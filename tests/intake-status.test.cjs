const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const c = require('../lib/close-fields.json');
const records = new Map();
const locks = [];
let lead = null, creates = 0, bookingWins = false;
const original = Module._load;
Module._load = function(name, ...args) {
  if (name === 'server-only') return {};
  if (name === './receipt-store') return {
    digest: value => value,
    readRecord: async key => records.get(key) || null,
    writeRecord: async (key, value) => { records.set(key, { value, etag: 'v1' }); return { etag: 'v1' }; },
    withLock: async (key, fn) => { locks.push(key); if (bookingWins && key.startsWith('lead-booking:')) { lead.status_id = c.bookedStatusId; lead['custom.'+c.fields.bookingStatus] = 'Booked'; bookingWins = false; } return fn(); },
  };
  return original.call(this, name, ...args);
};
process.env.CLOSE_API_KEY = 'test-key';
global.fetch = async (url, options) => {
  const endpoint = new URL(url).pathname.replace('/api/v1/', '');
  assert.ok(endpoint.startsWith('lead/') || endpoint.startsWith('contact/'), 'no tasks or messages');
  const body = options.body ? JSON.parse(options.body) : null;
  if (options.method === 'POST') { creates++; lead = { ...body, id: 'lead_test', organization_id: c.organizationId, contacts: body.contacts.map(contact => ({ ...contact, id: 'contact_test', phones: contact.phones || [] })) }; }
  if (options.method === 'PUT' && endpoint.startsWith('lead/')) Object.assign(lead, body);
  return Response.json(endpoint === 'lead/' && options.method === 'GET' ? { data: lead ? [lead] : [], has_more: false } : lead || {});
};
const { syncApplication } = require(path.join(process.env.SAVVY_TEST_OUTPUT, 'close.js'));
const { intakeStatus } = require(path.join(process.env.SAVVY_TEST_OUTPUT, 'intake-status.js'));
const a = { firstName: 'QA', lastName: 'Test', email: 'qa@example.com', phone: '+12025550148' };
const at = '2026-09-25T00:00:00Z';
(async () => {
  await syncApplication('app1', a, at, 'draft');
  assert.equal(lead.status_id, c.potentialStatusId);
  const result = await syncApplication('app1', a, at);
  assert.equal(lead.status_id, c.tfsStatusId);
  assert.equal(result.created, true, 'new lead follow-up eligibility survives partial capture');
  await syncApplication('app1', a, at);
  assert.equal(creates, 1);
  lead.status_id = c.tfnbStatusId;
  await syncApplication('app2', a, at);
  assert.equal(lead.status_id, c.tfsStatusId);
  await syncApplication('app3', { ...a, timeline: '12+ months from now' }, at);
  assert.equal(lead.status_id, c.tfdqStatusId);
  await syncApplication('app4', a, at);
  assert.equal(lead.status_id, c.tfsStatusId);
  bookingWins = true;
  await syncApplication('app5', a, at);
  assert.equal(lead.status_id, c.bookedStatusId, 'booking between lookup and locked write must win');
  await syncApplication('app6', { ...a, timeline: '12+ months from now' }, at);
  assert.equal(lead.status_id, c.bookedStatusId);
  assert.equal(creates, 1);
  for (const status of [c.tfnsStatusId, c.bookedStatusId, 'closed_by_salesperson']) {
    assert.equal(intakeStatus('submitted', false, { status_id: status }), undefined);
    assert.equal(intakeStatus('draft', false, { status_id: status }), undefined);
  }
  records.clear(); lead = null;
  await syncApplication('direct-qualified', a, at);
  assert.equal(lead.status_id, c.tfsStatusId);
  records.clear(); lead = null;
  await syncApplication('direct-dq', { ...a, timeline: '12+ months from now' }, at);
  assert.equal(lead.status_id, c.tfdqStatusId);
  console.log('PASS: real sync function creates TFS/TFDQ, partial-to-TFS, TFNB-to-TFS, one lead on retries, booking-race and historical/advanced-stage protection; no tasks');
})().catch(e => { console.error(e); process.exitCode = 1; });
