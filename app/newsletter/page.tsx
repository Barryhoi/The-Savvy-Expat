import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import SubscribeForm from "@/components/SubscribeForm";
import NewsletterList, { type NewsletterPost } from "@/components/NewsletterList";
import { formatShortDate, getPosts, isBeehiivConfigured } from "@/lib/beehiiv";

export const metadata = {
  title: "The Newsletter — The Savvy Expat",
  description:
    "Every newsletter we've ever sent — real stories, visa updates, and cost of living breakdowns from expats living in the Philippines.",
};

function MailIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function EmptyState({ configured }: { configured: boolean }) {
  return (
    <section className="px-6 py-24">
      <Reveal>
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-12 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lavender text-primary">
            <MailIcon className="h-6 w-6" />
          </div>
          <p className="mt-6 text-xl font-black">No newsletters yet</p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
            {configured
              ? "Once new newsletters are published, they'll show up here automatically."
              : "Add your BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID to .env.local to load newsletters here."}
          </p>
          <Link
            href="/subscribe"
            className="btn-shine mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-glow transition-all duration-300 hover:-translate-y-0.5"
          >
            Subscribe For Free
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

export default async function NewsletterPage() {
  const posts = await getPosts();
  const configured = isBeehiivConfigured();

  const newsletters: NewsletterPost[] = posts.map((post) => {
    const subtitle = post.subtitle ?? "";
    return {
      id: post.id,
      title: post.title,
      excerpt: subtitle || post.preview_text || "",
      thumbnail: post.thumbnail_url ?? null,
      date: formatShortDate(post.publish_date ?? post.displayed_date),
      byline: post.authors?.[0] ?? "The Savvy Expat",
    };
  });

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Header />

      <main className="flex-1">
        {/* ---------- Masthead ---------- */}
        <section className="bg-hero">
          <div className="mx-auto max-w-3xl px-6 pb-14 pt-16 text-center sm:pt-20">
            <Reveal>
              <h1 className="text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                The Savvy Expat
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/60">
                Helping expats and retirees navigate the move to the
                Philippines, covering cost of living, visas, housing,
                healthcare, and lifestyle tips from someone who&apos;s done it.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mx-auto mt-9 max-w-md">
                <SubscribeForm variant="inline" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- Every issue ---------- */}
        {newsletters.length === 0 ? (
          <EmptyState configured={configured} />
        ) : (
          <section className="px-6 pb-28">
            <div className="mx-auto max-w-6xl">
              <NewsletterList posts={newsletters} />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
