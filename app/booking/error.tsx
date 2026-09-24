"use client";
export default function BookingError({ reset }: { reset: () => void }) {
  return (
    <main className="bg-hero flex min-h-screen items-center justify-center p-6">
      <section className="intake-card max-w-lg">
        <h1 className="text-2xl font-black">
          Let’s reconnect to your application
        </h1>
        <p className="mt-4 text-ink/65">
          We couldn’t load your saved details. Please try again in a moment.
        </p>
        <button
          onClick={reset}
          className="mt-6 min-h-12 rounded-xl bg-primary px-6 font-bold text-white"
        >
          Try again
        </button>
        <a
          href="/form"
          className="ml-4 inline-block py-4 font-bold text-primary"
        >
          Back to application
        </a>
      </section>
    </main>
  );
}
