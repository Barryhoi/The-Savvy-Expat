import { Plus_Jakarta_Sans } from "next/font/google";
import SurveyFlow from "@/components/SurveyFlow";

export const metadata = {
  title: "Subscriber Survey — The Savvy Expat",
  description:
    "A few quick questions so we know how to help with your move to the Philippines.",
  // Mid-funnel step: only reachable from /subscribe, never from search.
  robots: { index: false, follow: false },
};

// Same shell as /subscribe — this page is step two of that funnel and has
// to read as the same place, down to the deliberate Plus Jakarta Sans
// exception to the site's Satoshi.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "700", "800"],
  display: "swap",
});

const PAGE_GRADIENT =
  "linear-gradient(180deg, #EEEAFD 0%, #F5F3FF 30%, #FAFAFE 65%, #FFFFFF 100%)";

export default function SurveyPage() {
  return (
    <main
      className={`${jakarta.className} grain relative flex min-h-screen flex-col overflow-hidden`}
      style={{ background: PAGE_GRADIENT }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] -top-[26%] h-[760px] w-[760px] rounded-full bg-[radial-gradient(circle,rgba(73,52,251,0.07),transparent_70%)]" />
      </div>

      <SurveyFlow />

      <p className="relative z-10 px-4 pb-4 text-[12px] font-light text-[#000101]">
        &copy; 2026 Savvy Expat.
      </p>
    </main>
  );
}
