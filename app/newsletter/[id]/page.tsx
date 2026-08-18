import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ScrollProgress from "@/components/ScrollProgress";
import SubscribeForm from "@/components/SubscribeForm";
import { formatShortDate, getPost, getPosts } from "@/lib/beehiiv";
import { categorizePost, getCategory } from "@/lib/categories";
import type { BeehiivPost } from "@/types/beehiiv";

interface PostPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await getPost(params.id);
  if (!post) return { title: "Newsletter Not Found — The Savvy Expat" };
  return {
    title: `${post.title} — The Savvy Expat`,
    description: post.subtitle ?? post.preview_text,
    openGraph: post.thumbnail_url ? { images: [post.thumbnail_url] } : undefined,
  };
}

function BackArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M17 10a.75.75 0 01-.75.75H6.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 111.06 1.06L6.56 9.25h9.69A.75.75 0 0117 10z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-9 w-9"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

function RelatedCard({ post }: { post: BeehiivPost }) {
  const byline = (post.authors?.[0] ?? "The Savvy Expat").toUpperCase();
  const date = formatShortDate(post.publish_date ?? post.displayed_date);

  return (
    <Link href={`/newsletter/${post.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow hover:ring-primary/25">
        <div className="relative aspect-video w-full overflow-hidden bg-lavender">
          {post.thumbnail_url ? (
            <Image
              src={post.thumbnail_url}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EFEDFB] to-[#DAD4F2] text-primary/35">
              <MailGlyph />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-base font-black leading-snug transition-colors duration-300 group-hover:text-primary line-clamp-2">
            {post.title}
          </h3>
          <p className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-bold uppercase tracking-wider text-ink/40">
            {byline}
            <span className="text-primary/50" aria-hidden="true">
              &bull;
            </span>
            {date}
          </p>
        </div>
      </article>
    </Link>
  );
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.id);

  if (!post) {
    notFound();
  }

  const contentHtml = post.content?.free?.rss;
  const subtitle = post.subtitle ?? "";
  const category = getCategory(categorizePost(post.title, subtitle));
  const byline = (post.authors?.[0] ?? "The Savvy Expat").toUpperCase();
  const date = formatShortDate(post.publish_date ?? post.displayed_date);

  const allPosts = await getPosts();
  const related = allPosts
    .filter(
      (p) =>
        p.id !== post.id &&
        categorizePost(p.title, p.subtitle ?? "") === category.id
    )
    .slice(0, 3);

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      {/* Reading progress, flying along the underside of the sticky header. */}
      <ScrollProgress anchor="header" />
      <Header />

      <main className="flex-1">
        {/* ---------- Header + title ---------- */}
        <section className="bg-hero">
          <div className="mx-auto max-w-3xl px-6 pt-8">
            <Reveal>
              <Link
                href="/newsletter"
                className="group inline-flex items-center gap-1.5 text-sm font-bold text-ink/60 transition-colors hover:text-primary"
              >
                <BackArrowIcon />
                Back to the Newsletter
              </Link>
            </Reveal>
          </div>

          <article className="px-6 pb-4 pt-8">
            <Reveal>
              <header className="mx-auto max-w-3xl text-center">
                <span
                  className={`inline-flex w-fit items-center rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider ${category.chipClass}`}
                >
                  {category.label}
                </span>
                <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                  {post.title}
                </h1>
                {post.subtitle && (
                  <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink/65 sm:text-xl">
                    {post.subtitle}
                  </p>
                )}
                <p className="mt-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-ink/45">
                  {byline}
                  <span className="text-primary/50" aria-hidden="true">
                    &bull;
                  </span>
                  {date}
                </p>
              </header>
            </Reveal>

            {post.thumbnail_url && (
              <Reveal delay={100}>
                <div className="relative mx-auto mt-10 max-w-4xl">
                  <div
                    className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-soft opacity-[0.12] blur-2xl"
                    aria-hidden="true"
                  />
                  <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] shadow-[0_24px_60px_-30px_rgba(4,22,48,0.45)]">
                    <Image
                      src={post.thumbnail_url}
                      alt={post.title}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 900px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </Reveal>
            )}
          </article>
        </section>

        {/* ---------- Content ---------- */}
        <section className="px-6 pb-20 pt-10">
          <Reveal>
            <div className="mx-auto max-w-[820px]">
              {contentHtml ? (
                <div
                  className="post-content card-soft rounded-[2rem] p-8 sm:p-14"
                  dangerouslySetInnerHTML={{ __html: contentHtml }}
                />
              ) : (
                <div className="card-soft rounded-[2rem] p-12 text-center">
                  <p className="text-ink/70">
                    This newsletter&apos;s content isn&apos;t available here.
                  </p>
                  {post.web_url && (
                    <a
                      href={post.web_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-shine mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-glow transition-all duration-300 hover:-translate-y-0.5"
                    >
                      Read It On beehiiv
                    </a>
                  )}
                </div>
              )}
            </div>
          </Reveal>
        </section>

        {/* ---------- Related newsletters ---------- */}
        {related.length > 0 && (
          <section className="bg-sheen">
            <div className="mx-auto max-w-6xl px-6 py-20">
              <Reveal className="text-center">
                <p className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ink backdrop-blur">
                  <span className={`h-2 w-2 rounded-full ${category.dotClass}`} aria-hidden="true" />
                  More {category.label}
                </p>
                <h2 className="mx-auto max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                  Keep Reading
                </h2>
              </Reveal>
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {related.map((relatedPost, i) => (
                  <Reveal key={relatedPost.id} delay={i * 100}>
                    <RelatedCard post={relatedPost} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------- Subscribe CTA ---------- */}
        <section className="px-6 pb-24 pt-16">
          <Reveal>
            <div className="bg-sheen mx-auto max-w-5xl rounded-[2.5rem] border border-ink/10 px-6 py-20 text-center">
              <h2 className="mx-auto max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                Never Miss A Newsletter
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg text-ink/60">
                Join 5,000+ expats and retirees getting the real inside scoop
                on the Philippines, straight to your inbox every week.
              </p>
              {/* Capture the email here rather than sending people to
                  /subscribe to start over — they have just finished reading an
                  issue, which is the moment they are most willing to sign up. */}
              <div className="mx-auto mt-9 w-full max-w-md">
                <SubscribeForm variant="inline" />
                <p className="mt-3 text-sm text-ink/45">
                  No spam &middot; 100% free &middot; Unsubscribe anytime.
                </p>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
