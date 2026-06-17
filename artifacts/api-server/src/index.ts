import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from .env.local (if it exists in development)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

dotenv.config({
  path: path.resolve(__dirname, "../.env.local"),
  override: true,
});

import app from "./app";
import { logger } from "./lib/logger";

// Validate required environment variables
const requiredEnvVars = ["SESSION_SECRET"];
const missingRequiredVars = requiredEnvVars.filter((v) => !process.env[v]);
const optionalEnvVars = ["ADMIN_USERNAME", "ADMIN_PASSWORD"];
const missingOptionalVars = optionalEnvVars.filter((v) => !process.env[v]);

if (missingRequiredVars.length > 0) {
  console.warn(
    `Missing required environment variables: ${missingRequiredVars.join(", ")}. ` +
      `Using fallback defaults is not recommended for production. Set them in Vercel dashboard or .env.local file.`,
  );
}

if (missingOptionalVars.length > 0) {
  console.warn(
    `Missing optional environment variables: ${missingOptionalVars.join(", ")}. ` +
      `Using built-in defaults for admin credentials. Set them in Vercel dashboard or .env.local file.`,
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
