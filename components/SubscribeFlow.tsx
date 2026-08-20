"use client";

import Image from "next/image";
import Reveal from "@/components/Reveal";
import SubscribeForm from "@/components/SubscribeForm";
import { SUBSCRIBE_EMAIL_KEY } from "@/components/SurveyFlow";

/** The /subscribe squeeze page body: email capture only. On success the
 * visitor is handed to /survey by a FULL browser navigation, deliberately
 * not a client-side route swap — swapping content into the document the
 * iOS keyboard was just open on left Safari's viewport stuck panned, and
 * a fresh page load is the one reliable reset. The email crosses over in
 * sessionStorage so it never appears in a URL. */
export default function SubscribeFlow() {
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
              try {
                sessionStorage.setItem(SUBSCRIBE_EMAIL_KEY, subscribedEmail);
              } catch {
                // Storage unavailable: /survey will bounce back here rather
                // than submit a survey with no email attached.
              }
              window.location.assign("/survey");
            }}
          />
          <p className="mt-4 text-[13px] leading-[18.2px] text-[#9CA3AF]">
            No spam &middot; 100% free &middot; Unsubscribe anytime.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
