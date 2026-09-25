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

## 2026-09-25 — Savvy visual redesign based on Ryan booking
- Preview: https://the-savvy-expat-lzikgvzgr-barry-operations.vercel.app/form
- Deployment: dpl_2RtZtuajJGyuwEvL6HA2pT9qzpFd; READY; Next.js cloud build 10s; code b45dc04.
- Compared live ryanunhinged.com/book and its NativeBookingCalendar/booking.css source. Adopted host overview, month calendar, adjacent bounded time list, selected-time Continue, and two-step booking indicator in Savvy purple/navy/lavender.
- Form refreshed with branded header, typography, progress, lettered selection cards, checkmarks, mobile inputs, keyboard focus and optional-name prompt cleanup. Original questions/options/qualification/API integrations retained.
- npm run lint, npm test and cloud build passed. Chrome desktop and emulated 390px/320px inspected. Required validation, multiple selections, full qualified form progression, mobile date-to-times downward scrolling, chosen-time Continue and exact Calendly date/time/timezone handoff verified. Final preview form and optional-name prompt verified at 320px.
- QA qualified application without identity: 43728e98-9a79-4539-95bc-37a694a3aee2. No booking submitted in this redesign pass. No new contact identity entered.
- Calendly emitted its third-party Datadog no-session-storage telemetry warning; embed still loaded. Real iPhone Safari not exercised.
- Production and Make untouched. Existing webhook remains on m0m90zni4 preview; retain that deployment as documented above.

## 2026-09-25 — Brand correction requested from screenshots
- Latest preview: https://the-savvy-expat-4ke13kojm-barry-operations.vercel.app/form (592ec19; deployment dpl_4zQmseKt4JzWmytZZ4huwZKE1ayh).
- Compared live Savvy homepage. Restored actual logo, Satoshi weights, purple/navy palette and lavender background; enlarged and darkened supporting text/calendar controls. Removed custom Sam name/title block. Replaced confusing final statement with an accurate booking handoff and explicit Choose a time CTA; qualification questions and rules unchanged.
- Type check, tests, and cloud build passed. Desktop final screen and booking calendar inspected. 320px calendar and final full-width CTA visually verified; qualified application still routes to live availability. No real booking submitted; production/Make unchanged.

## 2026-09-25 — TFDQ capture and setter task automation
- Preview: https://the-savvy-expat-d47mbaqng-barry-operations.vercel.app/form; READY dpl_AzBEeifzTikukWZnnNhcRGrc7XkX, code 1cc0069, cloud build 8s.
- User approved mandatory name/email/phone before qualification. First and last name, email and international phone are enforced client/server; old drafts return to missing contact fields. Four disqualification rules and passing gaps remain unchanged.
- Created Savvy Close lead status TFDQ, stat_WzMDyir894slPw5WHK8mrsKdm5TqqNLgxbtpe5advll. Disqualified submissions create/update exact-email lead with TFDQ, answers and reason. Qualified reapplications move TFDQ to Potential.
- API creates one follow-up lead task per disqualified application, due at submission, with exact question/answer and application reference. Receipt and CRM lookup recover retries; uncertain creates cannot blindly duplicate. Production task owner requires CLOSE_TFDQ_SETTER_ID.
- IMPORTANT: Live setter identity is awaiting user answer (Nicholas/Evan/Sam). Preview-only CLOSE_TFDQ_SETTER_ID uses existing API owner Evan for QA. Preview tasks are created completed, titled PREVIEW QA — DO NOT CONTACT, with send_notification=false. Do not copy this preview owner into production until user confirms. No live outreach or Make changes.
- Browser verified blank name/email/phone blocked, earliest rejection auto-submits and shows ending only after CRM sync. Real QA lead lead_1rZ6DgkTAKv6NTp5Cy47s5eIefkW6PyH1eRMZw83xTU; application 254815b6-c07c-4d55-aebd-dc2327d4010d; completed task task_hp6zc3p6te1XTEui3CGiz8i4aQkmrEjs8CihDKuyDUl. Verified TFDQ, contact phone, original situation answer, Disqualified qualification and Preview environment. Same-ID API replay returned success and exactly one task.
- npm test and lint pass, including all four branches requiring identity, international phone validation, old-draft contact recovery, task timeout-after-accept recovery, duplicate guard and preview/production task behavior.
- Existing Calendly webhook remains pinned to m0m90zni4; public domain remains unchanged. Deployment 8v7kl8jsm predates setter QA env and should not be used for review.

## 2026-09-25 — Status-only TFNS abandonment capture
- User explicitly requested TFNS status only, no TFNS setter task. Make and existing Close workflows remain untouched.
- Latest preview: https://the-savvy-expat-be47h8siw-barry-operations.vercel.app/form; READY dpl_DZhyi4Vqf1uYhdRmRXEcv3vh1N93, code f1634eb, build 10s. Prior full-flow QA preview jxnpn8pjt used 9ce18ea.
- Client saves committed name/email from the phone step onward, then answers as progress changes. Phone remains mandatory for final submission but is optional for partial capture. Debounce, serialized requests, retry, hidden-page beacon and monotonic revisions protect saves. Local draft remains available on network failure.
- Protected same-origin progress endpoint stores private drafts and creates/updates exact-email Close leads as In progress. No draft follow-up task or newsletter enrollment. New-lead identity tracking preserves new-lead newsletter behavior on later final submission.
- Existing TFNS status stat_bmPa0jISJvTQgFp5iwrLiDP3U4LqOF30mfJOVzUH7l6 used. /api/cron/tfns checks 30 minutes of inactivity; updates only status_id. Pending queue is paginated, completed entries removed, cursor retained. Same-application and per-email locks, current application reference, qualification, booking and pipeline checks prevent stale overwrite. Returning progress clears TFNS to Potential; submitted/DQ/booked/protected or manually moved leads are excluded.
- vercel.json schedules once per minute. CRON_SECRET securely configured in Preview and Production; private value only in ignored .env.tfns.local. CRON DOES NOT AUTOMATICALLY RUN ON PREVIEW. It was manually invoked for verification; schedule activates only with a future production deployment. Production Blob and other migration launch prerequisites still apply; do not promote without the user's approval.
- Browser QA captured an unfinished form before submission: application df195a17-085e-4696-8984-3f4111a05621, lead lead_LmDo9Wuq2cy4iw6YVbRyWYqdDKCT32BVbWQPmdajGZp, email barrymassmedia+savvy-tfns-qa@gmail.com. Unauthorized cron returned 401; authorized sweep initially waited. Backdated ONLY that QA draft 31 minutes: sweep marked TFNS, zero tasks. Browser resumed: status Potential and situation saved. Submitted qualified application via preview API; aged draft sweep excluded it, qualification remained Qualified and zero tasks. No booking was created.
- Final-preview email-only API QA: application 1de62ed3-50ec-487d-be7d-cf690247afdb, lead lead_NZpblH0kUDAauTsZoVhSyB3C6dh9VTGEr0DNchnLdxE, email barrymassmedia+savvy-tfns-email-qa@gmail.com. Name/email without phone captured as Potential, zero tasks. Clearly labeled PREVIEW EMAIL QA / DO NOT CONTACT. This remains a test draft in the preview queue.
- npm test/lint and cloud build passed. Added boundary tests for exactly 30 minutes, malformed timestamps, task-free status patch, duplicate and out-of-order progress, returning applicants, and submitted/DQ/booked/newer/manual-stage exclusions. No new TFNS outreach sequence was activated.

## 2026-09-25 — Corrected TFNS definition (supersedes prior abandonment meaning)
- User clarified: TFNS = completed, qualified form without booking; once booked, status Booked. Incomplete forms are NOT TFNS. TFDQ remains disqualified. No TFNS setter tasks.
- Latest preview: https://the-savvy-expat-qocn0muqb-barry-operations.vercel.app/form; READY dpl_7SAz7uWn6dpafKuAHt3dQTgAZvTr, code e7447bb, cloud build 15s.
- Partial progress is still captured, but no longer queues TFNS. Qualified successful submissions enqueue the check; its 30-minute timer starts at submittedAt. Old partial queue entries are discarded without changing CRM status. Checker shares lead-booking lock with booking sync to prevent racing a booking.
- Production verified active booking now changes lead status to Booked independently of BOOKING_LIVE_AUTOMATIONS. Opportunity/newsletter gates and preview outreach isolation remain. Preview booking continues to write Booked custom fields only; production status is covered by a mocked provider/CRM regression test without creating an appointment.
- Tests/lint pass: qualified submitted/no-booking => TFNS at 30 minutes, incomplete/DQ/booked/rescheduled/newer/manual-stage exclusions; production TFNS => Booked even with optional automation off; duplicate webhooks and preview isolation.
- CRITICAL LAUNCH: webhook still points to old m0m90zni4 preview code. At approved production launch, point the verified signed Calendly webhook to the production endpoint with correct signing secret, storage and environment. Do not claim the production transition is already active from a preview deploy.
- Production and Make unchanged; cron schedule remains production-only. No new booking, email, SMS, or follow-up task created in this correction.

## 2026-09-25 — Final agreed TFS / TFNB / Booked / TFDQ flow
- Supersedes all earlier TFNS naming and setter-task plans. Qualified submission is immediately TFS (Type Form Submitted); after 30 minutes without booking it becomes TFNB (Type Form No Booking); verified production booking moves to Booked; disqualified forms become TFDQ. Partial forms remain In progress/Potential, never TFNB. No setter tasks for any of these paths.
- Created Savvy Close statuses TFS stat_ij55sAYbHpHkUY2BFOxWq2iBCgjimScspGB3gCAYmak and TFNB stat_B2v4QecIUQ8wQYfXpd1OwYeB7rc0pX3Rtv6e95MlsyD. Historical TFNS and its automations remain unchanged; no bulk lead migration or Make changes.
- Removed TFDQ task module and application-route invocation. CLOSE_TFDQ_SETTER_ID is no longer used or required; prior pending setter question is obsolete.
- Cron endpoint renamed /api/cron/tfnb, scheduled once per minute with existing CRON_SECRET. It only promotes TFS to TFNB; historical TFNS, manual sales stages and bookings are protected. Shared booking/identity locks and a fresh read protect submission/booking races.
- Preview: https://the-savvy-expat-nrcgs7t5q-barry-operations.vercel.app/form; READY dpl_JCeTh5C5kzRVq51nKcXRBft7rbdz, deployed code 7b1ceb8, cloud build 14s.
- Real preview/Close QA: lead_s7Azqk28yfC3aSp527j3e8Os5rIctptNA1kSOewgkwB, email barrymassmedia+savvy-stages-qa@gmail.com; initial application 8703efaf-5b36-485c-8ece-a7d4aee534ae, repeat application 1154dcee-b112-410a-91b8-d4809fe9f7a1. Verified immediate TFS, same-ID replay with one lead, immediate sweep still TFS, aged-only-QA receipt at 31 minutes => TFNB, new qualified submission => TFS, all four disqualification branches => TFDQ, and stale prior qualified timer excluded. Exactly one lead and zero tasks. Final QA status TFDQ; no booking submitted.
- Automated tests exercise actual syncApplication with mocked Close transport, including direct TFS/TFDQ creation, partial-to-TFS, TFNB-to-TFS, duplicate protection, a booking race between lookup and locked update, and historical/advanced-stage protection. Production TFNB-to-Booked with optional automation off is tested with mocked Calendly/Close, plus duplicate webhook/preview guards. npm test, lint, diff check and cloud build pass.
- Launch boundary unchanged: production domain untouched, automatic cron is production-only, preview bookings write Booked custom fields without triggering production Booked status workflows. At approved launch, configure production Blob/signing environment and repoint signed Calendly webhook from old m0m90zni4 preview to the production route. Do not claim production migration is active yet.
