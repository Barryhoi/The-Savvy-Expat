import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import config from "./close-fields.json";
import { closeApi, exactLead, type Lead } from "./close";
import { calendlyApi, providerPath, resolveEventType } from "./calendly";
import { digest, readRecord, withLock, writeRecord } from "./receipt-store";
import { validateBookingDetails, type BookingDetails } from "./native-booking";
import { validateSetterContact, type SetterContactInput } from "./setting-validation";

export type SetterBooking = SetterContactInput & {
  id: string;
  leadId: string;
  createdAt: string;
};
const recordKey = (id: string) => `setter-bookings/${id}`;

export async function setterBookingFromToken(token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const pointer = await readRecord<{ id: string }>(`setter-sessions/${digest(token)}`);
  if (!pointer || !/^[a-f0-9-]{36}$/i.test(pointer.value.id)) return null;
  const record = await readRecord<SetterBooking>(recordKey(pointer.value.id));
  if (!record || Date.now() - Date.parse(record.value.createdAt) > 90 * 86400000) return null;
  return record;
}

export async function createSetterBooking(input: unknown) {
  const contact = validateSetterContact(input);
  return withLock(`setter-identity:${contact.email}`, async () => {
    let lead = await exactLead(contact.email);
    if (lead && lead.organization_id !== config.organizationId) throw new Error("WRONG_ORGANIZATION");
    if (lead) {
      const activeBooking = await readRecord<{ status?: string }>(`lead-bookings/${lead.id}`);
      if (activeBooking?.value.status === "active") throw new Error("ALREADY_BOOKED");
      const existingContact = lead.contacts.find((candidate) =>
        candidate.emails.some((item) => item.email.trim().toLowerCase() === contact.email),
      );
      if (!existingContact) throw new Error("CONTACT_NOT_FOUND");
      const currentNumbers = (existingContact.phones || []).map((item) => item.phone.replace(/\D/g, ""));
      const patch = {
        ...(existingContact.name !== contact.name ? { name: contact.name } : {}),
        ...(!currentNumbers.includes(contact.phone.replace(/\D/g, ""))
          ? { phones: [...(existingContact.phones || []), { phone: contact.phone, type: "mobile" }] }
          : {}),
      };
      if (Object.keys(patch).length) await closeApi(`contact/${existingContact.id}/`, "PUT", patch);
      lead = await closeApi(`lead/${lead.id}/`) as Lead;
    } else {
      // The identity lock plus exact-email lookup prevents duplicate leads.
      // If Close's create response is uncertain, the next request recovers via search.
      lead = await closeApi("lead/", "POST", {
        name: contact.name,
        status_id: config.potentialStatusId,
        contacts: [{
          name: contact.name,
          emails: [{ email: contact.email, type: "office" }],
          phones: [{ phone: contact.phone, type: "mobile" }],
        }],
      }) as Lead;
    }
    if (lead.organization_id !== config.organizationId) throw new Error("WRONG_ORGANIZATION");
    const id = randomUUID();
    const token = randomBytes(32).toString("hex");
    const booking: SetterBooking = { ...contact, id, leadId: lead.id, createdAt: new Date().toISOString() };
    await writeRecord(recordKey(id), booking);
    await writeRecord(`setter-sessions/${digest(token)}`, { id });
    return { booking, token };
  });
}

type Attempt = { state: "pending" | "rejected" | "created"; inviteeUri?: string };
export async function createSetterInvitee(token: string, input: BookingDetails) {
  const receipt = await setterBookingFromToken(token);
  if (!receipt) throw new Error("INVALID_SETTER_LINK");
  const booking = receipt.value;
  return withLock(`native-setter-booking:${booking.id}`, async () => {
    const key = `native-setter-bookings/${booking.id}`;
    const prior = await readRecord<Attempt>(key);
    if (prior?.value.inviteeUri) {
      const previous = await calendlyApi(providerPath(prior.value.inviteeUri, "invitee"), "GET");
      if (previous.resource?.status === "active") return prior.value.inviteeUri;
    }
    if (prior?.value.state === "pending") throw new Error("BOOKING_UNCERTAIN");
    const details = validateBookingDetails(input);
    const active = await readRecord<{ status?: string }>(`lead-bookings/${booking.leadId}`);
    if (active?.value.status === "active") throw new Error("ALREADY_BOOKED");
    const eventType = await resolveEventType();
    const { resource: event } = await calendlyApi(new URL(eventType).pathname);
    if (event.duration !== 30 || event.locations?.[0]?.kind !== "google_conference")
      throw new Error("EVENT_CONFIGURATION_CHANGED");
    const values: Record<string, string> = {
      "Additional notes": details.notes,
      "Phone number": booking.phone,
      "Do you have WhatsApp?": details.whatsapp,
    };
    const questions = (event.custom_questions || []).filter((question: { enabled: boolean }) => question.enabled);
    if (questions.some((question: { required: boolean; name: string }) => question.required && !values[question.name]))
      throw new Error("EVENT_CONFIGURATION_CHANGED");
    const query = new URLSearchParams({
      event_type: eventType,
      start_time: details.start,
      end_time: new Date(Date.parse(details.start) + 60000).toISOString(),
    });
    const available = await calendlyApi(`/event_type_available_times?${query}`);
    if (!available.collection.some((slot: { start_time: string; status: string }) => slot.status === "available" && Date.parse(slot.start_time) === Date.parse(details.start)))
      throw new Error("SLOT_UNAVAILABLE");
    const marker = await writeRecord(key, { state: "pending" }, prior?.etag);
    let result;
    try {
      result = await calendlyApi("/invitees", "POST", {
        event_type: eventType,
        start_time: details.start,
        invitee: { name: booking.name, email: booking.email, timezone: details.timezone },
        location: { kind: "google_conference" },
        questions_and_answers: questions
          .filter((question: { name: string }) => values[question.name])
          .map((question: { name: string; position: number }) => ({ question: question.name, answer: values[question.name], position: question.position })),
        tracking: { utm_content: `setter_${booking.id}`, utm_campaign: null, utm_source: "savvy-expat", utm_medium: "setter", utm_term: null, salesforce_uuid: null },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/^CALENDLY_(400|401|403|404|409|422|429)$/.test(message)) {
        await writeRecord(key, { state: "rejected" }, marker.etag);
        throw new Error(message === "CALENDLY_409" ? "SLOT_UNAVAILABLE" : "BOOKING_UNAVAILABLE");
      }
      throw new Error("BOOKING_UNCERTAIN");
    }
    const uri = result?.resource?.uri;
    if (typeof uri !== "string") throw new Error("BOOKING_UNCERTAIN");
    const url = new URL(uri);
    if (!(["calendly.com", "api.calendly.com"].includes(url.hostname))) throw new Error("BOOKING_UNCERTAIN");
    url.hostname = "api.calendly.com";
    const inviteeUri = url.toString();
    providerPath(inviteeUri, "invitee");
    await writeRecord(key, { state: "created", inviteeUri }, marker.etag);
    return inviteeUri;
  });
}

export async function setterInviteeMatches(token: string, inviteeUri: string) {
  const receipt = await setterBookingFromToken(token);
  if (!receipt) return false;
  const attempt = await readRecord<Attempt>(`native-setter-bookings/${receipt.value.id}`);
  return attempt?.value.inviteeUri === inviteeUri;
}
