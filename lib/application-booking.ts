import { readRecord } from "./receipt-store";

// Booking state lives in private receipts; Close only needs the pipeline status.
export async function hasApplicationBooking(
  id: string,
  lead: Record<string, unknown>,
) {
  const receipt = await readRecord<{
    applicationId: string;
    status: string;
  }>(`lead-bookings/${String(lead.id)}`);
  return (
    receipt?.value.applicationId === id &&
    receipt.value.status === "active"
  );
}
