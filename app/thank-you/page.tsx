import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import FunnelHeader from "@/components/FunnelHeader";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import ClientVideos from "@/components/ClientVideos";

// The explainer to watch before the call.
const PRE_CALL_VIDEO_ID = "wWbfSZrcMXo";

export const metadata = {
  title: "You're Booked — The Savvy Expat",
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

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <div className="bg-hero">
        <FunnelHeader current={3} />

        <section className="px-6 pb-16 pt-12">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <ConfirmedBadge />
              <h1 className="mt-7 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
                Your Call Has Been Successfully Booked
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink/60">
                Please Check Your Email And Watch This Short Video Before Our
                Call
              </p>
            </Reveal>
          </div>

          <Reveal delay={180}>
            <div className="relative mx-auto mt-12 w-full max-w-[820px]">
              <div
                className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary to-primary-soft opacity-25 blur-xl"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden rounded-2xl shadow-[0_24px_60px_-30px_rgba(4,22,48,0.45)]">
                <YouTubeEmbed
                  videoId={PRE_CALL_VIDEO_ID}
                  title="Watch this before your call with The Savvy Expat"
                  thumbnail="/thumbnails/thank-you.png"
                  featured
                  autoPlay
                />
              </div>
            </div>
          </Reveal>
        </section>
      </div>

      <main className="flex-1">
        <ClientVideos
          heading="While You Wait, Meet A Few Clients"
          subheading="They all started with the same call you just booked."
        />
      </main>

      <Footer />
    </div>
  );
}
