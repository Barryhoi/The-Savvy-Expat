"use client";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [fallback, setFallback] = useState(false);
  const [height, setHeight] = useState(1050),
    [frameReady, setFrameReady] = useState(false),
    [confirming, setConfirming] = useState(false);
  const [booked, setBooked] = useState(false);
  const [frameDelayed, setFrameDelayed] = useState(false);
  const pendingInvitee = useRef<string | null>(null),
    confirmingRef = useRef(false);
  const frame = useRef<HTMLIFrameElement>(null),
    times = useRef<HTMLHeadingElement>(null),
    details = useRef<HTMLHeadingElement>(null);
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
      times.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [date]);
  useEffect(() => {
    if (selected || fallback) {
      setFrameReady(false);
      setFrameDelayed(false);
      details.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, [selected, fallback]);
  useEffect(() => {
    if ((!selected && !fallback) || frameReady) return;
    const timer = window.setTimeout(() => setFrameDelayed(true), 15000);
    return () => window.clearTimeout(timer);
  }, [selected, fallback, frameReady]);
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
  const confirmBooking = useCallback(async (uri: string) => {
    if (confirmingRef.current) return;
    confirmingRef.current = true;
    pendingInvitee.current = uri;
    setBooked(true);
    setConfirming(true);
    setError("");
    try {
      const response = await fetch("/api/booking/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteeUri: uri }),
      });
      if (!response.ok) throw Error();
      try {
        sessionStorage.removeItem("savvy-application-v1");
      } catch {}
      window.location.assign("/thank-you");
    } catch {
      setError(
        "Your Calendly booking was created. Keep your confirmation email; we're still syncing the details. Please don't book a second time.",
      );
    } finally {
      confirmingRef.current = false;
      setConfirming(false);
    }
  }, []);
  useEffect(() => {
    function receive(event: MessageEvent) {
      if (
        event.origin !== "https://calendly.com" ||
        event.source !== frame.current?.contentWindow
      )
        return;
      const data = event.data;
      if (!data || typeof data.event !== "string") return;
      if (data.event.startsWith("calendly.")) setFrameReady(true);
      if (data.event === "calendly.page_height") {
        const h = Number(data.payload?.height);
        if (Number.isFinite(h)) setHeight(Math.min(2400, Math.max(700, h)));
      }
      if (
        data.event === "calendly.event_scheduled" &&
        typeof data.payload?.invitee?.uri === "string"
      )
        void confirmBooking(data.payload.invitee.uri);
    }
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, [confirmBooking]);
  const days = Array.from(new Set(slots.map((s) => dateKey(s.start, zone))));
  const chosen = slots.filter((s) => dateKey(s.start, zone) === date);
  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl bg-white/70 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            The Savvy Expat
          </p>
          <h2 className="mt-3 text-2xl font-black">
            Expat Relocation Discovery Call
          </h2>
          <p className="mt-4 font-semibold">30 minutes · Google Meet</p>
          <p className="mt-4 text-sm leading-relaxed text-ink/65">
            You&apos;ll be speaking with our Senior Relocation Strategist. On
            this call, we&apos;ll dive into your goals, timeline, and biggest
            concerns — and see if we&apos;re a good fit to work together for
            your Philippine transition.
          </p>
          <p className="mt-5 text-sm font-bold">Your host: Sam</p>
        </aside>
        <section className="intake-card !p-5 sm:!p-8">
          {!selected && !fallback ? (
            <>
              <h2 className="text-xl font-black">Choose a day</h2>
              <label className="mt-5 block text-sm font-bold">
                Your time zone
                <select
                  value={zone}
                  onChange={(e) => {
                    setZone(e.target.value);
                    setDate("");
                  }}
                  className="intake-input mt-2"
                >
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
              {loading ? (
                <p role="status" className="py-10">
                  Finding available times…
                </p>
              ) : (
                <>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {days.map((day) => {
                      const first = slots.find(
                        (s) => dateKey(s.start, zone) === day,
                      )!;
                      return (
                        <button
                          key={day}
                          aria-pressed={date === day}
                          onClick={() => setDate(day)}
                          className={`min-h-20 rounded-xl border p-3 text-center font-bold ${date === day ? "border-primary bg-primary text-white" : "border-primary/20 bg-white hover:bg-primary/5"}`}
                        >
                          {new Intl.DateTimeFormat("en", {
                            timeZone: zone,
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }).format(new Date(first.start))}
                        </button>
                      );
                    })}
                  </div>
                  {!error && !days.length && (
                    <p className="mt-6">
                      There are no available times in the current booking
                      window. Please check again later.
                    </p>
                  )}
                </>
              )}
              {date && (
                <div className="mt-8">
                  <h3
                    ref={times}
                    tabIndex={-1}
                    className="scroll-mt-6 text-xl font-black outline-none"
                  >
                    Available times
                  </h3>
                  <p className="mt-2 text-sm text-ink/60">
                    {zone.replaceAll("_", " ")} · 30-minute call
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {chosen.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => setSelected(slot)}
                        className="min-h-12 rounded-xl border border-primary/30 bg-white px-3 py-3 font-bold text-primary hover:bg-primary/10"
                      >
                        {new Intl.DateTimeFormat("en", {
                          timeZone: zone,
                          hour: "numeric",
                          minute: "2-digit",
                          timeZoneName: "short",
                        }).format(new Date(slot.start))}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {error && (
                <p role="alert" className="mt-5 text-sm text-red-800">
                  {error}
                </p>
              )}
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-bold">
                <button
                  onClick={() => setRetry((n) => n + 1)}
                  disabled={loading}
                  className="min-h-12 text-primary"
                >
                  Refresh times
                </button>
                <button
                  onClick={() => {
                    setError("");
                    setFallback(true);
                  }}
                  className="min-h-12 text-primary"
                >
                  Open full calendar →
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setSelected(null);
                  setFallback(false);
                  setError("");
                  setRetry((n) => n + 1);
                }}
                disabled={confirming || booked}
                className="mb-5 min-h-12 font-bold text-primary"
              >
                ← Change date or time
              </button>
              <h2
                ref={details}
                tabIndex={-1}
                className="scroll-mt-6 text-xl font-black outline-none"
              >
                Confirm your details
              </h2>
              {selected && (
                <p className="mt-3 text-sm font-bold">
                  {new Intl.DateTimeFormat("en", {
                    timeZone: zone,
                    dateStyle: "full",
                    timeStyle: "short",
                  }).format(new Date(selected.start))}{" "}
                  · {zone}
                </p>
              )}
              {!frameReady && (
                <p role="status" className="my-5">
                  {frameDelayed
                    ? "The calendar is taking longer than expected. You can open secure booking in a new tab below."
                    : "Loading secure booking…"}
                </p>
              )}
              {confirming && (
                <p role="status" className="my-4">
                  Confirming your booking…
                </p>
              )}
              {error && (
                <p role="alert" className="my-4 text-sm text-red-800">
                  {error}
                </p>
              )}
              {booked && error && (
                <button
                  disabled={confirming}
                  onClick={() =>
                    pendingInvitee.current &&
                    void confirmBooking(pendingInvitee.current)
                  }
                  className="my-4 min-h-12 rounded-xl bg-primary px-5 font-bold text-white"
                >
                  Retry confirmation sync
                </button>
              )}
              {!booked && (
                <p className="my-4 text-sm">
                  <a
                    href={makeUrl(selected?.url || eventUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-primary underline"
                  >
                    Having trouble? Open Calendly in a new tab.
                  </a>
                </p>
              )}
              <iframe
                ref={frame}
                className="discovery-embed"
                title="Confirm your discovery call with Sam"
                src={makeUrl(selected?.url || eventUrl)}
                style={{
                  height: frameDelayed && !frameReady ? 400 : height,
                  border: 0,
                }}
                allow="payment"
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
