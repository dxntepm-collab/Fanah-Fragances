import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

const COOKIE_NAME = "fanah_sid";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      sessionId: string;
    }
  }
}

export function sessionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let sid = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (!sid) {
    sid = crypto.randomBytes(24).toString("hex");
    res.cookie(COOKIE_NAME, sid, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 90,
      path: "/",
    });
  }
  req.sessionId = sid;
  next();
}
