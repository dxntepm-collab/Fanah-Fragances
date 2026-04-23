import type { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

const ADMIN_COOKIE = "fanah_admin";

function secret(): string {
  return process.env.SESSION_SECRET || "fanah-dev-secret";
}

export function adminToken(): string {
  return crypto.createHmac("sha256", secret()).update("admin:v1").digest("hex");
}

export function isAdminPassword(pwd: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  if (pwd.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(pwd), Buffer.from(expected));
}

export function setAdminCookie(res: Response) {
  res.cookie(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 30,
    path: "/",
  });
}

export function clearAdminCookie(res: Response) {
  res.clearCookie(ADMIN_COOKIE, { path: "/" });
}

export function isAuthenticated(req: Request): boolean {
  const token = req.cookies?.[ADMIN_COOKIE] as string | undefined;
  if (!token) return false;
  const expected = adminToken();
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!isAuthenticated(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}
