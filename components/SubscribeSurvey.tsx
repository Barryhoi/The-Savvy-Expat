"use client";

import { useState, type FormEvent, type ReactNode } from "react";

const TIMELINE_OPTIONS = [
  "Within the next 6 months",
  "Within 6–12 months",
  "Within 12+ months",
  "Just researching for now",
];

const HELP_OPTIONS = [
  "Yes, I want professional help",
  "Possibly, still weighing my options",
  "No, I plan to do it myself",
];

const INPUT_CLASS =
  "h-[48px] w-full rounded-[10px] border-[1.5px] border-[#D1D5DB] bg-white px-4 text-[16px] leading-[24px] text-[#111827] outline-none transition-colors duration-200 placeholder:text-[#9CA3AF] hover:border-[#B9BFC9] focus:border-primary focus:shadow-[0_0_0_3px_rgba(73,52,251,0.1)] md:h-[56px]";

type Status = "idle" | "loading" | "error";

/** The 5-question qualifying survey shown right after email signup on
 * /subscribe, in place of Beehiiv's off-brand hosted form. Submits straight
 * to our own API route instead of a Beehiiv webhook. Just the fields — the
 * page-level heading and copy for this step live in SubscribeFlow. */
export default function SubscribeSurvey({
  email,
  onComplete,
}: {
  email: string;
  onComplete: () => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [timeline, setTimeline] = useState("");
  const [helpIntent, setHelpIntent] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          phone,
          timeline,
          helpIntent,
        }),
      });

      if (res.ok) {
        // Same keyboard dismissal as the email step: if the visitor tapped
        // submit straight from the phone field, the keyboard is still up.
        (document.activeElement as HTMLElement | null)?.blur?.();
        onComplete();
      } else {
        const json = await res.json().catch(() => ({}));
        setStatus("error");
        setMessage(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <Field label="First name">
          <input
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Your first name"
            className={INPUT_CLASS}
          />
        </Field>

        <Field label="Last name">
          <input
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Your last name"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Phone number">
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Your phone number"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="mt-4 md:mt-6">
        <Field label="Are you planning to move to the Philippines? If so, when?">
          <div className="flex flex-col">
            {TIMELINE_OPTIONS.map((option) => (
              <ChoiceRow
                key={option}
                name="timeline"
                value={option}
                checked={timeline === option}
                onChange={() => setTimeline(option)}
              >
                {option}
              </ChoiceRow>
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-4 md:mt-6">
        <Field label="Are you considering getting help with your move to the Philippines?">
          <div className="flex flex-col">
            {HELP_OPTIONS.map((option) => (
              <ChoiceRow
                key={option}
                name="helpIntent"
                value={option}
                checked={helpIntent === option}
                onChange={() => setHelpIntent(option)}
              >
                {option}
              </ChoiceRow>
            ))}
          </div>
        </Field>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="sheen mt-4 h-[52px] w-full rounded-[10px] bg-primary px-4 text-[16px] font-bold leading-[24px] text-white shadow-[0_6px_16px_-8px_rgba(73,52,251,0.5)] transition-colors duration-200 hover:bg-[#3d2ae8] disabled:opacity-60 sm:w-auto sm:px-10 md:mt-7 md:h-[56px]"
      >
        {status === "loading" ? "Submitting…" : "Complete My Profile"}
      </button>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-600">{message}</p>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[15px] font-semibold leading-[20px] text-[#111827] md:mb-2.5">
        {label}
      </p>
      {children}
    </div>
  );
}

/** A plain radio row — the same custom radio circle the boxed tiles used,
 * without the card chrome, so a stack of options reads like a survey line
 * rather than a wall of buttons and the whole form fits a phone screen. */
function ChoiceRow({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: ReactNode;
}) {
  return (
    <label className="group -mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-150 hover:bg-primary/[0.04] md:py-2">
      <span
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] bg-white transition-colors duration-150 ${
          checked ? "border-primary" : "border-[#C7CBD6] group-hover:border-[#9CA3AF]"
        }`}
      >
        <span
          className={`h-[11px] w-[11px] rounded-full bg-primary transition-transform duration-150 ${
            checked ? "scale-100" : "scale-0"
          }`}
        />
      </span>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        required
        className="sr-only"
      />
      <span
        className={`text-[16px] leading-[22px] ${
          checked ? "font-semibold text-[#111827]" : "text-[#374151]"
        }`}
      >
        {children}
      </span>
    </label>
  );
}
