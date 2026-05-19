import { mkdir, rename, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";

const workflow = process.env.HOSTED_CI_WORKFLOW ?? "local-release-validation.yml";
const workflowPath = resolve(process.env.HOSTED_CI_WORKFLOW_PATH ?? ".github/workflows/local-release-validation.yml");
const reportPath = resolve(process.env.HOSTED_CI_PROOF_REPORT ?? "reports/hosted-ci-proof.json");
const runLimit = process.env.HOSTED_CI_RUN_LIMIT ?? "10";

function redact(text) {
  return text.replace(/[A-Za-z0-9_=-]{32,}/g, "[redacted]").slice(-4000);
}

function runCommand(command, args) {
  return new Promise((resolveCommand) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      resolveCommand({
        status: "failed",
        exitCode: null,
        error: error instanceof Error ? error.message : String(error),
        stdout,
        stderr,
      });
    });

    child.on("close", (exitCode) => {
      resolveCommand({
        status: exitCode === 0 ? "passed" : "failed",
        exitCode,
        stdout,
        stderr,
      });
    });
  });
}

function normalizeRun(run) {
  return {
    databaseId: typeof run.databaseId === "number" ? run.databaseId : null,
    status: typeof run.status === "string" ? run.status : null,
    conclusion: typeof run.conclusion === "string" ? run.conclusion : null,
    event: typeof run.event === "string" ? run.event : null,
    headBranch: typeof run.headBranch === "string" ? run.headBranch : null,
    headSha: typeof run.headSha === "string" ? run.headSha : null,
    displayTitle: typeof run.displayTitle === "string" ? run.displayTitle : null,
    createdAt: typeof run.createdAt === "string" ? run.createdAt : null,
    updatedAt: typeof run.updatedAt === "string" ? run.updatedAt : null,
    url: typeof run.url === "string" ? run.url : null,
  };
}

function compareRunRecency(left, right) {
  const leftTime = left.updatedAt ? Date.parse(left.updatedAt) : 0;
  const rightTime = right.updatedAt ? Date.parse(right.updatedAt) : 0;
  return rightTime - leftTime;
}

function buildReport({ generatedAt, query, runs, blockers, status }) {
  const normalizedRuns = runs.map(normalizeRun).sort(compareRunRecency);
  const successfulRun = normalizedRuns.find((run) => run.status === "completed" && run.conclusion === "success") ?? null;
  const finalStatus = status ?? (successfulRun ? "passed" : "blocked");
  const finalBlockers = successfulRun ? blockers : blockers.length > 0 ? blockers : ["no_successful_hosted_ci_run_found"];

  return {
    schemaVersion: 1,
    generatedAt,
    status: finalStatus,
    scope: "hosted-ci-read-only-proof",
    workflow,
    workflowPath,
    nonGoals: [
      "No workflow run is triggered.",
      "No repository, deployment, or provider state is mutated.",
      "No hosted provider credentials are required beyond read-only GitHub CLI access.",
    ],
    query,
    evidence: successfulRun,
    recentRuns: normalizedRuns,
    blockers: finalStatus === "passed" ? [] : finalBlockers,
  };
}

async function writeReport(report) {
  const tempPath = `${reportPath}.tmp`;
  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(tempPath, `${JSON.stringify(report, null, 2)}\n`);
  await rename(tempPath, reportPath);
}

async function main() {
  const generatedAt = new Date().toISOString();

  try {
    await stat(workflowPath);
  } catch {
    const report = buildReport({
      generatedAt,
      query: null,
      runs: [],
      blockers: ["workflow_file_missing"],
      status: "blocked",
    });
    await writeReport(report);
    console.log(`Hosted CI proof ${report.status}; report written to ${reportPath}`);
    return;
  }

  const args = [
    "run",
    "list",
    "--workflow",
    workflow,
    "--limit",
    runLimit,
    "--json",
    "databaseId,status,conclusion,headBranch,headSha,event,createdAt,updatedAt,url,displayTitle",
  ];
  const result = await runCommand("gh", args);
  const command = ["gh", ...args].join(" ");

  if (result.status !== "passed") {
    const report = buildReport({
      generatedAt,
      query: {
        command,
        status: "failed",
        exitCode: result.exitCode,
        error: result.error ?? null,
        stdoutTail: redact(result.stdout),
        stderrTail: redact(result.stderr),
      },
      runs: [],
      blockers: [result.exitCode === null ? "gh_cli_unavailable" : "gh_run_list_unavailable_or_unauthorized"],
      status: "blocked",
    });
    await writeReport(report);
    console.log(`Hosted CI proof ${report.status}; report written to ${reportPath}`);
    return;
  }

  try {
    const runs = JSON.parse(result.stdout);
    const report = buildReport({
      generatedAt,
      query: {
        command,
        status: "passed",
        exitCode: result.exitCode,
      },
      runs: Array.isArray(runs) ? runs : [],
      blockers: Array.isArray(runs) ? [] : ["gh_run_list_json_not_array"],
      status: Array.isArray(runs) ? undefined : "failed",
    });
    await writeReport(report);
    console.log(`Hosted CI proof ${report.status}; report written to ${reportPath}`);

    if (report.status === "failed") {
      process.exitCode = 1;
    }
  } catch (error) {
    const report = buildReport({
      generatedAt,
      query: {
        command,
        status: "failed",
        exitCode: result.exitCode,
        error: error instanceof Error ? error.message : String(error),
        stdoutTail: redact(result.stdout),
        stderrTail: redact(result.stderr),
      },
      runs: [],
      blockers: ["gh_run_list_invalid_json"],
      status: "failed",
    });
    await writeReport(report);
    console.log(`Hosted CI proof ${report.status}; report written to ${reportPath}`);
    process.exitCode = 1;
  }
}

await main();
