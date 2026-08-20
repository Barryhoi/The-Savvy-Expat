"use client";

import { useState } from "react";
import Image from "next/image";

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  /** Custom thumbnail (e.g. /thumbnails/1.png). Falls back to YouTube's. */
  thumbnail?: string;
  /** Renders a stronger glow treatment for the main VSL video. */
  featured?: boolean;
  /** Starts the video on mount instead of waiting for a click. */
  autoPlay?: boolean;
}

/**
 * Lite YouTube embed: shows the thumbnail with a play button and only loads
 * the iframe when clicked, keeping the page fast.
 *
 * With `autoPlay` the iframe mounts immediately and unmuted, per the brief.
 * Note that Chrome and Safari only allow unattended playback when a video is
 * muted, so on a first visit the browser will usually hold this at its poster
 * with YouTube's own play control showing, and one click starts it with sound.
 */
export default function YouTubeEmbed({
  videoId,
  title,
  thumbnail,
  featured = false,
  autoPlay = false,
}: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(autoPlay);
  // maxresdefault is the true 16:9 frame at 1280px. hqdefault is only 480x360
  // in 4:3, so it crops and looks soft in a widescreen card. Not every video
  // has a maxres though, so fall back the moment it fails to load.
  const [posterFailed, setPosterFailed] = useState(false);
  const ytPoster = posterFailed
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const posterSrc = thumbnail ?? ytPoster;

  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    ...(autoPlay ? { playsinline: "1" } : {}),
  });

  return (
    <div
      // Lenis (site-wide smooth scroll) fights the iframe's own scroll
      // capture once it's playing — this opts the embed out so scrolling
      // over/through it doesn't glitch against the eased scroll everywhere
      // else on the page. Only set once the iframe actually exists: applying
      // it to the idle thumbnail button too (which captures no scroll input
      // of its own) made Lenis hand off between native and smoothed scroll
      // at every thumbnail on a video-grid page, which is its own glitch.
      {...(playing ? { "data-lenis-prevent": true } : {})}
      className={`relative aspect-video w-full overflow-hidden bg-ink ${
        featured
          ? "rounded-xl"
          : "rounded-2xl shadow-card ring-1 ring-ink/10"
      }`}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?${params}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          <Image
            src={posterSrc}
            alt={title}
            onError={() => setPosterFailed(true)}
            fill
            priority={featured}
            sizes={featured ? "(max-width: 860px) 100vw, 820px" : "(max-width: 640px) 100vw, 50vw"}
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-ink/15 transition-colors group-hover:bg-ink/5" />
          {/* Featured thumbnails are portraits, so the control sits in the
              lower-left corner instead of over the subject's face. The scrim
              keeps it legible whatever the frame underneath happens to be. */}
          {featured && (
            <span
              className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent"
              aria-hidden="true"
            />
          )}
          <span
            className={`absolute flex items-center justify-center rounded-full ring-1 ring-white/50 transition-all duration-500 group-hover:scale-110 ${
              featured
                ? "bottom-5 left-5 h-20 w-20 sm:bottom-7 sm:left-7 sm:h-24 sm:w-24"
                : "left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2"
            }`}
            style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
          >
            <span
              className={`btn-shine flex items-center justify-center rounded-full bg-gradient-to-br from-white to-[#EFEDFB] shadow-[0_8px_28px_-6px_rgba(4,22,48,0.45)] transition-shadow duration-500 group-hover:shadow-[0_12px_36px_-6px_rgba(73,52,251,0.55)] ${
                featured
                  ? "h-[3.75rem] w-[3.75rem] sm:h-[4.5rem] sm:w-[4.5rem]"
                  : "h-12 w-12"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={featured ? "h-7 w-7 sm:h-8 sm:w-8" : "h-5 w-5"}
                aria-hidden="true"
              >
                {/* Rounded play triangle: stroke + linejoin softens the corners */}
                <path
                  d="M7.6 5.8L17 12l-9.4 6.2z"
                  fill="#4934FB"
                  stroke="#4934FB"
                  strokeWidth="2.8"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
