const assert = require('node:assert/strict');
const Module = require('node:module');
const path = require('node:path');
const original = Module._load;
const records = new Map();
const tasks = [];
let postCount = 0;
let failAfterCreate = false;
const config = require('../lib/close-fields.json');
Module._load = function(id, ...args) {
  if (id === 'server-only') return {};
  if (id === './receipt-store') return {
    readRecord: async key => records.get(key) || null,
    writeRecord: async (key, value) => { records.set(key, { value, etag: 'v1' }); return { etag: 'v1' }; },
    withLock: async (key, fn) => fn(),
  };
  if (id === './close') return { closeApi: async (url, method, body) => {
    if (method !== 'POST') return { data: tasks.filter(t => url.includes(t.lead_id)), has_more: false };
    postCount++;
    const task = { ...body, id: `task_${postCount}`, organization_id: config.organizationId };
    tasks.push(task);
    if (failAfterCreate) { failAfterCreate = false; throw new Error('NETWORK_TIMEOUT'); }
    return task;
  }};
  return original.call(this, id, ...args);
};
const { syncTfdqFollowup } = require(path.join(process.env.SAVVY_TEST_OUTPUT, 'tfdq-followup.js'));
const base = { id: 'a', leadId: 'lead_qa', qualified: false, reason: 'timeline', answers: { timeline: '12+ months from now' }, submittedAt: '2026-09-25T00:00:00.000Z' };
(async () => {
  process.env.CLOSE_TFDQ_SETTER_ID = 'user_setter';
  process.env.VERCEL_ENV = 'preview';
  await syncTfdqFollowup({ ...base, qualified: true });
  assert.equal(postCount, 0);
  await syncTfdqFollowup(base);
  await syncTfdqFollowup(base);
  assert.equal(postCount, 1);
  assert.equal(tasks[0].is_complete, true);
  assert.equal(tasks[0].send_notification, false);
  assert.match(tasks[0].text, /DO NOT CONTACT/);
  assert.match(tasks[0].text, /12\+ months from now/);
  failAfterCreate = true;
  await assert.rejects(syncTfdqFollowup({ ...base, id: 'b' }), /NETWORK_TIMEOUT/);
  await syncTfdqFollowup({ ...base, id: 'b' });
  assert.equal(postCount, 2, 'recover accepted POST rather than duplicate it');
  process.env.VERCEL_ENV = 'production';
  await syncTfdqFollowup({ ...base, id: 'c' });
  assert.equal(tasks[2].is_complete, false);
  assert.equal(tasks[2].assigned_to, 'user_setter');
  assert.equal(tasks[2].date, base.submittedAt);
  records.set('tfdq-followups/d', { value: { creating: true }, etag: 'v1' });
  await assert.rejects(syncTfdqFollowup({ ...base, id: 'd' }), /RECONCILIATION/);
  assert.equal(postCount, 3);
  delete process.env.CLOSE_TFDQ_SETTER_ID;
  await assert.rejects(syncTfdqFollowup({ ...base, id: 'e' }), /NOT_CONFIGURED/);
  console.log('PASS: TFDQ task deduplication, uncertain-create recovery, preview isolation, production assignment and missing-config protection');
})().catch(error => { console.error(error); process.exitCode = 1; });
