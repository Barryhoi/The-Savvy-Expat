import type { ReactNode } from "react";

const PILL_ICONS = {
  users: (
    <svg viewBox="0 0 20 20" fill="#4934FB" className="h-4 w-4" aria-hidden="true">
      <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.6 14.4A5.9 5.9 0 017 11.5a5.9 5.9 0 015.4 2.9c.4.7.05 1.6-.7 1.9A12.5 12.5 0 017 17c-1.9 0-3.7-.4-5.3-1.2-.75-.3-1.1-1.2-.7-1.9zM13.9 11.6a4.7 4.7 0 014.5 2.4c.34.62.05 1.4-.6 1.66-.6.24-1.24.4-1.9.5a3.6 3.6 0 00-.3-1.7 7.4 7.4 0 00-1.7-2.86z" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 20 20" fill="#4934FB" className="h-4 w-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.4 3.9a.9.9 0 01.32 1.23l-.06.09-7.2 9.6a.9.9 0 01-1.3.14l-.08-.08-4.2-4.5a.9.9 0 011.24-1.3l.08.07 3.47 3.71 6.55-8.73a.9.9 0 011.18-.23zM10 0a10 10 0 110 20 10 10 0 010-20zm0 1.8a8.2 8.2 0 100 16.4A8.2 8.2 0 0010 1.8z"
      />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 20 20" fill="#4934FB" className="h-4 w-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M6 2a.75.75 0 01.75.75V4h6.5V2.75a.75.75 0 011.5 0V4A2.5 2.5 0 0117 6.5v8A2.5 2.5 0 0114.5 17h-9A2.5 2.5 0 013 14.5v-8A2.5 2.5 0 015.25 4V2.75A.75.75 0 016 2zM4.5 8v6.5c0 .55.45 1 1 1h9c.55 0 1-.45 1-1V8h-11z"
        clipRule="evenodd"
      />
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 20 20" fill="#4934FB" className="h-4 w-4" aria-hidden="true">
      <path d="M13.6 2.4a2 2 0 012.83 0l1.17 1.17a2 2 0 010 2.83l-8.2 8.2a2 2 0 01-.9.52l-3.3.9a.75.75 0 01-.92-.92l.9-3.3a2 2 0 01.52-.9l8.2-8.2z" />
    </svg>
  ),
} as const;

/** Small pill label that sits above a section heading. */
export default function Eyebrow({
  icon,
  children,
  tone = "light",
}: {
  icon: keyof typeof PILL_ICONS;
  children: ReactNode;
  /** `dark` inverts it for use on the navy sections. */
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={`mb-5 inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] backdrop-blur ${
        tone === "dark"
          ? "border border-white/15 bg-white/10 text-white"
          : "border border-ink/10 bg-white/70 text-ink"
      }`}
    >
      {PILL_ICONS[icon]}
      {children}
    </p>
  );
}
