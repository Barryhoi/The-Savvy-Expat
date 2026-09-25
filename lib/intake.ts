import schema from "./intake-schema.json";

export const questions = schema.questions;
// Display copy is separate from the original answer values used by qualification,
// saved applications, and CRM fields.
const choiceLabels: Record<string, string> = {
  "Fully committed - just need execution": "Fully committed — I just need help with the move",
  "Mostly committed - a few concerns left": "Mostly committed — I have a few concerns left",
  "Unsure - still weighing options": "Unsure — I’m still weighing my options",
  "0-3 months from now": "0–3 months from now",
  "3-6 months from now": "3–6 months from now",
  "6 months - 1 year from now": "6 months to 1 year from now",
  "Attaining healthcare": "Setting up healthcare",
  "Opening up a bank account": "Opening a bank account",
  "Hiring  Local Staff": "Hiring local staff",
  "Travel Itinerary for scouting trip": "Planning an itinerary for a scouting trip",
  "$1,000 - $2,500": "$1,000–$2,500",
  "$3,000 - $4,000": "$3,000–$4,000",
  "I have the funds but they're tied up right now": "I have the funds, but they’re tied up right now",
  "None, I'm ready to get professional help now": "None — I’m ready to get professional help now",
  "I'm not ready to move forward, still finalizing logistics": "I’m not ready to move forward — I’m still finalizing arrangements",
};
export function choiceLabel(value: string): string {
  return choiceLabels[value] || value;
}
export type Answers = Record<string, string | string[]>;
export const rejectionRules = {
  situation: "I'm at an early stage and mainly looking for advice",
  commitment: "Unsure - still weighing options",
  timeline: "12+ months from now",
  logistics: "I'm not ready to move forward, still finalizing logistics",
} as const;
export type Rejection = keyof typeof rejectionRules;
export function qualification(answers: Answers): Rejection | null {
  for (const key of Object.keys(rejectionRules) as Rejection[]) {
    if (answers[key] === rejectionRules[key]) return key;
  }
  return null;
}
export function ending(reason: Rejection) {
  return schema.endings[reason];
}
export function validateAnswer(key: string, value: unknown): string | null {
  const q = questions.find((q) => q.key === key);
  if (!q || key === "final" || key === "name") return null;
  const empty =
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && !value.length);
  if (empty) return q.required ? "Please choose an answer to continue." : null;
  if (q.multiple) {
    if (
      !Array.isArray(value) ||
      value.some((v) => typeof v !== "string" || !q.choices.includes(v))
    )
      return "Please choose from the listed services.";
  } else {
    if (typeof value !== "string" || value.length > 4000)
      return "Please enter a valid answer (up to 4,000 characters).";
    if (q.choices.length && !q.choices.includes(value))
      return "Please choose one of the listed answers.";
    if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Please enter a valid email address.";
    if (key === "phone" && !/^\+?[\d\s().-]{7,30}$/.test(value))
      return "Please enter your phone number with its country code.";
  }
  return null;
}
export function validateSubmission(input: unknown): Answers {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid application.");
  const source = input as Record<string, unknown>;
  const result: Answers = {};
  for (const key of ["firstName", "lastName"]) {
    const value = source[key] ?? "";
    if (typeof value !== "string" || value.length > 150)
      throw new Error("Please check your name.");
    result[key] = value.trim();
  }
  for (const q of questions.filter((q) => !["name", "final"].includes(q.key))) {
    const value = source[q.key] ?? (q.multiple ? [] : "");
    const error = validateAnswer(q.key, value);
    if (error) throw new Error(`${q.title} ${error}`);
    result[q.key] = Array.isArray(value)
      ? Array.from(new Set(value))
      : (value as string).trim();
    // Reject at exactly the same point as the published Typeform. Later answers
    // are neither required nor accepted on that branch.
    if (qualification(result)) break;
  }
  return result;
}
