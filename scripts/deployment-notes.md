# Savvy Expat booking migration — Preview only

Production remains at bb80d60. The isolated branch is booking-migration-preview. No push, promotion, production-domain deployment, or Make edits have occurred.

## Verified original and new event
- Cal.com event 5641816 → Calendly editor event 203781020 for Sam Indus, sam@thesavvyexpat.com.
- New public URL: https://calendly.com/sam-thesavvyexpat/expat-relocation-discovery-call
- 30 minutes, copied description, Google Meet; original Cal location was organizer's default app.
- Custom daily hours 00:00–03:00 and 11:00–23:59, Asia/Bangkok.
- Four hours minimum notice, 10-minute after buffer, no before buffer; maximum 10/day, 30-minute intervals, three weekdays into the future.
- Required name/email and WhatsApp Yes/No. Optional notes and phone. Guests disabled.
- Public Chrome calendar verified through date → time → booking details, showing Sam, 30 minutes and the correct required/optional fields. No real appointment created.

## Verified implementation
- Native 13-question intake plus final statement, exact wording/choices and four rejection rules.
- Preserved optional identity/logistics, low budget, no/tied-up funds and 6–12 month passing behavior.
- Private durable application receipts, opaque HttpOnly sessions, server-side qualification, per-email locking and retry guards.
- Close organization verified as The Savvy Expat; 28 new lead custom fields plus existing attribution mappings.
- Deployed Preview API passed all four rejection branches.
- Replaying the same application produced one QA lead, not duplicates.
- Existing QA lead updated from rejected to qualified with all answers in custom fields.
- Full mobile browser journey at 390px: validation, multiple selection, reload recovery, save retry and form → booking route passed; same QA lead received both requested services and text answers.
- Desktop form visual check passed at 1280px. Mobile body width matched viewport with no horizontal overflow.
- Unsigned webhook returned 401. Signature tests cover tampering, wrong keys, replay expiry, malformed headers and rotated signatures.
- Build and TypeScript checks passed; npm audit reported zero vulnerabilities after the framework/security update.
- Private Preview deployment requires Vercel login. CLI verification used Vercel's authorized curl access; the CLI generated a project automation bypass token. Deployment protection was not disabled.

## Read-only Make findings and gated replacements
- Typeform new-lead branch creates Beehiiv free subscription: utm_source=typeform, reactivate=false, welcome=false, double_opt_override=off, newsletter auto-subscribe not skipped, no explicit automation/list IDs.
- Implemented matching new-lead newsletter behavior, disabled unless production plus BOOKING_LIVE_AUTOMATIONS=true.
- Booking-created pipeline logic is also gated; cancellation in Make sets Disqualified (stat_rLJFxq2pZzSisWKVDtW41xYzPi9U43oVm0PVX7v6Gg8). New code only applies that cancellation transition when the latest appointment is canceled, not rescheduled, and the lead is still Booked.
- Existing Close lead-status → opportunity Make scenario remains unchanged.

## Required before launch
1. DONE: CALENDLY_API_TOKEN added by user and validated for Evan's Savvy Expat organization, Sam membership, exact 30-minute event, and 26 live slots. User configured Preview and Production; only Preview was deployed. The existing Preview CLOSE_API_KEY works; the extra-underscore Production variable was left untouched.
2. Register signed invitee.created/invitee.canceled webhooks against a stable reachable Preview callback using an approved protection-aware configuration. CALENDLY_WEBHOOK_SIGNING_KEY already exists in Preview. No subscription registered yet.
3. Test actual live availability API and real booking → Close → confirmation, then cancellation, reschedule, duplicate delivery, and out-of-order delivery. No real booking was made during these checks.
4. Inspect native Calendly–Close contact-creation settings to avoid competition with anonymous application identity resolution. Native custom mappings do not update existing contacts; this implementation performs those updates server-side.
5. Verify delivery of the saved Calendly workflow c54561f7-531f-4cda-a19b-f67142e20f03, New discovery call - notify Lea. Applies only to Sam’s discovery call, immediately when booked; recipient lea@thesavvyexpat.com, subject New Call Booked: Expat Relocation Discovery Call. Body contains Event Date, Event Time, Invitee Full Name, Invitee Email, Location, and Questions And Answers variables. Saved and confirmed in Calendly. No notification sent or real booking created during setup.
6. Verify production opportunity mapping/assignment and gated follow-ups with an approved test before activation. These production-only side effects have not been run.
7. Complete real iPhone Safari and desktop end-to-end booking verification. The in-app browser did not load the external Calendly iframe during local testing; normal Chrome loaded the public Calendly page successfully. Native availability/date-to-times interaction awaits the API token.
8. User review and explicit production approval. Never promote this preview as-is.

## Test data
One intentionally retained lead: PREVIEW QA Migration Test, savvy-migration-qa-20260925@example.com, lead_4Ng6a7qP7mAo9Lf5MCO4U38RMhNJWO75qToMxulHLGx. Marked Application environment=Preview. No newsletter enrollment, opportunity creation, outgoing email, or booking was initiated by the application test.

## Final Preview deployment
- URL: https://the-savvy-expat-e9dllveub-barry-operations.vercel.app/form
- Deployment: dpl_6iiFoiwEkuE4SpSKna6hhnwjjvuH
- Status: READY; Next.js 16.3.6; Vercel build completed in 10 seconds.
- Code commit: b9c646f; subsequent documentation-only update records the saved notification workflow.
- Final deployed application smoke test returned HTTP 200 with qualified=true for the existing synthetic receipt.
- Small-screen booking-page document width matched the 320px viewport.

## Token-enabled preview verification (September 25)
- Latest URL: https://the-savvy-expat-42jszd0iq-barry-operations.vercel.app/form
- Deployment dpl_4ypf3zD2z71K3zB7sFWE4DWF12pd READY, code d830cb5, cloud build 9 seconds.
- Prior token-enabled preview mtsd56lli returned 26 real available slots through /api/booking/availability after the retained QA application submission.
- Chrome completed anonymous qualified applications on both token-enabled previews, preserving optional identity. No booking submitted, no additional Close lead created by these anonymous applications.
- At 390px selecting a date moved down to Available times; selected slot opened the correct Calendly detail form with 30-minute duration and required WhatsApp field.
- Found and fixed Calendly clipping at 320px: mobile iframe now uses full viewport width. Latest preview visually verified all fields and Schedule Event button fully visible at 320px; desktop details also fit. Real iPhone Safari remains untested.
- Removed iframe onLoad readiness shortcut; loading now ends on Calendly postMessage so an empty iframe does not prematurely hide loading feedback. Verified loading indicator clears when real Calendly content arrives.
- TypeScript, qualification parity tests, webhook signature tests, and production build pass. Latest deployed unsigned webhook rejects with 401.
- Webhook creation was BLOCKED by automatic approval review before execution: proposed Sam-scoped signed subscription used an existing project automation-bypass credential in its callback URL to reach the protected preview. Review requires explicit user approval for sharing that credential with Calendly; no subscription or callback reachability test was created/executed. Do not retry or work around without authorization. Latest preview URL above must replace the older proposed callback URL if authorized.
- Production and Make remain untouched. Actual booking, Close booking fields, notifications, reschedule/cancellation and live webhook deliveries still require testing.

## Approved live QA and webhook connection (September 25, completed)
- User explicitly approved the existing Vercel automation-bypass credential in the Calendly callback, then separately approved organization-wide invitee events after Sam-only registration returned 403. Automatic-review restrictions are resolved for this exact setup.
- One active subscription: a5bb61be-7fdf-4be3-b47a-1602da0f1909, events invitee.created/invitee.canceled, scope organization. Verified creation 201 and subsequent GET/list 200.
- Protected callback host: the-savvy-expat-m0m90zni4-barry-operations.vercel.app, deployment dpl_HZ7U9Hvm4kw49Yw6SuiBtEi3h547, commit 8c7e800. Keep this deployment while the subscription exists. Its backend matches the newest preview; subsequent changes are client confirmation retries only. Never print/store the callback credential in committed files.
- Valid signed callback 200; tampered and expired signatures 401. Unrelated event types are acknowledged and ignored without Close writes; browser confirmation still rejects a wrong event.
- User separately approved the real QA booking, its Participant Terms, notifications to the invitee/Sam/Lea, rescheduling and cancellation cleanup.
- QA identity: PREVIEW QA - DO NOT CONTACT, barrymassmedia+savvy-preview@gmail.com. Exact Close lookup before booking returned zero leads; after booking and replay checks exactly one: lead_KzKu0V3aVN1D3fPmeZjht3EDGIBVCTfo14soAQyUd0X. Intentionally retained, marked Preview, pipeline Potential. No pipeline automation activated.
- Application 50ecd155-4aef-4fbd-8821-cb6b9cb4abda was submitted through the actual native questionnaire with optional identity skipped; Calendly identity attached it successfully. Qualification answers, qualification result, booking date/time/timezone/host/email, WhatsApp No, notes and calendar/reschedule/cancel links verified in Close. Phone was omitted and correctly stored null.
- Original: Sep 28 2026 22:00 Asia/Manila; scheduled event 2339d835-de46-42b1-8423-054189e0de10; invitee 58adea9e-d6ce-4945-973a-dbf90245bf81.
- Replacement: Sep 29 2026 22:00 Asia/Manila; scheduled event e3d3b2e4-45ba-479f-a336-9ae249560ea1; invitee 7f2b8735-2ba8-4e11-bcba-0f96e68fbfbc. Real reschedule webhooks updated the same lead. Provider retry recovered one IN_PROGRESS overlap.
- Signed replays of the old cancellation after replacement, and two duplicate replacement deliveries, all returned 200. Latest booking stayed Booked with the replacement ID and exactly one lead.
- Cleanup completed through Calendly UI: replacement appointment canceled. Authoritative Calendly GET reports canceled and Close bookingStatus is Canceled; sales pipeline remains Potential. Both test appointments are inactive; Sam's test slots released.
- Gmail UI for barrymassmedia@gmail.com visibly received all three actual messages: original invitation at 14:17, rescheduled invitation at 14:20, and canceled invitation at 14:22 Philippine time. Connector search repeatedly requested authentication, so browser evidence was used. Lea's actual inbox delivery remains unverified; Calendly outgoing-communications API requires Enterprise (403), so no plan change was made.
- Browser confirmation initially hit IN_PROGRESS while the webhook held the lock. Manual retry confirmed successfully and reached /thank-you without rebooking. Fixed with bounded automatic retries of the same invitee for 5xx/429/network errors; permanent 4xx and confirmed:false never become success.
- Added tests reproducing lock/network races, unchanged retry payloads, bounded outage retries and false-confirmation rejection. TypeScript, all tests and cloud build passed.
- Latest review URL: https://the-savvy-expat-a5ilxs5ji-barry-operations.vercel.app/form. READY deployment dpl_EE1dCzoKqvTxnGnCwELgb69FL48r, code b9da848, build 9 seconds.
- Remaining launch checks: real iPhone Safari; Lea notification receipt; production environment/signing/storage configuration and intentionally gated newsletter/pipeline activation. Production launch still requires explicit user approval. Make was not changed.
