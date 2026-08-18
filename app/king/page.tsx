import Link from "next/link";
import CountUp from "@/components/CountUp";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import ScrollProgress from "@/components/ScrollProgress";
import YouTubeEmbed from "@/components/YouTubeEmbed";

const VSL_VIDEO_ID = "f3hj9TiUgFs";

export const metadata = {
  // Other pages join the title with an em dash. This one uses a pipe because
  // the brief bans em dashes on this page outright.
  title: "You Did Not Build This Life to Compromise on It | The Savvy Expat",
  description:
    "What the money you already spend buys in BGC, Makati, Rockwell and Ortigas. The buildings, the staff, the visas, the clubs, the mistakes that cost the most, and five American men who made the move on camera.",
  robots: { index: false, follow: false },
};

// `end` drives the count-up; `value` is the static fallback for the one
// field that is not a number.
const CREDIBILITY: {
  end?: number;
  suffix?: string;
  value?: string;
  label: string;
}[] = [
  { end: 170, suffix: "+", label: "Expats Relocated" },
  { end: 64000, suffix: "+", label: "Subscribers On YouTube" },
  { value: "Featured", label: "On Asian Journal News" },
];

const STACK = [
  {
    item: "Luxury 2 to 3 bedroom penthouse, premium BGC tower",
    cost: "$2,000 to $2,500",
    effect:
      "Floor to ceiling glass, high above the city, in a building with a pool, a gym and staff at the door.",
  },
  {
    item: "Full-time live-in housekeeper",
    cost: "$300 to $400",
    effect:
      "She does the laundry, the ironing, the dishes and all of the cleaning. Your place stays hotel clean at all times, and you stop running a household.",
  },
  {
    item: "Private chef",
    cost: "$500 to $700",
    effect:
      "Dinner is ready when you want it, cooked the way you asked, and the kitchen is clean afterwards.",
  },
  {
    item: "Personal driver, own vehicle, gas included",
    cost: "$700 to $800",
    effect:
      "You never think about parking, car payments, car insurance, or who to call for a spontaneous trip to the beach.",
  },
  {
    item: "Executive assistant",
    cost: "$400 to $600",
    effect:
      "Appointments, deliveries, bills and the small administrative work that quietly eats a weekend.",
  },
];

const DISTRICTS = [
  {
    name: "BGC",
    character: "Newest buildings, highest density of Western amenities",
    rent: "₱100,000 to ₱250,000",
    rentUsd: "$1,640 to $4,100",
    bestFor: "The easiest landing",
  },
  {
    name: "Makati CBD",
    character: "Older buildings, materially more space per peso",
    rent: "₱95,000 to ₱155,000",
    rentUsd: "$1,560 to $2,540",
    bestFor: "Two floors, or room for visiting family",
  },
  {
    name: "Rockwell",
    character: "Private and gated, roads close at night",
    rent: "₱95,000 to ₱135,000",
    rentUsd: "$1,560 to $2,210",
    bestFor: "Privacy and club access",
  },
  {
    name: "Ortigas",
    character: "Prime business district, more building for the same spend",
    rent: "₱45,000 to ₱80,000",
    rentUsd: "$740 to $1,310",
    bestFor: "The insider play",
  },
];

const BUILDINGS = [
  {
    name: "BGC",
    lead: "The newest buildings, the highest density of Western amenities, and the easiest landing.",
    note: "Park Triangle Residences sits between Uptown and High Street, recently renovated, and is our most recommended building on quality per peso. Uptown Ritz is directly across from Uptown Mall, so daily life needs no driver, and it does not allow Airbnb, which keeps the building private. Arya Residences is the diplomat and celebrity building, six units per floor with floor to ceiling windows.",
    items: [
      {
        title: "One bedroom",
        price: "₱45,000 to ₱90,000",
        priceUsd: "$740 to $1,480",
        body: "Typically 50 to 70 sqm, which is roughly 540 to 750 sq ft.",
      },
      {
        title: "Two bedroom",
        price: "₱100,000 to ₱250,000",
        priceUsd: "$1,640 to $4,100",
        body: "Typically 90 to 130 sqm, which is roughly 970 to 1,400 sq ft.",
      },
      {
        title: "Three bedroom",
        price: "₱160,000 to ₱400,000",
        priceUsd: "$2,620 to $6,560",
        body: "Typically 140 to 240 sqm, which is roughly 1,510 to 2,580 sq ft.",
      },
    ],
  },
  {
    name: "Makati CBD",
    lead: "Older buildings, and that is the advantage.",
    note: "You get significantly more square metres per peso than in BGC, which is why people who need two floors, or space for visiting family, end up here. The ceiling is high: full-floor and two-storey units with private elevators run past ₱360,000, about $5,900.",
    items: [
      {
        title: "One bedroom",
        price: "₱50,000 to ₱95,000",
        priceUsd: "$820 to $1,560",
        body: "Typically 55 to 80 sqm, which is roughly 590 to 860 sq ft.",
      },
      {
        title: "Two bedroom",
        price: "₱95,000 to ₱155,000",
        priceUsd: "$1,560 to $2,540",
        body: "Typically 100 to 130 sqm, which is roughly 1,080 to 1,400 sq ft.",
      },
      {
        title: "Three bedroom",
        price: "₱150,000 to ₱260,000",
        priceUsd: "$2,460 to $4,260",
        body: "Typically 195 to 260 sqm, which is roughly 2,100 to 2,800 sq ft.",
      },
    ],
  },
  {
    name: "Rockwell",
    lead: "Private and exclusive.",
    note: "The roads into the district close at night with security at every entrance, and residents get access to the Rockwell Leisure Club. Units here tend to come with a proper separate kitchen, and often a maid's room with its own exit. This is the district people choose when privacy is the priority.",
    items: [
      {
        title: "One bedroom",
        price: "₱60,000 to ₱80,000",
        priceUsd: "$980 to $1,310",
        body: "Typically 50 to 65 sqm, which is roughly 540 to 700 sq ft.",
      },
      {
        title: "Two bedroom",
        price: "₱95,000 to ₱135,000",
        priceUsd: "$1,560 to $2,210",
        body: "Typically 89 to 120 sqm, which is roughly 960 to 1,290 sq ft.",
      },
      {
        title: "Three bedroom",
        price: "₱160,000 to ₱260,000",
        priceUsd: "$2,620 to $4,260",
        body: "Typically 158 to 200 sqm, which is roughly 1,700 to 2,150 sq ft.",
      },
    ],
  },
  {
    name: "Ortigas",
    lead: "The insider play, and the one most people never look at.",
    note: "A prime business district in its own right, with the Western conveniences intact and Estancia and Podium walkable. What it gives you is more building at the same number: more square metres, higher floors and newer finishes than the same spend reaches in BGC. Compare the three bedroom line here against the one in BGC.",
    items: [
      {
        title: "One bedroom",
        price: "₱25,000 to ₱45,000",
        priceUsd: "$410 to $740",
        body: "Typically 45 to 60 sqm, which is roughly 480 to 650 sq ft.",
      },
      {
        title: "Two bedroom",
        price: "₱45,000 to ₱80,000",
        priceUsd: "$740 to $1,310",
        body: "Typically 70 to 100 sqm, which is roughly 750 to 1,080 sq ft.",
      },
      {
        title: "Three bedroom",
        price: "₱70,000 to ₱130,000",
        priceUsd: "$1,150 to $2,130",
        body: "Typically 110 to 150 sqm, which is roughly 1,180 to 1,610 sq ft.",
      },
    ],
  },
];

// What a YouTube tour of a district cannot tell you.
const FOOTAGE_MISSES = [
  "What the commute feels like at 6pm.",
  "How far the nearest grocery store actually is.",
  "Whether the building is full of short-stay rentals.",
];

const LEASE_FACTS = [
  "The Rent Control Act caps one month advance plus two months deposit.",
  "In Metro Manila it only covers units at ₱10,000 a month or below, which is about $160.",
  "At ₱125,000 to ₱360,000, roughly $2,050 to $5,900, there is no statutory protection at all.",
];

const STAFF_ROLES = [
  {
    title: "Full-time live-in housekeeper",
    price: "$300 to $400",
    body: "The laundry, the ironing, the dishes and all of the cleaning, every day. Your condo stays hotel clean at all times without you asking. She lives in the unit.",
  },
  {
    title: "Private chef",
    price: "$500 to $700",
    body: "Plans and cooks, and leaves the kitchen clean.",
  },
  {
    title: "Driver",
    price: "$700 to $800",
    body: "Brings his own vehicle, with gas and insurance included.",
  },
  {
    title: "Executive assistant",
    price: "$400 to $600",
    body: "Appointments, deliveries, bills, and the administrative work that otherwise consumes a weekend.",
  },
];

const SRRV_CHANGES = [
  "The minimum age dropped from 50 to 40.",
  "Smile and Human Touch were abolished, leaving Classic and Courtesy.",
  "The deposit stays your property throughout. It is refundable if you cancel, and once the visa is issued it can be converted into a condominium purchase.",
];

const SRRV_NEEDS = [
  "Apostilled documents from the US.",
  "A medical examination.",
  "An NBI clearance.",
  "The PRA deposit.",
  "Several in-person appointments that cannot be combined.",
];

const INSURANCE = [
  {
    title: "A local Philippine plan",
    price: "Cheapest",
    body: "Works well for routine care in-country, but does nothing for you outside the Philippines.",
  },
  {
    title: "An international plan",
    price: "$1,500 to $6,000 a year",
    body: "Covers you across borders including trips home. That range is for the 48 to 65 band, and it rises past 60.",
  },
  {
    title: "A combined approach",
    price: "What most clients pick",
    body: "A local plan for day to day care, and an international policy for serious events and evacuation.",
  },
];

const STAFF_TRUTHS = [
  "Household staff in the Philippines are employees, not contractors. There are legal obligations around 13th month pay, rest days and termination, and they apply to you whether or not you knew about them.",
  "Live-in staff need accommodation, which means this decision shapes which units you should be viewing. Some buildings have a maid's room with its own entrance. Most do not, and you cannot retrofit one.",
  "Vetting is the entire game. There is no reference-checking infrastructure here comparable to what you are used to in the US.",
  "The wrong hire is not a resignation. It is a person inside your home, with keys, while you work out how to end it correctly.",
];

// SRRV figures reflect the September 2025 restructure. Smile and Human Touch
// were abolished; only Classic and Courtesy remain.
const VISA_ROWS = [
  {
    label: "Who it is for",
    tourist: "Anyone testing the first year without committing to anything.",
    srrv: "Anyone who has decided to stay and wants to stop managing paperwork.",
  },
  {
    label: "Eligibility",
    tourist: "Arrival stamp on a US passport, no application in advance.",
    srrv: "Age 40 and over. Classic is the route for almost everyone. Courtesy is restricted to retired foreign diplomats, retired foreign military, international organisation officers and former Filipinos.",
  },
  {
    label: "Cost",
    tourist:
      "Around ₱3,000 for the first 29 day extension, about $50. The six month Long-Stay Visitor Visa Extension runs roughly ₱11,500, about $190.",
    srrv: "$1,500 one time to apply, then $360 a year covering you and up to two dependants.",
  },
  {
    label: "Deposit required",
    tourist: "None.",
    srrv: "Classic: $15,000 at 50 and over with a documented pension, $30,000 at 50 and over without. $25,000 at 40 to 49 with a pension, $50,000 at 40 to 49 without. Courtesy runs $1,500 to $6,000.",
  },
  {
    label: "Length of stay",
    tourist: "36 months in total, then you must leave the country and re-enter.",
    srrv: "Perpetual residency, multiple entry, and no minimum stay requirement.",
  },
  {
    label: "Renewal burden",
    tourist:
      "An ACR I-Card once your stay passes 59 days, and an Emigration Clearance Certificate before you fly out after six months. Airlines can refuse boarding without it.",
    srrv: "The $360 annual fee. You are exempt from the Bureau of Immigration annual report.",
  },
  {
    label: "Processing time",
    tourist: "Same day at the counter.",
    srrv: "Around 10 working days at the PRA. Realistically 6 to 10 weeks end to end.",
  },
];

const GOLF_SHARES = [
  { club: "Manila Golf", price: "Past ₱190,000,000", priceUsd: "Over $3.1 million" },
  { club: "Wack Wack", price: "Around ₱89,000,000", priceUsd: "About $1.46 million" },
  { club: "Sta. Elena", price: "Around ₱25,000,000", priceUsd: "About $410,000" },
  { club: "Alabang", price: "Around ₱19,000,000", priceUsd: "About $310,000" },
  { club: "Manila Southwoods", price: "Around ₱6,000,000", priceUsd: "About $98,000" },
];

const MISTAKES = [
  {
    title: "Signing a premium lease at foreigner rates",
    body: "A 20 to 40 percent markup on a ₱150,000 unit, around $2,460 a month, is $7,000 to $15,000 a year, on a contract you cannot reopen until it expires.",
  },
  {
    title: "Assuming the deposit cap protects you",
    body: "The Rent Control Act stops at ₱10,000 a month in Metro Manila, about $160. At the rents on this page there is no statutory ceiling and no regulator to appeal to. Whatever the contract says is what you have.",
  },
  {
    title: "Choosing a district from videos instead of standing in it",
    body: "Either a second move inside the year, or twelve months in a building that does not suit how you actually live.",
  },
  {
    title: "Hiring staff with no vetting and no contract",
    body: "There is no reference-checking infrastructure here comparable to the US. The wrong hire is not a resignation. It is a person inside your home.",
  },
  {
    title: "Arriving on the wrong visa track for the stay you actually intend",
    body: "Starting the SRRV after arrival means sourcing apostilled documents from the US from 8,000 miles away, which is the single slowest way to do it.",
  },
  {
    title: "Buying health insurance after landing",
    body: "Pre-existing exclusions are written against your policy start date, and most local plans will not take a new member past 65. Waiting is the version of this decision that cannot be undone.",
  },
  {
    title: "Flying out after six months without an exit clearance",
    body: "The Emigration Clearance Certificate is required once you have been here more than six months, and airlines can refuse to board you without it. People discover this at the counter.",
  },
  {
    title: "Assuming club access can be bought on arrival",
    body: "Manila House is referral only. Manila Golf trades past ₱190,000,000, which is over $3 million. Neither opens up simply because you have the money.",
  },
];

const OPTIONS = [
  {
    title: "Do It Yourself",
    description:
      "Three brokers quoting three prices on the same unit, and no way to tell which is real. Sundays spent viewing places that do not match the photographs. A bank application rejected with no reason attached and nobody to ask. A lease signed in a market with no rent regulator behind it.",
    highlighted: false,
  },
  {
    title: "Hire Agencies",
    description:
      "Several agencies who each own one piece of the move, none of whom are accountable for the outcome, and none of whom know what you are actually building here.",
    highlighted: false,
  },
  {
    title: "The Savvy Expat",
    description:
      "One partner with 6 years on the ground, the buildings and brokers already known, and the whole move handled end to end.",
    highlighted: true,
  },
];

const QUESTIONS = [
  {
    q: "What is the healthcare actually like?",
    a: "The four hospitals used by the expat community are St. Luke's Medical Center BGC, Makati Medical Center, The Medical City and Asian Hospital and Medical Center. Staff speak English, appointments happen in days rather than months, and you deal with the hospital directly rather than through an insurer first. Paying cash, a specialist consultation runs ₱1,500 to ₱3,500, about $25 to $57, and a private room at the top facilities runs up to around ₱20,000 a night, which is about $330, with doctor fees billed separately. The quality question is largely settled at this tier. The decision that actually matters is which insurance structure you arrive with, and when you buy it.",
  },
  {
    q: "Is it safe?",
    a: "BGC, Makati, Rockwell and Ortigas are among the most secure districts in the country, which is why we work in them and not elsewhere. Buildings have 24 hour security and controlled lift access, and Rockwell closes its roads at night with security at every entrance. Todd put it more plainly than we would: he said he would feel safer walking in BGC at two in the morning than in Seattle at seven in the evening. The realistic risk here is not violence. It is being quoted a higher price because you are visibly foreign, which costs considerably more than anything else on this list.",
  },
  {
    q: "How long can I actually stay?",
    a: "On a tourist visa the cumulative maximum for a US passport holder is 36 months, after which you must leave the country and re-enter. Along the way you need an ACR I-Card once your stay passes 59 days, and an Emigration Clearance Certificate before you fly out after six months, which airlines do check. The SRRV removes all of it and grants perpetual residency with multiple entry and no minimum stay, without touching your US citizenship. Most people spend the first year on a tourist visa deciding, then convert.",
  },
  {
    q: "What happens to my money and my banking?",
    a: "Your US accounts, income and pension stay exactly where they are. Nothing needs to be moved or converted for you to live here, and most of our clients never move the bulk of anything. You open a local account for day to day spending, which is the step people most often get stuck on alone, since requirements vary by branch and a rejection usually arrives without a reason attached. You earn in dollars and spend in pesos. That gap is the entire arithmetic of this page.",
  },
  {
    q: "Can I still run my business from there?",
    a: "Walter runs a virtual law practice from Manila advising doctors and hospitals, with a team of eight, and he says he does not need the business income. Joe is a corporate M&A and securities attorney licensed in Texas and New York who moved his practice without pausing it. The internet in the premium towers is genuinely fine, and the labour cost difference is what changes the arithmetic of running anything staffed. What does not travel unexamined is your US corporate and tax structure. That is a conversation with your own accountant before you fly, not after.",
  },
  {
    q: "Will I actually know anyone?",
    a: "This is the question that decides whether men stay, and it is the one nobody plans for. The honest answer is that it does not happen on its own, and that arriving without a plan for it is the most common reason people leave inside a year. Walter says he had more social engagement in his first year here than in seven years in Hawaii, and that was not luck. He joined a club, he started a practice, and he put himself in rooms. Every two weeks we put our clients in a room together. They are high net worth, successful, and at the same stage of life.",
  },
  {
    q: "What if I get bored six months in?",
    a: "You have watched men retire badly, which is why you are asking. Walter is blunt about it. He says you need a purpose beyond tennis, golf and travel because that gets boring, and that he did not want to be sedentary or die in a hammock, so he started a practice here rather than stop. Craig kept working as an adviser and built his week around a cigar lounge where the owner keeps his locker. Austin is using Manila as a base and travelling out from it. The men who do well here arrive with something to redeploy into, not just something to retire from.",
  },
  {
    q: "Can foreigners buy property?",
    a: "Foreigners cannot own land in the Philippines. Foreigners can own condominium units outright, provided foreign ownership in that building stays under 40 percent, which is the structure almost every expat here uses. Craig bought a two bedroom on the top floor of a building in Ortigas. Most of our clients rent for at least the first year regardless, because a lease is reversible and a purchase is not, and because a year on the ground tells you which building you actually want. There is also a route through the SRRV: once the visa is issued, the deposit can be converted into a condominium purchase.",
  },
  {
    q: "How reversible is this if I change my mind?",
    a: "Almost entirely. You are not selling your life in America to try this. Leases here are typically annual, your accounts and income stay in the US, and a tourist visa commits you to nothing. Even the SRRV deposit remains your property and is refundable if you cancel the visa. Most of our clients arrive intending to see how a year feels. Todd is taking exactly that approach and says so on camera. The decision looks far larger from where you are standing now than it does once you are here.",
  },
];

/* ---------------------------------------------------------------- pieces */

/** The anchor line device from the opening section, reused throughout. */
function Lead({
  children,
  onDark = false,
}: {
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <p
      className={`text-xl font-black sm:text-2xl ${
        onDark ? "text-white" : "text-ink"
      }`}
    >
      {children}
    </p>
  );
}

/** The dotted list from the opening section. */
function Bullets({ items, onDark = false }: { items: string[]; onDark?: boolean }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className={`mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full ${
              onDark ? "bg-primary-soft" : "bg-primary/50"
            }`}
            aria-hidden="true"
          />
          <span className={onDark ? "text-white/65" : ""}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Name, figure, and one line on what it means. The same ruled treatment as the
 * cost schedule, so a dense paragraph of buildings or roles becomes something
 * you can scan a column of.
 */
function SpecList({
  items,
  flush = false,
}: {
  items: { title: string; price?: string; priceUsd?: string; body: string }[];
  /** Rows only, no card chrome, for use inside another card. */
  flush?: boolean;
}) {
  return (
    <ul
      className={`cascade divide-y divide-ink/10 ${
        flush
          ? "border-t border-ink/10 lg:border-t-0"
          : "overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink/5"
      }`}
    >
      {items.map((it) => (
        <li
          key={it.title}
          className={flush ? "py-5" : "row-hover p-5 sm:p-6"}
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-5">
            <h4 className="text-[0.9375rem] font-black leading-snug">
              {it.title}
            </h4>
            {it.price ? (
              <span className="shrink-0 text-right">
                <span className="block text-sm font-black text-primary">
                  {it.price}
                </span>
                {it.priceUsd ? (
                  <span className="block text-xs font-bold text-ink/40">
                    {it.priceUsd}
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{it.body}</p>
        </li>
      ))}
    </ul>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4l3.3 3.29 6.8-6.8a1 1 0 011.4 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Deliberately a text link rather than a button. The page argues, it does not push. */
function SoftCta({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-10 text-base leading-relaxed text-ink/55">
      {children}{" "}
      <Link
        href="/form"
        prefetch
        className="font-bold text-primary underline underline-offset-4 transition-colors hover:text-[#3d2ae8]"
      >
        Book a call
      </Link>
      .
    </p>
  );
}

function SectionHeading({
  eyebrow,
  children,
  onDark = false,
}: {
  eyebrow: string;
  children: React.ReactNode;
  onDark?: boolean;
}) {
  return (
    <>
      <p
        className={`text-xs font-black uppercase tracking-[0.14em] ${
          onDark ? "text-primary-soft" : "text-primary"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl ${
          onDark ? "text-white" : ""
        }`}
      >
        {children}
      </h2>
      {/* Draws itself in once the heading arrives. */}
      <span
        className="sweep mt-5 block h-[3px] w-16 rounded-full bg-gradient-to-r from-primary to-primary-soft"
        aria-hidden="true"
      />
    </>
  );
}

/**
 * A filmed client, framed as a resource rather than a testimonial. `watchFor`
 * is the point: it tells the reader what he gets for the next twenty minutes,
 * which is what turns a testimonial into something worth clicking.
 */
function ClientStory({
  videoId,
  title,
  thumbnail,
  name,
  detail,
  watchFor,
}: {
  videoId: string;
  title: string;
  thumbnail?: string;
  name: string;
  detail: string;
  watchFor: string;
}) {
  return (
    <div className="rich lift sweep-once overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink/5">
      <YouTubeEmbed videoId={videoId} title={title} thumbnail={thumbnail} />
      <div className="p-7 sm:p-8">
        <h3 className="text-lg font-black">{name}</h3>
        <p className="mt-3 text-base leading-relaxed text-ink/70">{detail}</p>
        <div className="mt-6 rounded-2xl bg-lavender p-5">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
            Worth watching for
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">{watchFor}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export default function KingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <ScrollProgress />
      {/* No header at all. Traffic arrives from a DM with one job to do, so
          the headline is the first thing on the page. */}
      <main className="flex-1">
        {/* ---------- 1. Hero ---------- */}
        <section className="bg-hero">
          <div className="mx-auto max-w-4xl px-6 pb-16 pt-10 text-center sm:pt-14">
            <Reveal>
              <h1 className="headline-wipe text-[2.1rem] font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                You Didn&apos;t Build This Life to Compromise on It.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-balance text-xl leading-relaxed text-ink/70 sm:text-2xl">
                The Philippines is where high earners come to stop doing exactly
                that.
              </p>
            </Reveal>

            <Reveal delay={150} className="mt-12 sm:mt-14">
              {/* The glow sits flush with the video's own top edge rather than
                  overhanging above it: with the previous -inset-4/-inset-8 on
                  all four sides, the blurred glow reached up far enough to
                  wash out the subhead text sitting just above it. */}
              <div className="relative mx-auto w-full max-w-[820px]">
                <div
                  className="aura absolute inset-x-4 -bottom-4 top-0 rounded-[2rem] bg-gradient-to-br from-primary to-primary-soft blur-xl"
                  aria-hidden="true"
                />
                <div
                  className="aura-2 absolute inset-x-8 -bottom-8 top-0 rounded-[2.5rem] bg-gradient-to-tr from-primary-soft via-primary to-primary-soft blur-2xl"
                  aria-hidden="true"
                />
                <div className="poster-drift relative overflow-hidden rounded-2xl shadow-[0_24px_60px_-30px_rgba(4,22,48,0.45)]">
                  <YouTubeEmbed
                    videoId={VSL_VIDEO_ID}
                    title="What $10,000 a month actually buys in BGC"
                    thumbnail="/thumbnails/king-vsl.png"
                    featured
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={250}>
              <ul className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
                {CREDIBILITY.map((item, i) => (
                  <li
                    key={item.label}
                    className="card-soft lift sweep-once rounded-3xl p-6 text-center"
                  >
                    {item.end !== undefined ? (
                      <CountUp
                        end={item.end}
                        suffix={item.suffix}
                        className="block text-3xl font-black tracking-tight text-ink sm:text-4xl"
                      />
                    ) : (
                      <p
                        className="figure-rise text-3xl font-black tracking-tight text-ink sm:text-4xl"
                        style={{ animationDelay: `${330 + i * 110}ms` }}
                      >
                        {item.value}
                      </p>
                    )}
                    <span
                      className="mx-auto mt-3 block h-1 w-10 rounded-full bg-primary/60"
                      aria-hidden="true"
                    />
                    <p className="mt-3 text-sm font-bold text-ink/60">
                      {item.label}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ---------- 2. Why the money does not work (LOCKED COPY) ---------- */}
        <section className="px-6 py-20">
          <Reveal>
            <div className="mx-auto max-w-2xl space-y-6 text-base leading-relaxed text-ink/75 sm:text-lg">
              <p className="text-xl font-black text-ink sm:text-2xl">
                You did everything right.
              </p>
              <p>
                The career, the investments, the savings. By every conventional
                measure, you won.
              </p>
              <p>
                And you are paying $3,000 to $4,000 a month for a house that
                does not excite you.
              </p>
              <ul className="space-y-3">
                {[
                  "Sitting in the same traffic as everyone else.",
                  "Driving yourself to the same appointments.",
                  "Doing your own laundry on a Sunday.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xl font-black text-ink sm:text-2xl">
                The income was never the problem.
              </p>
              <p>
                You are earning at a level that should feel like something, and
                it does not, because of the market you are spending it in.
              </p>
              <p>This is not about spending less. It is about landing in the right market.</p>
              <p>
                A man living on $1,500 a month in a rural province and a man
                living on $8,000 a month in BGC are not living in the same
                Philippines. They do not use the same hospitals, the same
                buildings, or the same airports.
              </p>
              <p>Everything below is written for the man in BGC.</p>
            </div>
          </Reveal>
        </section>

        {/* ---------- 3. What $5,000 a month buys ---------- */}
        <section className="bg-sheen px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading eyebrow="The arithmetic">
                What $5,000 to $10,000 A Month Buys
              </SectionHeading>
              <p className="mt-6 text-base leading-relaxed text-ink/70">
                Not a smaller version of what you have. The whole stack, at
                once, for roughly a quarter of what the same staffed life costs
                in America.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <ul className="rich cascade mt-10 divide-y divide-ink/10 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink/5">
                {STACK.map((row) => (
                  <li key={row.item} className="row-hover p-6 sm:p-7">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                      <h3 className="text-base font-black leading-snug">
                        {row.item}
                      </h3>
                      <span className="shrink-0 font-black text-primary">
                        {row.cost}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">
                      {row.effect}
                    </p>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={140}>
              <div className="rich mt-6 grid gap-4 sm:grid-cols-2">
                <div className="lift rounded-3xl bg-primary p-7 text-on-primary shadow-glow">
                  <p className="text-xs font-black uppercase tracking-[0.14em] opacity-80">
                    All of it, here
                  </p>
                  <p className="mt-2 text-3xl font-black">$4,000 to $5,000</p>
                  <p className="mt-1 text-sm opacity-80">per month</p>
                </div>
                <div className="lift rounded-3xl bg-white p-7 ring-1 ring-ink/10">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-ink/45">
                    The same staffed lifestyle in the US
                  </p>
                  <p className="mt-2 text-3xl font-black text-ink/70">
                    $15,000 to $20,000
                  </p>
                  <p className="mt-1 text-sm text-ink/45">per month</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-10 space-y-5 rounded-3xl border border-ink/10 bg-white/60 p-7 text-base leading-relaxed text-ink/75 sm:p-8">
                <p>Those are the numbers at market rate.</p>
                <Lead>
                  Almost nobody arriving from the US pays market rate in their
                  first year.
                </Lead>
                <p>Here is why.</p>
                <Lead>Price here moves with who is asking.</Lead>
                <p>The same unit gets two quotes:</p>
                <Bullets
                  items={[
                    "One to a man who landed last week with nobody on his side of the table.",
                    "Another to a man with a boots on the ground team who already know what it should cost, and who do the negotiating for him.",
                  ]}
                />
                <p>
                  Our clients are the second man, on the lease, the staff and
                  the clubs alike.
                </p>
                <Lead>Every number on this page has two versions.</Lead>
                <p>
                  Without someone local asking on your behalf, you have no way
                  to know which one you are being quoted.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 4. Where the premium tier is ---------- */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <SectionHeading eyebrow="The map">
                Where The Premium Tier Actually Is
              </SectionHeading>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/70">
                Four districts hold effectively all of the housing worth
                considering at this budget. They are not interchangeable, and
                the difference between them is not price.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-10 overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-ink/10">
                      {[
                        "District",
                        "Character",
                        "Two bedroom, typical",
                        "Best for",
                      ].map((h) => (
                        <th
                          key={h}
                          className="pb-3 pr-6 text-xs font-black uppercase tracking-[0.14em] text-ink/45"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/10">
                    {DISTRICTS.map((d) => (
                      <tr key={d.name} className="row-hover">
                        <td className="py-4 pr-6 text-base font-black">
                          {d.name}
                        </td>
                        <td className="py-4 pr-6 text-sm leading-relaxed text-ink/65">
                          {d.character}
                        </td>
                        <td className="py-4 pr-6 text-sm font-bold text-primary">
                          {d.rent}
                          {d.rentUsd ? (
                            <span className="mt-0.5 block text-xs font-bold text-ink/40">
                              {d.rentUsd}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-4 text-sm leading-relaxed text-ink/65">
                          {d.bestFor}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink/50">
                Those are current market ranges for the premium tier, not our
                own viewings, and they move with the building, the floor and
                whether the unit comes furnished. Dollar equivalents throughout
                this page are converted at ₱61 to the dollar, which also moves.
              </p>
            </Reveal>

            <Reveal delay={120}>
              {/* One district per row. Each card splits on desktop so the
                  district and its argument sit on the left and the buildings
                  read as a column on the right, which is what the extra width
                  is for. */}
              <div className="rich mt-12 space-y-5">
                {BUILDINGS.map((d) => (
                  <div
                    key={d.name}
                    className="lift rounded-3xl bg-white p-7 shadow-card ring-1 ring-ink/5 sm:p-8 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-12"
                  >
                    <div>
                      <h3 className="text-2xl font-black tracking-tight">
                        {d.name}
                      </h3>
                      <span
                        className="mt-3 block h-1 w-10 rounded-full bg-primary/60"
                        aria-hidden="true"
                      />
                      <p className="mt-5 text-base font-bold leading-snug text-ink">
                        {d.lead}
                      </p>
                      {"note" in d && d.note ? (
                        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink/65">
                          {d.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-6 lg:mt-0">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                        Luxury Condo Prices
                      </p>
                      <div className="mt-4">
                        <SpecList items={d.items} flush />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-10 rounded-3xl border border-ink/10 bg-white/60 p-7 sm:p-8">
                <Lead>
                  The mistake is choosing a district from YouTube videos instead
                  of standing in it.
                </Lead>
                <p className="mt-5 text-base leading-relaxed text-ink/75">
                  The footage does not tell you:
                </p>
                <div className="mt-4 text-base leading-relaxed text-ink/75">
                  <Bullets items={FOOTAGE_MISSES} />
                </div>
                <p className="mt-5 text-base leading-relaxed text-ink/75">
                  Getting it wrong means either a second move inside the year,
                  or twelve months in a building that does not suit how you
                  live.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mx-auto mt-12 max-w-2xl">
                <ClientStory
                  videoId="rw78e7K_E_Q"
                  title="Todd, Washington State, on searching for a BGC penthouse"
                  name="Todd, Washington State"
                  detail="Todd was spending $10,000 a month in Washington. A career, a divorce, a house sold, and a decision to take a year and put it into his own health. He viewed nine properties in a single day, then more on the second round, and deliberately stepped his budget up partway through to see what the next tier actually bought. He ended up in a BGC penthouse, 39 floors up with roughly 20 foot ceilings, at $2,000 a month."
                  watchFor="What a serious search actually looks like from the inside, and his account of the process being fraught with peril once agents are inflating prices and the photographs are not the unit you get shown."
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 5. The lease and the foreigner price ---------- */}
        <section className="bg-sheen px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading eyebrow="The contract">
                The Lease, And What The Foreigner Price Costs
              </SectionHeading>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-9 space-y-6 text-base leading-relaxed text-ink/75">
                <Lead>Listings are not a reliable picture of the market.</Lead>
                <p>
                  The same unit is often posted by several brokers at several
                  prices.
                </p>
                <p>
                  And the unit in the photographs is frequently not the unit you
                  will be shown, because the photographed one was leased months ago
                  and the listing was never taken down.
                </p>
                <Lead>Nothing regulates your lease at this level.</Lead>
                <p>
                  Americans arrive expecting a statutory ceiling on deposits.
                  There is one, and it does not apply to you.
                </p>
                <Bullets items={LEASE_FACTS} />
                <p>
                  Your contract is the only thing standing between you and
                  whatever was agreed, and there is no regulator to appeal to
                  afterwards.
                </p>
                <p>
                  Association dues are the other common surprise, often quoted
                  separately from rent or not mentioned at all until the
                  contract appears. Ask for the figure in writing before you
                  negotiate anything else.
                </p>
                <p>
                  Verbal agreements here are worth precisely nothing, including
                  the ones made warmly and in good faith.
                </p>
                <p>
                  Then there is the skin tax, which is the local term for being
                  quoted a higher price because you are visibly foreign.
                </p>
                <p>
                  Everyone discusses it on a $600 apartment, where it is an
                  irritation. At ₱150,000 a month, around $2,460, it is a
                  different problem entirely.
                </p>
                <Lead>
                  A 20 to 40 percent markup is $7,000 to $15,000 a year.
                </Lead>
                <p>
                  Every year, on a signed contract you cannot reopen until it
                  expires. The higher your budget, the more the markup takes,
                  and the less anyone thinks to warn you about it.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="lift mt-10 rounded-3xl bg-white p-7 shadow-card ring-1 ring-ink/5 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                  Worked example
                </p>
                <p className="mt-3 text-base leading-relaxed text-ink/75">
                  Michael&apos;s asking rent was $1,500. We negotiated it to
                  $1,100, which is roughly $4,800 saved across the year. That is
                  a mid-tier unit. The same percentage applied to a premium
                  building is a different order of number entirely.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 6. Household staff ---------- */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading eyebrow="The staff">
                For The First Time, Someone Else Handles It
              </SectionHeading>
              <p className="mt-6 text-base leading-relaxed text-ink/70">
                You have been the person everyone calls for thirty years. This
                is the part of the move that changes the most about a day, and
                the part almost nothing online covers properly.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-9 space-y-6 text-base leading-relaxed text-ink/75">
                <SpecList items={STAFF_ROLES} />
                <p>
                  Craig runs an executive assistant and a personal assistant.
                  His assistant costs under $500.
                </p>
                <p>
                  Joe and Andrea&apos;s full-time on-call driver costs ₱40,000,
                  around $650, gas included.
                </p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="lift mt-10 rounded-3xl bg-white p-7 shadow-card ring-1 ring-ink/5 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                  If you still run a business
                </p>
                <p className="mt-3 text-base leading-relaxed text-ink/75">
                  Joe&apos;s executive assistant in Texas cost $3,200 a month.
                  Here the same role is $400 to $500. He said he would hire
                  four, because the overhead had been capping the growth of his
                  practice. Walter runs a team of eight supporting a virtual law
                  practice.
                </p>
                <p className="mt-4 text-base leading-relaxed text-ink/75">
                  If you are retired, skip this. If you are not, it is probably
                  the largest single number on this page.
                </p>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-10 text-base leading-relaxed text-ink/75">
                You find people through referral, through agencies, or through
                the building, and the three are not equivalent. Then there are
                the parts nobody tells Americans.
              </p>
              <ul className="cascade mt-6 space-y-5">
                {STAFF_TRUTHS.map((point) => (
                  <li key={point} className="flex gap-3">
                    <CheckIcon />
                    <span className="text-base leading-relaxed text-ink/75">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-12">
                <ClientStory
                  videoId="7bWWU1jxn_U"
                  title="Joe and Andrea, Texas, on staffing a practice from Manila"
                  name="Joe and Andrea, Texas"
                  detail="Joe is a corporate M&A and securities attorney, 20 plus years in private practice, licensed in Texas and New York, married 28 years, moving with his teenage son. He came for four days, viewed the top of the Makati market, and negotiated on a 420 square metre penthouse with a private elevator on camera."
                  watchFor="The moment he works out what an executive assistant costs here and says he would hire four instead of one. Also the full walkthrough of the penthouse, which is the clearest look at the ceiling of this market you will find."
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 7. Visas ---------- */}
        <section className="bg-sheen px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <SectionHeading eyebrow="The paperwork">Visas</SectionHeading>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink/70">
                Two routes matter at this budget. The tourist visa, which you
                extend, and the SRRV, which is permanent residency. The SRRV was
                restructured in September 2025, so most of what is written
                online about it is now wrong.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-10 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink/5">
                <div className="hidden grid-cols-[1fr_1.2fr_1.2fr] gap-px bg-ink/10 sm:grid">
                  <div className="bg-white px-5 py-4" />
                  <div className="bg-white px-5 py-4 text-sm font-black">
                    Tourist visa
                  </div>
                  <div className="bg-white px-5 py-4 text-sm font-black">
                    SRRV
                  </div>
                </div>
                <div className="divide-y divide-ink/10 sm:divide-y-0">
                  {VISA_ROWS.map((row) => (
                    <div
                      key={row.label}
                      className="row-hover p-5 sm:grid sm:grid-cols-[1fr_1.2fr_1.2fr] sm:gap-px sm:border-t sm:border-ink/10 sm:p-0"
                    >
                      <div className="text-xs font-black uppercase tracking-[0.12em] text-ink/45 sm:px-5 sm:py-4 sm:normal-case sm:tracking-normal sm:text-ink/70">
                        {row.label}
                      </div>
                      <div className="mt-2 text-sm leading-relaxed text-ink/75 sm:mt-0 sm:px-5 sm:py-4">
                        <span className="mb-1 block text-xs font-black text-ink/45 sm:hidden">
                          Tourist visa
                        </span>
                        {row.tourist}
                      </div>
                      <div className="mt-3 text-sm leading-relaxed text-ink/75 sm:mt-0 sm:px-5 sm:py-4">
                        <span className="mb-1 block text-xs font-black text-ink/45 sm:hidden">
                          SRRV
                        </span>
                        {row.srrv}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-10 max-w-2xl space-y-6 text-base leading-relaxed text-ink/75">
                <Lead>The restructure changed three things worth knowing.</Lead>
                <Bullets items={SRRV_CHANGES} />
                <p>
                  Your spouse and children under 21 are included with no
                  additional deposit.
                </p>
                <div className="lift rounded-3xl bg-white p-7 shadow-card ring-1 ring-ink/5">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                    The rule almost nobody publishes
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-ink/75">
                    Retired foreign military qualify for Courtesy at a $1,500
                    deposit rather than the $15,000 the Classic route asks. If
                    that applies to you, it is worth checking before you do
                    anything else.
                  </p>
                </div>
                <p>
                  Beyond that the SRRV is not difficult so much as procedural,
                  and the friction is all front-loaded. You need:
                </p>
                <Bullets items={SRRV_NEEDS} />
                <Lead>Apostilled and notarised are not the same thing.</Lead>
                <p>
                  This one misunderstanding causes more delay than everything
                  else put together.
                </p>
                <p>
                  A notary confirms a signature. An apostille is a state-level
                  certification that makes the document valid internationally,
                  and it is issued by the Secretary of State in the state where
                  the document originated.
                </p>
                <p>
                  Documents that have only been notarised get rejected, and by
                  the time you find out you are already here and 8,000 miles
                  from the office that issues the correct version.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 7.5. Mid-page offer ----------
            Sits alone at the true midpoint of the page, between visas and
            healthcare, where every section on either side closes cleanly.
            Styled like the schedule total card so it reads as a deliberate
            pause rather than an ad dropped into the reading flow. */}
        <section className="px-6 py-4">
          <Reveal>
            <div className="lift mx-auto max-w-xl rounded-3xl bg-primary p-8 text-center text-on-primary shadow-glow sm:p-10">
              <h3 className="text-xl font-black sm:text-2xl">
                Interested in working with us?
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed opacity-80">
                See everything we handle, from the first call to the day you
                land.
              </p>
              <Link
                href="/"
                className="btn-shine mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary shadow-[0_10px_30px_-10px_rgba(4,22,48,0.4)] transition-all duration-300 hover:-translate-y-0.5"
              >
                See What We Offer
              </Link>
            </div>
          </Reveal>
        </section>

        {/* ---------- 8. Healthcare ---------- */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading eyebrow="The cover">Healthcare</SectionHeading>
              <p className="mt-6 text-base leading-relaxed text-ink/70">
                The category where being wrong is most expensive, because the
                decision is made before boarding rather than after landing.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-9 space-y-6 text-base leading-relaxed text-ink/75">
                <p>There are three approaches.</p>
                <SpecList items={INSURANCE} />
                <Lead>
                  Two things make this the one decision you cannot postpone.
                </Lead>
                <p>
                  The first is timing. Pre-existing condition exclusions and
                  waiting periods are written against the date your policy
                  starts. Arriving uninsured and buying cover once you are
                  settled means anything already on your medical record is
                  likely excluded, permanently, and no amount of money
                  afterwards reopens that.
                </p>
                <p>
                  The second is harder. Local Philippine plans typically exclude
                  pre-existing conditions outright rather than after a waiting
                  period, and most will not accept a new member over 65.
                </p>
                <p>
                  If you are approaching that line, the door does not stay open
                  and waiting does not improve your position.
                </p>
                <p>
                  The hospitals the expat community actually uses are
                  St. Luke&apos;s Medical Center BGC, Makati Medical Center, The
                  Medical City and Asian Hospital and Medical Center. All four
                  operate in English and you deal with them directly.
                </p>
                <p>
                  Paying cash, a specialist consultation runs ₱1,500 to ₱3,500,
                  about $25 to $57. A private room at the top facilities runs up
                  to around ₱20,000 a night, which is about $330, with doctor
                  fees billed separately from the room.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 9. Clubs and access ---------- */}
        <section className="bg-sheen px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading eyebrow="The access">
                Clubs, Memberships And Access
              </SectionHeading>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-9 space-y-8 text-base leading-relaxed text-ink/75">
                <div>
                  <h3 className="text-lg font-black">Manila House</h3>
                  <p className="mt-3">
                    A private members club in BGC, opposite High Street and the
                    Philippine Stock Exchange.
                  </p>
                  <p className="mt-4 text-lg font-black text-ink">
                    Membership is referral only.
                  </p>
                  <p className="mt-3">
                    You cannot simply apply, and no amount of money changes that
                    on its own.
                  </p>
                  <p className="mt-4">
                    The club does not publish its fees, and the figures
                    circulating online disagree with each other, so we will not
                    print one here. In Austin&apos;s video below the membership
                    director gives the current numbers on camera.
                  </p>
                  <p className="mt-4">
                    Members get reciprocal access to clubs in Hong Kong,
                    Singapore and the US.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-black">Golf and country clubs</h3>
                  <p className="mt-3">
                    Foreigners buy B shares. A shares are Filipino only.
                    Memberships are acquired through brokers, who arrange
                    driver-escorted site visits before you commit.
                  </p>
                  <p className="mt-3">
                    At the top of the market the numbers look like this.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <dl className="rich cascade mt-8 overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink/5">
                {GOLF_SHARES.map((g, i) => (
                  <div
                    key={g.club}
                    className={`row-hover flex items-baseline justify-between gap-6 px-6 py-4 sm:px-7 ${
                      i > 0 ? "border-t border-ink/10" : ""
                    }`}
                  >
                    <dt className="text-base font-bold">{g.club}</dt>
                    <dd className="shrink-0 text-right">
                      <span className="block text-sm font-black text-primary">
                        {g.price}
                      </span>
                      <span className="block text-xs font-bold text-ink/40">
                        {g.priceUsd}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-8 space-y-6 text-base leading-relaxed text-ink/75">
                <p>
                  Those are the trophy clubs, and prices there have been broadly
                  flat. Below that tier the decision changes shape entirely, and
                  it turns on a distinction almost nobody explains to Americans.
                </p>
                <Lead>A share and a membership are not the same thing.</Lead>
                <p>
                  A membership is cheaper and it runs for a year or two. You are
                  buying access, and when it ends you own nothing.
                </p>
                <p>
                  A share you own outright. If you stop playing, or you split
                  your year between here and the US, you can rent it out. You
                  give up playing rights for as long as a tenant holds it, and
                  you collect the income.
                </p>
                <p>
                  That is why a share can sit in a retirement portfolio rather
                  than in a monthly budget. It is worth asking a broker about
                  both routes before you assume the trophy clubs are the market.
                </p>
                <p>
                  Craig looked at the course adjacent to BGC first, decided it
                  was beyond any sensible budget, and took a share at Eastridge
                  in Antipolo instead. He chose it deliberately because it is an
                  hour out and the expats do not travel that far.
                </p>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="lift mt-10 rounded-3xl bg-white p-7 shadow-card ring-1 ring-ink/5 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary">
                  The same man, two club shares
                </p>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="text-3xl font-black tracking-tight text-ink/70">
                      $450,000
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink/45">
                      His club share in the United States, which he still holds
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-black tracking-tight text-primary">
                      $22,000
                    </p>
                    <p className="mt-1 text-sm font-bold text-ink/45">
                      His share at Eastridge, bought this year
                    </p>
                  </div>
                </div>
                <p className="mt-6 text-base leading-relaxed text-ink/75">
                  Both figures are Craig&apos;s own, given on camera in the
                  video below. He is the same man valuing two club shares at the
                  same time, which is what makes the comparison worth anything.
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="mt-8 space-y-6 text-base leading-relaxed text-ink/75">
                <p>
                  Worth stating plainly, because it is one of the strongest
                  arguments for the move and one of the least discussed: club
                  and golf access of this kind is functionally unavailable in
                  the US at any comparable price.
                </p>
                <p>
                  Craig described the US position as needing somebody to die and
                  bequeath a membership before you can even attempt to get one.
                </p>
              </div>

              <div className="mt-12">
                <ClientStory
                  videoId="i3W2JtgwpWo"
                  title="Craig at Eastridge, on what a golf share actually costs"
                  name="Craig, at Eastridge"
                  detail="A day at the course Craig chose, an hour outside the city in the hills of Rizal, looking over Laguna Lake. He walks through what he paid, why he bought a share rather than a membership, and what he can do with it if he stops playing."
                  watchFor="The moment he explains that a share can be rented out when you are not using it, which turns a club into something that pays you rather than something you pay. It is the clearest explanation of how club ownership works here that we have on camera."
                />
              </div>

              <div className="mt-12">
                <ClientStory
                  videoId="3BKgMMKdtI4"
                  title="Austin, Texas, touring Manila House"
                  thumbnail="/thumbnails/king-austin.png"
                  name="Austin, Texas"
                  detail="Austin has lived overseas for eighteen years across Thailand, Japan and Mexico, and holds property and investments in Thailand. He chose the Philippines for the visa environment, the English and the closeness to the US, and he still chose to have the move handled rather than do it himself. He is the person on this page with the least reason to need help."
                  watchFor="A full walkthrough of Manila House with the membership director on camera, including the current joining fee and annual dues. This is the clearest look inside the club you will get without a member taking you."
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 10. Who do you talk to on a Tuesday ---------- */}
        <section className="bg-dark-glow px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading eyebrow="The part nobody plans for" onDark>
                Who Do You Talk To On A Tuesday?
              </SectionHeading>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-8 space-y-6 text-base leading-relaxed text-white/65 sm:text-lg">
                <p>
                  Everything above this point is logistics. Housing, staff,
                  visas, healthcare, clubs. All of it is solvable. None of it
                  answers the question that actually decides whether a man
                  stays.
                </p>
                <p>
                  Walter spent seven years near Waikiki and San Diego before
                  that. He says it never had the social and cultural field he
                  was looking for.
                </p>
                <p>
                  In his first year in Manila he had more social engagement and
                  more evenings out than in seven years in Hawaii.
                </p>
                <Lead onDark>That was not an accident of geography.</Lead>
                <Bullets
                  onDark
                  items={[
                    "Walter joined a club because he wanted somewhere they knew his name, and started a practice so there was a reason to meet people.",
                    "Craig built his week around a cigar lounge in Makati where the owner keeps his locker and puts the blues on when he texts ahead.",
                    "Todd said the social side was exactly what Seattle lacked.",
                  ]}
                />
                <Lead onDark>None of them arrived and hoped.</Lead>
                <p>That is the whole difference.</p>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="lift mt-10 rounded-3xl bg-white p-7 shadow-glow-lg sm:p-9">
                <h3 className="text-xl font-black">The Expat Inner Circle</h3>
                <p className="mt-3 text-base leading-relaxed text-ink/70">
                  Every two weeks we put our clients in a room together. High net
                  worth, successful, at the same stage of life. You are not
                  arriving somewhere and hoping to meet people.
                </p>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-10">
                <ClientStory
                  videoId="GKbFhrhqd6c"
                  title="Five American clients on why they left the US for BGC"
                  name="The Inner Circle, filmed"
                  detail="Five clients, on camera together, from Port St. Lucie, Scottsdale, Miami, Seattle and Texas. George had landed three hours before filming, on a scouting trip, and had already made friends he did not expect to make that fast."
                  watchFor="Dr. Michael Critter, a retired professor from Scottsdale who spent $10,000 a month taking care of everyone else, on choosing himself for the first time in his life. And George, three hours off the plane, already several drinks and several friends in."
                />
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-10">
                <ClientStory
                  videoId="d9GhB5q6HqY"
                  title="Walter, Hawaii, on purpose and social life in Manila"
                  name="Walter, Hawaii"
                  detail="Semi-retired government lawyer for a high-end agency, seven years near Waikiki and San Diego before that. He spends $4,000 to $5,000 personal plus $2,000 to $3,000 on the business, and says $5,000 a month puts you in the top 10 percent of the income bracket here."
                  watchFor="His line about not wanting to be sedentary and not wanting to die in a hammock, and what he actually did about it. If you are within a few years of stopping work, this is the one to watch first."
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 11. What goes wrong at this budget ---------- */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading eyebrow="The failure modes">
                What Goes Wrong At This Budget
              </SectionHeading>
              <p className="mt-6 text-base leading-relaxed text-ink/70">
                The mistakes that get expensive once you are spending $5,000
                to $10,000 a month.
              </p>
            </Reveal>

            <Reveal delay={80}>
              <ol className="cascade mt-10 space-y-4">
                {MISTAKES.map((m, i) => (
                  <li
                    key={m.title}
                    className="lift flex gap-5 rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink/5"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-black text-primary"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-black leading-snug">
                        {m.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/65">
                        {m.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>

        {/* ---------- 12. DIY versus agencies versus us ---------- */}
        <section className="bg-dark-glow px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <Reveal className="text-center">
              <h2 className="mx-auto max-w-3xl text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
                Doing It Yourself Versus Having It Handled
              </h2>
            </Reveal>

            <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3">
              {OPTIONS.map((option, i) => (
                <Reveal key={option.title} delay={i * 120} className="h-full">
                  {option.highlighted ? (
                    <div className="lift relative flex h-full flex-col rounded-3xl bg-white p-8 text-left shadow-glow-lg ring-2 ring-primary-soft/60 lg:scale-[1.05]">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-glow">
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-6 w-6"
                          aria-hidden="true"
                        >
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
                    <div className="flex h-full flex-col rounded-3xl bg-white/[0.06] p-8 text-left ring-1 ring-white/10 backdrop-blur transition-colors duration-300 hover:bg-white/[0.09]">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-rose-300">
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5"
                          aria-hidden="true"
                        >
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

            <Reveal delay={180}>
              <div className="mx-auto mt-14 max-w-3xl">
                <ClientStory
                  videoId="ztLGUaDhlSE"
                  title="Craig, North Carolina, on what a top tier month actually costs"
                  name="Craig, North Carolina"
                  detail="Retired military, then vice president of procurement and logistics for a company in the Middle East, then a financial adviser. He sold the house, the furniture and six cars before he came. He holds a golf membership and country club memberships, and runs an executive assistant and a personal assistant."
                  watchFor="An itemised breakdown of a top tier month, and how club memberships are actually acquired here through a broker, complete with escorted site visits before you commit."
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 13. Questions ---------- */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading eyebrow="Questions">
                The Questions You Are Actually Asking
              </SectionHeading>
            </Reveal>

            {/* Native details/summary: keyboard accessible, works with no
                JavaScript, keeps the page a server component. */}
            <Reveal delay={80}>
              <div className="cascade mt-10 space-y-3">
                {QUESTIONS.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-2xl bg-white p-6 shadow-card ring-1 ring-ink/5 transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(4,22,48,0.05),0_18px_44px_-22px_rgba(73,52,251,0.35)] [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-5 text-base font-black leading-snug">
                      {item.q}
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-open:rotate-45"
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path d="M10 4.25a.75.75 0 01.75.75v4.25H15a.75.75 0 010 1.5h-4.25V15a.75.75 0 01-1.5 0v-4.25H5a.75.75 0 010-1.5h4.25V5a.75.75 0 01.75-.75z" />
                        </svg>
                      </span>
                    </summary>
                    <p className="accordion-body mt-4 text-base leading-relaxed text-ink/70">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 14. Close ---------- */}
        <section className="px-6 pb-24 pt-10">
          <Reveal>
            <div className="bg-sheen mx-auto max-w-3xl rounded-[2.5rem] border border-ink/10 px-6 py-16 text-center sm:py-20">
              <h2 className="mx-auto max-w-2xl text-2xl font-black leading-tight tracking-tight sm:text-4xl">
                The Income Is Already There
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink/65 sm:text-lg">
                The only question left is which market you spend it in.
              </p>
              <div className="mt-9">
                <Link
                  href="/"
                  prefetch
                  className="btn-shine cta-ring group relative inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-base font-bold text-on-primary shadow-[0_10px_30px_-10px_rgba(73,52,251,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3d2ae8] active:translate-y-0 sm:w-auto sm:text-lg"
                >
                  See What We Offer
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h9.69L10.22 6.03a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}
