import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env.local (if it exists in development)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "../.env.local");
dotenv.config({ path: envPath, override: true });

import app from "./app";
import { logger } from "./lib/logger";

// Validate required environment variables
const requiredEnvVars = [
  "ADMIN_PASSWORD",
  "SESSION_SECRET",
];

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  throw new Error(
    `Missing critical environment variables: ${missingVars.join(", ")}. ` +
    `Set them in Vercel dashboard or .env.local file.`,
  );
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
