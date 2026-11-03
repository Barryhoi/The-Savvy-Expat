"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Self-hosted MP4 (served from /public on Vercel's CDN, no YouTube).
 * Shows the poster with the same play button as YouTubeEmbed and only starts
 * downloading the video once clicked.
 */
export default function HostedVideo({
  src,
  poster,
  title,
}: {
  src: string;
  poster: string;
  title: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-ink shadow-card ring-1 ring-ink/10">
      {playing ? (
        <video
          src={src}
          poster={poster}
          controls
          autoPlay
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full bg-ink object-contain"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 h-full w-full"
        >
          <Image
            src={poster}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-ink/15 transition-colors group-hover:bg-ink/5" />
          <span
            className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full ring-1 ring-white/50 transition-all duration-500 group-hover:scale-110"
            style={{ backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}
          >
            <span className="btn-shine flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-white to-[#EFEDFB] shadow-[0_8px_28px_-6px_rgba(4,22,48,0.45)] transition-shadow duration-500 group-hover:shadow-[0_12px_36px_-6px_rgba(73,52,251,0.55)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M7.6 5.8L17 12l-9.4 6.2z" fill="#4934FB" stroke="#4934FB" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
