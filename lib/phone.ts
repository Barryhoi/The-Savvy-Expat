import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/max";

export type { CountryCode };

export const PHONE_ERROR =
  "Please enter a valid phone number for the selected country.";

const COUNTRIES = new Set<string>(getCountries());

export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && COUNTRIES.has(value);
}

// The picker always submits a full international number (+65…). A bare
// number only reaches the server from older saved drafts, which were US.
// 00 is the international dialing prefix used outside North America.
export function normalizePhone(
  value: unknown,
  country: CountryCode = "US",
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/^00/, "+");
  if (!/^\+?[\d\s().-]+$/.test(trimmed)) return null;
  const parsed = parsePhoneNumberFromString(trimmed, country);
  return parsed?.isValid() ? parsed.number : null;
}

export function parsePhone(value: string, country: CountryCode) {
  const parsed = parsePhoneNumberFromString(
    value.trim().replace(/^00/, "+"),
    country,
  );
  return parsed && parsed.isValid() ? parsed : null;
}

// Several countries share a calling code (+1, +7, +44, +61…). When someone
// types the full number, keep their picked country if the code matches,
// otherwise switch to the code's main country rather than a territory.
const MAIN_COUNTRY: Record<string, CountryCode> = {
  "1": "US", "7": "RU", "44": "GB", "47": "NO", "61": "AU", "39": "IT",
  "212": "MA", "262": "RE", "290": "SH", "358": "FI", "590": "GP", "599": "CW",
};
export function countryForTyped(value: string, current: CountryCode): CountryCode {
  const trimmed = value.trim().replace(/^00/, "+");
  if (!trimmed.startsWith("+")) return current;
  const parsed = parsePhoneNumberFromString(trimmed);
  if (!parsed) return current;
  if (String(getCountryCallingCode(current)) === parsed.countryCallingCode) return current;
  return MAIN_COUNTRY[parsed.countryCallingCode] ?? parsed.country ?? current;
}

export function nationalPart(value: unknown): string {
  if (typeof value !== "string") return "";
  if (!value.startsWith("+")) return value;
  return parsePhoneNumberFromString(value)?.formatNational() ?? value;
}

export function flag(country: string) {
  return String.fromCodePoint(
    ...[...country].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

export function callingCode(country: CountryCode) {
  return `+${getCountryCallingCode(country)}`;
}

// Most applicants are North American or already in the Philippines, so those
// lead the list; everything else follows alphabetically.
const PINNED: CountryCode[] = ["US", "CA", "PH", "GB", "AU"];
export function countryOptions(locale = "en") {
  let names: Intl.DisplayNames | null = null;
  try {
    names = new Intl.DisplayNames([locale], { type: "region" });
  } catch {}
  const all = getCountries().map((code) => ({
    code,
    name: names?.of(code) || code,
    dial: callingCode(code),
  }));
  const pinned = PINNED.map((code) => all.find((c) => c.code === code)!);
  const rest = all
    .filter((c) => !PINNED.includes(c.code))
    .sort((a, b) => a.name.localeCompare(b.name));
  return [...pinned, ...rest];
}
