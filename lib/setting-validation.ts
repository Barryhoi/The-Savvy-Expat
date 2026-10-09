import { normalizePhone } from "./phone";

export type SetterContactInput = {
  name: string;
  email: string;
  phone: string;
};

export function validateSetterContact(input: unknown): SetterContactInput {
  if (!input || typeof input !== "object") throw new Error("INVALID_CONTACT");
  const data = input as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim().replace(/\s+/g, " ") : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const rawPhone = typeof data.phone === "string" ? data.phone.trim() : "";
  if (name.length < 2 || name.length > 120 || /[<>\u0000-\u001f]/.test(name))
    throw new Error("INVALID_CONTACT");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("INVALID_CONTACT");
  const phone = normalizePhone(rawPhone);
  if (!phone) throw new Error("INVALID_CONTACT");
  return { name, email, phone };
}
