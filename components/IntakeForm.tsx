"use client";

import { useEffect, useRef, useState } from "react";
import {
  questions,
  qualification,
  ending,
  validateAnswer,
  type Answers,
  type Rejection,
} from "@/lib/intake";

import { readAttribution } from "@/lib/attribution";

const STORAGE = "savvy-application-v1";
export default function IntakeForm() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rejected, setRejected] = useState<Rejection | null>(null);
  const [submissionId, setSubmissionId] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const attempted = useRef(false);
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
        setStep(Math.max(0, Math.min(questions.length - 1, saved.step || 0)));
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

  const change = (key: string, value: string | string[]) => {
    if (attempted.current) {
      setSubmissionId(crypto.randomUUID());
      attempted.current = false;
    }
    setAnswers((a) => ({ ...a, [key]: value }));
    setError("");
  };
  async function submit() {
    attempted.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submissionId,
          answers,
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
      setBusy(false);
    }
  }
  function next() {
    if (busy) return;
    const message = validateAnswer(q.key, answers[q.key]);
    if (message) {
      setError(message);
      return;
    }
    const visitedKeys = new Set(
      questions.slice(0, step + 1).map((question) => question.key),
    );
    const visitedAnswers = Object.fromEntries(
      Object.entries(answers).filter(([key]) => visitedKeys.has(key)),
    );
    if (qualification(visitedAnswers) || step === questions.length - 1) {
      void submit();
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
  );
  return (
    <section className="intake-card application-card" aria-busy={busy}>
      <div className="mb-8 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-ink/50">
        <span>{step < 13 ? `Question ${step + 1} of 13` : "Last step"}</span>
        <span>
          {q.required ? "Required" : q.type === "statement" ? "" : "Optional"}
        </span>
      </div>
      <div
        className="mb-8 h-1 overflow-hidden rounded-full bg-primary/10"
        role="progressbar"
        aria-label="Application progress"
        aria-valuemin={0}
        aria-valuemax={14}
        aria-valuenow={step + 1}
      >
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${((step + 1) / 14) * 100}%` }}
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
                      onChange={() =>
                        change(
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
                    <span className="choice-letter" aria-hidden="true">{String.fromCharCode(65 + i)}</span><span className="choice-text">{choice}</span><span className="choice-check" aria-hidden="true">{selected ? "✓" : ""}</span>
                  </label>
                );
              })}
              {q.multiple && (
                <p className="text-sm text-ink/55">Choose all that apply.</p>
              )}
            </div>
          ) : q.type !== "statement" ? (
            <input
              aria-labelledby="question-title"
              aria-invalid={!!error}
              aria-describedby={error ? "form-error" : undefined}
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
                q.key === "phone" ? "+1 555 123 4567" : "Type your answer…"
              }
            />
          ) : null}
        </fieldset>
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
            {busy ? "Saving…" : "Continue →"}
          </button>
        </div>
      </form>
    </section>
  );
}
