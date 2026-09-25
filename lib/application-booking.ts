import config from "./close-fields.json";
import { digest, readRecord } from "./receipt-store";

// The lead's booking fields may belong to an earlier application. Use the
// durable booking receipt rather than the lead's overwritten application ID.
export async function hasApplicationBooking(id: string, lead: Record<string, unknown>) {
  if (!["Booked", "Rescheduled"].includes(String(lead[`custom.${config.fields.bookingStatus}`]))) return false;
  const uri = lead[`custom.${config.fields.bookingId}`];
  if (typeof uri !== "string" || !uri) return true; // Preserve unknown legacy bookings.
  const receipt = await readRecord<{ applicationId: string }>(`bookings/${digest(uri)}`);
  return !receipt?.value.applicationId || receipt.value.applicationId === id;
}
