const commonUsTimeZones = [
  { value: "America/New_York", label: "Eastern Time — New York" },
  { value: "America/Chicago", label: "Central Time — Chicago" },
  { value: "America/Denver", label: "Mountain Time — Denver" },
  { value: "America/Phoenix", label: "Arizona Time — Phoenix (no daylight saving)" },
  { value: "America/Los_Angeles", label: "Pacific Time — Los Angeles" },
  { value: "America/Anchorage", label: "Alaska Time — Anchorage" },
  { value: "Pacific/Honolulu", label: "Hawaii Time — Honolulu" },
] as const;

const fallbackTimeZones = [
  "America/Adak",
  "America/Anchorage",
  "America/Boise",
  "America/Chicago",
  "America/Denver",
  "America/Detroit",
  "America/Indiana/Indianapolis",
  "America/Indiana/Knox",
  "America/Los_Angeles",
  "America/Menominee",
  "America/New_York",
  "America/North_Dakota/Center",
  "America/Phoenix",
  "America/Puerto_Rico",
  "America/Toronto",
  "Asia/Bangkok",
  "Asia/Dubai",
  "Asia/Manila",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Brisbane",
  "Australia/Perth",
  "Australia/Sydney",
  "Europe/London",
  "Europe/Paris",
  "Pacific/Auckland",
  "Pacific/Honolulu",
];

export function getTimeZones(local: string, supported?: string[]) {
  const all = new Set([
    local,
    "UTC",
    ...commonUsTimeZones.map((zone) => zone.value),
    ...(supported?.length ? supported : fallbackTimeZones),
  ]);
  const common = new Set<string>(commonUsTimeZones.map((zone) => zone.value));
  return {
    common: commonUsTimeZones.map((zone) => zone.value),
    all: Array.from(all).sort((a, b) => a.localeCompare(b)),
    additional: Array.from(all).filter((zone) => !common.has(zone)).sort((a, b) => a.localeCompare(b)),
  };
}

export function timeZoneLabel(zone: string) {
  const common = commonUsTimeZones.find((item) => item.value === zone);
  if (common) return common.label;
  if (zone === "UTC") return "UTC";
  try {
    const generic = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "longGeneric",
    }).formatToParts(new Date()).find((part) => part.type === "timeZoneName")?.value;
    const city = zone.split("/").pop()?.replace(/_/g, " ");
    return generic && city ? `${generic} — ${city}` : zone.replace(/_/g, " ");
  } catch {
    return zone.replace(/_/g, " ");
  }
}
