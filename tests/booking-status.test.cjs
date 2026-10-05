const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const config = require('../lib/close-fields.json');
assert.equal(config.canceledStatusId, 'stat_OdueX1uIM0d1b8h40kUqNuzEWPCtKdsf5i0I7YfbwSq', 'cancellations must map to the dedicated Call Canceled status');
const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const records = new Map();
const writes = [];
const locks = [];
let status = config.tfnbStatusId, currentApplication = id, inviteeStatus = "active", rescheduled = false, currentInvitee, trackingMarker;
const original = Module._load;
Module._load = function(name, ...args) {
  if (name === 'server-only') return {};
  if (name === './application') return { getApplication: async () => ({ value: { id, qualified: true, leadId: 'lead_test', answers: { email: 'qa@example.com' } } }) };
  if (name === './application-followups') return { syncApplicationFollowups: async () => {} };
  if (name === './calendly') return {
    providerPath: uri => uri,
    resolveEventType: async () => 'event_type_test',
    calendlyApi: async uri => ({ resource: uri.includes('invitee') ? { status: inviteeStatus, rescheduled, event: 'event_test', email: 'qa@example.com', tracking: { utm_content: trackingMarker || 'se_'+id }, created_at: '2026-09-25T00:00:00Z', timezone: 'Asia/Manila' } : { event_type: 'event_type_test', start_time: '2026-09-26T00:00:00Z' } }),
  };
  if (name === './receipt-store') return {
    digest: value => value,
    readRecord: async key => key === 'identities/qa@example.com' ? { value: { applicationId: currentApplication } } : records.get(key) || null,
    writeRecord: async (key, value) => { records.set(key, { value, etag: 'v1' }); return { etag: 'v1' }; },
    withLock: async (key, fn) => { locks.push(key); return fn(); },
  };
  if (name === './close') return {
    closeApi: async (url, method, body) => {
      assert.match(url, /^lead\//, 'optional automation off must not create an opportunity or task');
      if (method === 'PUT') { writes.push(body); if (body.status_id) status = body.status_id; }
      return { ['custom.'+config.legacyFields.applicationId]: currentApplication, organization_id: config.organizationId, status_id: status, contacts: [{ emails: [{ email: 'qa@example.com' }] }] };
    },
  };
  return original.call(this, name, ...args);
};
const { syncBooking } = require(path.join(process.env.SAVVY_TEST_OUTPUT, 'booking-sync.js'));
(async () => {
  process.env.VERCEL_ENV = 'production';
  process.env.BOOKING_LIVE_AUTOMATIONS = 'false';
  await syncBooking('invitee_test', id);
  assert.equal(status, config.bookedStatusId);
  assert.ok(locks.includes('lead-booking:lead_test'));
  const count = writes.length;
  await syncBooking('invitee_test', id);
  assert.equal(writes.length, count, 'duplicate webhook must not repeat status updates');
  records.clear(); writes.length = 0; status = config.tfnbStatusId;
  process.env.VERCEL_ENV = 'preview';
  await syncBooking('invitee_preview', id);
  assert.equal(status, config.bookedStatusId, 'verified preview bookings run the core Booked stage transition');
  assert.deepEqual(writes[0], { status_id: config.bookedStatusId }, 'booking sync writes no booking custom fields');
  records.clear(); writes.length = 0; status = config.tfsStatusId;
  records.set('bookings/invitee_previously_synced', { value: { updatedAt: '2026-09-25T00:00:00Z', synced: true } });
  await syncBooking('invitee_previously_synced', id);
  assert.equal(status, config.bookedStatusId, 'legacy successful preview booking replays once to repair the missing stage transition');
  records.clear(); writes.length = 0; currentApplication = 'newer-application';
  process.env.VERCEL_ENV = 'production';
  await syncBooking('invitee_old_late', id);
  assert.equal(writes.length, 0, 'older application webhook cannot overwrite newer submission');
  currentApplication = id;
  for (const scenario of ['cancel', 'reschedule', 'advanced', 'old-cancel']) {
    records.clear(); writes.length = 0;
    status = scenario === 'advanced' ? 'closed-sale' : config.bookedStatusId;
    inviteeStatus = scenario === 'advanced' ? 'active' : 'canceled';
    rescheduled = scenario === 'reschedule';
    currentInvitee = scenario === 'old-cancel' ? 'replacement-invitee' : undefined;
    if (scenario !== 'advanced') records.set('lead-bookings/lead_test', { value: { applicationId: id, inviteeUri: currentInvitee || 'invitee_'+scenario, status: 'active', createdAt: '2026-09-25T00:00:00Z' } });
    await syncBooking('invitee_'+scenario, id);
    assert.equal(status, scenario === 'advanced' ? 'closed-sale' : scenario === 'cancel' ? config.canceledStatusId : config.bookedStatusId, scenario);
    if (scenario === 'old-cancel') assert.equal(writes.length, 0);
    if (scenario === 'cancel') assert.deepEqual(writes[0], { status_id: config.canceledStatusId });
  }
  const setterId = '11111111-2222-4333-8444-555555555555';
  records.clear(); writes.length = 0; status = config.tfsStatusId; inviteeStatus = 'active'; rescheduled = false; trackingMarker = 'setter_'+setterId;
  records.set('setter-bookings/'+setterId, { value: { id: setterId, leadId: 'lead_test', email: 'qa@example.com', name: 'QA Contact', phone: '+17208109892', createdAt: '2026-09-25T00:00:00Z' } });
  await syncBooking('setter-invitee', undefined);
  assert.equal(status, config.bookedStatusId, 'setter calendar booking moves its linked Close lead to Booked');
  assert.deepEqual(writes[0], { status_id: config.bookedStatusId }, 'setter booking writes no custom fields');
  assert.equal(records.get('lead-bookings/lead_test').value.setterId, setterId);
  records.clear(); writes.length = 0; status = config.bookedStatusId; inviteeStatus = 'canceled';
  records.set('setter-bookings/'+setterId, { value: { id: setterId, leadId: 'lead_test', email: 'qa@example.com', name: 'QA Contact', phone: '+17208109892', createdAt: '2026-09-25T00:00:00Z' } });
  records.set('lead-bookings/lead_test', { value: { setterId, inviteeUri: 'setter-invitee', status: 'active', createdAt: '2026-09-25T00:00:00Z' } });
  await syncBooking('setter-invitee', undefined);
  assert.equal(status, config.canceledStatusId, 'setter cancellation moves the linked Close lead to Call Canceled');
  trackingMarker = undefined;
  console.log('PASS: verified booking moves leads to Booked without booking custom fields; legacy replay, duplicate, reschedule, cancellation, advanced-stage guards, and setter booking/cancellation');
})().catch(e => { console.error(e); process.exitCode = 1; });
