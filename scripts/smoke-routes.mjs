import { spawn } from "node:child_process";

const baseUrl = new URL(process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000");
const routes = (process.env.SMOKE_ROUTES ?? "/,/login,/dashboard,/instructor/dashboard")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);
const startupTimeoutMs = Number(process.env.SMOKE_STARTUP_TIMEOUT_MS ?? 30000);
const requestTimeoutMs = Number(process.env.SMOKE_REQUEST_TIMEOUT_MS ?? 10000);

let devServer;

async function fetchRoute(pathname) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const url = new URL(pathname, baseUrl);
    return await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function canReachServer() {
  try {
    const response = await fetchRoute("/");
    return response.status < 500;
  } catch {
    return false;
  }
}

function startDevServer() {
  const args = [
    "run",
    "dev",
    "--",
    "--hostname",
    baseUrl.hostname,
    "--port",
    baseUrl.port || "3000",
  ];

  devServer = spawn("npm", args, {
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  devServer.stdout.on("data", (chunk) => process.stdout.write(chunk));
  devServer.stderr.on("data", (chunk) => process.stderr.write(chunk));
}

async function waitForServer() {
  const deadline = Date.now() + startupTimeoutMs;

  while (Date.now() < deadline) {
    if (await canReachServer()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Dev server did not become reachable at ${baseUrl.origin}`);
}

async function smokeRoutes() {
  const serverAlreadyRunning = await canReachServer();

  if (!serverAlreadyRunning) {
    startDevServer();
    await waitForServer();
  }

  const failures = [];

  for (const route of routes) {
    try {
      const response = await fetchRoute(route);
      const ok = response.status >= 200 && response.status < 400;
      console.log(`${ok ? "PASS" : "FAIL"} ${route} ${response.status}`);

      if (!ok) {
        failures.push(`${route} returned ${response.status}`);
      }
    } catch (error) {
      console.log(`FAIL ${route} ${error instanceof Error ? error.message : String(error)}`);
      failures.push(`${route} failed to fetch`);
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.join("; "));
  }
}

try {
  await smokeRoutes();
} finally {
  if (devServer) {
    devServer.kill("SIGTERM");
  }
}
