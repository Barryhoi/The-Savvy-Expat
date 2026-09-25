import FunnelHeader from "@/components/FunnelHeader";
import IntakeForm from "@/components/IntakeForm";
export const metadata = {
  title: "Your Relocation Application — The Savvy Expat",
  robots: { index: false, follow: false },
};
export default function FormPage() {
  return (
    <div className="funnel-page min-h-screen">
      <FunnelHeader current={1} />
      <main className="form-main">
        <div className="form-intro">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">
            Your move starts here
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            A new chapter. A clear plan.
          </h1>
          <p className="mt-3 text-ink/60">
            If we’re a fit, you’ll choose a time for your 30-minute discovery
            call.
          </p>
        </div>
        <IntakeForm />
      </main>
    </div>
  );
}
