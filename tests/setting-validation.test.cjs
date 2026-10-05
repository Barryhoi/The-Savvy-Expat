const assert = require("node:assert/strict");
const path = require("node:path");
const { validateSetterContact } = require(path.join(process.env.SAVVY_TEST_OUTPUT, "setting-validation.js"));

assert.deepEqual(
  validateSetterContact({ name: "  Jordan   Smith ", email: "Jordan@Example.com", phone: "(720) 810-9892" }),
  { name: "Jordan Smith", email: "jordan@example.com", phone: "+17208109892" },
);
assert.equal(validateSetterContact({ name: "Sam", email: "sam@example.com", phone: "1-720-810-9892" }).phone, "+17208109892");
for (const phone of ["720810989", "172081098921", "1234567890", "5551234567 ext 5"]) {
  assert.throws(() => validateSetterContact({ name: "Jordan Smith", email: "jordan@example.com", phone }));
}
for (const contact of [
  { name: "x", email: "jordan@example.com", phone: "7208109892" },
  { name: "Jordan Smith", email: "bad", phone: "7208109892" },
  { name: "<script>", email: "jordan@example.com", phone: "7208109892" },
]) assert.throws(() => validateSetterContact(contact));
console.log("Setter contact validation tests passed");
