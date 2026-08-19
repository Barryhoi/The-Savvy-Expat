import Reveal from "@/components/Reveal";
import Eyebrow from "@/components/Eyebrow";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { TESTIMONIAL_VIDEOS } from "@/lib/testimonials";

/**
 * The client-video wall. Shared by the homepage and the booking funnel so the
 * same proof follows a visitor from the VSL all the way to the confirmation.
 */
export default function ClientVideos({
  heading = "Hear From Those Who've Made The Move With Us…",
  subheading,
}: {
  heading?: string;
  subheading?: string;
}) {
  const [lead, ...rest] = TESTIMONIAL_VIDEOS;

  return (
    <section className="bg-sheen">
      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        <Reveal>
          <Eyebrow icon="users">Our Clients</Eyebrow>
          <h2 className="mx-auto max-w-3xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            {heading}
          </h2>
          {subheading && (
            <p className="mx-auto mt-4 max-w-2xl text-base text-ink/60">
              {subheading}
            </p>
          )}
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Reveal className="sm:col-span-2">
            <YouTubeEmbed
              videoId={lead.id}
              title={lead.title}
              thumbnail={lead.thumbnail}
            />
          </Reveal>
          {rest.map((video, i) => (
            <Reveal key={video.id} delay={(i % 2) * 100}>
              <YouTubeEmbed
                videoId={video.id}
                title={video.title}
                thumbnail={video.thumbnail}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
