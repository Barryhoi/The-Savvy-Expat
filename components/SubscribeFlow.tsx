"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Reveal from "@/components/Reveal";
import SubscribeForm from "@/components/SubscribeForm";
import SubscribeSurvey from "@/components/SubscribeSurvey";

type Step = "email" | "survey" | "redirecting";

const REDIRECT_DELAY_MS = 2800;

/** Owns the full /subscribe page body across all three steps — email
 * capture, the qualifying survey, then a hand-off into /king — so each step
 * gets a real full-page moment instead of a form squeezed into a corner.
 * The page shell (gradient, grain, decorative bloom, footer) stays in
 * app/subscribe/page.tsx and wraps this regardless of step. */
export default function SubscribeFlow() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  // Diagnostic readout for device-only viewport bugs, opt-in via ?debug=1.
  // Set from an effect (not at render) so server and client HTML match.
  const [debug, setDebug] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setDebug(new URLSearchParams(window.location.search).has("debug"));
  }, []);

  useEffect(() => {
    if (step !== "redirecting") return;
    const timer = setTimeout(() => router.push("/king"), REDIRECT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [step, router]);

  // Each step is a fresh full-page moment. Without this, whatever scroll
  // position the visitor was at when they submitted carries over to the
  // next step, which lands them mid-page instead of at the top. On iOS the
  // on-screen keyboard may still be collapsing when the step swaps, and
  // Safari re-adjusts its viewport when that finishes — at timings that
  // outlast any fixed delay on slower devices. So besides a few timed
  // re-asserts, listen to the visualViewport resize events that collapse
  // actually fires and pin the page to the top on each one, for a short
  // window after the swap.
  useEffect(() => {
    const toTop = () => {
      // iOS pans its visual viewport while the keyboard is up, and that pan
      // (visualViewport.offsetTop) is NOT reflected in window.scrollY — so a
      // plain scrollTo(0, 0) with scrollY already 0 is treated as a no-op
      // and leaves the page visibly shifted under the status bar. Scroll
      // down by at least the pan first, so the reset is a real scroll large
      // enough to drag the visual viewport back with it.
      const pan = window.visualViewport?.offsetTop ?? 0;
      window.scrollTo(0, Math.max(1, Math.ceil(pan)));
      window.scrollTo(0, 0);
    };
    toTop();
    const timers = [150, 400, 800, 1200].map((ms) =>
      window.setTimeout(toTop, ms)
    );
    // The keyboard collapse reports through the visual viewport's resize
    // and scroll events. Only intervene when its offsetTop shows a real
    // pan: normal user scrolling keeps offsetTop at 0, so this never
    // fights a visitor who starts scrolling right away, and our own
    // corrective scrolls can't re-trigger it.
    const onViewportChange = () => {
      if ((window.visualViewport?.offsetTop ?? 0) > 2) toTop();
    };
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", onViewportChange);
    viewport?.addEventListener("scroll", onViewportChange);
    const stop = () => {
      viewport?.removeEventListener("resize", onViewportChange);
      viewport?.removeEventListener("scroll", onViewportChange);
    };
    const stopListening = window.setTimeout(stop, 2500);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(stopListening);
      stop();
    };
  }, [step]);

  if (step === "survey") {
    return (
      <div className="relative z-10 mx-auto w-full max-w-[640px] flex-1 px-6 pb-16 pt-4 md:pb-[60px] md:pt-20">
        <Reveal>
          <h1 className="whitespace-nowrap text-[20px] font-extrabold leading-[26px] tracking-[-1px] text-[#000101] md:text-[36px] md:leading-[44px] md:tracking-[-2px]">
            Savvy Expat Subscriber Survey
          </h1>

          <div className="mt-4 md:mt-10">
            <SubscribeSurvey
              email={email}
              onComplete={() => setStep("redirecting")}
            />
          </div>
        </Reveal>
        {debug && <ViewportDebug />}
      </div>
    );
  }

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
        {debug && <ViewportDebug />}
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1 px-6 pb-10 pt-5 md:pb-[45px] md:pl-[180px] md:pr-20 md:pt-[30px]">
      <h1 className="line-rise max-w-[700px] text-[37px] font-extrabold leading-[37px] tracking-[-2px] text-[#000101] md:text-[88px] md:leading-[85.36px] md:tracking-[-3px]">
        <span className="block">Real Talk.</span>
        <span className="block">Real Philippines.</span>
        <span className="block">Every Week.</span>
      </h1>

      <Reveal delay={80}>
        <figure className="mt-3 md:mt-4">
          <Image
            src="/evan-portrait.jpg"
            alt="Evan Lorezca, founder of Savvy Expat"
            width={400}
            height={400}
            priority
            className="h-[72px] w-[72px] rounded-full object-cover shadow-[0_0_0_3px_#fff,0_8px_20px_-8px_rgba(4,22,48,0.28)] md:h-[90px] md:w-[90px]"
          />
          <figcaption className="mt-2 text-[12px] leading-[16.8px] text-[#9CA3AF] md:mt-3">
            Evan Lorezca &mdash; Founder of Savvy Expat
          </figcaption>
        </figure>
      </Reveal>

      <Reveal delay={140}>
        <p className="mt-5 max-w-[580px] text-[16px] leading-[26.4px] text-black md:mt-8">
          Join 5,000+ expats and retirees getting the real inside scoop on
          retiring in the Philippines &mdash;{" "}
          <span className="marker-highlight">
            in a free weekly newsletter you can read in under 3 minutes.
          </span>
        </p>

        <p className="mt-4 max-w-[580px] text-[17px] leading-[27.2px] text-[#374151] md:mt-[26px]">
          👑 Subscribe and we&apos;ll send our free{" "}
          <strong className="font-bold">
            How to Live Like a King in the Philippines
          </strong>{" "}
          guide straight to your inbox.
        </p>
      </Reveal>

      <Reveal delay={200}>
        <p className="mt-4 flex items-center gap-[22px] md:mt-6">
          <span className="rounded-[5px] bg-primary px-3 py-1 text-[22px] font-extrabold leading-[26.4px] text-white">
            5,000+
          </span>
          <span className="text-[16px] leading-[19.2px] text-[#1A1A1A]">
            Readers today
          </span>
        </p>

        <div className="mt-4 max-w-[480px] md:mt-6">
          <SubscribeForm
            onSuccess={(subscribedEmail) => {
              setEmail(subscribedEmail);
              setStep("survey");
            }}
          />
          <p className="mt-4 text-[13px] leading-[18.2px] text-[#9CA3AF]">
            No spam &middot; 100% free &middot; Unsubscribe anytime.
          </p>
        </div>
      </Reveal>
      {debug && <ViewportDebug />}
    </div>
  );
}

/** Tiny live readout of the scroll and viewport numbers, rendered only
 * when the URL carries ?debug=1 — lets a phone screenshot show exactly
 * which viewport layer is shifted when a device-only bug won't reproduce
 * anywhere else. */
function ViewportDebug() {
  const [text, setText] = useState("");

  useEffect(() => {
    const update = () => {
      const viewport = window.visualViewport;
      setText(
        [
          `scrollY ${Math.round(window.scrollY)}`,
          `vvOffset ${viewport ? viewport.offsetTop.toFixed(1) : "n/a"}`,
          `vvPageTop ${viewport ? viewport.pageTop.toFixed(1) : "n/a"}`,
          `vvH ${viewport ? Math.round(viewport.height) : "n/a"}`,
          `winH ${window.innerHeight}`,
        ].join(" · ")
      );
    };
    update();
    const interval = window.setInterval(update, 150);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-24 left-2 z-[999] rounded-md bg-black/80 px-2 py-1 font-mono text-[11px] leading-relaxed text-white">
      {text}
    </div>
  );
}
