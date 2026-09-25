import { questions, qualification, validateName, validateAnswer, type Answers } from "./intake";
export const ABANDONMENT_MS = 30 * 60 * 1000;
export function validateProgress(input: unknown): Answers {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("INVALID_PROGRESS");
  const source = input as Record<string, unknown>;
  const nameError = validateName(source);
  if (nameError) throw new Error(nameError);
  const answers: Answers = { firstName: String(source.firstName).trim(), lastName: String(source.lastName).trim() };
  for (const q of questions.filter(q => !["name", "final"].includes(q.key))) {
    const value = source[q.key];
    if (value === undefined || value === "" || (Array.isArray(value) && !value.length)) {
      if (["email", "phone"].includes(q.key)) throw new Error("MISSING_CONTACT");
      continue;
    }
    const error = validateAnswer(q.key, value);
    if (error) throw new Error(error);
    answers[q.key] = Array.isArray(value) ? Array.from(new Set(value)) : String(value).trim();
    if (qualification(answers)) break;
  }
  return answers;
}
export function abandonmentDue(updatedAt: string, now = Date.now()) {
  const updated = Date.parse(updatedAt);
  return Number.isFinite(updated) && now - updated >= ABANDONMENT_MS;
}
