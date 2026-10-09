import FunnelHeader from "@/components/FunnelHeader";
import IntakeForm from "@/components/IntakeForm";
import { headers } from "next/headers";
import { isCountryCode } from "@/lib/phone";
export const metadata = {
  title: "Your Relocation Application — The Savvy Expat",
  robots: { index: false, follow: false },
};
export default async function FormPage() {
  // Vercel tags each request with the visitor's country; it preselects the
  // phone country so applicants abroad are never saved with +1.
  const country = (await headers()).get("x-vercel-ip-country");
  return (
    <div className="funnel-page min-h-screen">
      <FunnelHeader current={1} />
      <main className="form-main">
        <div className="form-intro">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
            Your move starts here
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Let’s plan your move.
          </h1>
          <p className="mt-3 text-ink/60">
            Tell us a little about your plans. If we’re a fit, you can book a
            30-minute call with our team.
          </p>
        </div>
        <IntakeForm defaultCountry={isCountryCode(country) ? country : "US"} />
      </main>
    </div>
  );
}
