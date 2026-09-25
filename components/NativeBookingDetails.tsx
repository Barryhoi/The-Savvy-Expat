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
    <button className="native-back" onClick={onBack} disabled={busy || pending}>← Change date or time</button>
    <p className="funnel-eyebrow">ONE LAST STEP</p>
    <h2>Make it official.</h2>
    <p className="native-subtitle">Confirm your details and we’ll save your spot.</p>
    <div className="native-slot"><span className="native-slot-icon" aria-hidden="true">✓</span><div><strong>{new Intl.DateTimeFormat("en", { timeZone: zone, weekday: "long", month: "long", day: "numeric" }).format(new Date(start))}</strong><p>{new Intl.DateTimeFormat("en", { timeZone: zone, hour: "numeric", minute: "2-digit" }).format(new Date(start))} · 30 minutes</p><span>{zone.replaceAll("_", " ")} · Google Meet</span></div></div>
    <div className="native-contact"><div><span>Your name</span><strong>{application.name}</strong></div><div><span>Confirmation email</span><strong>{application.email}</strong></div><div><span>Phone number</span><strong>{application.phone}</strong></div></div>
    <form onSubmit={submit}>
      <fieldset disabled={busy || pending} className="native-whatsapp"><legend>Do you have WhatsApp? <span>Required</span></legend><div>{["Yes", "No"].map(value => <label key={value} className={whatsapp === value ? "chosen" : ""}><input required type="radio" name="whatsapp" value={value} checked={whatsapp === value} onChange={() => setWhatsapp(value)} />{value}</label>)}</div></fieldset>
      <label className="native-notes">Anything else you’d like us to know? <span>Optional</span><textarea maxLength={2000} rows={3} value={notes} onChange={e => setNotes(e.target.value)} disabled={busy || pending} placeholder="Share a question or anything helpful for our call." /></label>
      {error && <p className="calendar-error" role="alert">{error}</p>}
      <button className="native-confirm-button" disabled={busy || (!pending && !whatsapp)} type="submit">{busy ? "Confirming your booking…" : pending ? "Check booking status" : "Confirm booking"}<span aria-hidden="true">→</span></button>
      <p className="native-reassurance">Your confirmation and meeting link will be sent by email.</p>
      <p className="native-terms">By confirming, you agree to Calendly’s <a href="https://calendly.com/legal/participant-terms-conditions" target="_blank" rel="noopener noreferrer">Participant Terms</a> and <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Notice</a>.</p>
    </form>
  </div>;
}
