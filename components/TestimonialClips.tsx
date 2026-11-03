import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import HostedVideo from "@/components/HostedVideo";

// Evan's short testimonial cuts (Nov 2026), straight to the client's story.
// Files live in /public/testimonials: H.264 MP4 plus a poster frame each.
export const TESTIMONIAL_CLIPS = [
  { slug: "todd", name: "Todd" },
  { slug: "charles", name: "Charles" },
  { slug: "michael-cherry", name: "Michael Cherry" },
  { slug: "michael", name: "Michael" },
];

/** 2x2 grid of the clips, each with the client's name underneath. */
export function TestimonialClipGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {TESTIMONIAL_CLIPS.map((clip, i) => (
        <Reveal key={clip.slug} delay={(i % 2) * 100}>
          <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink/5">
            <HostedVideo
              src={`/testimonials/${clip.slug}.mp4`}
              poster={`/testimonials/${clip.slug}.jpg`}
              title={`${clip.name}, client testimonial`}
            />
            <p className="px-5 py-4 font-black">{clip.name}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** Section version for the booking funnel pages. */
export default function TestimonialClips({
  heading,
  subheading,
}: {
  heading: string;
  subheading?: string;
}) {
  return (
    <section className="bg-sheen">
      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <Reveal>
          <Eyebrow icon="users">Our Clients</Eyebrow>
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {heading}
          </h2>
          {subheading && (
            <p className="mx-auto mt-4 max-w-2xl text-base text-ink/60">{subheading}</p>
          )}
        </Reveal>
        <div className="mt-12 text-left">
          <TestimonialClipGrid />
        </div>
      </div>
    </section>
  );
}
