import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import FunnelHeader from "@/components/FunnelHeader";
import DiscoveryCalendar from "@/components/DiscoveryCalendar";
import { applicationFromToken } from "@/lib/application";
import { readRecord } from "@/lib/receipt-store";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Book Your Discovery Call — The Savvy Expat",
  robots: { index: false, follow: false },
};
export default async function BookingPage() {
  const receipt = await applicationFromToken(
    (await cookies()).get("savvy_application")?.value,
  );
  if (!receipt?.value.qualified) redirect("/form");
  if (receipt.value.leadId) {
    const booking = await readRecord<{ status: string; applicationId: string }>(
      `lead-bookings/${receipt.value.leadId}`,
    );
    if (
      booking?.value.status === "active" &&
      booking.value.applicationId === receipt.value.id
    )
      redirect("/thank-you");
  }
  const { id, answers } = receipt.value;
  return (
    <div className="min-h-screen bg-hero">
      <FunnelHeader current={2} />
      <main className="px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <h1 className="mx-auto mb-8 max-w-3xl text-center text-3xl font-black tracking-tight sm:text-4xl">
          Let’s plan your move
        </h1>
        <DiscoveryCalendar
          application={{
            id,
            name: [answers.firstName, answers.lastName]
              .filter(Boolean)
              .join(" "),
            email: String(answers.email || ""),
            phone: String(answers.phone || ""),
          }}
        />
      </main>
    </div>
  );
}
