import "server-only";
export const EVENT_URL =
  "https://calendly.com/sam-thesavvyexpat/expat-relocation-discovery-call";
export async function calendlyApi(
  path: string,
  method = "GET",
  body?: unknown,
) {
  if (!process.env.CALENDLY_API_TOKEN)
    throw new Error("CALENDLY_NOT_CONFIGURED");
  const response = await fetch(`https://api.calendly.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.CALENDLY_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`CALENDLY_${response.status}`);
  return response.json();
}
let eventUri: string | undefined;
export async function resolveEventType() {
  if (eventUri) return eventUri;
  const { resource: me } = await calendlyApi("/users/me");
  const memberships = await calendlyApi(
    `/organization_memberships?organization=${encodeURIComponent(me.current_organization)}&email=sam%40thesavvyexpat.com&count=100`,
  );
  const sam = memberships.collection.find(
    (m: { user: { email: string } }) =>
      m.user.email.toLowerCase() === "sam@thesavvyexpat.com",
  );
  if (!sam) throw new Error("CALENDLY_HOST_NOT_FOUND");
  let page = "";
  for (let i = 0; i < 10; i++) {
    const result = await calendlyApi(
      `/event_types?user=${encodeURIComponent(sam.user.uri)}&active=true&count=100${page ? `&page_token=${encodeURIComponent(page)}` : ""}`,
    );
    const event = result.collection.find(
      (e: { scheduling_url: string; duration: number }) =>
        e.scheduling_url.replace(/\/$/, "") === EVENT_URL && e.duration === 30,
    );
    if (event) {
      eventUri = event.uri;
      return event.uri as string;
    }
    page = result.pagination?.next_page_token;
    if (!page) break;
  }
  throw new Error("CALENDLY_EVENT_NOT_FOUND");
}
export async function availability() {
  const uri = await resolveEventType();
  const start = new Date(Date.now() + 60000),
    end = new Date(start.getTime() + 7 * 86400000 - 1000);
  const query = new URLSearchParams({
    event_type: uri,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
  });
  const response = await calendlyApi(`/event_type_available_times?${query}`);
  return response.collection
    .filter(
      (s: { status: string; scheduling_url: string }) =>
        s.status === "available" &&
        s.scheduling_url.startsWith(EVENT_URL + "/"),
    )
    .map((s: { start_time: string; scheduling_url: string }) => ({
      start: s.start_time,
      url: s.scheduling_url,
    }));
}
export function providerPath(uri: string, kind: "invitee" | "event") {
  const pattern =
    kind === "invitee"
      ? /^https:\/\/api\.calendly\.com(\/scheduled_events\/[a-zA-Z0-9-]+\/invitees\/[a-zA-Z0-9-]+)$/
      : /^https:\/\/api\.calendly\.com(\/scheduled_events\/[a-zA-Z0-9-]+)$/;
  const match = uri.match(pattern);
  if (!match) throw new Error("INVALID_PROVIDER_URI");
  return match[1];
}
