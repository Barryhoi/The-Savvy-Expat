import Link from "next/link";
export const metadata = { title: "Call booked — The Savvy Expat", robots: { index: false, follow: false } };
export default function SetterBookingConfirmed() {
  return <main className="setter-main"><section className="setter-confirmed"><span aria-hidden="true">✓</span><p className="setter-kicker">BOOKING CONFIRMED</p><h1>The discovery call is booked.</h1><p>Calendly has sent the confirmation and meeting details by email. The Close lead will show the call as Booked.</p><Link href="/setting">Back to setter desk</Link></section></main>;
}
