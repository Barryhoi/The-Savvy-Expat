import BookPageView from "@/components/book/BookPageView";

// Color preview for Barry and Evan: current look with a lavender-tinted card
// matching Calendly's form. Books real calls.
export const metadata = {
  title: "Book Your Free Discovery Call | The Savvy Expat",
  robots: { index: false, follow: false },
};

export default function BookPreviewPage() {
  return <BookPageView theme="tint" pageTheme="current" />;
}
