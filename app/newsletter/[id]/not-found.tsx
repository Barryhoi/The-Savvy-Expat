import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}

export default function PostNotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-hero px-6 py-24">
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-12 text-center shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lavender text-primary">
            <MailIcon />
          </div>
          <h1 className="mt-6 text-2xl font-black">Newsletter not found</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/60">
            We couldn&apos;t find that newsletter. It may have been moved or
            the link is out of date.
          </p>
          <Link
            href="/newsletter"
            className="btn-shine mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-glow transition-all duration-300 hover:-translate-y-0.5"
          >
            Back to the Newsletter
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
