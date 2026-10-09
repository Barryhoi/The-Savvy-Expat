"use client";
import { useState } from "react";
import DiscoveryCalendar from "./DiscoveryCalendar";
import PhoneInput from "./PhoneInput";

type Created = { token: string; booking: { name: string; email: string; phone: string } };
export default function SetterWorkspace() {
  const [created, setCreated] = useState<Created | null>(null);
  const [mode, setMode] = useState<"form" | "calendar">("form");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/setting/lead", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.get("name"), email: data.get("email"), phone: data.get("phone") }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save this contact.");
      setCreated(result); setMode("calendar");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not save this contact. Please try again.");
    } finally { setBusy(false); }
  }

  return <main className="setter-main"><div className="setter-shell">
    <header className="setter-heading"><span className="setter-kicker">THE SAVVY EXPAT · SETTER DESK</span><h1>Book a discovery call.</h1><p>Save their details to Close, then choose a time for their discovery call.</p></header>
    {mode === "calendar" && created ? <DiscoveryCalendar application={{ id: created.token, ...created.booking }} setterToken={created.token} /> : <section className="setter-card">
        <div className="setter-card-heading"><span>01</span><div><h2>Who are you booking for?</h2><p>We’ll find or create their lead in Close using these details.</p></div></div>
        <form className="setter-form" onSubmit={submit}>
          <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={120} placeholder="Jordan Smith" /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="jordan@example.com" /></label>
          <div className="setter-field"><span id="setter-phone-label">Phone number</span>{/* The lead's country, not the setter's: most leads are in the US. */}<PhoneInput name="phone" value={phone} onChange={setPhone} defaultCountry="US" inputProps={{ "aria-labelledby": "setter-phone-label", required: true, placeholder: "Phone number" }} /><small>Pick the lead’s country first if they’re outside the US.</small></div>
          {error && <p className="setter-error" role="alert">{error}</p>}
          <button className="setter-primary" type="submit" disabled={busy}>{busy ? "Saving to Close…" : "Continue"}<span aria-hidden="true">→</span></button>
        </form>
    </section>}
    <p className="setter-footnote">Appointments are booked with Sam. A confirmed booking updates the same Close lead to Booked.</p>
  </div></main>;
}
