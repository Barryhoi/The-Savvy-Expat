import config from "./close-fields.json";
// Only this form's own stages can be replaced by a repeat submission. A booking
// or a salesperson's later stage must not be demoted by another form visit.
export function intakeStatus(
  mode: "submitted" | "draft",
  disqualified: boolean,
  lead?: { status_id: string; [key: string]: unknown } | null,
): string | undefined {
  if (mode === "draft") return lead ? undefined : config.potentialStatusId;
  if (lead && (
    ["Booked", "Rescheduled"].includes(String(lead[`custom.${config.fields.bookingStatus}`])) ||
    ![config.potentialStatusId, config.tfsStatusId, config.tfnbStatusId, config.tfdqStatusId].includes(lead.status_id)
  )) return undefined;
  return disqualified ? config.tfdqStatusId : config.tfsStatusId;
}
