const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const config = require('../lib/close-fields.json');
const records = new Map(), applications = new Map(), patches = [], removed = [];
let lead, syncCount = 0;
const original = Module._load;
Module._load = function(id, ...args) {
  if (id === 'server-only') return {};
  if (id === './application') return { getApplication: async id => applications.has(id) ? { value: applications.get(id) } : null };
  if (id === './receipt-store') return {
    readRecord: async key => records.get(key) || null,
    writeRecord: async (key, value) => { records.set(key, { value, etag: 'v1' }); return { etag: 'v1' }; },
    withLock: async (key, fn) => fn(),
    removePendingDraft: async id => { removed.push(id); records.delete('abandonment-pending/'+id); },
  };
  if (id === './close') return {
    syncApplication: async (id, answers, at, mode) => { assert.equal(mode, 'draft'); syncCount++; return { leadId: 'lead_test' }; },
    closeApi: async (url, method, body) => {
      assert.match(url, /^lead\//, 'TFNB must never create tasks or outreach');
      if (method === 'PUT') { patches.push(body); Object.assign(lead, body); }
      return lead;
    },
  };
  return original.call(this, id, ...args);
};
const output = process.env.SAVVY_TEST_OUTPUT;
const { validateProgress, abandonmentDue, ABANDONMENT_MS } = require(path.join(output, 'intake-progress.js'));
const { saveProgress, checkAbandonment } = require(path.join(output, 'intake-abandonment.js'));
const answers = { firstName: 'QA', lastName: 'Test', email: 'qa@example.com', phone: '+12025550148' };
const at = Date.parse('2026-09-25T00:00:00.000Z');
function eligible(id) { return { id: 'lead_test', organization_id: config.organizationId, status_id: config.tfsStatusId, ['custom.'+config.fields.applicationId]: id, ['custom.'+config.fields.qualification]: 'Qualified' }; }
function seed(id, extra={}) { records.set('drafts/'+id, { value: { id, answers, revision: 1, updatedAt: new Date(at).toISOString(), leadId: 'lead_test', ...extra }, etag: 'v1' }); lead = eligible(id); }
(async () => {
  assert.deepEqual(validateProgress(answers), answers);
  assert.equal(validateProgress({ ...answers, phone: '' }).email, answers.email);
  assert.throws(() => validateProgress({ ...answers, email: '' }));
  assert.throws(() => validateProgress({ ...answers, situation: 'invalid' }));
  assert.equal(abandonmentDue(new Date(at).toISOString(), at+ABANDONMENT_MS-1), false);
  assert.equal(abandonmentDue(new Date(at).toISOString(), at+ABANDONMENT_MS), true);
  assert.equal(abandonmentDue('invalid'), false);
  seed('unfinished');
  assert.equal(await checkAbandonment('unfinished', at+ABANDONMENT_MS), 'excluded');
  assert.equal(patches.length, 0, 'unfinished forms must never become TFNB');
  const submitted = id => ({ id, answers, qualified: true, synced: true, leadId: 'lead_test', submittedAt: new Date(at).toISOString() });
  seed('idle'); applications.set('idle', submitted('idle'));
  assert.equal(await checkAbandonment('idle', at+ABANDONMENT_MS-1), 'waiting');
  assert.equal(patches.length, 0);
  assert.equal(await checkAbandonment('idle', at+ABANDONMENT_MS), 'marked');
  assert.deepEqual(patches[0], { status_id: config.tfnbStatusId });
  await checkAbandonment('idle', at+ABANDONMENT_MS);
  assert.equal(patches.length, 1);
  for (const kind of ['dq', 'booked', 'rescheduled', 'newer', 'manual']) {
    seed(kind); applications.set(kind, submitted(kind));
    if (kind === 'dq') applications.get(kind).qualified = false;
    if (kind === 'booked') lead['custom.'+config.fields.bookingStatus] = 'Booked';
    if (kind === 'rescheduled') lead['custom.'+config.fields.bookingStatus] = 'Rescheduled';
    if (kind === 'newer') lead['custom.'+config.fields.applicationId] = 'new-application';
    if (kind === 'manual') lead.status_id = 'manual-sales-stage';
    assert.equal(await checkAbandonment(kind, at+ABANDONMENT_MS), 'excluded', kind);
  }
  assert.equal(patches.length, 1);
  await saveProgress('resume', 10, answers);
  const first = records.get('drafts/resume').value;
  await saveProgress('resume', 9, { ...answers, firstName: 'stale' });
  assert.equal(records.get('drafts/resume').value.answers.firstName, 'QA');
  assert.equal(records.get('drafts/resume').value.updatedAt, first.updatedAt);
  assert.equal(syncCount, 1);
  records.get('drafts/resume').value.marked = true;
  await saveProgress('resume', 11, answers);
  assert.equal(records.get('drafts/resume').value.marked, undefined);
  assert.equal(syncCount, 2);
  applications.set('resume', submitted('resume'));
  await saveProgress('resume', 12, answers);
  assert.equal(syncCount, 2);
  assert.equal(records.has('abandonment-pending/resume'), false, 'partial saves do not queue TFNB');
  console.log('PASS: TFNB only for qualified submitted applications without bookings, 30-minute cutoff, no tasks, partial/DQ/booked/rescheduled/newer/manual-stage exclusions');
})().catch(error => { console.error(error); process.exitCode = 1; });
