# Preview-only migration

Production remains at bb80d60. This checkout is isolated on booking-migration-preview.

## Verified original Cal.com settings
- Event 5641816: Expat Relocation Discovery Call, 30 minutes, Sam Indus.
- Daily 00:00–03:00 and 11:00–23:59, Asia/Bangkok.
- Four hours minimum notice, 10-minute after buffer, no before buffer.
- 30-minute intervals; max 10 bookings/day; 3 business days into future.
- Name/email required. Phone optional. WhatsApp Yes/No required. Notes optional. Guests hidden.
- Workflow 442916 sends an email to lea@thesavvyexpat.com; content/trigger still being inspected.

## New Calendly settings
Sam's initial 30-minute template (event editor ID 203781020) renamed to Expat Relocation Discovery Call.
URL https://calendly.com/sam-thesavvyexpat/expat-relocation-discovery-call
Description, duration, daily hours/timezone, buffer, day limit and window copied. Google Meet location.
Guests disabled. Booking question order: Additional notes (optional), Phone number (optional), WhatsApp (required, Yes/No).
Native Calendly-Close integration does not update mapped custom fields for existing contacts. Website webhook is responsible for custom fields.

## Required before production
- CALENDLY_API_TOKEN and CALENDLY_WEBHOOK_SIGNING_KEY.
- Register signed invitee.created/invitee.canceled webhook against reachable stable preview URL; keep deployment protection intact.
- Verify real booking, cancellation and reschedule, duplicate retry and authoritative Close fields.
- Reconcile existing Make module outcomes (no Make modifications): original Typeform new-lead newsletter subscription and Cal lead/opportunity status values. Production writes to these outcomes currently gated off.
- BOOKING_LIVE_AUTOMATIONS is deliberately off in Preview. Existing Make scenarios remain unchanged.
- Preserve four Typeform rejection rules and the current optionality. Budget/funds rejection endings stay unconnected.
