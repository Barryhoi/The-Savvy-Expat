import "@/components/book/book.css";
import { bookAvailableTimes } from "@/lib/book-event";
import { BOOK_EVENT_URL } from "@/lib/book-site";

// Color test for Calendly's form (step 2 of /book). Calendly only takes
// background, text and primary (buttons/accents) colors from the URL.
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Booking Form Colors | The Savvy Expat",
  robots: { index: false, follow: false },
};

const VARIANTS = [
  { label: "1. Current (live)", background: "ffffff", text: "041630", primary: "4934fb" },
  { label: "2. Lavender tint", background: "f7f5ff", text: "041630", primary: "4934fb" },
  { label: "3. Navy buttons", background: "ffffff", text: "041630", primary: "041630" },
  { label: "4. Soft purple", background: "ffffff", text: "2a3147", primary: "6f61ff" },
];

async function firstSlotUrl() {
  const now = new Date();
  for (let i = 0; i < 2; i++) {
    const month = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + i, 1)).toISOString().slice(0, 7);
    try {
      const slots = await bookAvailableTimes(month);
      if (slots.length) return slots[slots.length - 1].schedulingUrl;
    } catch { /* fall through */ }
  }
  return BOOK_EVENT_URL;
}

export default async function EmbedColorsPage() {
  const base = await firstSlotUrl();
  return (
    <main className="bk-compare">
      <h1>Booking form colors (step 2)</h1>
      <p>This is Calendly’s real form for an open time. Don’t press Schedule Event, it books a real call.</p>
      <div className="bk-embed-grid">
        {VARIANTS.map((v) => {
          const url = new URL(base);
          url.searchParams.set("background_color", v.background);
          url.searchParams.set("text_color", v.text);
          url.searchParams.set("primary_color", v.primary);
          url.searchParams.set("hide_gdpr_banner", "1");
          url.searchParams.set("hide_event_type_details", "1");
          url.searchParams.set("embed_type", "Inline");
          url.searchParams.set("embed_domain", "thesavvyexpat.com");
          return (
            <section key={v.label}>
              <header><h2>{v.label}</h2></header>
              <div className="bk-embed-frame"><iframe src={url.toString()} title={v.label} /></div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
