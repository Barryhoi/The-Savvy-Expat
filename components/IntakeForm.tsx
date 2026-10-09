"use client";

import { useEffect, useRef, useState } from "react";
import {
  questions,
  choiceLabel,
  qualification,
  ending,
  validateAnswer,
  validateName,
  contactStep,
  type Answers,
  type Rejection,
} from "@/lib/intake";

import { validateProgress } from "@/lib/intake-progress";
import { readAttribution } from "@/lib/attribution";
import PhoneInput from "@/components/PhoneInput";
import type { CountryCode } from "@/lib/phone";

const STORAGE = "savvy-application-v1";
export default function IntakeForm({ defaultCountry = "US" }: { defaultCountry?: CountryCode }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rejected, setRejected] = useState<Rejection | null>(null);
  const [submissionId, setSubmissionId] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const attempted = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitting = useRef(false);
  const progressRequest = useRef<Promise<void>>(Promise.resolve());
  const revision = useRef(0);
  const [saveWarning, setSaveWarning] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
  }, []);
  function cancelAdvance() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = null;
    setAdvancing(false);
  }
  const q = questions[step];

  useEffect(() => {
    let id = crypto.randomUUID();
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE) || "null");
      if (
        saved &&
        Date.now() - saved.savedAt < 86400000 &&
        saved.version === 1
      ) {
        setAnswers(saved.answers || {});
        setStep(Math.max(0, Math.min(questions.length - 1, saved.step || 0, contactStep(saved.answers || {}) ?? questions.length - 1)));
        id = saved.id || id;
      }
    } catch {
      /* Storage is optional, including in private browsers. */
    }
    setSubmissionId(id);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(
        STORAGE,
        JSON.stringify({
          version: 1,
          answers,
          step,
          id: submissionId,
          savedAt: Date.now(),
        }),
      );
    } catch {}
  }, [answers, step, submissionId, ready]);
  useEffect(() => {
    if (!ready) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [step, rejected]);

  useEffect(() => {
    if (!ready || busy || rejected || step < 2 || validateName(answers) || validateAnswer("email", answers.email)) return;
    let partial: Answers;
    const visited = new Set(["firstName", "lastName", "email", "phone", ...questions.slice(0, step + 1).map(q => q.key)]);
    const draftAnswers = Object.fromEntries(Object.entries(answers).filter(([key]) => visited.has(key)));
    // Capture the committed email even if the phone is still being typed.
    if (validateAnswer("phone", draftAnswers.phone)) delete draftAnswers.phone;
    try { partial = validateProgress(draftAnswers); } catch { return; }
    revision.current = Math.max(Date.now(), revision.current + 1);
    const payload = JSON.stringify({ id: submissionId, revision: revision.current, answers: partial });
    let active = true;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const save = () => {
      progressRequest.current = progressRequest.current.catch(() => {}).then(async () => {
        if (!active || submitting.current) return;
        try {
          const response = await fetch("/api/application/progress", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true,
          });
          if (!response.ok) throw new Error("SAVE_FAILED");
          if (active) setSaveWarning(false);
        } catch {
          if (active) { setSaveWarning(true); retry = setTimeout(save, 5000); }
        }
      });
    };
    const timer = setTimeout(save, 750);
    const flush = () => {
      if (document.visibilityState === "hidden" && !submitting.current)
        navigator.sendBeacon("/api/application/progress", new Blob([payload], { type: "application/json" }));
    };
    document.addEventListener("visibilitychange", flush);
    return () => { active = false; clearTimeout(timer); if (retry) clearTimeout(retry); document.removeEventListener("visibilitychange", flush); };
  }, [answers, step, ready, busy, rejected, submissionId]);

  const change = (key: string, value: string | string[]) => {
    let id = submissionId;
    if (attempted.current) {
      id = crypto.randomUUID();
      setSubmissionId(id);
      attempted.current = false;
    }
    setAnswers((a) => ({ ...a, [key]: value }));
    setError("");
    return id;
  };
  function chooseSingle(value: string) {
    if (submitting.current) return;
    cancelAdvance();
    const id = change(q.key, value);
    const updated = { ...answers, [q.key]: value };
    setAdvancing(true);
    advanceTimer.current = setTimeout(() => next(updated, id), 250);
  }
  async function submit(currentAnswers = answers, id = submissionId) {
    if (submitting.current) return;
    const missingContact = contactStep(currentAnswers);
    if (missingContact !== null) {
      setStep(missingContact);
      setError("Please complete your contact details before continuing.");
      return;
    }
    submitting.current = true;
    attempted.current = true;
    setBusy(true);
    setError("");
    try {
      await progressRequest.current;
      const response = await fetch("/api/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          answers: currentAnswers,
          attribution: readAttribution(),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "We couldn't save your application. Please try again.",
        );
      if (data.qualified) window.location.assign("/booking");
      else {
        setRejected(data.reason);
        try {
          sessionStorage.removeItem(STORAGE);
        } catch {}
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Please try again. Your answers are still here.",
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  function next(currentAnswers = answers, id = submissionId) {
    cancelAdvance();
    if (submitting.current) return;
    const message = q.key === "name" ? validateName(currentAnswers) : validateAnswer(q.key, currentAnswers[q.key]);
    if (message) {
      setError(message);
      return;
    }
    const visitedKeys = new Set(
      questions.slice(0, step + 1).map((question) => question.key),
    );
    const visitedAnswers = Object.fromEntries(
      Object.entries(currentAnswers).filter(([key]) => visitedKeys.has(key)),
    );
    if (qualification(visitedAnswers) || step === questions.length - 1) {
      void submit(currentAnswers, id);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  }
  if (!ready)
    return (
      <p role="status" className="p-8 text-center">
        Loading your application…
      </p>
    );
  if (rejected)
    return (
      <section className="intake-card">
        <h2
          ref={heading}
          tabIndex={-1}
          className="text-2xl font-bold leading-relaxed outline-none"
        >
          {ending(rejected)}
        </h2>
        <p className="mt-8 text-ink/60">
          Warm regards,
          <br />
          The Savvy Expat Team
        </p>
      </section>
    );
  const title = q.title.replace(
    /\{\{field:[^}]+\}\}/g,
    String(answers.firstName || ""),
  ).replace(/,\s*\?$/, "?");
  return (
    <section className="intake-card application-card" aria-busy={busy}>
      <div className="mb-8 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-ink/50">
        <span>Question {step + 1} of {questions.length}</span>
        <span>{q.required ? "Required" : "Optional"}</span>
      </div>
      <div
        className="mb-8 h-1 overflow-hidden rounded-full bg-primary/10"
        role="progressbar"
        aria-label="Application progress"
        aria-valuemin={0}
        aria-valuemax={questions.length}
        aria-valuenow={step + 1}
      >
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        noValidate
      >
        <h2
          ref={heading}
          tabIndex={-1}
          id="question-title"
          className="application-question"
        >
          {title}
        </h2>
        {q.description && (
          <p
            id="question-description"
            className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink/65"
          >
            {q.description}
          </p>
        )}
        <fieldset
          disabled={busy}
          className="mt-7"
          aria-labelledby="question-title"
          aria-describedby={q.description ? "question-description" : undefined}
        >
          {q.key === "name" ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {["firstName", "lastName"].map((key, i) => (
                <label key={key} className="block text-sm font-bold">
                  {i ? "Last name" : "First name"}
                  <input
                    className="intake-input mt-2"
                    autoComplete={i ? "family-name" : "given-name"}
                    required
                    aria-invalid={!!error}
                    aria-describedby={error ? "form-error" : undefined}
                    maxLength={150}
                    value={answers[key] || ""}
                    onChange={(e) => change(key, e.target.value)}
                  />
                </label>
              ))}
            </div>
          ) : q.choices.length ? (
            <div className="space-y-3">
              {q.choices.map((choice, i) => {
                const selected = q.multiple
                  ? ((answers[q.key] as string[]) || []).includes(choice)
                  : answers[q.key] === choice;
                return (
                  <label
                    key={choice}
                    className={`intake-choice ${selected ? "intake-choice-selected" : ""}`}
                  >
                    <input
                      className="choice-control"
                      type={q.multiple ? "checkbox" : "radio"}
                      name={q.key}
                      checked={selected}
                      onClick={() => { if (!q.multiple && selected) chooseSingle(choice); }}
                      onChange={() =>
                        !q.multiple ? chooseSingle(choice) : change(
                          q.key,
                          q.multiple
                            ? selected
                              ? (answers[q.key] as string[]).filter(
                                  (v) => v !== choice,
                                )
                              : [
                                  ...((answers[q.key] as string[]) || []),
                                  choice,
                                ]
                            : choice,
                        )
                      }
                    />
                    <span className="choice-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span><span className="choice-text">{choiceLabel(choice)}</span><span className="choice-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                  </label>
                );
              })}
              {!q.multiple && <p className="text-sm text-ink/65" role="status">{advancing ? "Moving to the next step…" : "Select an answer to continue automatically."}</p>}
              {q.multiple && (
                <p className="text-sm text-ink/55">Choose all that apply.</p>
              )}
            </div>
          ) : q.key === "phone" ? (
            <PhoneInput
              value={String(answers.phone || "")}
              onChange={(v) => change("phone", v)}
              defaultCountry={defaultCountry}
              inputProps={{
                "aria-labelledby": "question-title",
                "aria-invalid": !!error,
                "aria-describedby": error ? "form-error" : undefined,
                required: q.required,
                className: "intake-input",
                placeholder: "Phone number",
              }}
            />
          ) : (
            <input
              aria-labelledby="question-title"
              aria-invalid={!!error}
              aria-describedby={error ? "form-error" : undefined}
              required={q.required}
              className="intake-input"
              type={
                q.key === "email" ? "email" : q.key === "phone" ? "tel" : "text"
              }
              autoComplete={
                q.key === "email" ? "email" : q.key === "phone" ? "tel" : "off"
              }
              maxLength={q.key === "phone" ? 30 : 4000}
              value={answers[q.key] || ""}
              onChange={(e) => change(q.key, e.target.value)}
              placeholder={
                q.key === "phone" ? "(555) 123-4567" : "Type your answer…"
              }
            />
          )}
        </fieldset>
        {saveWarning && !error && <p role="status" className="mt-4 text-sm text-ink/65">Reconnecting to save your progress. Your answers are still here.</p>}
        {error && (
          <p
            id="form-error"
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <div className="application-actions">
          <button
            type="button"
            disabled={step === 0 || busy}
            onClick={() => {
              cancelAdvance();
              setError("");
              setStep((s) => s - 1);
            }}
            className="min-h-12 rounded-xl px-4 font-bold text-ink/65 disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            disabled={busy}
            type="submit"
            className="min-h-12 rounded-xl bg-primary px-7 py-3 font-bold text-white shadow-glow disabled:opacity-60"
          >
            {busy ? "Saving…" : step === questions.length - 1 ? "Choose a time →" : "Continue →"}
          </button>
        </div>
      </form>
    </section>
  );
}
