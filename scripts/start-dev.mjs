#!/usr/bin/env node

/**
 * Development server manager
 * Starts both API and frontend servers with auto-restart capability
 */

import { spawn, exec } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import http from "http";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = {
  api: {
    port: 3000,
    dir: join(__dirname, "artifacts/api-server"),
    command: "pnpm",
    args: ["dev"],
    healthUrl: "http://localhost:3000/api/health",
    name: "API Server",
  },
  frontend: {
    port: 5173,
    dir: join(__dirname, "artifacts/decants-shop"),
    command: "pnpm",
    args: ["dev"],
    healthUrl: "http://localhost:5173/",
    name: "Frontend Server",
  },
};

const processes = {};
const logs = {};

function log(service, message, type = "info") {
  const colors = {
    info: "\x1b[36m", // cyan
    success: "\x1b[32m", // green
    warn: "\x1b[33m", // yellow
    error: "\x1b[31m", // red
  };
  const reset = "\x1b[0m";
  const color = colors[type] || colors.info;
  const timestamp = new Date().toLocaleTimeString();
  console.log(
    `${color}[${timestamp}] ${service}${reset} ${message}`
  );
}

function startServer(service, config) {
  log(config.name, `Starting...`, "info");

  const proc = spawn(config.command, config.args, {
    cwd: config.dir,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });

  proc.stdout.on("data", (data) => {
    const output = data.toString().trim();
    if (output) log(config.name, output, "info");
  });

  proc.stderr.on("data", (data) => {
    const output = data.toString().trim();
    if (output) log(config.name, output, "warn");
  });

  proc.on("close", (code) => {
    if (code !== 0) {
      log(config.name, `Crashed with code ${code}. Restarting...`, "error");
      setTimeout(() => startServer(service, config), 2000);
    }
  });

  processes[service] = proc;
  return proc;
}

async function checkHealth(url) {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      })
      .on("error", () => resolve(false))
      .setTimeout(3000);
  });
}

async function waitForServer(config, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const healthy = await checkHealth(config.healthUrl);
    if (healthy) {
      log(config.name, `✅ Ready!`, "success");
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  log(config.name, `⚠️  Health check timeout`, "warn");
  return false;
}

function cleanup() {
  log("System", "Shutting down...", "info");
  Object.values(processes).forEach((proc) => {
    if (proc && !proc.killed) {
      proc.kill("SIGTERM");
    }
  });
  setTimeout(() => process.exit(0), 1000);
}

async function main() {
  // Kill existing processes on ports
  for (const port of [3000, 5173]) {
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
      if (stdout) {
        const match = stdout.match(/(\d+)/);
        if (match) {
          exec(`taskkill /PID ${match[1]} /F`, () => {});
        }
      }
    });
  }

  log("System", "🚀 Fanah Fragances Development Environment", "success");
  log("System", "========================================", "success");

  // Start servers
  startServer("api", config.api);
  startServer("frontend", config.frontend);

  // Wait for servers to be ready
  await Promise.all([
    waitForServer(config.api),
    waitForServer(config.frontend),
  ]);

  log("System", "========================================", "success");
  log("System", "🎉 All servers ready!", "success");
  log("System", "========================================", "success");
  log("System", "", "info");
  log("System", "📍 Access the application at:", "info");
  log("System", "   🏪 Frontend: http://localhost:5173", "info");
  log("System", "   🔐 Admin Panel: http://localhost:5173/admin/login", "info");
  log("System", "   🔑 Admin Password: Lujo14", "warn");
  log("System", "   🛠️  API: http://localhost:3000", "info");
  log("System", "", "info");
  log("System", "Press Ctrl+C to stop all servers", "info");
}

// Handle signals
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

main();
