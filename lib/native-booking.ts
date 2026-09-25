import "server-only";
import type { Application } from "./application";
import { calendlyApi, providerPath, resolveEventType } from "./calendly";
import { closeApi } from "./close";
import config from "./close-fields.json";
import { digest, readRecord, withLock, writeRecord } from "./receipt-store";

export type BookingDetails = { start: string; timezone: string; whatsapp: string; notes: string };
export function validateBookingDetails(input: BookingDetails): BookingDetails {
  if (!input || typeof input.start !== "string" || !Number.isFinite(Date.parse(input.start)) || Date.parse(input.start) <= Date.now()) throw Error("INVALID_DETAILS");
  if (typeof input.timezone !== "string" || input.timezone.length > 100) throw Error("INVALID_DETAILS");
  try { new Intl.DateTimeFormat("en", { timeZone: input.timezone }); } catch { throw Error("INVALID_DETAILS"); }
  if (!["Yes", "No"].includes(input.whatsapp) || typeof input.notes !== "string" || input.notes.length > 2000) throw Error("INVALID_DETAILS");
  return { start: new Date(input.start).toISOString(), timezone: input.timezone, whatsapp: input.whatsapp, notes: input.notes.trim() };
}
type Attempt = { hash: string; state: "pending" | "rejected" | "created"; inviteeUri?: string };
export async function createNativeBooking(application: Application, input: BookingDetails) {
  if (!application.qualified || !application.leadId) throw Error("APPLICATION_REQUIRED");
  return withLock(`native-booking:${application.id}`, async () => {
    const key = `native-bookings/${application.id}`;
    const prior = await readRecord<Attempt>(key);
    // Recover an accepted POST from either its saved response or the webhook.
    if (prior?.value.inviteeUri) return prior.value.inviteeUri;
    const existing = await readRecord<{ applicationId: string; inviteeUri: string; status: string }>(`lead-bookings/${application.leadId}`);
    if (existing?.value.applicationId === application.id && existing.value.status === "active") return existing.value.inviteeUri;
    if (prior?.value.state === "pending") throw Error("BOOKING_UNCERTAIN");
    const details = validateBookingDetails(input);
    const lead = await closeApi(`lead/${application.leadId}/`);
    if (lead.organization_id !== config.organizationId || lead[`custom.${config.fields.applicationId}`] !== application.id) throw Error("APPLICATION_CHANGED");
    const eventType = await resolveEventType();
    const { resource: event } = await calendlyApi(new URL(eventType).pathname);
    if (event.duration !== 30 || event.locations?.[0]?.kind !== "google_conference") throw Error("EVENT_CONFIGURATION_CHANGED");
    const values: Record<string, string> = { "Additional notes": details.notes, "Phone number": String(application.answers.phone || ""), "Do you have WhatsApp?": details.whatsapp };
    const questions = (event.custom_questions || []).filter((q: { enabled: boolean }) => q.enabled);
    if (questions.some((q: { required: boolean; name: string }) => q.required && !values[q.name])) throw Error("EVENT_CONFIGURATION_CHANGED");
    const query = new URLSearchParams({ event_type: eventType, start_time: details.start, end_time: new Date(Date.parse(details.start) + 60000).toISOString() });
    const available = await calendlyApi(`/event_type_available_times?${query}`);
    if (!available.collection.some((s: { start_time: string; status: string }) => s.status === "available" && Date.parse(s.start_time) === Date.parse(details.start))) throw Error("SLOT_UNAVAILABLE");
    const hash = digest(JSON.stringify(details));
    const marker = await writeRecord(key, { hash, state: "pending" }, prior?.etag);
    let result;
    try {
      result = await calendlyApi("/invitees", "POST", {
        event_type: eventType, start_time: details.start,
        invitee: { name: [application.answers.firstName, application.answers.lastName].filter(Boolean).join(" "), email: application.answers.email, timezone: details.timezone },
        location: { kind: "google_conference" },
        questions_and_answers: questions.filter((q: { name: string }) => values[q.name]).map((q: { name: string; position: number }) => ({ question: q.name, answer: values[q.name], position: q.position })),
        tracking: { utm_content: `se_${application.id}`, utm_campaign: null, utm_source: "savvy-expat", utm_medium: "website", utm_term: null, salesforce_uuid: null },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "";
      // Definitive rejection is retryable. An uncertain POST must NEVER be repeated.
      if (/^CALENDLY_(400|401|403|404|409|422|429)$/.test(message)) {
        await writeRecord(key, { hash, state: "rejected" }, marker.etag);
        throw Error(message === "CALENDLY_409" ? "SLOT_UNAVAILABLE" : "BOOKING_UNAVAILABLE");
      }
      throw Error("BOOKING_UNCERTAIN");
    }
    const uri = result?.resource?.uri;
    if (typeof uri !== "string") throw Error("BOOKING_UNCERTAIN");
    // Some create responses use calendly.com rather than api.calendly.com.
    const url = new URL(uri);
    if (!["calendly.com", "api.calendly.com"].includes(url.hostname)) throw Error("BOOKING_UNCERTAIN");
    url.hostname = "api.calendly.com";
    const inviteeUri = url.toString();
    providerPath(inviteeUri, "invitee");
    await writeRecord(key, { hash, state: "created", inviteeUri }, marker.etag);
    return inviteeUri;
  });
}
