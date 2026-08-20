const STEPS = [
  { n: 1, label: "Your details" },
  { n: 2, label: "Pick a time" },
  { n: 3, label: "Confirmed" },
];

function TickIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4l3.3 3.29 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Header for the three booking-funnel pages: just the progress indicator.
 * Deliberately drops the site nav — once someone is in the funnel, extra
 * links are just exits.
 */
export default function FunnelHeader({ current }: { current: 1 | 2 | 3 }) {
  return (
    <header className="px-6 pt-10">
      <div className="mx-auto max-w-2xl">
        <ol className="mx-auto flex max-w-md items-center justify-center gap-2 sm:gap-3">
          {STEPS.map((step, i) => {
            const done = step.n < current;
            const active = step.n === current;
            return (
              <li key={step.n} className="flex items-center gap-2 sm:gap-3">
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-black transition-colors ${
                      done
                        ? "bg-primary/15 text-primary"
                        : active
                          ? "bg-primary text-on-primary shadow-glow"
                          : "bg-ink/[0.07] text-ink/40"
                    }`}
                    aria-hidden="true"
                  >
                    {done ? <TickIcon /> : step.n}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      active ? "text-ink" : "text-ink/40"
                    } ${active ? "" : "hidden sm:inline"}`}
                  >
                    {step.label}
                  </span>
                  <span className="sr-only">
                    {done ? "(completed)" : active ? "(current step)" : "(upcoming)"}
                  </span>
                </span>
                {i < STEPS.length - 1 && (
                  <span
                    className={`h-px w-4 sm:w-8 ${done ? "bg-primary/30" : "bg-ink/10"}`}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </header>
  );
}
