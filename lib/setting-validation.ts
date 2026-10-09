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
  if (!/^\+?[\d\s().-]+$/.test(rawPhone)) throw new Error("INVALID_CONTACT");
  const digits = rawPhone.replace(/\D/g, "");
  // + or 00 marks an international number that keeps its own country code.
  if (rawPhone.startsWith("+") || rawPhone.startsWith("00")) {
    const international = rawPhone.startsWith("+") ? digits : digits.slice(2);
    if (!international.startsWith("1")) {
      if (!/^[2-9]\d{7,14}$/.test(international)) throw new Error("INVALID_CONTACT");
      return { name, email, phone: `+${international}` };
    }
  }
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (national.length !== 10 || !/^[2-9]\d{2}[2-9]\d{6}$/.test(national))
    throw new Error("INVALID_CONTACT");
  return { name, email, phone: `+1${national}` };
}
