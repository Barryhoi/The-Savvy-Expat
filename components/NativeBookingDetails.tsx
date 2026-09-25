"use client";
import { useRef, useState } from "react";
import { confirmBookingRequest } from "@/lib/booking-confirmation";
export default function NativeBookingDetails({ application, start, zone, onBack }: {
  application: { name: string; email: string; phone: string }; start: string; zone: string; onBack: () => void;
}) {
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const invitee = useRef<string | undefined>(undefined);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      if (!invitee.current) {
        let response: Response;
        try {
          response = await fetch("/api/booking/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ start, timezone: zone, whatsapp, notes }) });
        } catch { setPending(true); throw Error("We’re checking whether your booking went through. Wait a moment, then check again—please don’t book another appointment."); }
        let result;
        try { result = await response.json(); } catch { setPending(true); throw Error("We couldn’t read the booking response. Please check again before making another booking."); }
        if (!response.ok) { setPending(Boolean(result.pending)); throw Error(result.error || "Please try again shortly."); }
        if (typeof result.inviteeUri !== "string") { setPending(true); throw Error("Please check your booking status again shortly."); }
        invitee.current = result.inviteeUri;
      }
      setPending(true);
      try { await confirmBookingRequest(invitee.current!); }
      catch { throw Error("Your appointment is booked. We’re still saving the confirmation—please check again instead of booking twice."); }
      try { sessionStorage.removeItem("savvy-application-v1"); } catch {}
      window.location.assign("/thank-you");
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again shortly."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="native-confirmation">
    <h1>Confirm your call.</h1>
    <div className="native-slot"><div><strong>{new Intl.DateTimeFormat("en", { timeZone: zone, weekday: "short", month: "short", day: "numeric" }).format(new Date(start))}</strong><p>{new Intl.DateTimeFormat("en", { timeZone: zone, hour: "numeric", minute: "2-digit" }).format(new Date(start))}<span className="native-zone">{zone.replaceAll("_", " ")}</span></p><span>30 min · Google Meet</span></div><button type="button" className="native-change" onClick={onBack} disabled={busy || pending} aria-label="Change date or time">Change</button></div>
    <div className="native-recipient"><strong>{application.name}</strong><p>Confirmation to <span>{application.email}</span></p><details><summary>Contact details</summary><p>{application.phone}</p></details></div>
    <form onSubmit={submit}>
      <fieldset disabled={busy || pending} className="native-whatsapp"><legend>Do you have WhatsApp?</legend><div>{["Yes", "No"].map(value => <label key={value} className={whatsapp === value ? "chosen" : ""}><input required type="radio" name="whatsapp" value={value} checked={whatsapp === value} onChange={() => setWhatsapp(value)} />{value}</label>)}</div></fieldset>
      <details className="native-optional-note"><summary>Add a note <span>(optional)</span></summary><label className="native-notes"><span className="sr-only">Anything else you’d like us to know?</span><textarea maxLength={2000} rows={3} value={notes} onChange={e => setNotes(e.target.value)} disabled={busy || pending} placeholder="Anything helpful for our call?" /></label></details>
      {error && <p className="calendar-error" role="alert">{error}</p>}
      <button className="native-confirm-button" disabled={busy || (!pending && !whatsapp)} type="submit">{busy ? "Confirming your booking…" : pending ? "Check booking status" : "Confirm booking"}<span aria-hidden="true">→</span></button>
      <p className="native-terms">By booking, you agree to Calendly’s <a href="https://calendly.com/legal/participant-terms-conditions" target="_blank" rel="noopener noreferrer">Participant Terms</a> and <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Notice</a>.</p>
    </form>
  </div>;
}
