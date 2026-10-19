"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminSetup, newSessionToken, passwordMatches } from "@/lib/admin/auth";

// Slow down password guessing: after 5 wrong tries from one address, wait 15 minutes.
const failures = new Map<string, { n: number; until: number }>();
const MAX_TRIES = 5;
const LOCK_MS = 15 * 60 * 1000;

export type LoginState = { error?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  if (adminSetup() !== "ok") return { error: "Admin sign-in isn't set up yet. Add ADMIN_PASSWORD in Vercel (see instructions above)." };

  const ip = ((await headers()).get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const now = Date.now();
  const f = failures.get(ip);
  if (f && f.n >= MAX_TRIES && f.until > now) {
    return { error: "Too many wrong passwords. Please wait 15 minutes and try again." };
  }

  const password = String(form.get("password") ?? "");
  if (!passwordMatches(password)) {
    const n = f && f.until > now ? f.n + 1 : 1;
    failures.set(ip, { n, until: now + LOCK_MS });
    await new Promise((r) => setTimeout(r, 800));
    return { error: "That password isn't right." };
  }

  failures.delete(ip);
  const { value, maxAge } = newSessionToken();
  (await cookies()).set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
