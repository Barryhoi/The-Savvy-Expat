import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import FunnelHeader from "@/components/FunnelHeader";
import TypeformEmbed from "@/components/TypeformEmbed";

// The `data-tf-live` id from Typeform's embed snippet. It currently resolves
// to form `my8rCVz6` ("Expat Relocation Application Form"), which is what the
// direct link below points at if the embed script is ever blocked.
const TYPEFORM_LIVE_ID = "01JV8BYD4BGZE7ET5GAGRVH6AS";
const TYPEFORM_DIRECT_URL = "https://form.typeform.com/to/my8rCVz6";

export const metadata = {
  title: "Book A Call — Step 1 — The Savvy Expat",
  description:
    "Tell us about your move to the Philippines, then pick a time to speak with our head relocation specialist.",
  robots: { index: false, follow: false },
};

export default function FormPage() {
  return (
    <div className="bg-hero flex min-h-screen flex-col overflow-x-clip">
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

        <Reveal delay={120}>
          <div className="mx-auto mt-10 max-w-3xl">
            <TypeformEmbed
              liveId={TYPEFORM_LIVE_ID}
              fallbackUrl={TYPEFORM_DIRECT_URL}
              nextHref="/booking"
            />
          </div>
        </Reveal>
      </main>

      <Footer />
    </div>
  );
}
