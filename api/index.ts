import app from "../artifacts/api-server/src/app";

export default function handler(req: unknown, res: unknown) {
  return app(req as any, res as any);
}
