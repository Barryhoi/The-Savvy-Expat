import type {
  BeehiivPost,
  BeehiivPostResponse,
  BeehiivPostsResponse,
} from "@/types/beehiiv";

const BASE_URL = "https://api.beehiiv.com/v2";

function getConfig() {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

  if (
    !apiKey ||
    !publicationId ||
    apiKey === "your_beehiiv_api_key_here" ||
    publicationId === "pub_00000000-0000-0000-0000-000000000000"
  ) {
    return null;
  }

  return { apiKey, publicationId };
}

export function isBeehiivConfigured(): boolean {
  return getConfig() !== null;
}

/**
 * Posts hidden from the site's archive. They stay published in beehiiv —
 * this only controls what shows on /newsletter.
 */
const HIDDEN_POST_IDS = new Set([
  // "He Sold Everything at 59 and Moved to the Philippines. Here's His Monthly Budget"
  "post_9c74a19e-d0cc-44e0-a6dd-c5a927b5d89b",
  // "The Savvy Expat newsletter is back!" (x2)
  "post_acf511d5-84d7-4a36-828b-8cfb05000362",
  "post_a8d501ff-6dfa-4768-b48d-6df6586f0ba8",
  // "He Came to the Philippines for Peace. He Lost $7,000 Instead" — this is a
  // byte-identical duplicate of post_b1c7cdc4-6691-4fd8-ba9b-22be8b2b07df
  // (same title, same subtitle, published under a second post id). Hiding
  // the older of the two so the same newsletter doesn't appear twice.
  "post_fc588b2e-2a65-4660-9bd6-5cedfc559aec",
]);

/** beehiiv caps page size at 100. */
const PAGE_SIZE = 100;
/** Safety stop so a bad API response can't spin forever. */
const MAX_PAGES = 20;

/**
 * When a post has no custom thumbnail, beehiiv falls back to the publication
 * logo. We detect that by its asset path so the card can render its own
 * clean placeholder instead of repeating the logo across the grid.
 */
function isLogoFallback(url?: string | null): boolean {
  return !!url && url.includes("/uploads/publication/logo/");
}

/**
 * Fetch every published post for the archive page, paging through the beehiiv
 * API until all pages are collected. Returns an empty array when beehiiv isn't
 * configured or the request fails, so the page can render a placeholder state
 * instead of crashing.
 */
export async function getPosts(): Promise<BeehiivPost[]> {
  const config = getConfig();
  if (!config) return [];

  const posts: BeehiivPost[] = [];

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      // No content expand here — the archive list only needs title,
      // thumbnail, date and excerpt, all of which beehiiv returns by
      // default. Requesting each post's full HTML body (as this used to)
      // was several times heavier per post and the main cause of the
      // archive page loading slowly.
      const res = await fetch(
        `${BASE_URL}/publications/${config.publicationId}/posts?status=confirmed&limit=${PAGE_SIZE}&page=${page}&order_by=publish_date&direction=desc`,
        {
          headers: { Authorization: `Bearer ${config.apiKey}` },
          next: { revalidate: 300 },
        }
      );

      if (!res.ok) {
        console.error(`beehiiv posts request failed: ${res.status}`);
        break;
      }

      const json: BeehiivPostsResponse = await res.json();
      const batch = json.data ?? [];
      posts.push(...batch.filter((post) => !HIDDEN_POST_IDS.has(post.id)));

      const totalPages = json.total_pages ?? 1;
      if (batch.length === 0 || page >= totalPages) break;
    }

    // Without content expanded there's nothing to backfill a real image
    // from, so a logo-fallback thumbnail is just nulled out — the card
    // renders its own clean placeholder in that case.
    return posts.map((post) =>
      isLogoFallback(post.thumbnail_url) ? { ...post, thumbnail_url: null } : post
    );
  } catch (error) {
    console.error("beehiiv posts request errored:", error);
    // Return whatever we managed to collect rather than nothing.
    return posts;
  }
}

/**
 * Fetch a single post with its content expanded for reading on this site.
 *
 * Uses the "rss" content variant, not "web" — beehiiv's `free.web` field is a
 * complete standalone HTML document (its own <!DOCTYPE>, stylesheet, fonts,
 * plus a duplicate title/byline/avatar/share-icon header), meant to be
 * rendered as its own page, not dropped into another page's DOM. Injecting
 * it here duplicated the header and leaked beehiiv's own CSS variables into
 * this site's global styles. `free.rss` is a clean content-only fragment —
 * just the article body — which is what we actually want to embed.
 *
 * Returns null when not found, not configured, or on error.
 */
export async function getPost(id: string): Promise<BeehiivPost | null> {
  const config = getConfig();
  if (!config) return null;

  try {
    const res = await fetch(
      `${BASE_URL}/publications/${config.publicationId}/posts/${id}?expand[]=free_rss_content`,
      {
        headers: { Authorization: `Bearer ${config.apiKey}` },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      console.error(`beehiiv post request failed: ${res.status}`);
      return null;
    }

    const json: BeehiivPostResponse = await res.json();
    const post = json.data ?? null;
    if (post) {
      stripLeadingBodyImage(post);
      stripBeehiivFooter(post);
    }
    return post;
  } catch (error) {
    console.error("beehiiv post request errored:", error);
    return null;
  }
}

/**
 * Every newsletter's rss content opens with the same image that's already
 * shown as this page's glowing hero image (Evan embeds it at the top of
 * every issue when writing it). Strip that one leading image out of the
 * body so it isn't shown twice.
 */
function stripLeadingBodyImage(post: BeehiivPost): void {
  const rss = post.content?.free?.rss;
  if (!rss) return;
  post.content!.free!.rss = rss.replace(
    /<div class="image">\s*<img[^>]*\/?>\s*<\/div>/i,
    ""
  );
}

/**
 * beehiiv auto-appends a "Powered by beehiiv" promo link (with its own UTM
 * tracking back to beehiiv.com) to the end of every rss content export.
 * Strip that footer block out — it's platform branding, not Evan's content.
 */
function stripBeehiivFooter(post: BeehiivPost): void {
  const rss = post.content?.free?.rss;
  if (!rss) return;
  post.content!.free!.rss = rss.replace(
    /<div class=['"]beehiiv__footer['"]>[\s\S]*?<\/div>/i,
    ""
  );
}

/** Format a beehiiv unix timestamp (seconds) like "January 15, 2026". */
export function formatPostDate(timestamp?: number | null): string {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** e.g. "AUG 5, 2026" — the compact byline date format used across the newsletter pages. */
export function formatShortDate(timestamp?: number | null): string {
  if (!timestamp) return "";
  return new Date(timestamp * 1000)
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    .toUpperCase();
}
