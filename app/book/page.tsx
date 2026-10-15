import type { Viewport } from "next";
import BookPageView from "@/components/book/BookPageView";

// iPhones zoom the page when a text field under 16px gets focus, and
// Calendly's form fields are smaller than that. Locking the scale keeps the
// booking form steady while people type (pinch zoom is still allowed on iOS).
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

export const metadata = {
  alternates: { canonical: "/book" },
  title: "Book Your Free Discovery Call | The Savvy Expat",
  description: "Book a free 45 minute discovery call with The Savvy Expat. Limited calls each week.",
};

export default function BookPage() {
  return <BookPageView theme="tint" pageTheme="current" />;
}
