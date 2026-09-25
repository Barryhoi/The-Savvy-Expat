// The provider webhook can hold the booking lock when the iframe confirms.
// Retry the same invitee only; this endpoint never creates an appointment.
export async function confirmBookingRequest(
  inviteeUri: string,
  request: typeof fetch = fetch,
  pause: (ms: number) => Promise<void> = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms)),
) {
  for (let attempt = 0; attempt < 5; attempt++) {
    let response: Response | undefined;
    try {
      response = await request("/api/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeUri }),
      });
    } catch {
      // A dropped response is safe to retry with the same invitee identity.
    }
    if (response?.ok) {
      const result = await response.json();
      if (result.confirmed === true) return;
      throw new Error("INVALID_CONFIRMATION");
    }
    if (response && response.status < 500 && response.status !== 429)
      throw new Error("BOOKING_NOT_CONFIRMED");
    if (attempt === 4) throw new Error("BOOKING_SYNC_PENDING");
    await pause(1000 * 2 ** attempt);
  }
}
