import Reveal from "@/components/Reveal";
import FunnelHeader from "@/components/FunnelHeader";
import TypeformEmbed from "@/components/TypeformEmbed";
import CalPreload from "@/components/CalPreload";
import { CAL_ORIGIN } from "@/lib/booking";

// Typeform "Expat Relocation Application Form". Embedded by its form id, not
// the share panel's live-embed id (01JV8BYD4BGZE7ET5GAGRVH6AS), which resolved
// to this same form after an extra round trip — see TypeformEmbed.
const TYPEFORM_FORM_ID = "my8rCVz6";
const TYPEFORM_EMBED_SCRIPT = "https://embed.typeform.com/next/embed.js";

export const metadata = {
  title: "Book A Call — Step 1 — The Savvy Expat",
  description:
    "Tell us about your move to the Philippines, then pick a time to speak with our head relocation specialist.",
  robots: { index: false, follow: false },
};

// No site footer on the funnel pages: a newsletter box and social links under
// the form are exits from a flow that should end in a booked call.
export default function FormPage() {
  return (
    <div className="bg-hero flex min-h-screen flex-col overflow-x-clip">
      {/* Start the embed script and the form's connections at parse time,
          not after hydration — they're on the critical path to the form.
          The hosts are the ones the form's own waterfall hits: the SDK, the
          form document, its renderer bundles, and its cover image. */}
      <link rel="preload" as="script" href={TYPEFORM_EMBED_SCRIPT} />
      <link rel="preconnect" href="https://embed.typeform.com" />
      <link rel="preconnect" href="https://form.typeform.com" />
      <link rel="preconnect" href="https://renderer-assets.typeform.com" />
      <link rel="preconnect" href="https://images.typeform.com" />
      <link rel="preconnect" href={CAL_ORIGIN} />

      <FunnelHeader current={1} />

      <main className="flex-1 px-6 pb-24 pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h1 className="text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
              Step 1: Fill Out This Form
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink/60">
              Once you submit this form, you&apos;ll be redirected to a calendar
              to schedule a call with our head relocation specialist!
            </p>
          </Reveal>
        </div>

        {/* Not wrapped in Reveal: an interactive widget that fades and slides
            in on scroll reads as lag, and the animating transform skews the
            embed's own measurements. */}
        <div className="mx-auto mt-8 max-w-3xl sm:mt-10">
          <TypeformEmbed formId={TYPEFORM_FORM_ID} nextHref="/booking" />
        </div>
      </main>

      <CalPreload />
    </div>
  );
}
