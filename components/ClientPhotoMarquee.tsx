import Image from "next/image";
import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";

// Real photos of Evan with clients (same set as the Philippine Gameplan deck),
// all pre-cropped to one 9:8 frame in /public/clients so the strip stays even.
const PHOTOS = Array.from({ length: 16 }, (_, i) => `/clients/evan-${String(i + 1).padStart(2, "0")}.jpg`);

/** One right-to-left strip of client photos; hovering pauses it. */
export default function ClientPhotoMarquee() {
  return (
    <section className="pb-8 pt-4">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <Reveal>
          <Eyebrow icon="users">Real Clients, Real Moves</Eyebrow>
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Evan With Clients
          </h2>
        </Reveal>
      </div>

      <Reveal delay={150}>
        <div className="marquee-row mt-10 overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="animate-marquee flex w-max" style={{ animationDuration: "90s" }}>
            {[...PHOTOS, ...PHOTOS].map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative mx-2.5 aspect-[9/8] w-[260px] shrink-0 overflow-hidden rounded-2xl shadow-[0_18px_45px_-28px_rgba(4,22,48,0.45)] ring-1 ring-ink/5 sm:w-[320px]"
              >
                <Image
                  src={src}
                  alt={i < PHOTOS.length ? "Evan with a Savvy Expat client" : ""}
                  fill
                  sizes="320px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
