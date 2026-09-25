const assert = require("node:assert/strict");
const {
  questions,
  qualification,
  validateSubmission,
  rejectionRules,
} = require(
  require("node:path").join(process.env.SAVVY_TEST_OUTPUT, "intake.js"),
);
const base = {
  firstName: "Test",
  lastName: "Applicant",
  email: "test@example.com",
  phone: "+1 202 555 0148",
  situation: "I'm actively planning my move and need professional help",
  commitment: "Fully committed - just need execution",
  timeline: "0-3 months from now",
  motivation: "To retire",
  services: [],
  budget: "$1,000 - $2,500",
  funds: "Yes",
  logistics: "",
  obstacle: "",
  whyUs: "",
};
assert.equal(questions.length, 13);
assert.equal(questions.some((question) => question.key === "final"), false);
assert.equal(qualification(validateSubmission(base)), null);
for (const [key, value] of Object.entries(rejectionRules)) {
  const result = validateSubmission({ ...base, [key]: value });
  assert.equal(qualification(result), key);
  const q = questions.findIndex((q) => q.key === key);
  for (const later of questions.slice(q + 1)) {
    assert.equal(result[later.key], undefined);
  }
}
for (const patch of [
  { budget: "Under $1,000" },
  { funds: "No" },
  { funds: "I have the funds but they're tied up right now" },
  { timeline: "6 months - 1 year from now" },
  { motivation: "To visit" },
  { motivation: "To scout the country" },
  { logistics: "" },

])
  assert.equal(qualification(validateSubmission({ ...base, ...patch })), null);
for (const key of [
  "firstName",
  "lastName",
  "email",
  "phone",
  "situation",
  "commitment",
  "timeline",
  "motivation",
  "budget",
  "funds",
])
  assert.throws(() => validateSubmission({ ...base, [key]: "" }));
assert.throws(() => validateSubmission({ ...base, funds: "Maybe" }));
assert.throws(() => validateSubmission({ ...base, services: ["Made up"] }));
assert.throws(() => validateSubmission({ ...base, email: "not-an-email" }));
assert.throws(() =>
  validateSubmission({ ...base, obstacle: "x".repeat(4001) }),
);
assert.deepEqual(
  validateSubmission({
    ...base,
    services: ["Finding a rental", "Finding a rental"],
  }).services,
  ["Finding a rental"],
);
console.log(
  "PASS: qualification parity, early exits, required identity and optional logistics, all required fields, choice validation, length bounds and duplicate services",
);

for (const key of ["firstName", "lastName", "email", "phone"]) {
  for (const empty of ["", "   ", undefined]) {
    for (const [rule, answer] of Object.entries(rejectionRules)) {
      assert.throws(() => validateSubmission({ ...base, [rule]: answer, [key]: empty }));
    }
  }
}
for (const phone of ["+++++++", "+( )....", "202555014", "+1234567890123456"]) {
  assert.throws(() => validateSubmission({ ...base, phone }));
}
for (const phone of ["7208109892", "17208109892", "+17208109892", "(720) 810-9892", "1 (720) 810-9892"]) {
  assert.equal(validateSubmission({ ...base, phone }).phone, "+17208109892");
}
const { contactStep } = require(require("node:path").join(process.env.SAVVY_TEST_OUTPUT, "intake.js"));
assert.equal(contactStep({}), 0);
assert.equal(contactStep({ ...base, email: "" }), 1);
assert.equal(contactStep({ ...base, phone: "" }), 2);
assert.equal(contactStep(base), null);
console.log("PASS: all disqualification branches require contact details; US-default phone normalization; legacy draft recovery");
