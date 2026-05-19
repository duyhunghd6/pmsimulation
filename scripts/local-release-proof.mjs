import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

const reportPath = resolve(process.env.LOCAL_RELEASE_PROOF_REPORT ?? "reports/local-release-proof.json");

const checks = [
  {
    name: "validate:quick",
    command: "npm",
    args: ["run", "validate:quick"],
  },
  {
    name: "smoke:routes",
    command: "npm",
    args: ["run", "smoke:routes"],
  },
  {
    name: "build",
    command: "npm",
    args: ["run", "build"],
  },
];

function runCheck(check) {
  const startedAt = new Date();

  return new Promise((resolveCheck) => {
    const child = spawn(check.command, check.args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      process.stdout.write(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(text);
    });

    child.on("error", (error) => {
      const finishedAt = new Date();
      resolveCheck({
        name: check.name,
        command: [check.command, ...check.args].join(" "),
        status: "failed",
        exitCode: null,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        error: error instanceof Error ? error.message : String(error),
        stdoutTail: stdout.slice(-4000),
        stderrTail: stderr.slice(-4000),
      });
    });

    child.on("close", (exitCode) => {
      const finishedAt = new Date();
      resolveCheck({
        name: check.name,
        command: [check.command, ...check.args].join(" "),
        status: exitCode === 0 ? "passed" : "failed",
        exitCode,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        stdoutTail: stdout.slice(-4000),
        stderrTail: stderr.slice(-4000),
      });
    });
  });
}

async function writeReport(report) {
  const tempPath = `${reportPath}.tmp`;
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(tempPath, `${JSON.stringify(report, null, 2)}\n`);
  await rename(tempPath, reportPath);
}

const startedAt = new Date();
const results = [];
let failed = false;

for (const check of checks) {
  const result = await runCheck(check);
  results.push(result);

  if (result.status !== "passed") {
    failed = true;
    break;
  }
}

const finishedAt = new Date();
const report = {
  schemaVersion: 1,
  generatedAt: finishedAt.toISOString(),
  status: failed ? "failed" : "passed",
  scope: "local-bounded-release-proof",
  nonGoals: [
    "No deployment is created.",
    "No hosted provider credentials are required.",
    "No CI or shared platform state is mutated.",
  ],
  startedAt: startedAt.toISOString(),
  finishedAt: finishedAt.toISOString(),
  durationMs: finishedAt.getTime() - startedAt.getTime(),
  checks: results,
};

await writeReport(report);
console.log(`Local release proof ${report.status}; report written to ${reportPath}`);

if (failed) {
  process.exitCode = 1;
}
