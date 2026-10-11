// Sam's Discovery Call. On /book, Calendly's own form asks the questions;
// the setter page books the same event through the API.
export const BOOK_EVENT_URL = "https://calendly.com/sam-thesavvyexpat/expat-relocation-discovery-call";

// Match Calendly's pages to the white booking card. Event details are shown
// once, in the card's left column.
export const BOOK_EMBED_PARAMS: Record<string, string> = {
  background_color: "ffffff",
  text_color: "041630",
  primary_color: "4934fb",
  hide_gdpr_banner: "1",
  hide_event_type_details: "1",
};

export function bookEmbedUrl(base: string = BOOK_EVENT_URL) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(BOOK_EMBED_PARAMS)) url.searchParams.set(key, value);
  return url.toString();
}
