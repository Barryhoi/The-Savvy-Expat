import "server-only";
import {
  applicationKey,
  getApplication,
  type Application,
} from "./application";
import { calendlyApi, providerPath, resolveEventType } from "./calendly";
import { closeApi, customFields, syncApplication } from "./close";
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
  if (event.event_type !== (await resolveEventType()))
    throw new Error("WRONG_EVENT");
  const tracking = String(invitee.tracking?.utm_content || "");
  const match = tracking.match(/^se_([a-f0-9-]{36})$/);
  const previous =
    typeof invitee.old_invitee === "string"
      ? await readRecord<{ applicationId: string }>(
          `bookings/${digest(invitee.old_invitee)}`,
        )
      : null;
  const id = match?.[1] || previous?.value.applicationId;
  if (!id) return { confirmed: false, ignored: true }; // Other bookings in the organization are not ours.
  if (expectedApplicationId && expectedApplicationId !== id)
    throw new Error("WRONG_APPLICATION");
  return withLock(`booking:${id}`, async () => {
    const receipt = await getApplication(id);
    if (!receipt?.value.qualified) throw new Error("APPLICATION_NOT_QUALIFIED");
    const jobKey = `bookings/${digest(inviteeUri)}`;
    const prior = await readRecord<{ updatedAt: string; synced: boolean }>(
      jobKey,
    );
    const updatedAt = invitee.updated_at || invitee.created_at;
    if (prior?.value.synced && prior.value.updatedAt === updatedAt)
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
      const currentInvitee = current[`custom.${config.fields.bookingId}`];
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
          currentInvitee &&
          currentInvitee !== inviteeUri)
      )
        return;
      const qa = (invitee.questions_and_answers || []) as {
        question: string;
        answer: string;
      }[];
      const answer = (name: string) =>
        qa.find((q) => q.question.trim().toLowerCase() === name.toLowerCase())
          ?.answer || "";
      const fields = customFields({
        bookingStatus:
          invitee.status === "active"
            ? "Booked"
            : invitee.rescheduled
              ? "Rescheduled"
              : "Canceled",
        bookingStart: event.start_time,
        bookingTimezone: invitee.timezone,
        bookingHost: "Sam — sam@thesavvyexpat.com",
        bookingEmail: invitee.email,
        bookingPhone: answer("Phone number"),
        whatsapp: answer("Do you have WhatsApp?"),
        bookingNotes: answer("Additional notes"),
        bookingId: inviteeUri,
        bookingEvent: invitee.event,
        meetingUrl: event.location?.join_url || event.location?.location || "",
        rescheduleUrl: invitee.reschedule_url || "",
        cancelUrl: invitee.cancel_url || "",
      });
      await closeApi(`lead/${application.leadId}/`, "PUT", fields);
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
      // Preview writes fields only: existing Make/Close follow-ups must not be
      // triggered by test data. Production automation activation is explicit.
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
        await closeApi(`lead/${application.leadId}/`, "PUT", {
          status_id: config.bookedStatusId,
        });
      }
      if (
        process.env.VERCEL_ENV === "production" &&
        process.env.BOOKING_LIVE_AUTOMATIONS === "true" &&
        invitee.status === "canceled" &&
        !invitee.rescheduled &&
        current.status_id === config.bookedStatusId
      ) {
        // Existing Make cancellation outcome, guarded against demoting a lead
        // that a closer has already advanced after the booking.
        await closeApi(`lead/${application.leadId}/`, "PUT", {
          status_id: config.canceledStatusId,
        });
      }
    });
    await writeRecord(
      jobKey,
      { inviteeUri, applicationId: id, updatedAt, synced: true },
      pending.etag,
    );
    return { confirmed: invitee.status === "active" };
  });
}
