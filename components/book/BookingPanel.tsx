import Image from "next/image";
import NativeBookingCalendar from "./NativeBookingCalendar";
import CalendlyEmbed from "./CalendlyEmbed";
import "./book.css";

// Same structure as ryanunhinged.com/book: host card on the left, our own
// calendar on the right, then Calendly's form for the details.
export type BookTheme = "current" | "navy" | "soft" | "tint";

// Calendly's own pages (step 2) take their colors from URL parameters.
const CALENDLY_COLORS: Record<BookTheme, Record<string, string> | undefined> = {
  current: undefined,
  navy: { background_color: "0b1f3d", text_color: "ffffff", primary_color: "8b7dff" },
  soft: undefined,
  tint: { background_color: "f7f5ff", text_color: "041630", primary_color: "4934fb" },
};

export default function BookingPanel({ nextHref, theme = "current" }: { nextHref: string; theme?: BookTheme }) {
  const colors = CALENDLY_COLORS[theme];
  return (
    <div className={`bk-panel bk-panel-card bk-theme-${theme}`}>
      <aside className="bk-overview">
        <div className="bk-host">
          <Image src="/evan-portrait.jpg" alt="Evan Lorezca" width={72} height={72} sizes="72px" className="bk-avatar" />
          <div><p>Evan Lorezca</p></div>
        </div>
        <p className="bk-eyebrow">Free · 30 minutes</p>
        <h2 className="bk-title">Discovery call</h2>
        <p className="bk-description">You’ll speak with our Senior Relocation Strategist about your goals, your timeline and your biggest concerns, and we’ll see if we’re the right fit to make your move to the Philippines easy.</p>
        <p className="bk-reassurance">No obligation.</p>
      </aside>
      {process.env.CALENDLY_API_TOKEN ? <NativeBookingCalendar nextHref={nextHref} colors={colors} /> : <CalendlyEmbed nextHref={nextHref} colors={colors} />}
    </div>
  );
}
