import "server-only";
import {
  applicationKey,
  getApplication,
  type Application,
} from "./application";
import { calendlyApi, providerPath, resolveEventType } from "./calendly";
import { closeApi, syncApplication } from "./close";
import config from "./close-fields.json";
import { syncApplicationFollowups } from "./application-followups";
import { digest, readRecord, withLock, writeRecord } from "./receipt-store";

export async function syncBooking(
  inviteeUri: string,
  expectedApplicationId?: string,
) {
  const { resource: invitee } = await calendlyApi(
    providerPath(inviteeUri, "invitee"),
  );
  const { resource: event } = await calendlyApi(
    providerPath(invitee.event, "event"),
  );
  if (event.event_type !== (await resolveEventType())) {
    if (expectedApplicationId) throw new Error("WRONG_EVENT");
    // Calendly subscriptions can include unrelated event types. Acknowledge
    // those without touching Close or causing repeated webhook deliveries.
    return { confirmed: false, ignored: true };
  }
  const tracking = String(invitee.tracking?.utm_content || "");
  const match = tracking.match(/^se_([a-f0-9-]{36})$/);
  const previous =
    typeof invitee.old_invitee === "string"
      ? await readRecord<{ applicationId?: string; setterId?: string }>(
          `bookings/${digest(invitee.old_invitee)}`,
        )
      : null;
  const setterMatch = tracking.match(/^setter_([a-f0-9-]{36})$/i);
  const setterId = setterMatch?.[1] || previous?.value.setterId;
  const id = match?.[1] || previous?.value.applicationId;
  if (setterId && !id) return syncSetterBooking(invitee, inviteeUri, setterId);
  if (!id) return { confirmed: false, ignored: true }; // Other bookings in the organization are not ours.
  if (expectedApplicationId && expectedApplicationId !== id)
    throw new Error("WRONG_APPLICATION");
  return withLock(`booking:${id}`, async () => {
    const receipt = await getApplication(id);
    if (!receipt?.value.qualified) throw new Error("APPLICATION_NOT_QUALIFIED");
    const jobKey = `bookings/${digest(inviteeUri)}`;
    const prior = await readRecord<{ updatedAt: string; synced: boolean; stageSynced?: boolean }>(
      jobKey,
    );
    const updatedAt = invitee.updated_at || invitee.created_at;
    if (prior?.value.synced && prior.value.stageSynced && prior.value.updatedAt === updatedAt)
      return { confirmed: invitee.status === "active" };
    const pending = await writeRecord(
      jobKey,
      { inviteeUri, applicationId: id, updatedAt, synced: false },
      prior?.etag,
    );
    let application: Application = receipt.value;
    if (!application.leadId) {
      const answers = {
        ...application.answers,
        email: invitee.email,
        firstName:
          application.answers.firstName || invitee.first_name || invitee.name,
        lastName: application.answers.lastName || invitee.last_name || "",
      };
      const synced = await syncApplication(
        id,
        answers,
        application.submittedAt,
      );
      application = { ...application, ...synced, answers, synced: true };
      await writeRecord(applicationKey(id), application, receipt.etag);
    }
    if (!application.leadId) throw new Error("NO_LEAD");
    await syncApplicationFollowups(application);
    await withLock(`lead-booking:${application.leadId}`, async () => {
      const current = await closeApi(`lead/${application.leadId}/`);
      if (current.organization_id !== config.organizationId)
        throw new Error("WRONG_ORGANIZATION");
      // Delayed events for an older form must not overwrite the new form's stage.
      const email = String(application.answers.email || invitee.email || "").trim().toLowerCase();
      const identity = email
        ? await readRecord<{ applicationId?: string }>(`identities/${digest(email)}`)
        : null;
      const legacyApplicationField = config.legacyFields?.applicationId;
      const currentApplication = identity?.value.applicationId ??
        (legacyApplicationField ? current[`custom.${legacyApplicationField}`] : undefined);
      if (currentApplication && currentApplication !== id) return;
      const latestKey = `lead-bookings/${application.leadId}`;
      const latest = await readRecord<{
        createdAt: string;
        inviteeUri: string;
        status: string;
      }>(latestKey);
      // A canceled old appointment must never cancel its replacement. Booking
      // creation time, not the appointment date, determines the latest booking.
      const older =
        latest &&
        Date.parse(invitee.created_at) < Date.parse(latest.value.createdAt);
      if (
        older ||
        (invitee.status !== "active" &&
          latest &&
          latest.value.inviteeUri !== inviteeUri)
      )
        return;
      const stagePatch: Record<string, string> = {};
      if (invitee.status === "active" && [config.potentialStatusId, config.tfsStatusId, config.tfnbStatusId, config.tfdqStatusId, config.bookedStatusId, config.canceledStatusId].includes(current.status_id))
        stagePatch.status_id = config.bookedStatusId;
      if (invitee.status === "canceled" && !invitee.rescheduled && current.status_id === config.bookedStatusId)
        stagePatch.status_id = config.canceledStatusId;
      // A verified appointment updates the core pipeline stage in Preview and
      // Production; optional outreach/opportunity automations stay production-gated.
      if (Object.keys(stagePatch).length)
        await closeApi(`lead/${application.leadId}/`, "PUT", stagePatch);
      await writeRecord(
        latestKey,
        {
          createdAt: invitee.created_at,
          inviteeUri,
          status: invitee.status,
          applicationId: id,
        },
        latest?.etag,
      );
      // Preview can update the core stage for a verified booking; optional
      // newsletter/opportunity follow-ups remain production-gated.
      if (
        process.env.VERCEL_ENV === "production" &&
        process.env.BOOKING_LIVE_AUTOMATIONS === "true" &&
        invitee.status === "active"
      ) {
        const opportunities = await closeApi(
          `opportunity/?lead_id=${application.leadId}&_limit=100`,
        );
        if (
          !opportunities.data.some(
            (o: { status_type: string }) => o.status_type === "active",
          )
        ) {
          const oppKey = `opportunities/${application.leadId}`;
          const attempt = await readRecord<{ creating: boolean }>(oppKey);
          if (attempt?.value.creating)
            throw new Error("OPPORTUNITY_REQUIRES_RECONCILIATION");
          const marker = await writeRecord(
            oppKey,
            { creating: true },
            attempt?.etag,
          );
          const opportunity = await closeApi("opportunity/", "POST", {
            lead_id: application.leadId,
            status_id: config.bookedOpportunityStatusId,
            user_id: config.samUserId,
          });
          await writeRecord(
            oppKey,
            { creating: false, id: opportunity.id },
            marker.etag,
          );
        }

      }

    });
    await writeRecord(
      jobKey,
      { inviteeUri, applicationId: id, updatedAt, synced: true, stageSynced: true },
      pending.etag,
    );
    return { confirmed: invitee.status === "active" };
  });
}

async function syncSetterBooking(invitee: any, inviteeUri: string, id: string) {
  return withLock(`booking:setter_${id}`, async () => {
    const bookingReceipt = await readRecord<{
      id: string; leadId: string; name: string; email: string; phone: string;
      createdAt: string;
    }>(`setter-bookings/${id}`);
    if (!bookingReceipt) throw new Error("SETTER_BOOKING_NOT_FOUND");
    const booking = bookingReceipt.value;
    if (String(invitee.email || "").trim().toLowerCase() !== booking.email)
      throw new Error("SETTER_EMAIL_MISMATCH");
    const jobKey = `bookings/${digest(inviteeUri)}`;
    const updatedAt = invitee.updated_at || invitee.created_at;
    const prior = await readRecord<{ updatedAt: string; synced: boolean; stageSynced?: boolean }>(jobKey);
    if (prior?.value.synced && prior.value.stageSynced && prior.value.updatedAt === updatedAt)
      return { confirmed: invitee.status === "active", setterId: id };
    const pending = await writeRecord(jobKey, { inviteeUri, setterId: id, updatedAt, synced: false }, prior?.etag);
    await withLock(`lead-booking:${booking.leadId}`, async () => {
      const current = await closeApi(`lead/${booking.leadId}/`);
      if (current.organization_id !== config.organizationId) throw new Error("WRONG_ORGANIZATION");
      const hasContact = (current.contacts || []).some((contact: { emails?: { email: string }[] }) =>
        (contact.emails || []).some((email) => email.email.trim().toLowerCase() === booking.email),
      );
      if (!hasContact) throw new Error("SETTER_LEAD_IDENTITY_CHANGED");
      const latestKey = `lead-bookings/${booking.leadId}`;
      const latest = await readRecord<{ createdAt: string; inviteeUri: string; status: string }>(latestKey);
      const older = latest && Date.parse(invitee.created_at) < Date.parse(latest.value.createdAt);
      if (older || (invitee.status !== "active" && latest && latest.value.inviteeUri !== inviteeUri)) return;
      const stagePatch: Record<string, string> = {};
      if (invitee.status === "active" && [config.potentialStatusId, config.tfsStatusId, config.tfnbStatusId, config.tfdqStatusId, config.bookedStatusId, config.canceledStatusId].includes(current.status_id))
        stagePatch.status_id = config.bookedStatusId;
      if (invitee.status === "canceled" && !invitee.rescheduled && current.status_id === config.bookedStatusId)
        stagePatch.status_id = config.canceledStatusId;
      if (Object.keys(stagePatch).length) await closeApi(`lead/${booking.leadId}/`, "PUT", stagePatch);
      await writeRecord(latestKey, { createdAt: invitee.created_at, inviteeUri, status: invitee.status, setterId: id }, latest?.etag);
      if (process.env.VERCEL_ENV === "production" && process.env.BOOKING_LIVE_AUTOMATIONS === "true" && invitee.status === "active") {
        const opportunities = await closeApi(`opportunity/?lead_id=${booking.leadId}&_limit=100`);
        if (!opportunities.data.some((opportunity: { status_type: string }) => opportunity.status_type === "active")) {
          const oppKey = `opportunities/${booking.leadId}`;
          const attempt = await readRecord<{ creating: boolean }>(oppKey);
          if (attempt?.value.creating) throw new Error("OPPORTUNITY_REQUIRES_RECONCILIATION");
          const marker = await writeRecord(oppKey, { creating: true }, attempt?.etag);
          const opportunity = await closeApi("opportunity/", "POST", { lead_id: booking.leadId, status_id: config.bookedOpportunityStatusId, user_id: config.samUserId });
          await writeRecord(oppKey, { creating: false, id: opportunity.id }, marker.etag);
        }
      }
    });
    await writeRecord(jobKey, { inviteeUri, setterId: id, updatedAt, synced: true, stageSynced: true }, pending.etag);
    return { confirmed: invitee.status === "active", setterId: id };
  });
}
