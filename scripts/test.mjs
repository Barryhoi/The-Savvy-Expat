import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
const output = mkdtempSync(join(tmpdir(), "savvy-tests-"));
try {
  execFileSync(
    process.execPath,
    [
      "node_modules/typescript/bin/tsc",
      "lib/intake.ts",
      "lib/webhook-signature.ts",
      "lib/booking-confirmation.ts",
      "lib/intake-abandonment.ts",
      "lib/booking-sync.ts",
      "lib/native-booking.ts",
      "lib/setting-validation.ts",
      "lib/timezones.ts",
      "--outDir",
      output,
      "--module",
      "commonjs",
      "--target",
      "es2020",
      "--resolveJsonModule",
      "--esModuleInterop",
      "--skipLibCheck",
    ],
    { stdio: "inherit" },
  );
  for (const file of ["intake", "webhook-signature", "booking-confirmation", "intake-abandonment", "booking-status", "intake-status", "native-booking", "setting-validation", "timezones"])
    execFileSync(process.execPath, [`tests/${file}.test.cjs`], {
      stdio: "inherit",
      env: { ...process.env, SAVVY_TEST_OUTPUT: output },
    });
} finally {
  rmSync(output, { recursive: true, force: true });
}
