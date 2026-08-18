import Link from "next/link";
import TrustBadge from "@/components/TrustBadge";

// Step 1 of the on-site booking funnel: /form → /booking → /thank-you.
const BOOK_CALL_URL = "/form";

interface BookCallButtonProps {
  size?: "md" | "lg";
  withBadge?: boolean;
}

export default function BookCallButton({
  size = "lg",
  withBadge = true,
}: BookCallButtonProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Link
        href={BOOK_CALL_URL}
        prefetch
        className={`btn-shine group inline-flex items-center gap-2.5 rounded-xl bg-primary font-bold text-on-primary shadow-[0_10px_30px_-10px_rgba(73,52,251,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#3d2ae8] active:translate-y-0 ${
          size === "lg" ? "px-8 py-4 text-lg" : "px-6 py-3 text-base"
        }`}
      >
        Book A Call
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M3 10a.75.75 0 01.75-.75h9.69L10.22 6.03a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
      {withBadge && <TrustBadge />}
    </div>
  );
}
