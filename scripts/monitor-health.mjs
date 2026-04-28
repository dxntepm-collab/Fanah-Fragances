#!/usr/bin/env node

/**
 * Health Monitor for Fanah Fragances Development
 * Continuously checks if servers are running and sends alerts
 */

import http from "http";
import { exec } from "child_process";

const PORTS = {
  api: 3000,
  frontend: 5173,
};

const URLS = {
  api: "http://localhost:3000/api/health",
  frontend: "http://localhost:5173/",
};

let statusCache = {
  api: null,
  frontend: null,
};

function checkHealth(url) {
  return new Promise((resolve) => {
    http
      .get(url, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 400);
      })
      .on("error", () => resolve(false))
      .setTimeout(2000);
  });
}

function log(message, type = "info") {
  const now = new Date().toLocaleTimeString();
  const icons = {
    info: "ℹ️ ",
    success: "✅",
    error: "❌",
    warn: "⚠️ ",
  };
  console.log(`${icons[type]} [${now}] ${message}`);
}

async function monitor() {
  log("Starting health monitor...", "info");

  setInterval(async () => {
    const apiHealth = await checkHealth(URLS.api);
    const frontendHealth = await checkHealth(URLS.frontend);

    // API Server
    if (apiHealth !== statusCache.api) {
      statusCache.api = apiHealth;
      if (apiHealth) {
        log("API Server (port 3000) is UP", "success");
      } else {
        log("API Server (port 3000) is DOWN ⚠️", "error");
        log(
          "💡 Start it with: pnpm dev:api or pnpm dev:managed",
          "warn"
        );
      }
    }

    // Frontend
    if (frontendHealth !== statusCache.frontend) {
      statusCache.frontend = frontendHealth;
      if (frontendHealth) {
        log("Frontend (port 5173) is UP", "success");
      } else {
        log("Frontend (port 5173) is DOWN ⚠️", "error");
        log(
          "💡 Start it with: pnpm dev:frontend or pnpm dev:managed",
          "warn"
        );
      }
    }

    // Overall status
    if (apiHealth && frontendHealth) {
      log("✅ All systems operational!", "success");
    } else if (!apiHealth || !frontendHealth) {
      log("🚨 WARNING: Some services are not running!", "error");
    }
  }, 5000);
}

monitor();

// Keep process alive
process.on("SIGINT", () => {
  log("Monitor stopped", "info");
  process.exit(0);
});
