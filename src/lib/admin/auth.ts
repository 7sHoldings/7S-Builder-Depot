import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

// Admin sign-in: one shared password, set as ADMIN_PASSWORD in Vercel.
// After signing in, the browser keeps a signed cookie for 7 days.
// Changing ADMIN_PASSWORD signs everyone out.

export const ADMIN_COOKIE = "7s_admin";
const SESSION_DAYS = 7;
export const MIN_PASSWORD_LENGTH = 10;

export type AdminSetup = "ok" | "missing" | "too_short";

export function adminSetup(): AdminSetup {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return "missing";
  if (pw.length < MIN_PASSWORD_LENGTH) return "too_short";
  return "ok";
}

function key(): Buffer | null {
  if (adminSetup() !== "ok") return null;
  return createHash("sha256").update(`7s-admin-session-v1:${process.env.ADMIN_PASSWORD}`).digest();
}

function sign(payload: string, k: Buffer) {
  return createHmac("sha256", k).update(payload).digest("base64url");
}

function same(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export function passwordMatches(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (adminSetup() !== "ok" || !pw) return false;
  return same(input, pw);
}

export function newSessionToken(): { value: string; maxAge: number } {
  const k = key();
  if (!k) throw new Error("Admin password is not set");
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const payload = String(Math.floor(Date.now() / 1000) + maxAge);
  return { value: `${payload}.${sign(payload, k)}`, maxAge };
}

export function tokenIsValid(token: string | undefined): boolean {
  const k = key();
  if (!k || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !/^\d+$/.test(payload)) return false;
  if (!same(sig, sign(payload, k))) return false;
  return Number(payload) > Date.now() / 1000;
}

export async function isAdmin(): Promise<boolean> {
  await connection(); // always checked per request, never prerendered
  return tokenIsValid((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
