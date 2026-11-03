// Where /book sends people after Calendly confirms the booking. Unlike
// /thank-you it isn't tied to the old application cookie.
import Reveal from "@/components/Reveal";
import Image from "next/image";
import Link from "next/link";
import ClientVideos from "@/components/ClientVideos";
import TrustpilotReviews from "@/components/TrustpilotReviews";
import "@/components/book/book.css";

export const metadata = {
  title: "You're Booked | The Savvy Expat",
  description: "Your call with The Savvy Expat is confirmed.",
  robots: { index: false, follow: false },
};

function ConfirmedBadge() {
  return (
    <p className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-white/80 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur">
      <span className="rounded-full bg-primary px-3 py-1 text-[0.7rem] font-black uppercase tracking-wider text-on-primary">
        Confirmed
      </span>
      <span className="text-sm font-bold tracking-wide">
        Your call is booked 🎉
      </span>
    </p>
  );
}

export default function BookedPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <div className="bg-hero">
        <header className="flex justify-center px-6 pt-8">
          <Link href="/"><Image src="/logo.png" alt="The Savvy Expat" width={105} height={80} priority className="funnel-logo" /></Link>
        </header>

        <section className="px-6 pb-4 pt-12">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <ConfirmedBadge />
              <h1 className="mt-7 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
                Your discovery call is booked.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink/60">
                Your booking is confirmed and the details are in your email. To help
                you prepare for your chat with The Savvy Expat team, take a few minutes
                to read what our clients say and watch their stories below.
              </p>
            </Reveal>
          </div>

        </section>

        <TrustpilotReviews />
      </div>

      {/* No site footer on the funnel pages: the visitor has just booked;
          a newsletter box and social links here only dilute the ending. */}
      <main className="flex-1 pb-16">
        <ClientVideos
          heading="Watch these before your call"
          subheading="Real clients on what it was like making the move with The Savvy Expat."
        />
      </main>
    </div>
  );
}
