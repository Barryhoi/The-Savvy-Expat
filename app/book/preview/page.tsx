import BookPageView from "@/components/book/BookPageView";

// Preview for Barry: the navy booking card on the original light page.
export const metadata = {
  title: "Book Your Free Discovery Call | The Savvy Expat",
  robots: { index: false, follow: false },
};

export default function BookPreviewPage() {
  return <BookPageView theme="navy" pageTheme="current" />;
}
