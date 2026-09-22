import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import FunnelHeader from "@/components/FunnelHeader";
import CalEmbed from "@/components/CalEmbed";
import ClientVideos from "@/components/ClientVideos";
import QuoteMarquee from "@/components/QuoteMarquee";

const CAL_LINK = "team/the-savvy-expat/expat-relocation-discovery-call";
const CAL_NAMESPACE = "expat-relocation-discovery-call";

export const metadata = {
  title: "Book Your Call — Step 2 — The Savvy Expat",
  description:
    "Pick a time to speak with our head relocation specialist about your move to the Philippines.",
  robots: { index: false, follow: false },
};

export default function BookingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <div className="bg-hero">
        <FunnelHeader current={2} />

        <section className="px-6 pb-8 pt-12 sm:pb-16">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <h1 className="text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
                Book Your Call With The Savvy Expat
              </h1>
            </Reveal>
          </div>

          {/* Not wrapped in Reveal: an interactive widget that fades and
              slides in on scroll reads as lag, and the transform on the
              wrapper skews the embed's own measurements while it animates. */}
          <div className="mx-auto mt-8 max-w-5xl sm:mt-12">
            <CalEmbed
              calLink={CAL_LINK}
              namespace={CAL_NAMESPACE}
              nextHref="/thank-you"
            />
          </div>
        </section>
      </div>

      <main className="flex-1">
        <ClientVideos />
        <QuoteMarquee
          heading="It All Starts With A Call"
          subheading="Every client below started exactly where you are now — on this page, picking a time."
        />
      </main>

      <Footer />
    </div>
  );
}
