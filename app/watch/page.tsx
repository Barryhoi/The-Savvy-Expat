import { redirect } from "next/navigation";

// Kept for old links/ad campaigns pointing at /watch; deep-links straight to
// the VSL video instead of just dropping visitors at the top of the homepage.
export default function WatchPage() {
  redirect("/#watch");
}
