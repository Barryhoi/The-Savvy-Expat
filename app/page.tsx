import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import BookCallButton from "@/components/BookCallButton";
import CountUp from "@/components/CountUp";
import LottieIcon from "@/components/LottieIcon";
import ClientVideos from "@/components/ClientVideos";
import QuoteMarquee from "@/components/QuoteMarquee";

const VSL_VIDEO_ID = "gQY2qf-ZXIE";

const STATS = [
  { end: 200, suffix: "+", label: "Expats Relocated" },
  { end: 97, suffix: "+", label: "Five Star Reviews" },
  { end: 6, suffix: "+ Years", label: "Living In The Philippines" },
  { end: 64, suffix: "K+", label: "Subscribers On YouTube" },
];

// The exact Lordicon "wired-outline" animations the live Framer site uses.
const SERVICES = [
  {
    title: "Finding Your Rental",
    description:
      "Secure a great deal for your new home in a prime location with our market expertise & connections.",
    lottie: "https://framerusercontent.com/assets/WpgScWGNL7JiifW7AU0RqkBRY0.json",
  },
  {
    title: "Banking And Finances",
    description:
      "Expedite opening up your local Philippine bank account without the guesswork.",
    lottie: "https://framerusercontent.com/assets/Pxbf3TvetgA0XGt3KhyrFrIUMy0.json",
  },
  {
    title: "Securing Your Visa",
    description:
      "Fast-lane help to documentation, filing, and appointment booking for your Philippines Visa.",
    lottie: "https://framerusercontent.com/assets/vvnT5B7jTp6Nq4f2waT8iaoWwgY.json",
  },
  {
    title: "24/7 Expert Access",
    description:
      "Full 24/7 access to Evan, his network of connections, and The Savvy Expat Team.",
    lottie: "https://framerusercontent.com/assets/V5wPJvKyRR72amkAPyzlnrdEtw.json",
  },
  {
    title: "Lifestyle Setup",
    description:
      "Best locations, restaurants, gyms, country clubs and more so you can find routine in the Philippines.",
    lottie: "https://framerusercontent.com/assets/J1wY3ux2iQTgqCgmeGpoyZVxfQ.json",
  },
  {
    title: "SIM Cards & Utilities",
    description:
      "Setup your mobile data and other daily utilities the right way to eliminate inconveniences.",
    lottie: "https://framerusercontent.com/assets/A9Y1O3jQKLLsKxWQI4pc8Jgue9s.json",
  },
];

const OPTIONS = [
  {
    title: "Do It Yourself",
    description:
      "An uncertain trial and error transition to the Philippines with potential road-blocks, wasted capital and lost time.",
    highlighted: false,
  },
  {
    title: "Hire Agencies",
    description:
      "A messy, uncoordinated and expensive process with multiple agencies who don't understand your vision or goals.",
    highlighted: false,
  },
  {
    title: "The Savvy Expat",
    description:
      "Your all-in-one Expat Partner with 6+ years experience in the Philippines, ready to set up your new lifestyle with you.",
    highlighted: true,
  },
];

const STEPS = [
  {
    number: "01",
    title: "Book A Call",
    description:
      "The first step is to book in a call with me where we will meet and see if we are a good fit to work together.",
  },
  {
    number: "02",
    title: "Game Plan",
    description:
      "On this call we will learn your goals and visions and start to build a game plan for you to build your dream life.",
  },
  {
    number: "03",
    title: "The Transition",
    description:
      "We'll get you set up and onboarded into our program and prepare for a fully guided smooth transition over.",
  },
];

// Small purple glyphs for the section pills, like the reference site.
const PILL_ICONS = {
  question: (
    <svg viewBox="0 0 20 20" fill="#4934FB" className="h-4 w-4" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a1.5 1.5 0 112.12 2.12c-.4.4-1.06.61-1.06 1.44v.25a.75.75 0 001.5 0c0-.19.09-.3.42-.6a3 3 0 10-4.48-3.98.75.75 0 101.28.77c.06-.1.14-.2.22-.3zM10 15a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
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
  bulb: (
    <svg viewBox="0 0 20 20" fill="#4934FB" className="h-4 w-4" aria-hidden="true">
      <path d="M10 1a6 6 0 00-3.5 10.87c.44.32.75.79.87 1.32l.13.56h5l.13-.56c.12-.53.43-1 .87-1.32A6 6 0 0010 1zM8.5 15.5a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3zM9 18.25c0 .41.34.75.75.75h.5a.75.75 0 000-1.5h-.5a.75.75 0 00-.75.75z" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 20 20" fill="#4934FB" className="h-4 w-4" aria-hidden="true">
      <path d="M9.29 1.7a1 1 0 011.42 0l7.58 7.59a.75.75 0 11-1.06 1.06l-.23-.23V17a2 2 0 01-2 2h-3.25a.75.75 0 01-.75-.75V13.5h-2v4.75a.75.75 0 01-.75.75H5a2 2 0 01-2-2v-6.88l-.23.23A.75.75 0 111.7 9.3l7.6-7.6z" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 20 20" fill="#4934FB" className="h-4 w-4" aria-hidden="true">
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.47 14.53A6.5 6.5 0 0110 11a6.5 6.5 0 016.53 3.53c.4.8.05 1.72-.72 2.09A13.44 13.44 0 0110 18c-2.1 0-4.07-.48-5.81-1.38-.77-.37-1.11-1.3-.72-2.09z" />
    </svg>
  ),
  steps: (
    <svg viewBox="0 0 20 20" fill="#4934FB" className="h-4 w-4" aria-hidden="true">
      <path d="M3 4.75A.75.75 0 013.75 4h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 4.75zM3 10a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10zm0 5.25a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5a.75.75 0 01-.75-.75z" />
    </svg>
  ),
} as const;

function Eyebrow({
  icon,
  children,
}: {
  icon: keyof typeof PILL_ICONS;
  children: React.ReactNode;
}) {
  return (
    <p className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-ink backdrop-blur">
      {PILL_ICONS[icon]}
      {children}
    </p>
  );
}

export default function VslPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Header />

      <main className="flex-1">
        {/* ---------- Hero + VSL ---------- */}
        <section className="bg-hero-glow">
          <div className="mx-auto max-w-4xl px-6 pb-20 pt-10 text-center sm:pt-14">
            <Reveal>
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white/90 py-1.5 pl-1.5 pr-5 shadow-card ring-1 ring-ink/5">
                <span className="btn-shine rounded-full bg-primary px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-on-primary">
                  Attention
                </span>
                <span className="text-sm font-bold tracking-wide">
                  ASPIRING EXPATS 🇵🇭
                </span>
              </div>
              <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl">
                Your One-Stop Solution for a Seamless Move to the Philippines
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-balance text-xl leading-relaxed text-ink/70 sm:text-2xl">
                We handle every step of your move to the Philippines, so you
                don&apos;t waste time, money, or energy figuring it out alone.
              </p>
            </Reveal>

            <Reveal delay={150} className="mt-10">
              <div id="watch" className="relative mx-auto w-full max-w-[820px] scroll-mt-24">
                <div
                  className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary to-primary-soft opacity-25 blur-xl"
                  aria-hidden="true"
                />
                <div className="relative overflow-hidden rounded-2xl shadow-[0_24px_60px_-30px_rgba(4,22,48,0.45)]">
                  <YouTubeEmbed
                    videoId={VSL_VIDEO_ID}
                    title="How The Savvy Expat helps you move to the Philippines"
                    thumbnail="/thumbnails/1.png"
                    featured
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={250} className="mt-10">
              <BookCallButton />
              <p className="mt-4 text-sm text-ink/45">
                No pressure &middot; No obligation &middot; Just a conversation about your move.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------- Story ---------- */}
        <section className="bg-glow-purple">
          <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <Reveal>
            <Eyebrow icon="question">
              Ready To Make The Move, Minus The Pressure?
            </Eyebrow>
            <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
              Unlock The Next Chapter Of Your Life In The Philippines 🇵🇭 With
              Zero Transitioning Hassle
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mx-auto mt-8 max-w-2xl space-y-5 text-base leading-relaxed text-ink/70 sm:text-lg">
              <p>
                Planning on moving to the Philippines, but don&apos;t know where
                to start? Finding a rental, securing a visa, setting up health
                care, and building a network of friends can be daunting and
                full of pitfalls.
              </p>
              <p>
                Without trusted boots-on-the-ground guidance, it&apos;s not
                uncommon to be skin taxed and waste your resources like time,
                effort and money — causing you to miss out on the life you have
                envisioned.
              </p>
              <p>
                Trying to navigate the complexities of moving to a new country
                is no small feat. After all, you don&apos;t know what you
                don&apos;t know. Overpaying for rent, getting stuck with visa
                paperwork, running in circles with misinformation, or dealing
                with the bureaucracy probably isn&apos;t part of your plan,
                right?
              </p>
              <p>
                With over 6 years of experience as a successful expat in the
                Philippines, I&apos;m here to invite you to my done-for-you
                expat relocation program designed to turn your dream into a
                reality without the guesswork. I ensure a smooth, stress-free
                transition to achieve a high quality life of freedom and peace
                of mind in the Philippines.
              </p>
            </div>
          </Reveal>
            <Reveal delay={200} className="mt-10">
              <BookCallButton />
            </Reveal>
          </div>
        </section>

        {/* ---------- Stats ---------- */}
        <section className="bg-sheen">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <Reveal>
              <Eyebrow icon="check">Track Record</Eyebrow>
              <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                We Are The Best In The Game At Setting Up Expats In The
                Philippines
              </h2>
            </Reveal>
            <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {STATS.map((item, i) => (
                <Reveal key={item.label} delay={i * 100}>
                  <div className="card-soft rounded-3xl p-8 transition-transform duration-300 hover:-translate-y-1">
                    <CountUp
                      end={item.end}
                      suffix={item.suffix}
                      className="text-4xl font-black tracking-tight text-ink sm:text-6xl"
                    />
                    <div className="mx-auto mt-4 h-1 w-10 rounded-full bg-primary/60" aria-hidden="true" />
                    <p className="mt-3 text-sm font-bold text-ink/60">
                      {item.label}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Services ---------- */}
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <Reveal>
            <Eyebrow icon="bulb">What Will The Savvy Expat Help Me Set Up?</Eyebrow>
            <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              Sit Back And We&apos;ll Curate Your Dream Life In The Philippines
              For You
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink/70 sm:text-lg">
              We hold your hand through the entire process of moving to the
              Philippines with boots on the ground experience and connections.
              Tap into us, tap into our network.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <Reveal key={service.title} delay={(i % 3) * 100}>
                <div className="card-soft group h-full rounded-3xl p-8 text-left transition-transform duration-300 hover:-translate-y-1">
                  <div className="-ml-2 transition-transform duration-300 group-hover:scale-105">
                    <LottieIcon src={service.lottie} />
                  </div>
                  <h3 className="mt-5 text-2xl font-bold">{service.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-ink/70">
                    {service.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Dream lifestyle CTA ---------- */}
        <section className="bg-sheen">
          <div className="mx-auto max-w-3xl px-6 py-24 text-center">
            <Reveal>
              <Eyebrow icon="home">Your Dream Lifestyle Awaits</Eyebrow>
              <h2 className="mx-auto max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                Let&apos;s Design The Life You Really Want In The Philippines 🇵🇭
              </h2>
              <div className="mt-9">
                <BookCallButton />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- Founder ---------- */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <Reveal>
              <Eyebrow icon="user">Founder</Eyebrow>
              <h2 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">
                Meet The Savvy Expat
              </h2>
            </Reveal>
          </div>
          <div className="mt-12 grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <h3 className="text-2xl font-black sm:text-3xl">
                Hi, I&apos;m Evan
              </h3>
              <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink/70 sm:text-xl">
                <p>
                  I left America for the Philippines 6 years ago. To be honest,
                  it took me a while to find my feet when I first moved.
                  I&apos;ve been scammed, overcharged, and faced challenges
                  that led me to want to leave, because I didn&apos;t know what
                  I now know.
                </p>
                <p>
                  Fortunately after a rocky start, I worked it all out, so that
                  you can relocate like a pro and build a &lsquo;living like a
                  king&rsquo; lifestyle in the Philippines that rewards you
                  with peace of mind &amp; bang for buck.
                </p>
                <p>
                  My mission is simple: eliminate the stress, save you time and
                  money, and help you build the life that you not only dreamed
                  of but deserve, without the pit-falls. Let&apos;s discuss
                  your transition today. 👇
                </p>
              </div>
              <div className="mt-8 flex justify-start">
                <BookCallButton size="md" withBadge={false} />
              </div>
            </Reveal>
            <Reveal delay={150}>
              <div className="relative mx-auto max-w-md">
                <div
                  className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-primary to-primary-soft opacity-25 blur-xl"
                  aria-hidden="true"
                />
                <Image
                  src="/evan-founder.jpg"
                  alt="Evan, founder of The Savvy Expat, in the Philippines"
                  width={1080}
                  height={1080}
                  className="relative w-full rounded-3xl shadow-[0_24px_60px_-30px_rgba(4,22,48,0.4)]"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <ClientVideos />

        {/* ---------- Options — the one dark section on the page ---------- */}
        <section className="bg-dark-glow">
          <div className="mx-auto max-w-6xl px-6 py-24 text-center">
            <Reveal>
              <p className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-primary-soft" aria-hidden="true" />
                Why The Savvy Expat?
              </p>
              <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Here Are Your Options For Transitioning To The Philippines 🇵🇭
              </h2>
            </Reveal>
            <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
              {OPTIONS.map((option, i) => (
                <Reveal key={option.title} delay={i * 120} className="h-full">
                  {option.highlighted ? (
                    <div className="relative flex h-full flex-col rounded-3xl bg-white p-8 text-left shadow-glow-lg ring-2 ring-primary-soft/60 lg:scale-[1.05]">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-glow">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                          <path
                            fillRule="evenodd"
                            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4l3.3 3.29 6.8-6.8a1 1 0 011.4 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <h3 className="mt-5 text-2xl font-black text-ink">
                        {option.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-ink/70">
                        {option.description}
                      </p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col rounded-3xl bg-white/[0.06] p-8 text-left ring-1 ring-white/10 backdrop-blur">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-rose-300">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </span>
                      <h3 className="mt-5 text-xl font-bold text-white/85">
                        {option.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-white/55">
                        {option.description}
                      </p>
                    </div>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <QuoteMarquee />

        {/* ---------- Process ---------- */}
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <Reveal>
            <Eyebrow icon="steps">The 3 Simple Steps</Eyebrow>
            <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
              The Simple 3-Step Process For A Smooth Transition
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.number} delay={i * 120}>
                <div className="h-full rounded-3xl bg-gradient-to-b from-[#EFEDF9] to-[#D8D4F0] p-9 text-left shadow-[0_1px_2px_rgba(4,22,48,0.03),0_10px_28px_-18px_rgba(4,22,48,0.25)] transition-transform duration-300 hover:-translate-y-1">
                  <span className="text-3xl font-black text-ink">
                    {step.number}
                  </span>
                  <h3 className="mt-5 text-3xl font-medium">{step.title}</h3>
                  <p className="mt-5 text-base leading-relaxed text-ink/70">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <section className="px-6 pb-24 pt-4">
          <Reveal>
            <div className="bg-sheen mx-auto max-w-5xl rounded-[2.5rem] border border-ink/10 px-6 py-20 text-center">
              <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                Make The Move To The Philippines Seamlessly
              </h2>
              <p className="mt-5 text-lg text-ink/60">
                Ready To Turn Your Philippines Dreams Into Reality?
              </p>
              <div className="mt-9">
                <BookCallButton />
                <p className="mt-4 text-sm text-ink/45">
                  No pressure &middot; No obligation &middot; Just a conversation about your move.
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
