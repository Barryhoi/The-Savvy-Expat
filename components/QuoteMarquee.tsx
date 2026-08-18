/* eslint-disable @next/next/no-img-element */

import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import TrustBadge from "@/components/TrustBadge";
import { QUOTES, type Quote } from "@/lib/testimonials";

function QuoteCard({ quote, name, avatar }: Quote) {
  return (
    <figure className="card-soft mx-3 flex w-[340px] shrink-0 flex-col justify-between rounded-2xl p-6">
      <div>
        <div
          className="flex gap-0.5 text-white drop-shadow-[0_1px_1px_rgba(4,22,48,0.25)]"
          aria-hidden="true"
        >
          {"★★★★★".split("").map((star, i) => (
            <span key={i} className="text-sm">
              {star}
            </span>
          ))}
        </div>
        <blockquote className="mt-3 text-sm leading-relaxed text-ink/80">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>
      <figcaption className="mt-4 flex items-center gap-3">
        {avatar && (
          <img
            src={avatar}
            alt={name}
            loading="lazy"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        )}
        <span>
          <span className="block text-sm font-bold">{name}</span>
          {avatar && (
            <span className="block text-xs text-ink/50">Philippines Expat</span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

/** Two counter-scrolling rows of written client quotes, plus the trust badge. */
export default function QuoteMarquee({
  heading = "Don't Just Take My Word For It…",
  subheading = "Hear it from my other expat clients who've moved to the Philippines",
  quotes = QUOTES,
  showTrustBadge = true,
}: {
  heading?: string;
  subheading?: string;
  quotes?: Quote[];
  showTrustBadge?: boolean;
}) {
  const half = Math.ceil(quotes.length / 2);
  const reversed = [...quotes.slice(half), ...quotes.slice(0, half)];

  // animate-marquee/-slow run a fixed 45s/60s, tuned for QUOTES' 6 cards.
  // A longer list (like /reviews' 20) has more distance to cover in that
  // same time, which reads as the marquee suddenly speeding up — scale the
  // duration with the card count so the px/sec pace stays constant.
  const speedScale = quotes.length / QUOTES.length;
  const duration = `${45 * speedScale}s`;
  const durationSlow = `${60 * speedScale}s`;

  return (
    <section className="bg-sheen py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <Reveal>
          <Eyebrow icon="users">Testimonials</Eyebrow>
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-base text-ink/60">{subheading}</p>
        </Reveal>
      </div>

      <Reveal delay={150}>
        <div className="marquee-row mt-12 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div
            className="animate-marquee flex w-max"
            style={{ animationDuration: duration }}
          >
            {[...quotes, ...quotes].map((item, i) => (
              <QuoteCard key={`row1-${i}`} {...item} />
            ))}
          </div>
        </div>
        <div className="marquee-row mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div
            className="animate-marquee-slow flex w-max"
            style={{ animationDirection: "reverse", animationDuration: durationSlow }}
          >
            {[...reversed, ...reversed].map((item, i) => (
              <QuoteCard key={`row2-${i}`} {...item} />
            ))}
          </div>
        </div>
      </Reveal>

      {showTrustBadge && (
        <Reveal delay={250} className="mt-12">
          <TrustBadge />
        </Reveal>
      )}
    </section>
  );
}
