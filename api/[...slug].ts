import app from "../artifacts/api-server/src/app";

// Vercel serverless functions provide a Node.js request/response object.
// Express apps can be invoked directly as request handlers.
export default function handler(req: unknown, res: unknown) {
  return app(req as any, res as any);
}
