import Reveal from "@/components/Reveal";

// Real five-star reviews copied from Trustpilot (Nov 2026). Excerpts only:
// "…" marks a cut, wording and spelling are the reviewer's own. Never edit
// a quote or invent a reviewer; add new ones from the Trustpilot page.
const TRUSTPILOT_URL = "https://www.trustpilot.com/review/thesavvyexpat.com";

const REVIEWS = [
  {
    name: "Todd Dowling",
    country: "United States",
    date: "Oct 17, 2026",
    title: "Excellent… A+++",
    text: "Amazing is not a word I throw around lightly. I have experience with various customer service type company’s. To date there has not been a single one that can touch the Savy expat team. Excellent communication, excellent service and the most important one. You genuinely feel taken care of!",
  },
  {
    name: "David Haley",
    country: "United States",
    date: "Oct 19, 2026",
    title: "Evan and his team are SUPERSTARS!",
    text: "Evan’s team was amazing from the start! I had high expectations based on the YouTube videos of previous clients, but my experience was even better than anticipated.",
  },
  {
    name: "Fred Jackson",
    country: "United States",
    date: "Oct 17, 2026",
    title: "Getting off the couch and making a decision for your life",
    text: "Evan didn't give me the sleazy, used-car-salesman pitch. The man was pure sincerity… The moment Jess and her team picked me up, the stress evaporated.",
  },
  {
    name: "Jim Laugen",
    country: "Philippines",
    date: "Oct 20, 2026",
    title: "Thanks all!",
    text: "…from finding us a fantastic condo in a perfect neighborhood (below budget 🥳) to helping us navigating so many logistics including our visas and getting our phone and internet set up… you’ve given us something just as valuable: peace of mind.",
  },
  {
    name: "Charles Bradley",
    country: "United States",
    date: "Oct 17, 2026",
    title: "The Savvy Expat makes it easy",
    text: "Evan's team listens to your requirements, makes a plan, then accomplishes it, seven days a week… They are wired into the BGC network that gets things done efficiently. I definitely recommend you use them, money well spent.",
  },
  {
    name: "Emmanuelle R",
    country: "United States",
    date: "Oct 17, 2026",
    title: "Take the stress out of moving",
    text: "Evan and his team took care of everything from A-Z. His team was both kind and professional… The team is very responsive to any concerns and tailor the needs to each client. I would recommend them to anyone who wants a hassle free experience.",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Trustpilot-style rating: five white stars on green squares.
function Stars({ size = "h-6 w-6" }: { size?: string }) {
  return (
    <div className="flex gap-[3px]" role="img" aria-label="Rated 5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`grid place-items-center bg-[#00B67A] ${size}`}>
          <svg viewBox="0 0 24 24" fill="#fff" className="h-[72%] w-[72%]" aria-hidden="true">
            <path d="M12 2.5l2.84 6.6 7.16.62-5.43 4.7 1.63 7.01L12 17.7l-6.2 3.73 1.63-7.01L2 9.72l7.16-.62L12 2.5z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

function TrustpilotMark() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-ink">
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path fill="#00B67A" d="M12 2.5l2.84 6.6 7.16.62-5.43 4.7 1.63 7.01L12 17.7l-6.2 3.73 1.63-7.01L2 9.72l7.16-.62L12 2.5z" />
      </svg>
      Trustpilot
    </span>
  );
}

export default function TrustpilotReviews() {
  return (
    <section className="px-6 pb-4 pt-16">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center">
            <a
              href={TRUSTPILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-ink/10 bg-white/80 py-2 pl-4 pr-5 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-0.5"
            >
              <TrustpilotMark />
              <span className="h-4 w-px bg-ink/15" aria-hidden="true" />
              <Stars size="h-[18px] w-[18px]" />
            </a>
            <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              What our clients say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-ink/60">
              Five-star reviews from expats who made the move with us, posted
              on Trustpilot.
            </p>
          </div>
        </Reveal>

        {/* Swipeable row on phones, a 3-column wall on desktop. */}
        <div
          className="-mx-6 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {REVIEWS.map((review, i) => (
            <Reveal
              key={review.name}
              delay={(i % 3) * 100}
              className="w-[86%] shrink-0 snap-center sm:w-[46%] lg:w-auto"
            >
              <a
                href={TRUSTPILOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-[0_18px_45px_-28px_rgba(4,22,48,0.35)] ring-1 ring-ink/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_55px_-28px_rgba(73,52,251,0.45)] sm:p-7"
              >
                <div className="flex items-center justify-between gap-3">
                  <Stars />
                  <span className="text-xs font-medium text-ink/45">{review.date}</span>
                </div>
                <p className="mt-5 text-lg font-black leading-snug tracking-tight">
                  {review.title}
                </p>
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink/70">
                  “{review.text}”
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-ink/5 pt-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lavender text-sm font-black text-primary">
                    {initials(review.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{review.name}</p>
                    <p className="text-xs text-ink/50">{review.country}</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[#00805A]">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 00-.36-1.12L2.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.29z" />
                    </svg>
                    Trustpilot
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mt-4 text-center">
            <a
              href={TRUSTPILOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-primary transition-colors hover:text-[#3d2ae8]"
            >
              Read all our reviews on Trustpilot →
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
