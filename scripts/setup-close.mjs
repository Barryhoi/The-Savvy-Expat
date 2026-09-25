import fs from "node:fs";
const org = "orga_GNNtkPIRum2rVcOQHDflZjFNuJ9h6M2eNqbigggmHNM";
async function api(path, body) {
  const r = await fetch("https://api.close.com/api/v1/" + path, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(process.env.CLOSE_API_KEY + ":").toString("base64"),
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!r.ok) throw new Error("Close " + r.status + " " + (await r.text()));
  return r.json();
}
const me = await api("me/");
if (!me.organizations.some((o) => o.id === org))
  throw new Error("Wrong organization");
const definitions = {
  situation: ["Current situation", "text"],
  commitment: ["Relocation commitment", "text"],
  timeline: ["Relocation timeline", "text"],
  motivation: ["Reason for moving", "text"],
  services: ["Services requested", "text"],
  budget: ["Monthly living budget", "text"],
  funds: ["Liquid relocation funds", "text"],
  logistics: ["Outstanding logistics", "text"],
  obstacle: ["Biggest relocation obstacle", "text"],
  whyUs: ["Why The Savvy Expat", "text"],
  qualification: ["Application qualification", "text"],
  reason: ["Disqualification reason", "text"],
};
const retained = JSON.parse(fs.readFileSync("lib/close-fields.json", "utf8"));
const existing = (await api("custom_field/lead/")).data;
const fields = { ...retained.fields };
for (const [key, [name, type]] of Object.entries(definitions)) {
  let found = existing.filter((f) => f.name === name);
  if (found.length > 1) throw new Error("Ambiguous " + name);
  let field = found[0];
  if (field && field.type !== type) throw new Error("Wrong field type " + name);
  if (!field) {
    field = await api("custom_field/lead/", {
      name,
      type,
      description:
        "Savvy Expat website application and Calendly booking integration.",
      always_visible: true,
    });
    console.log("Created", name);
  }
  fields[key] = field.id;
}
fs.writeFileSync(
  "lib/close-fields.json",
  JSON.stringify(
    {
      ...retained,
      organizationId: org,
      fields,
      samUserId: "user_Z2ZjSckSmmwVcEZLIWRHPvNDgmEtHXTdSUC1HxPUXMV",
      potentialStatusId: "stat_XiWRvk1KLrzXAaOt9etX1BfzD4BIH79PnTtHLFEEIyK",
      bookedStatusId: "stat_RyvJceWWRIMzN6SNXcuM0oWe6da87x5IB5CX1BWTgBF",
      bookedOpportunityStatusId:
        "stat_EjTduP3gtHYbp94TyQQzidqmsKoCUBSXAML34mNW9WY",
    },
    null,
    2,
  ),
);
console.log("Mapped", Object.keys(fields).length, "fields");
