"use client";
import { useEffect, useRef, useState } from "react";
import NativeBookingDetails from "./NativeBookingDetails";
type Slot = { start: string; url: string };
const eventUrl =
  "https://calendly.com/sam-thesavvyexpat/expat-relocation-discovery-call";
function dateKey(value: string, zone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
export default function DiscoveryCalendar({
  application,
}: {
  application: { id: string; name: string; email: string; phone: string };
}) {
  const [zone, setZone] = useState("UTC"),
    [zones, setZones] = useState<string[]>(["UTC"]);
  const [slots, setSlots] = useState<Slot[]>([]),
    [date, setDate] = useState(""),
    [selected, setSelected] = useState<Slot | null>(null);
  const [choice, setChoice] = useState<Slot | null>(null);
  const [month, setMonth] = useState("");
  const timeList = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const times = useRef<HTMLHeadingElement>(null),
    details = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setZone(local);
    const supported = (
      Intl as unknown as { supportedValuesOf?: (key: string) => string[] }
    ).supportedValuesOf?.("timeZone") || [
      local,
      "UTC",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/London",
      "Asia/Manila",
      "Asia/Bangkok",
      "Australia/Sydney",
    ];
    setZones(Array.from(new Set([local, "UTC", ...supported])));
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/booking/availability", { signal: controller.signal })
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw Error(j.error);
        setSlots(j.slots);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    if (date) {
      times.current?.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 700px)").matches) {
        times.current?.scrollIntoView({ block: "start", behavior: "instant" });
      }
      timeList.current?.scrollTo({ top: 0 });
    }
  }, [date]);
  useEffect(() => {
    if (selected) details.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [selected]);
  const makeUrl = (base: string) => {
    const url = new URL(base);
    url.searchParams.set(
      "embed_domain",
      typeof window !== "undefined" ? window.location.hostname : "",
    );
    url.searchParams.set("embed_type", "Inline");
    url.searchParams.set("hide_gdpr_banner", "1");
    url.searchParams.set("hide_landing_page_details", "1");
    url.searchParams.set("primary_color", "4934fb");
    url.searchParams.set("timezone", zone);
    url.searchParams.set("utm_content", `se_${application.id}`);
    if (application.name) url.searchParams.set("name", application.name);
    if (application.email) url.searchParams.set("email", application.email);
    if (application.phone) url.searchParams.set("a2", application.phone);
    return url.toString();
  };
  const days = Array.from(new Set(slots.map((s) => dateKey(s.start, zone))));
  const activeMonth = month || days[0]?.slice(0, 7) || dateKey(new Date().toISOString(), zone).slice(0, 7);
  const months = Array.from(new Set(days.map(day => day.slice(0, 7))));
  const activeDate = days.includes(date) && date.startsWith(activeMonth) ? date : days.find(day => day.startsWith(activeMonth)) || "";
  const chosen = slots.filter((s) => dateKey(s.start, zone) === activeDate);
  const firstDay = new Date(`${activeMonth}-01T12:00:00Z`);
  const offset = (firstDay.getUTCDay() + 6) % 7;
  const dayCount = new Date(Date.UTC(firstDay.getUTCFullYear(), firstDay.getUTCMonth() + 1, 0)).getUTCDate();
  const monthIndex = months.indexOf(activeMonth);
  const formatDay = (day: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en", { ...options, timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
  return (
    <div className="savvy-booking">
      <aside className="booking-overview">
        <p className="booking-brand-label">THE SAVVY EXPAT</p>
        <h2>Your relocation<br /><span>discovery call.</span></h2>
        <div className="booking-meta"><span>30 minutes</span><span>Google Meet</span></div>
        <p>Let’s talk about your goals, your timeline, and what you need for a smooth move to the Philippines.</p>
        <div className="booking-note"><strong>What we’ll cover</strong><ul><li>Your plans for the Philippines</li><li>Your questions and concerns</li><li>How our team can help</li></ul></div>
      </aside>
      <section className="booking-scheduler">
        <ol className="calendar-steps" aria-label="Booking progress"><li aria-current={!selected ? "step" : undefined}><span>{selected ? "✓" : "1"}</span>Choose a time</li><li aria-current={selected ? "step" : undefined}><span>2</span>Your details</li></ol>
          {!selected ? (
            <>
              <div className="calendar-layout">
                <div className="month-panel">
                  <div className="month-toolbar"><h2>{formatDay(`${activeMonth}-01`, { month: "long", year: "numeric" })}</h2><div>
                    <button aria-label="Previous month" disabled={monthIndex <= 0 || loading} onClick={() => {setMonth(months[monthIndex - 1]);setChoice(null);}}>‹</button>
                    <button aria-label="Next month" disabled={monthIndex < 0 || monthIndex >= months.length - 1 || loading} onClick={() => {setMonth(months[monthIndex + 1]);setChoice(null);}}>›</button>
                  </div></div>
                  <div className="month-grid" role="group" aria-label="Choose an available date">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => <span className="weekday" key={day}>{day}</span>)}
                    {Array.from({length: offset}, (_, i) => <span key={`empty-${i}`} />)}
                    {Array.from({length: dayCount}, (_, i) => {
                      const day = `${activeMonth}-${String(i + 1).padStart(2, "0")}`;
                      const available = days.includes(day);
                      return <button key={day} disabled={!available || loading} aria-label={`${formatDay(day, {weekday: "long", month: "long", day: "numeric"})}, ${available ? "times available" : "no times available"}`} aria-pressed={day === activeDate} className={day === activeDate ? "calendar-day selected" : "calendar-day"} onClick={() => {setDate(day);setChoice(null);}}>{i + 1}</button>;
                    })}
                  </div>
                  <label className="calendar-zone"><span>Time zone</span><select value={zone} onChange={e => {setZone(e.target.value);setDate("");setMonth("");setChoice(null);}}>{zones.map(z => <option key={z} value={z}>{z.replaceAll("_", " ")}</option>)}</select></label>
                  <p className="calendar-caption">All times are shown in your time zone.</p>
                </div>
                <div className="times-panel">
                  <h3 ref={times} tabIndex={-1}>{activeDate ? formatDay(activeDate, {weekday: "long", month: "short", day: "numeric"}) : "Available times"}</h3>
                  <div className="time-list" ref={timeList} role="group" aria-label="Available times">
                    {loading ? <p role="status">Finding available times…</p> : chosen.map(slot => <button key={slot.start} aria-pressed={choice?.start === slot.start} className={choice?.start === slot.start ? "time-choice selected" : "time-choice"} onClick={() => setChoice(slot)}>{new Intl.DateTimeFormat("en", {timeZone: zone, hour: "numeric", minute: "2-digit"}).format(new Date(slot.start))}</button>)}
                    {!loading && !error && !chosen.length && <p>No times available in the current booking window. Please check again later.</p>}
                  </div>
                  <button className="calendar-continue" disabled={!choice || loading} onClick={() => setSelected(choice)}>Continue <span aria-hidden="true">→</span></button>
                  <p className="time-hint">{choice ? "Next: confirm your details" : "Select a time to continue"}</p>
                </div>
              </div>
              {error && <p role="alert" className="calendar-error">{error}</p>}
              <div className="calendar-footer"><button disabled={loading} onClick={() => {setChoice(null);setRetry(n => n + 1);}}>Refresh times</button><a href={makeUrl(eventUrl)} target="_blank" rel="noopener noreferrer">Trouble booking? ↗</a></div>
            </>
          ) : (
            <div className="booking-details" ref={details}>
              <NativeBookingDetails application={application} start={selected.start} zone={zone} onBack={() => { setSelected(null); setChoice(null); setError(""); setRetry(n => n + 1); }} />
            </div>
          )}
      </section>
    </div>
  );
}
