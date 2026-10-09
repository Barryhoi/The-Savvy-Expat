"use client";

import { useEffect, useState, type InputHTMLAttributes } from "react";
import {
  callingCode,
  countryForTyped,
  countryOptions,
  flag,
  nationalPart,
  parsePhone,
  type CountryCode,
} from "@/lib/phone";

type Props = {
  /** Full international number (+6583833995) once valid, otherwise what was typed. */
  value: string;
  onChange: (value: string) => void;
  defaultCountry: CountryCode;
  /** Adds a hidden input so plain <form> posts receive the international number. */
  name?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
};

/**
 * Country picker + number box. The visitor's country is preselected (from
 * their location), so nobody's number is ever assumed to be American: the
 * saved value always carries the country the person chose.
 */
export default function PhoneInput({ value, onChange, defaultCountry, name, inputProps }: Props) {
  const [country, setCountry] = useState<CountryCode>(() => countryForTyped(value, defaultCountry));
  const [text, setText] = useState(() => nationalPart(value));
  // Country names come from the browser's Intl data, which differs slightly
  // from the server's, so the full list is built after hydration.
  const [options, setOptions] = useState<ReturnType<typeof countryOptions> | null>(null);
  useEffect(() => setOptions(countryOptions()), []);
  const parsed = text.trim() ? parsePhone(text, country) : null;

  function update(nextText: string, nextCountry: CountryCode) {
    // Someone typing the full +44… number picks the country themselves.
    const chosen = countryForTyped(nextText, nextCountry);
    if (chosen !== nextCountry) setCountry(chosen);
    setText(nextText);
    const result = nextText.trim() ? parsePhone(nextText, chosen) : null;
    onChange(result ? result.number : nextText.trim());
  }

  return (
    <div className="phone-field">
      <div className="phone-row">
        <label className="phone-country">
          <span className="sr-only">Country</span>
          <span className="phone-country-face" aria-hidden="true">
            <span className="phone-flag">{flag(country)}</span>
            <span>{callingCode(country)}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <select
            value={country}
            onChange={(e) => {
              const next = e.target.value as CountryCode;
              setCountry(next);
              update(text, next);
            }}
          >
            {(options ?? [{ code: country, name: country, dial: callingCode(country) }]).map((c) => (
              <option key={c.code} value={c.code}>
                {flag(c.code)} {c.name} ({c.dial})
              </option>
            ))}
          </select>
        </label>
        <input
          {...inputProps}
          className={`phone-number ${inputProps?.className ?? ""}`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          maxLength={30}
          value={text}
          onChange={(e) => update(e.target.value, country)}
        />
      </div>
      {name && <input type="hidden" name={name} value={parsed ? parsed.number : text.trim()} />}
      <p className="phone-preview" aria-live="polite">
        {parsed ? <>We’ll reach you at <strong>{parsed.formatInternational()}</strong></> : " "}
      </p>
    </div>
  );
}
