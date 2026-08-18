/* eslint-disable @next/next/no-img-element */

// Client avatar strip from the live site's trust row.
const AVATARS = [
  "https://framerusercontent.com/images/yxqu4J2BsbAT1mOgX4lLwhcYDI.jpg",
  "https://framerusercontent.com/images/4i4gerdoLnBy1atJtSO13IOp1VU.jpg",
  "https://framerusercontent.com/images/LuhsEpZPH21EgbX8piE1Sn0Unf4.jpg",
  "https://framerusercontent.com/images/KB84UUzlr0d4clDQQ9khInt2JbM.jpg",
  "https://framerusercontent.com/images/BzSzB8Q4gZ9Ez9pLPI9AnmYi7kg.jpg",
];

export default function TrustBadge({
  label = "Trusted by 200+ Expats 🇵🇭",
}: {
  label?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex -space-x-2.5">
        {AVATARS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
            style={{ zIndex: AVATARS.length - i }}
          />
        ))}
      </div>
      <div className="text-left">
        <div
          className="flex gap-0.5 text-white drop-shadow-[0_1px_1px_rgba(4,22,48,0.25)]"
          aria-label="5 star rating"
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 00-.36-1.12L2.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.29z" />
            </svg>
          ))}
        </div>
        <p className="mt-0.5 text-sm font-medium text-ink/70">{label}</p>
      </div>
    </div>
  );
}
