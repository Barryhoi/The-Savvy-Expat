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
    <div className="min-h-screen funnel-page">
      <FunnelHeader current={2} />
      <main className="booking-main booking-simple-main">

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
