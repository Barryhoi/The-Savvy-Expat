import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import HostedVideo from "@/components/HostedVideo";

// Evan's short testimonial cuts (Nov 2026), straight to the client's story.
// Files live in /public/testimonials: H.264 MP4 plus a poster frame each.
export const TESTIMONIAL_CLIPS = [
  { slug: "todd", name: "Todd", from: "Washington" },
  { slug: "charles", name: "Charles", from: "Florida" },
  { slug: "michael-cherry", name: "Michael", from: "North Carolina" },
  { slug: "michael", name: "Michael", from: "Pennsylvania" },
];

/**
 * Evan's testimonial montage (Nov 11 2026): one full-width video that replaced
 * the four separate clips. TESTIMONIAL_CLIPS above is kept for reference only.
 */
export function TestimonialClipGrid() {
  return (
    <Reveal>
      <HostedVideo
        src="/testimonials/montage.mp4"
        poster="/testimonials/montage.jpg"
        title="Savvy Expat clients share their experience moving to the Philippines"
      />
    </Reveal>
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
