const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const config = require('../lib/close-fields.json');
const id = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const records = new Map();
const writes = [];
const locks = [];
let status = config.tfnbStatusId;
const original = Module._load;
Module._load = function(name, ...args) {
  if (name === 'server-only') return {};
  if (name === './application') return { getApplication: async () => ({ value: { id, qualified: true, leadId: 'lead_test', answers: { email: 'qa@example.com' } } }) };
  if (name === './application-followups') return { syncApplicationFollowups: async () => {} };
  if (name === './calendly') return {
    providerPath: uri => uri,
    resolveEventType: async () => 'event_type_test',
    calendlyApi: async uri => ({ resource: uri.includes('invitee') ? { status: 'active', event: 'event_test', email: 'qa@example.com', tracking: { utm_content: 'se_'+id }, created_at: '2026-09-25T00:00:00Z', timezone: 'Asia/Manila' } : { event_type: 'event_type_test', start_time: '2026-09-26T00:00:00Z' } }),
  };
  if (name === './receipt-store') return {
    digest: value => value,
    readRecord: async key => records.get(key) || null,
    writeRecord: async (key, value) => { records.set(key, { value, etag: 'v1' }); return { etag: 'v1' }; },
    withLock: async (key, fn) => { locks.push(key); return fn(); },
  };
  if (name === './close') return {
    customFields: values => values,
    closeApi: async (url, method, body) => {
      assert.match(url, /^lead\//, 'optional automation off must not create an opportunity or task');
      if (method === 'PUT') { writes.push(body); if (body.status_id) status = body.status_id; }
      return { organization_id: config.organizationId, status_id: status };
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
  assert.equal(status, config.tfnbStatusId, 'preview must not activate existing production status automations');
  assert.equal(writes[0].bookingStatus, 'Booked');
  console.log('PASS: verified production booking changes TFNB to Booked with optional automations off; duplicate and preview guards');
})().catch(e => { console.error(e); process.exitCode = 1; });
