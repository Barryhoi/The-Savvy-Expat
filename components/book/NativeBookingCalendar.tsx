"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import CalendlyEmbed from "./CalendlyEmbed";
import { dateInZone, monthDays, moveMonth, type AvailableSlot } from "@/lib/booking-time";


const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function NativeBookingCalendar({ nextHref, colors }: { nextHref: string; colors?: Record<string, string> }) {
  const [zone, setZone] = useState("");
  const [zones, setZones] = useState<string[]>([]);
  const [month, setMonth] = useState("");
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [day, setDay] = useState("");
  const [choice, setChoice] = useState<AvailableSlot | null>(null);
  const [booking, setBooking] = useState<AvailableSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [fallback, setFallback] = useState(false);
  const timeList = useRef<HTMLDivElement>(null);
  const stepPanel = useRef<HTMLDivElement>(null);
  const previousBooking = useRef<AvailableSlot | null>(null);
  const jumpedMonth = useRef(false);

  useLayoutEffect(() => {
    // Preserve browser scroll restoration on initial mount. Reposition only
    // when the visitor moves between the calendar and their booking details.
    if (previousBooking.current === booking) return;
    previousBooking.current = booking;
    // On phones the Continue button sits below the calendar. Bring the new
    // step into view before paint, instead of leaving visitors at the footer.
    const top = stepPanel.current?.getBoundingClientRect().top;
    // On touch screens step 2 is sized to fit the screen, so line it up with
    // the top of the screen to keep the whole form in view.
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (top !== undefined && (top < 0 || (touch && booking && top > 16)))
      window.scrollTo({ top: window.scrollY + top - 16, behavior: "instant" });
  }, [booking]);

  useEffect(() => {
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const supported = (Intl as typeof Intl & { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.("timeZone") ?? ["UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Manila", "Australia/Sydney"];
    setZones([...new Set([localZone, "UTC", ...supported])]);
    setZone(localZone);
    setMonth(dateInZone(new Date().toISOString(), localZone).slice(0, 7));
  }, []);

  useEffect(() => {
    if (!month) return;
    const abort = new AbortController();
    setLoading(true); setError(false); setChoice(null); setSlots([]);
    fetch(`/api/book/availability?month=${month}`, { signal: abort.signal, cache: "no-store" })
      .then(async response => {
        if (!response.ok) throw new Error("Availability unavailable");
        return response.json();
      })
      .then(data => { setSlots(data.slots); setLoading(false); })
      .catch(error => { if (error.name !== "AbortError") { setError(true); setLoading(false); } });
    return () => abort.abort();
  }, [month, retry]);

  const days = useMemo(() => {
    const grouped = new Map<string, AvailableSlot[]>();
    if (!zone) return grouped;
    for (const slot of slots) {
      if (Date.parse(slot.startTime) <= Date.now()) continue;
      const date = dateInZone(slot.startTime, zone);
      if (!date.startsWith(month)) continue;
      grouped.set(date, [...(grouped.get(date) ?? []), slot]);
    }
    return grouped;
  }, [slots, zone, month]);
  const selectedDay = days.has(day) ? day : [...days.keys()].sort()[0] ?? "";
  const times = days.get(selectedDay) ?? [];
  const today = zone ? dateInZone(new Date().toISOString(), zone) : "";
  const { offset, count } = month ? monthDays(month) : { offset: 0, count: 0 };
  const monthLabel = month ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T12:00:00Z`)) : "Loading calendar…";
  const dayLabel = selectedDay ? new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${selectedDay}T12:00:00Z`)) : "Available times";
  const timeLabel = (time: string) => new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: zone }).format(new Date(time));

  // Near the end of a month the next open times can all be in the next month.
  // Open there once instead of showing an empty calendar.
  useEffect(() => {
    if (loading || error || jumpedMonth.current || !month || !today) return;
    if (month !== today.slice(0, 7)) return;
    if (days.size === 0) {
      jumpedMonth.current = true;
      setMonth(moveMonth(month, 1));
      setDay("");
    }
  }, [loading, error, days, month, today]);

  function chooseDay(date: string) {
    setDay(date); setChoice(null);
    timeList.current?.scrollTo({ top: 0 });
  }

  if (fallback) return <CalendlyEmbed nextHref={nextHref} colors={colors} />;

  // Calendly's form takes ~15s to load. Start loading it (off screen) as soon
  // as a time is picked, and keep the same instance when Continue is pressed.
  // Before a time is picked, warm up with the first open time of the shown
  // day: Calendly's scripts and styles are then cached for whichever time
  // the visitor picks.
  const formSlot = booking ?? choice ?? (!loading && !error ? times[0] ?? null : null);
  const formUrl = formSlot && zone ? (() => { const url = new URL(formSlot.schedulingUrl); url.searchParams.set("timezone", zone); return url.toString(); })() : null;
  const resetToCalendar = () => { setBooking(null); setChoice(null); setRetry(value => value + 1); };
  const form = formUrl && <div key={formUrl} ref={booking ? stepPanel : undefined} className={booking ? "bkn-details" : "bkn-preload"} aria-hidden={booking ? undefined : true}>
    {booking && <button className="bkn-change" onClick={resetToCalendar}>← Change time</button>}
    <CalendlyEmbed nextHref={nextHref} colors={colors} bookingUrl={formUrl} onReturn={resetToCalendar} />
  </div>;

  // Same tree shape before and after Continue, so the loaded form is reused.
  return <>{form}{!booking && <div key="calendar" ref={stepPanel} className="bkn-booking">
    <ol className="bk-steps" aria-label="Booking progress">
      <li className="is-current" aria-current="step"><span aria-hidden="true">1</span>Choose a time</li>
      <li><span aria-hidden="true">2</span>Your details</li>
    </ol>
    <div className="bkn-calendar-card" aria-busy={loading}>
      <h3 className="sr-only">Select a date &amp; time</h3>
      <div className="bkn-calendar-grid">
        <div className="bkn-month-panel">
          <div className="bkn-month-bar">
            <h4 aria-live="polite">{monthLabel}</h4>
            <div className="bkn-month-controls">
              <button aria-label="Previous month" disabled={!month || month <= today.slice(0, 7) || loading} onClick={() => { setMonth(moveMonth(month, -1)); setDay(""); }}>‹</button>
              <button aria-label="Next month" disabled={!month || month >= moveMonth(today.slice(0, 7) || month, 11) || loading} onClick={() => { setMonth(moveMonth(month, 1)); setDay(""); }}>›</button>
            </div>
          </div>
          <div className="bkn-days" aria-label="Choose an available date">
            {weekdays.map(weekday => <span className="bkn-weekday" key={weekday}>{weekday}</span>)}
            {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} />)}
            {Array.from({ length: count }, (_, index) => {
              const number = index + 1;
              const date = `${month}-${String(number).padStart(2, "0")}`;
              const available = days.has(date);
              return <button key={date} disabled={!available || loading} className={`${available ? "is-available" : ""} ${date === selectedDay ? "is-selected" : ""} ${date === today ? "is-today" : ""}`} aria-label={`${new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`))}${available ? ", times available" : ", no times available"}`} aria-pressed={date === selectedDay} onClick={() => chooseDay(date)}>{number}</button>;
            })}
          </div>
          <label className="bkn-timezone">Time zone<select aria-label="Time zone" value={zone} onChange={event => { setZone(event.target.value); setDay(""); setChoice(null); }}>{zones.map(item => <option key={item} value={item}>{item.replaceAll("_", " ").replaceAll("/", " / ")}</option>)}</select></label>
        </div>
        <div className="bkn-times-panel">
          <h4>{dayLabel}</h4>
          <div ref={timeList} className="bkn-time-list" aria-label={`Available times for ${dayLabel}`}>
            {loading ? <div className="bkn-status" role="status"><span className="bk-spinner" /><p>Finding available times…</p></div> : error ? <div className="bkn-status" role="alert"><p>We couldn’t load the calendar.</p><button className="bkn-retry" onClick={() => setRetry(value => value + 1)}>Try again</button><button className="bkn-text-button" onClick={() => setFallback(true)}>Open booking calendar ↗</button></div> : times.length ? times.map(slot => <button key={slot.startTime} className={`bkn-time ${choice?.startTime === slot.startTime ? "is-selected" : ""}`} aria-pressed={choice?.startTime === slot.startTime} onClick={() => setChoice(slot)}><span>{timeLabel(slot.startTime)}</span><span aria-hidden="true">{choice?.startTime === slot.startTime ? "✓" : ""}</span></button>) : <div className="bkn-status"><p>No times available this month.</p>{month < moveMonth(today.slice(0, 7) || month, 11) && <button className="bkn-text-button" onClick={() => setMonth(moveMonth(month, 1))}>Check next month →</button>}</div>}
          </div>
          <button className="bkn-continue" disabled={!choice || loading} onClick={() => { if (choice && Date.parse(choice.startTime) > Date.now()) setBooking(choice); else setRetry(value => value + 1); }}>Continue<span aria-hidden="true">→</span></button>
          <p className="sr-only" aria-live="polite">{choice ? `${timeLabel(choice.startTime)} · ${dayLabel}` : "Select a time to continue"}</p>
        </div>
      </div>
    </div>
    <div className="bk-help"><span>Times shown in your time zone.</span><button className="bkn-text-button" onClick={() => setFallback(true)}>Trouble booking? ↗</button></div>
  </div>}</>;
}
