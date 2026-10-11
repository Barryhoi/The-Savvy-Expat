import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import BookingPanel from "@/components/book/BookingPanel";

export const metadata = {
  alternates: { canonical: "/book" },
  title: "Book Your Free Discovery Call | The Savvy Expat",
  description: "Book a free 30 minute discovery call with The Savvy Expat. Limited calls each week.",
};

export default function BookPage() {
  return (
    <div className="funnel-page flex min-h-screen flex-col overflow-x-clip">
      <header className="flex justify-center px-6 pt-5 sm:pt-8">
        <Link href="/"><Image src="/logo.png" alt="The Savvy Expat" width={105} height={80} priority className="funnel-logo" /></Link>
      </header>
      <main id="main-content" className="flex-1">
        <section className="px-4 pb-12 pt-4 sm:px-6 sm:pb-16 sm:pt-10">
          <div className="mx-auto max-w-6xl text-center">
            <Reveal>
              <p className="inline-flex items-center gap-2.5 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.18em]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" aria-hidden="true" />
                Private discovery call
              </p>
              <h1 className="mx-auto mt-4 max-w-3xl text-[32px] font-black leading-[1.05] tracking-tight text-ink sm:mt-5 sm:text-6xl">
                Book your move with <span className="text-primary">The Savvy Expat</span>
              </h1>
              <p className="mx-auto mt-3 max-w-md text-base text-ink/60 sm:mt-5 sm:text-lg">
                Simply select a time you can commit to below.
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-primary sm:mt-3 sm:text-xs">
                Limited calls each week
              </p>
            </Reveal>
            <Reveal delay={150} className="mt-6 sm:mt-8">
              <BookingPanel nextHref="/booked" />
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
