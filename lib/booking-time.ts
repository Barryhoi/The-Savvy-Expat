export type AvailableSlot = { startTime: string; schedulingUrl: string };

export function dateInZone(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(iso));
  const part = (name: string) => parts.find(p => p.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function monthDays(month: string) {
  const [year, number] = month.split("-").map(Number);
  const offset = (new Date(Date.UTC(year, number - 1, 1)).getUTCDay() + 6) % 7;
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return { offset, count };
}

export function moveMonth(month: string, delta: number) {
  const [year, number] = month.split("-").map(Number);
  return new Date(Date.UTC(year, number - 1 + delta, 1)).toISOString().slice(0, 7);
}

export function availabilityWindows(month: string, now = Date.now()) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Invalid month");
  const [year, number] = month.split("-").map(Number);
  const beginning = Date.UTC(year, number - 1, 1) - 14 * 60 * 60 * 1000;
  const ending = Date.UTC(year, number, 1) + 14 * 60 * 60 * 1000;
  if (ending < now || beginning > now + 366 * 86400000) throw new Error("Month out of range");
  // Seven-day chunks work across Calendly API versions. The extra timezone
  // margin includes UTC-12 through UTC+14; the client groups in its chosen zone.
  const windows: { start: string; end: string }[] = [];
  for (let start = Math.max(beginning, now + 60000); start < ending; start += 7 * 86400000) {
    windows.push({ start: new Date(start).toISOString(), end: new Date(Math.min(start + 7 * 86400000, ending)).toISOString() });
  }
  return windows;
}
