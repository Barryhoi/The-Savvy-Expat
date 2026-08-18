"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface NewsletterPost {
  id: string;
  title: string;
  excerpt: string;
  thumbnail: string | null;
  date: string;
  byline: string;
}

/** How many cards are visible at once before "Show more" reveals another batch. */
const PAGE_SIZE = 12;

const AUTHOR_AVATAR = "/evan-portrait.jpg";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.33 3.33a.75.75 0 11-1.06 1.06l-3.33-3.33A7 7 0 012 9z"
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

function NewsletterCard({
  post,
  priority,
}: {
  post: NewsletterPost;
  /** The first row is above the fold, so it loads eagerly instead of flashing empty. */
  priority: boolean;
}) {
  return (
    <Link href={`/newsletter/${post.id}`} className="group block h-full">
      <article className="flex h-full flex-col">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-lavender shadow-card ring-1 ring-ink/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-glow">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#EFEDFB] to-[#DAD4F2] text-primary/35">
              <MailGlyph />
            </div>
          )}
        </div>

        <p className="mt-4 text-xs font-bold text-ink/45">{post.date}</p>

        <h3 className="mt-2 text-lg font-black leading-snug tracking-tight transition-colors duration-300 group-hover:text-primary line-clamp-2">
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-ink/60 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-4">
          <Image
            src={AUTHOR_AVATAR}
            alt=""
            width={24}
            height={24}
            className="h-6 w-6 shrink-0 rounded-full object-cover ring-1 ring-ink/10"
          />
          <span className="text-sm font-medium text-ink/60">{post.byline}</span>
        </div>
      </article>
    </Link>
  );
}

/** Search box plus one flat grid of every issue, newest first. */
export default function NewsletterList({ posts }: { posts: NewsletterPost[] }) {
  const [query, setQuery] = useState("");
  // Rendering all 50+ cards (and their images) at once was the other half of
  // the archive page loading slowly, alongside the heavier data fetch this
  // was paired with. Showing 12 at a time keeps the initial render light.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) =>
      `${post.title} ${post.excerpt}`.toLowerCase().includes(q)
    );
  }, [posts, query]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  function handleSearch(value: string) {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-2xl font-black tracking-tight">Featured</h2>

        <div className="relative w-full sm:max-w-xs">
          <SearchIcon />
          <label htmlFor="newsletter-search" className="sr-only">
            Search newsletters
          </label>
          <input
            id="newsletter-search"
            type="search"
            value={query}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search issues"
            className="w-full rounded-xl border border-ink/10 bg-white/80 py-2.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-ink/35 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          />
        </div>
      </div>

      {query.trim() && (
        <p className="mt-4 text-sm text-ink/45">
          {filtered.length} issue{filtered.length === 1 ? "" : "s"} matching
          &ldquo;{query.trim()}&rdquo;
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-2xl bg-white p-10 text-center shadow-card">
          <p className="text-lg font-bold">No issues match that search</p>
          <p className="mt-2 text-sm text-ink/60">
            Try a broader term like &ldquo;visa&rdquo;, &ldquo;rent&rdquo;, or
            &ldquo;healthcare&rdquo;.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((post, index) => (
              <NewsletterCard key={post.id} post={post} priority={index < 3} />
            ))}
          </div>

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="mx-auto mt-12 flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-6 py-3 text-sm font-bold text-ink transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:text-primary hover:shadow-card"
            >
              Show {Math.min(PAGE_SIZE, remaining)} more
            </button>
          )}
        </>
      )}
    </div>
  );
}
