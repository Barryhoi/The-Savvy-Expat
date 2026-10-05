const assert = require("node:assert/strict");
const { getTimeZones, timeZoneLabel } = require(
  require("node:path").join(process.env.SAVVY_TEST_OUTPUT, "timezones.js"),
);

const fallback = getTimeZones("America/Indiana/Indianapolis");
assert.ok(fallback.common.includes("America/Chicago"), "Central Time is available without Intl.supportedValuesOf");
assert.ok(fallback.common.includes("America/Denver"), "Mountain Time is available without Intl.supportedValuesOf");
assert.ok(fallback.common.includes("America/Phoenix"), "Arizona's no-DST zone is available");
assert.ok(fallback.all.includes("America/Indiana/Indianapolis"), "the visitor's exact local zone stays available");

const expanded = getTimeZones("Asia/Manila", ["America/Indiana/Indianapolis", "Asia/Manila"]);
assert.ok(expanded.all.includes("America/Indiana/Indianapolis"), "browser-supported state-specific zones are retained");
assert.equal(timeZoneLabel("America/Chicago"), "Central Time — Chicago");
assert.equal(timeZoneLabel("America/Denver"), "Mountain Time — Denver");
assert.equal(timeZoneLabel("UTC"), "UTC");
assert.match(timeZoneLabel("Asia/Manila"), /Manila/);

console.log("Time-zone picker tests passed");
