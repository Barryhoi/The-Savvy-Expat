"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
import SubscribeSurvey from "@/components/SubscribeSurvey";

const REDIRECT_DELAY_MS = 2800;

/** Where the squeeze page leaves the subscriber's email for this page.
 * sessionStorage rather than a query param, so addresses never end up in
 * server logs, analytics, or browser history. */
export const SUBSCRIBE_EMAIL_KEY = "savvy-subscribe-email";

/** The /survey page body: the qualifying survey, then the "You're All Set"
 * hand-off into /king. Lives on its own page — reached by a full browser
 * navigation from /subscribe — because swapping the survey into the same
 * document the iOS keyboard was just open on left Safari's viewport stuck
 * panned, unfixably. A fresh page load resets all of that by definition. */
export default function SurveyFlow() {
  const [step, setStep] = useState<"survey" | "redirecting">("survey");
  const [email, setEmail] = useState("");

  // The survey is only useful mid-funnel. Anyone landing here without an
  // email on file (direct visit, expired session) goes to the start.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = sessionStorage.getItem(SUBSCRIBE_EMAIL_KEY);
    } catch {
      // Storage unavailable — fall through to the redirect below.
    }
    if (stored) {
      setEmail(stored);
    } else {
      window.location.replace("/subscribe");
    }
  }, []);

  useEffect(() => {
    if (step !== "redirecting") return;
    // A full navigation, deliberately: /king always loads fresh, at the top.
    const timer = setTimeout(
      () => window.location.assign("/king"),
      REDIRECT_DELAY_MS
    );
    return () => clearTimeout(timer);
  }, [step]);

  if (step === "redirecting") {
    return (
      <div className="relative z-10 mx-auto flex w-full max-w-[640px] flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="handoff-pop flex h-12 w-12 items-center justify-center rounded-full bg-primary md:h-16 md:w-16">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 md:h-7 md:w-7">
            <path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength="1"
              className="handoff-check"
            />
          </svg>
        </span>

        <h1 className="handoff-headline mt-6 text-[40px] font-extrabold leading-[40px] tracking-[-3px] text-[#000101] md:text-[64px] md:leading-[62px]">
          You&apos;re All Set.
        </h1>
        <p className="handoff-subtext mt-5 max-w-[440px] text-[17px] leading-[27.2px] text-[#374151]">
          You are now being taken to our{" "}
          <strong className="font-bold">
            How to Live Like a King in the Philippines
          </strong>{" "}
          guide. Enjoy!
        </p>
        <div className="mt-8 h-[3px] w-[160px] overflow-hidden rounded-full bg-primary/15">
          <div
            className="handoff-progress h-full w-full rounded-full bg-primary"
            style={{ animationDuration: `${REDIRECT_DELAY_MS}ms` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-[640px] flex-1 px-6 pb-16 pt-4 md:pb-[60px] md:pt-20">
      <Reveal>
        <h1 className="whitespace-nowrap text-[20px] font-extrabold leading-[26px] tracking-[-1px] text-[#000101] md:text-[36px] md:leading-[44px] md:tracking-[-2px]">
          Savvy Expat Subscriber Survey
        </h1>

        <div className="mt-4 md:mt-10">
          <SubscribeSurvey
            email={email}
            onComplete={() => {
              // One-shot: completing the survey uses the stored email up,
              // so revisiting /survey later restarts the funnel cleanly.
              try {
                sessionStorage.removeItem(SUBSCRIBE_EMAIL_KEY);
              } catch {}
              window.scrollTo(0, 1);
              window.scrollTo(0, 0);
              setStep("redirecting");
            }}
          />
        </div>
      </Reveal>
    </div>
  );
}
