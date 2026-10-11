import Reveal from "@/components/Reveal";
import BookingPanel, { type BookTheme } from "./BookingPanel";

// The /book page: a two-line headline, then the booking card.
// "tint" (lavender card) is live; "current" and "navy" are kept for reference.
export default function BookPageView({ theme = "current", pageTheme = theme }: { theme?: BookTheme; pageTheme?: BookTheme }) {
  return (
    <div className={`funnel-page bk-page bk-page-${pageTheme} flex min-h-screen flex-col overflow-x-clip`}>
      <main id="main-content" className="flex-1">
        <section className="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16">
          <div className="mx-auto max-w-6xl text-center">
            <Reveal>
              <h1 className="bk-hero-title mx-auto max-w-3xl text-[32px] font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">
                <span className="block">Book your move with</span>
                <span className="block text-primary">The Savvy Expat</span>
              </h1>
            </Reveal>
            <Reveal delay={150} className="mt-8 sm:mt-10">
              <BookingPanel nextHref="/booked" theme={theme} />
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
