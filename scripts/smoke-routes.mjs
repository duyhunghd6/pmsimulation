import { spawn } from "node:child_process";

const baseUrl = new URL(process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000");
const routes = (process.env.SMOKE_ROUTES ?? "/,/login,/dashboard,/instructor/dashboard")
  .split(",")
  .map((route) => route.trim())
  .filter(Boolean);
const startupTimeoutMs = Number(process.env.SMOKE_STARTUP_TIMEOUT_MS ?? 30000);
const requestTimeoutMs = Number(process.env.SMOKE_REQUEST_TIMEOUT_MS ?? 10000);

const routeExpectations = new Map([
  [
    "/",
    {
      content: ["Portfolio simulation shell", "Login boundary", "Student route group", "Instructor route group"],
    },
  ],
  [
    "/login",
    {
      content: ["Sign in boundary", "browser-safe public environment values"],
    },
  ],
  [
    "/dashboard",
    {
      redirectTo: "/login?status=sign-in-required",
      contentAny: ["Auth configuration required", "Protected dashboard waiting for session", "Apex Alpha command center"],
    },
  ],
  [
    "/instructor/dashboard",
    {
      redirectTo: "/login?status=sign-in-required",
      contentAny: ["Auth configuration required", "Protected dashboard waiting for session", "Class order monitor"],
    },
  ],
]);

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

function normalizeRoute(pathname) {
  const url = new URL(pathname, baseUrl);
  return `${url.pathname}${url.search}`;
}

function normalizeLocation(location) {
  if (!location) {
    return null;
  }

  const url = new URL(location, baseUrl);
  return `${url.pathname}${url.search}`;
}

async function assertRouteExpectation(route, response) {
  const expectation = routeExpectations.get(normalizeRoute(route));

  if (!expectation) {
    return "status only";
  }

  if (response.status >= 300 && response.status < 400) {
    if (!expectation.redirectTo) {
      throw new Error(`${route} redirected unexpectedly`);
    }

    const location = normalizeLocation(response.headers.get("location"));

    if (location !== expectation.redirectTo) {
      throw new Error(`${route} redirected to ${location ?? "missing location"} instead of ${expectation.redirectTo}`);
    }

    return `redirect ${location}`;
  }

  const body = await response.text();

  for (const snippet of expectation.content ?? []) {
    if (!body.includes(snippet)) {
      throw new Error(`${route} did not render expected content: ${snippet}`);
    }
  }

  if (expectation.contentAny && !expectation.contentAny.some((snippet) => body.includes(snippet))) {
    throw new Error(`${route} did not render any accepted protected-surface state`);
  }

  return "content checked";
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
      const proof = ok ? await assertRouteExpectation(route, response) : "status failed";
      console.log(`${ok ? "PASS" : "FAIL"} ${route} ${response.status} ${proof}`);

      if (!ok) {
        failures.push(`${route} returned ${response.status}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`FAIL ${route} ${message}`);
      failures.push(`${route} ${message}`);
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
