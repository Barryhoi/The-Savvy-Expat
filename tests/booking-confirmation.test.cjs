const assert = require('node:assert/strict');
const { join } = require('node:path');
const { confirmBookingRequest } = require(join(process.env.SAVVY_TEST_OUTPUT, 'booking-confirmation.js'));
(async () => {
  const calls = [], delays = [];
  await confirmBookingRequest('qa-invitee', async (url, options) => {
    calls.push({url, ...options});
    if (calls.length === 1) return new Response('{}', {status: 503});
    if (calls.length === 2) throw new Error('connection dropped');
    return new Response('{"confirmed":true}');
  }, async ms => delays.push(ms));
  assert.equal(calls.length, 3);
  assert.deepEqual(calls[0], calls[1]);
  assert.deepEqual(calls[1], calls[2]);
  assert.deepEqual(delays, [1000, 2000]);
  let permanentCalls = 0;
  await assert.rejects(confirmBookingRequest('qa-invitee', async () => {
    permanentCalls++;
    return new Response('{}', {status: 409});
  }, async () => {}));
  assert.equal(permanentCalls, 1);
  let outageCalls = 0;
  await assert.rejects(confirmBookingRequest('qa-invitee', async () => {
    outageCalls++;
    return new Response('{}', {status: 503});
  }, async () => {}), /BOOKING_SYNC_PENDING/);
  assert.equal(outageCalls, 5);
  await assert.rejects(confirmBookingRequest('qa-invitee', async () =>
    new Response('{"confirmed":false}')), /INVALID_CONFIRMATION/);
  console.log('PASS: booking confirmation recovers from lock/network races, preserves invitee identity, and bounds retries');
})().catch(error => { console.error(error); process.exitCode = 1; });
