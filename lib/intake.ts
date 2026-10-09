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
  funds: "No",
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
export function validateName(input: Record<string, unknown>): string | null {
  if (typeof input.firstName !== "string" || !input.firstName.trim() || input.firstName.length > 150)
    return "Please enter your first name.";
  if (typeof input.lastName !== "string" || !input.lastName.trim() || input.lastName.length > 150)
    return "Please enter your last name.";
  return null;
}
export function contactStep(answers: Answers): number | null {
  if (validateName(answers)) return 0;
  if (validateAnswer("email", answers.email)) return 1;
  if (validateAnswer("phone", answers.phone)) return 2;
  return null;
}
// US is the default: accept local formatting and an optional leading 1.
// Numbers starting with + or 00 are international and keep their country code.
export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string" || !/^\+?[\d\s().-]+$/.test(value.trim())) return null;
  const trimmed = value.trim();
  const digits = value.replace(/\D/g, "");
  if (trimmed.startsWith("+") || trimmed.startsWith("00")) {
    const international = trimmed.startsWith("+") ? digits : digits.slice(2);
    if (international.startsWith("1")) return international.length === 11 ? `+${international}` : null;
    return /^[2-9]\d{7,14}$/.test(international) ? `+${international}` : null;
  }
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}
export const PHONE_ERROR =
  "Please enter a valid phone number. Outside the US? Start with + and your country code.";
export function validateAnswer(key: string, value: unknown): string | null {
  const q = questions.find((q) => q.key === key);
  if (!q || key === "final" || key === "name") return null;
  const empty =
    value === undefined ||
    (typeof value === "string" && !value.trim()) ||
    (Array.isArray(value) && !value.length);
  if (empty) return q.required
    ? key === "email" ? "Please enter your email address."
      : key === "phone" ? PHONE_ERROR
      : "Please choose an answer to continue."
    : null;
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
    if (key === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      return "Please enter a valid email address.";
    if (key === "phone" && !normalizePhone(value))
      return PHONE_ERROR;
  }
  return null;
}
export function validateSubmission(input: unknown): Answers {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Invalid application.");
  const source = input as Record<string, unknown>;
  const nameError = validateName(source);
  if (nameError) throw new Error(nameError);
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
      : q.key === "phone" ? normalizePhone(value)! : (value as string).trim();
    // Reject at exactly the same point as the published Typeform. Later answers
    // are neither required nor accepted on that branch.
    if (qualification(result)) break;
  }
  return result;
}
