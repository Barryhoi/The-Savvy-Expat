// Automatic topic tagging for newsletters. beehiiv's own content_tags field is
// unused on this publication, so newsletters are classified from their
// title + subtitle instead. This runs on every newsletter (including future
// ones) — no manual tagging required.
//
// The archive at /newsletter is a single undivided grid and does not use any
// of this; topics exist only on an individual issue's page, to label it and to
// pick the related issues shown at the bottom.

export interface Category {
  id: string;
  label: string;
  /** Tailwind classes for the soft badge shown on an issue's page. */
  chipClass: string;
  /** Small solid swatch paired with the label above the related issues. */
  dotClass: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "stories",
    label: "Client Stories",
    chipClass: "bg-amber-100 text-amber-700",
    dotClass: "bg-amber-500",
  },
  {
    id: "money",
    label: "Cost of Living & Money",
    chipClass: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  {
    id: "guides",
    label: "Lifestyle & Guides",
    chipClass: "bg-sky-100 text-sky-700",
    dotClass: "bg-sky-500",
  },
  {
    id: "visas",
    label: "Visas & Residency",
    chipClass: "bg-violet-100 text-violet-700",
    dotClass: "bg-violet-500",
  },
  {
    id: "housing",
    label: "Housing & Real Estate",
    chipClass: "bg-rose-100 text-rose-700",
    dotClass: "bg-rose-500",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    chipClass: "bg-teal-100 text-teal-700",
    dotClass: "bg-teal-500",
  },
];

const DEFAULT_CATEGORY = CATEGORIES.find((c) => c.id === "guides")!;

const CATEGORY_BY_ID: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((category) => [category.id, category])
);

export function getCategory(id: string): Category {
  return CATEGORY_BY_ID[id] ?? DEFAULT_CATEGORY;
}

const VISA_RE = /\b(visa|residency|digital nomad)\b/i;
const HEALTHCARE_RE = /\b(healthcare|hospital|medical)\b/i;
const HAD_A_BABY_RE = /had a baby/i;
// Personal-narrative openers: "He left...", "They sold...", "This expat...",
// "From cold Wisconsin...", "How a veteran...", "How this expat...", or a
// "The Philippines made him feel..." transformation framing anywhere in the
// title.
const STORY_RE = /^(he |they |this |from |how a |how this )/i;
const STORY_TRANSFORMATION_RE = /\bmade (him|her|them)\b/i;
const HOUSING_RE = /\b(condo|apartment|landlord|real estate)\b/i;
const RENTAL_RE = /\brent(al)?\b/i;
const MONEY_RE =
  /\b(cost|costs|budget|peso|pesos|dollar|dollars|afford|worth|scam|save|saved|spend|spent|expensive|price|bank)\b/i;

/** Assigns a single primary category based on a newsletter's title + subtitle. */
export function categorizePost(title: string, subtitle: string): string {
  const text = `${title} ${subtitle}`;

  if (VISA_RE.test(text)) return "visas";
  if (HEALTHCARE_RE.test(text) || HAD_A_BABY_RE.test(text)) return "healthcare";
  if (STORY_RE.test(title) || STORY_TRANSFORMATION_RE.test(title)) return "stories";
  if (HOUSING_RE.test(text) || RENTAL_RE.test(text)) return "housing";
  if (MONEY_RE.test(text) || text.toLowerCase().includes("retire comfortably") || text.includes("$")) {
    return "money";
  }
  return "guides";
}
