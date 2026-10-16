// The questions on Calendly's form for Sam's Discovery Call (Oct 11 2026).
// Names and options here must match the Calendly event exactly: the setter
// page and the old /booking flow answer them through the API.
export const BOOK_QUESTIONS = {
  timeline: {
    name: "When do you plan to arrive in the Philippines?",
    options: ["0–3 months from now", "3–6 months from now", "6 months to 1 year from now", "12+ months from now"],
    required: true,
  },
  services: {
    name: "Which services do you need?",
    options: [
      "Finding a rental", "Securing a visa", "Setting up healthcare", "Opening a bank account",
      "Hiring local staff", "Planning an itinerary for a scouting trip", "Advisory consulting",
    ],
    required: false,
  },
  // Replaced the liquid funds question on Oct 16 2026 (Evan).
  budget: {
    name: "How much do you plan to allocate toward your monthly living expenses in the Philippines?",
    options: ["Under $1,000", "$1,000–$2,500", "$2,500–$4,000", "$4,000+"],
    required: true,
  },
  logistics: {
    name: "What arrangements do you still need to finalize before making the move?",
    options: [
      "None, I’m ready to get professional help now",
      "I’m not ready to move forward, I’m still finalizing arrangements",
    ],
    required: false,
  },
} as const;

// Free-text question added Oct 15 2026 (Evan). Optional on Calendly's form;
// saved to the Close field "Why The Savvy Expat".
export const WHY_QUESTION = "What made you want to look into The Savvy Expat for professional relocation support?";

export type BookAnswers = { timeline: string; services: string[]; budget: string; logistics: string; why?: string };

export function validBookAnswers(input: unknown): BookAnswers | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const pick = (key: "timeline" | "budget" | "logistics") => {
    const value = typeof raw[key] === "string" ? (raw[key] as string) : "";
    return (BOOK_QUESTIONS[key].options as readonly string[]).includes(value) ? value : "";
  };
  const services = Array.isArray(raw.services)
    ? [...new Set(raw.services.filter((s): s is string => (BOOK_QUESTIONS.services.options as readonly string[]).includes(s as string)))]
    : [];
  const why = typeof raw.why === "string" ? raw.why.trim().slice(0, 1000) : "";
  const answers = { timeline: pick("timeline"), services, budget: pick("budget"), logistics: pick("logistics"), why };
  if (!answers.timeline || !answers.budget) return null;
  return answers;
}

// Calendly question name → answer, for questions_and_answers.
export function bookQuestionValues(answers: BookAnswers | null): Record<string, string> {
  if (!answers) return {};
  return {
    [BOOK_QUESTIONS.timeline.name]: answers.timeline,
    [BOOK_QUESTIONS.services.name]: answers.services.join("\n"),
    [BOOK_QUESTIONS.budget.name]: answers.budget,
    [BOOK_QUESTIONS.logistics.name]: answers.logistics,
    ...(answers.why ? { [WHY_QUESTION]: answers.why } : {}),
  };
}

// The old /form application stored its own wording; translate it.
const fromApplication: Record<string, string> = {
  "0-3 months from now": "0–3 months from now",
  "3-6 months from now": "3–6 months from now",
  "6 months - 1 year from now": "6 months to 1 year from now",
  "12+ months from now": "12+ months from now",
  "Under $1,000": "Under $1,000",
  "$1,000 - $2,500": "$1,000–$2,500",
  "$3,000 - $4,000": "$2,500–$4,000",
  "$4,000+": "$4,000+",
  "None, I'm ready to get professional help now": "None, I’m ready to get professional help now",
  "I'm not ready to move forward, still finalizing logistics": "I’m not ready to move forward, I’m still finalizing arrangements",
  "Finding a rental": "Finding a rental",
  "Securing a visa": "Securing a visa",
  "Attaining healthcare": "Setting up healthcare",
  "Opening up a bank account": "Opening a bank account",
  "Hiring  Local Staff": "Hiring local staff",
  "Travel Itinerary for scouting trip": "Planning an itinerary for a scouting trip",
  "Advisory consulting": "Advisory consulting",
};
export function applicationBookAnswers(answers: Record<string, string | string[] | undefined>): BookAnswers {
  const one = (value: unknown) => (typeof value === "string" && fromApplication[value]) || "";
  const services = Array.isArray(answers.services) ? answers.services : typeof answers.services === "string" ? [answers.services] : [];
  return {
    timeline: one(answers.timeline),
    services: services.map((s) => fromApplication[s]).filter(Boolean),
    budget: one(answers.budget),
    logistics: one(answers.logistics),
  };
}
