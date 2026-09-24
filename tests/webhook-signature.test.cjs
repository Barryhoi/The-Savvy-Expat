const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const { join } = require("node:path");
const { validCalendlySignature } = require(
  join(process.env.SAVVY_TEST_OUTPUT, "webhook-signature.js"),
);
const secret = "synthetic-test-secret",
  raw = '{"event":"invitee.created"}',
  now = 1790272800000,
  t = String(now / 1000);
const mac = createHmac("sha256", secret)
  .update(t + "." + raw)
  .digest("hex");
const header = `t=${t},v1=${mac}`;
assert.equal(validCalendlySignature(raw, header, secret, now), true);
assert.equal(validCalendlySignature(raw + " ", header, secret, now), false);
assert.equal(validCalendlySignature(raw, header, "wrong-secret", now), false);
assert.equal(validCalendlySignature(raw, header, secret, now + 300000), false);
assert.equal(validCalendlySignature(raw, header, secret, now - 300000), false);
for (const bad of [
  "",
  `t=${t}`,
  `t=nope,v1=${mac}`,
  `t=${t},v1=a`,
  `t=${t},v1=${"z".repeat(64)}`,
])
  assert.equal(validCalendlySignature(raw, bad, secret, now), false);
assert.equal(
  validCalendlySignature(
    raw,
    `t=${t},v1=${"0".repeat(64)},v1=${mac}`,
    secret,
    now,
  ),
  true,
);
console.log(
  "PASS: webhook authenticity, payload tampering, replay window, malformed headers and signature rotation",
);
