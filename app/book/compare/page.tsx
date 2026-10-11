import "@/components/book/book.css";

// Side-by-side: the live /book next to the calmer light preview.
export const metadata = {
  title: "Booking Colors | The Savvy Expat",
  robots: { index: false, follow: false },
};

const VARIANTS = [
  { href: "/book", label: "Current (live)" },
  { href: "/book/preview", label: "New: lavender-tinted card" },
];

export default function ComparePage() {
  return (
    <main className="bk-compare">
      <h1>Booking page colors</h1>
      <p>Both pages work for real. Open one full size to click through it.</p>
      <div className="bk-compare-grid">
        {VARIANTS.map((variant) => (
          <section key={variant.href}>
            <header><h2>{variant.label}</h2><a href={variant.href} target="_blank" rel="noopener noreferrer">Open full size ↗</a></header>
            <div className="bk-compare-frame"><iframe src={variant.href} title={variant.label} /></div>
          </section>
        ))}
      </div>
    </main>
  );
}
