import BookPageView from "@/components/book/BookPageView";

export const metadata = {
  alternates: { canonical: "/book" },
  title: "Book Your Free Discovery Call | The Savvy Expat",
  description: "Book a free 30 minute discovery call with The Savvy Expat. Limited calls each week.",
};

export default function BookPage() {
  return <BookPageView />;
}
