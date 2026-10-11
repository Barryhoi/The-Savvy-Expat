// Side-by-side color preview of /book/navy and /book/light.
export const metadata = {
  title: "Booking Colors | The Savvy Expat",
  robots: { index: false, follow: false },
};

const VARIANTS = [
  { href: "/book/navy", label: "Option 1: Dark navy" },
  { href: "/book/light", label: "Option 2: Light, calmer" },
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
