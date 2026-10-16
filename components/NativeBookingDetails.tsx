"use client";
import { useRef, useState } from "react";
import { confirmBookingRequest } from "@/lib/booking-confirmation";
import { timeZoneLabel } from "@/lib/timezones";
import { BOOK_QUESTIONS, WHY_QUESTION } from "@/lib/book-questions";
export default function NativeBookingDetails({ application, start, zone, setterToken, onBack }: {
  application: { id?: string; name: string; email: string; phone: string }; start: string; zone: string; setterToken?: string; onBack: () => void;
}) {
  const isSetterBooking = Boolean(setterToken);
  const [whatsapp, setWhatsapp] = useState("");
  const [notes, setNotes] = useState("");
  // Setter bookings answer the same questions as Calendly's form on /book.
  const [answers, setAnswers] = useState({ timeline: "", services: [] as string[], budget: "", logistics: "", why: "" });
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
          response = await fetch("/api/booking/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ start, timezone: zone, whatsapp, notes, ...(setterToken ? { setterToken, answers } : {}) }) });
        } catch { setPending(true); throw Error("We’re checking whether your booking went through. Wait a moment, then check again—please don’t book another appointment."); }
        let result;
        try { result = await response.json(); } catch { setPending(true); throw Error("We couldn’t read the booking response. Please check again before making another booking."); }
        if (!response.ok) { setPending(Boolean(result.pending)); throw Error(result.error || "Please try again shortly."); }
        if (typeof result.inviteeUri !== "string") { setPending(true); throw Error("Please check your booking status again shortly."); }
        invitee.current = result.inviteeUri;
      }
      setPending(true);
      try { await confirmBookingRequest(invitee.current!, fetch, undefined, setterToken); }
      catch { throw Error("Your appointment is booked. We’re still saving the confirmation—please check again instead of booking twice."); }
      try { sessionStorage.removeItem("savvy-application-v1"); } catch {}
      window.location.assign(setterToken ? "/setting/confirmed" : "/thank-you");
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again shortly."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="native-confirmation">
    <h1>Confirm your call.</h1>
    <div className="native-slot"><div><strong>{new Intl.DateTimeFormat("en", { timeZone: zone, weekday: "short", month: "short", day: "numeric" }).format(new Date(start))}</strong><p>{new Intl.DateTimeFormat("en", { timeZone: zone, hour: "numeric", minute: "2-digit" }).format(new Date(start))}<span className="native-zone">{timeZoneLabel(zone)}</span></p><span>45 min · Google Meet</span></div><button type="button" className="native-change" onClick={onBack} disabled={busy || pending} aria-label="Change date or time">Change</button></div>
    <div className="native-recipient"><strong>{application.name}</strong><p>Confirmation to <span>{application.email}</span></p><div className="native-contact-summary"><span>Contact details</span><p>{application.phone}</p></div></div>
    <form onSubmit={submit}>
      {isSetterBooking && (["timeline", "budget", "logistics", "services"] as const).map(key => {
        const question = BOOK_QUESTIONS[key];
        const multiple = key === "services";
        return <fieldset key={key} disabled={busy || pending} className="native-whatsapp setter-question"><legend>{question.name}{!question.required && <span className="native-optional-label"> (optional)</span>}</legend><div>{question.options.map(option => {
          const chosen = multiple ? answers.services.includes(option) : answers[key] === option;
          return <label key={option} className={chosen ? "chosen" : ""}><input type={multiple ? "checkbox" : "radio"} required={!multiple && question.required} name={`setter-${key}`} value={option} checked={chosen} onChange={() => setAnswers(current => multiple
            ? { ...current, services: chosen ? current.services.filter(item => item !== option) : [...current.services, option] }
            : { ...current, [key]: option })} />{option}</label>;
        })}</div></fieldset>;
      })}
      {isSetterBooking && <label className="native-notes setter-why"><span className="native-note-label">{WHY_QUESTION} <span className="native-optional-label">(optional)</span></span><textarea aria-label={WHY_QUESTION} maxLength={1000} rows={3} value={answers.why} onChange={e => setAnswers(current => ({ ...current, why: e.target.value }))} disabled={busy || pending} /></label>}
      <fieldset disabled={busy || pending} className="native-whatsapp"><legend>Do you have WhatsApp?</legend><div>{["Yes", "No"].map(value => <label key={value} className={whatsapp === value ? "chosen" : ""}><input required type="radio" name="whatsapp" value={value} checked={whatsapp === value} onChange={() => setWhatsapp(value)} />{value}</label>)}</div></fieldset>
      <label className="native-notes"><span className="native-note-label"><span aria-hidden="true">▾</span> {isSetterBooking ? "Add a note for Sam" : "Add a note"} <span className="native-optional-label">(optional)</span></span><textarea aria-label="What would be helpful for us to know before the call?" maxLength={2000} rows={3} value={notes} onChange={e => setNotes(e.target.value)} disabled={busy || pending} placeholder="What would be helpful for us to know before the call?" /></label>
      {error && <p className="calendar-error" role="alert">{error}</p>}
      <button className="native-confirm-button" disabled={busy || (!pending && (!whatsapp || (isSetterBooking && (!answers.timeline || !answers.budget))))} type="submit">{busy ? "Confirming your booking…" : pending ? "Check booking status" : "Confirm booking"}<span aria-hidden="true">→</span></button>
      <p className="native-terms">By booking, you agree to Calendly’s <a href="https://calendly.com/legal/participant-terms-conditions" target="_blank" rel="noopener noreferrer">Participant Terms</a> and <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Notice</a>.</p>
    </form>
  </div>;
}
