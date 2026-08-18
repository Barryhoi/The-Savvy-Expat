import Image from "next/image";
import Link from "next/link";

// Step 1 of the on-site booking funnel: /form → /booking → /thank-you.
const BOOK_CALL_URL = "/form";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[#E9E7F4]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="The Savvy Expat"
            width={105}
            height={80}
            priority
            className="h-12 w-auto"
          />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/newsletter"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary shadow-[0_6px_18px_-8px_rgba(4,22,48,0.35)] ring-1 ring-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:ring-primary/50 hover:shadow-[0_10px_26px_-8px_rgba(73,52,251,0.45)]"
          >
            Newsletter
          </Link>
          <Link
            href={BOOK_CALL_URL}
            prefetch
            className="btn-shine rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-[0_8px_24px_-10px_rgba(73,52,251,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3d2ae8]"
          >
            Book A Call
          </Link>
        </div>
      </div>
    </header>
  );
}
