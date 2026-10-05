import { notFound } from "next/navigation";
import FunnelHeader from "@/components/FunnelHeader";
import DiscoveryCalendar from "@/components/DiscoveryCalendar";
import { setterBookingFromToken } from "@/lib/setter-booking";
export const dynamic = "force-dynamic";
export const metadata = { title: "Choose a time — The Savvy Expat", robots: { index: false, follow: false, noarchive: true } };
export default async function SetterBookingLink({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const receipt = await setterBookingFromToken(token);
  if (!receipt) notFound();
  return <div className="min-h-screen funnel-page"><FunnelHeader current={2} /><main className="booking-main booking-simple-main"><DiscoveryCalendar application={{ id: receipt.value.id, name: receipt.value.name, email: receipt.value.email, phone: receipt.value.phone }} setterToken={token} /></main></div>;
}
