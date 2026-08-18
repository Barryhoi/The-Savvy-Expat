import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import QuoteMarquee from "@/components/QuoteMarquee";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { REVIEW_VIDEOS, WRITTEN_REVIEWS } from "@/lib/reviews";

export const metadata = {
  title: "Reviews — The Savvy Expat",
  description:
    "Real stories from real expats who relocated to the Philippines with The Savvy Expat, in their own words.",
};

const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@TheSavvyExpat";

function ReviewVideoCard({
  id,
  name,
  location,
}: {
  id: string;
  name: string;
  location: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink/5">
      <YouTubeEmbed videoId={id} title={`${name}, ${location} — client story`} />
      <div className="p-5">
        <p className="font-black">{name}</p>
        <p className="text-sm text-ink/50">{location}</p>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Header />

      <main className="flex-1">
        {/* ---------- Hero ---------- */}
        <section className="bg-hero">
          <div className="mx-auto max-w-3xl px-6 pb-14 pt-16 text-center sm:pt-20">
            <Reveal>
              <h1 className="text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl">
                Why Expats Choose The Savvy Expat, In Their Own Words
              </h1>
              <p className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-lavender px-4 py-2 text-sm font-bold text-primary">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
                170+ Clients satisfied
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------- Video testimonials ---------- */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Eyebrow icon="users">Video Testimonials</Eyebrow>
                  <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                    Hear It In Their Own Words
                  </h2>
                  <p className="mt-3 max-w-xl text-base text-ink/60">
                    Watch real clients talk about their move to the
                    Philippines.
                  </p>
                </div>
                <a
                  href={YOUTUBE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm font-bold text-primary transition-colors hover:text-[#3d2ae8]"
                >
                  All videos →
                </a>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {REVIEW_VIDEOS.map((video, index) => (
                <Reveal key={video.id} delay={(index % 3) * 100}>
                  <ReviewVideoCard {...video} />
                </Reveal>
              ))}
            </div>

            <Reveal delay={150}>
              <div className="mt-10 text-center">
                <a
                  href={YOUTUBE_CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-primary transition-colors hover:text-[#3d2ae8]"
                >
                  See more testimonials here
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- Written reviews ---------- */}
        <QuoteMarquee
          heading="Real Reviews From Real Clients"
          subheading="Real feedback from clients who moved to the Philippines with The Savvy Expat."
          quotes={WRITTEN_REVIEWS}
          showTrustBadge={false}
        />

        {/* ---------- Close ---------- */}
        <section className="px-6 py-24">
          <Reveal>
            <div className="lift mx-auto max-w-2xl rounded-3xl bg-primary p-10 text-center text-on-primary shadow-glow sm:p-14">
              <h2 className="text-2xl font-black leading-tight tracking-tight sm:text-3xl">
                Ready to start your own story?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed opacity-80 sm:text-base">
                Get the same support these clients had. Plan your move with
                the team behind every review on this page.
              </p>
              <div className="mt-8">
                <Link
                  href="/"
                  prefetch
                  className="btn-shine inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary shadow-[0_10px_30px_-10px_rgba(4,22,48,0.4)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  Start Your Move To The Philippines
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
