"use client";
import { useEffect, useRef, useState } from "react";
import NativeBookingDetails from "./NativeBookingDetails";
import { getTimeZones, timeZoneLabel } from "@/lib/timezones";
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
  setterToken,
}: {
  application: { id: string; name: string; email: string; phone: string };
  setterToken?: string;
}) {
  const [zone, setZone] = useState("UTC"),
    [zones, setZones] = useState(() => getTimeZones("UTC"));
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
    const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] })
      .supportedValuesOf?.("timeZone");
    setZones(getTimeZones(local, supported));
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/booking/availability${setterToken ? `?setter=${encodeURIComponent(setterToken)}` : ""}`, { signal: controller.signal })
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
  }, [retry, setterToken]);
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
    if (selected) { details.current?.focus({ preventScroll: true }); details.current?.scrollIntoView({ block: "start", behavior: "instant" }); }
  }, [selected]);
  const makeUrl = (base: string) => {
    const url = new URL(base);
    url.searchParams.set("primary_color", "4934fb");
    url.searchParams.set("timezone", zone);
    url.searchParams.set("utm_content", setterToken ? `setter_${application.id}` : `se_${application.id}`);
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
    <div className={`savvy-booking booking-simple${selected ? " booking-confirm-step" : ""}`}>
      <section className="booking-scheduler">
          {!selected ? (
            <>
              <header className="booking-simple-heading"><h1>Choose a time.</h1><p>30-minute discovery call · Google Meet</p></header>
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
                  <label className="calendar-zone"><span>Time zone</span><select value={zone} onChange={e => {setZone(e.target.value);setDate("");setMonth("");setChoice(null);}}><optgroup label="Common U.S. time zones">{zones.common.map(z => <option key={z} value={z}>{timeZoneLabel(z)}</option>)}</optgroup><optgroup label="Other time zones">{zones.additional.map(z => <option key={z} value={z}>{timeZoneLabel(z)}</option>)}</optgroup></select></label>
                  <p className="calendar-caption">All times are shown in your time zone.</p>
                </div>
                <div className="times-panel">
                  <h3 ref={times} tabIndex={-1}>{activeDate ? formatDay(activeDate, {weekday: "long", month: "short", day: "numeric"}) : "Available times"}</h3>
                  <div className="time-list" ref={timeList} role="group" aria-label="Available times">
                    {loading ? <p role="status">Finding available times…</p> : chosen.map(slot => <button key={slot.start} aria-pressed={choice?.start === slot.start} className={choice?.start === slot.start ? "time-choice selected" : "time-choice"} onClick={() => setChoice(slot)}>{new Intl.DateTimeFormat("en", {timeZone: zone, hour: "numeric", minute: "2-digit"}).format(new Date(slot.start))}</button>)}
                    {!loading && !error && !chosen.length && <p>No times available in the current booking window. Please check again later.</p>}
                  </div>
                  <button className="calendar-continue" aria-label={choice ? "Continue with selected time" : "Choose a time to continue"} disabled={!choice || loading} onClick={() => setSelected(choice)}><span>{choice ? "Continue" : "Choose a time"}</span><span className="calendar-continue-arrow" aria-hidden="true">→</span></button>
                  <p className="time-hint">{choice ? <><strong>{new Intl.DateTimeFormat("en", { timeZone: zone, hour: "numeric", minute: "2-digit" }).format(new Date(choice.start))}</strong> selected <span aria-hidden="true">·</span> Confirm your details next</> : "Select a time to continue"}</p>
                </div>
              </div>
              {error && <p role="alert" className="calendar-error">{error}</p>}
              <div className="calendar-footer"><button disabled={loading} onClick={() => {setChoice(null);setRetry(n => n + 1);}}>Refresh times</button><a href={makeUrl(eventUrl)} target="_blank" rel="noopener noreferrer">Trouble booking? ↗</a></div>
            </>
          ) : (
            <div className="booking-details outline-none" tabIndex={-1} ref={details}>
              <NativeBookingDetails application={application} start={selected.start} zone={zone} setterToken={setterToken} onBack={() => { setSelected(null); setChoice(null); setError(""); setRetry(n => n + 1); }} />
            </div>
          )}
      </section>
    </div>
  );
}
