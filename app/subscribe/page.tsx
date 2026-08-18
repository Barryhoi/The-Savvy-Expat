import { Plus_Jakarta_Sans } from "next/font/google";
import SubscribeFlow from "@/components/SubscribeFlow";

export const metadata = {
  title: "Subscribe Free — The Savvy Expat",
  description:
    "Join 5,000+ expats and retirees getting the real inside scoop on retiring in the Philippines — free, weekly, under 3 minutes.",
};

// Every value here is measured off savvyexpatdigest.com/subscribe at 1512px.
// The rest of this site is set in Satoshi; this page is deliberately the
// exception, because the page it mirrors is set in Plus Jakarta Sans and the
// two faces do not render at the same visual size at a given px.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
});

const PAGE_GRADIENT =
  "linear-gradient(180deg, #EEEAFD 0%, #F5F3FF 30%, #FAFAFE 65%, #FFFFFF 100%)";

// The page shell (gradient, grain, decorative bloom, footer) persists across
// every step of the funnel; SubscribeFlow owns what fills it — email
// capture, then the qualifying survey, then the hand-off into /king. Each
// step is a full-page moment on the same shell, not a card swapped in a
// corner of a fixed layout.
export default function SubscribePage() {
  return (
    <main
      className={`${jakarta.className} grain relative flex min-h-screen flex-col overflow-hidden`}
      style={{ background: PAGE_GRADIENT }}
    >
      {/* A single soft bloom behind the headline — enough to give the wash a
          light source, not enough to notice on its own. Decorative, absolutely
          positioned and pointer-events-none, so the measured layout is
          untouched. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] -top-[26%] h-[760px] w-[760px] rounded-full bg-[radial-gradient(circle,rgba(73,52,251,0.07),transparent_70%)]" />
      </div>

      <SubscribeFlow />

      <p className="relative z-10 px-4 pb-4 text-[12px] font-light text-[#000101]">
        &copy; 2026 Savvy Expat.
      </p>
    </main>
  );
}
