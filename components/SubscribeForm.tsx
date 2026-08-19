"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

/**
 * Three layouts for the same form:
 * - `stacked` (default) — the squeeze page, where the form is the whole screen.
 * - `inline` — a single pill for mastheads, where signing up is a side offer.
 * - `split` — a separate field and button, for the footer.
 */
export default function SubscribeForm({
  variant = "stacked",
  submitLabel,
  placeholder,
  onSuccess,
}: {
  variant?: "stacked" | "inline" | "split";
  submitLabel?: string;
  placeholder?: string;
  /** When provided, called with the subscribed email instead of showing the
   * built-in success card — lets a caller (the /subscribe page) take over
   * what happens next, e.g. moving on to the qualifying survey. */
  onSuccess?: (email: string) => void;
}) {
  const inline = variant === "inline";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (res.ok) {
        const subscribedEmail = email.trim();
        setEmail("");
        if (onSuccess) {
          // Dismiss the mobile keyboard before the step swap, so the next
          // step mounts on a settled viewport instead of mid-collapse.
          (document.activeElement as HTMLElement | null)?.blur?.();
          onSuccess(subscribedEmail);
        } else {
          setStatus("success");
          setMessage(
            "You're in! Check your inbox for your free Philippines guide."
          );
        }
      } else {
        setStatus("error");
        setMessage(json.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`rounded-2xl border border-primary/20 bg-white text-center shadow-glow ${
          variant === "stacked" ? "p-8" : "px-6 py-5"
        }`}
      >
        <p
          className={`font-black text-primary ${
            variant === "stacked" ? "text-2xl" : "text-lg"
          }`}
        >
          Welcome aboard! 🎉
        </p>
        <p className="mt-2 text-sm text-ink/70">{message}</p>
      </div>
    );
  }

  if (inline) {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-white p-2 shadow-sm transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <label htmlFor="masthead-email" className="sr-only">
            Email address
          </label>
          <input
            id="masthead-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder ?? "Email"}
            className="min-w-0 flex-1 bg-transparent px-3 py-2 text-base outline-none placeholder:text-ink/35"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-shine shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-all duration-300 hover:bg-[#3d2ae8] disabled:opacity-60"
          >
            {status === "loading" ? "Subscribing…" : submitLabel ?? "Subscribe"}
          </button>
        </div>
        {status === "error" && (
          <p className="mt-3 text-sm text-red-600">{message}</p>
        )}
      </form>
    );
  }

  if (variant === "split") {
    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label htmlFor="footer-email" className="sr-only">
            Email address
          </label>
          <input
            id="footer-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder ?? "Enter your email"}
            className="h-12 w-full min-w-0 rounded-xl border border-transparent bg-ink/[0.06] px-4 text-base text-ink outline-none transition-colors duration-200 placeholder:text-ink/45 focus:border-primary focus:bg-white sm:max-w-[320px]"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="h-12 shrink-0 rounded-xl bg-primary px-6 text-base font-bold text-on-primary transition-colors duration-200 hover:bg-[#3d2ae8] disabled:opacity-60"
          >
            {status === "loading" ? "Joining…" : submitLabel ?? "Join For Free"}
          </button>
        </div>
        {status === "error" && (
          <p className="mt-3 text-sm text-red-600">{message}</p>
        )}
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label htmlFor="subscribe-email" className="sr-only">
        Email address
      </label>
      <input
        id="subscribe-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your Email..."
        className="h-[52px] w-full rounded-[10px] border-[1.5px] border-[#D1D5DB] bg-white px-4 text-[16px] leading-[24px] text-[#111827] outline-none transition-colors duration-200 placeholder:text-[#9CA3AF] hover:border-[#B9BFC9] focus:border-primary focus:shadow-[0_0_0_3px_rgba(73,52,251,0.1)]"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="sheen mt-3 h-[52px] w-full rounded-[10px] bg-primary px-4 text-[16px] font-bold leading-[24px] text-white shadow-[0_6px_16px_-8px_rgba(73,52,251,0.5)] transition-colors duration-200 hover:bg-[#3d2ae8] disabled:opacity-60"
      >
        {status === "loading" ? "Subscribing..." : "Get My Free Philippines Guide"}
      </button>
      {status === "error" && (
        <p className="mt-3 text-sm text-red-600">{message}</p>
      )}
    </form>
  );
}
