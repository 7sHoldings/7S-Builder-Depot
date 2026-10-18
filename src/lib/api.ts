"use client";

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; fallback: boolean; message: string };

/** POST JSON to one of our API routes.
 *  `fallback: true` means the database isn't available, so the caller should
 *  use the email fallback instead of showing an error. */
export async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
    if (res.ok) return { ok: true, data };
    if (res.status === 400) return { ok: false, fallback: false, message: data.error ?? "Please check the form and try again." };
    return { ok: false, fallback: true, message: data.error ?? "server_error" };
  } catch {
    return { ok: false, fallback: true, message: "network_error" };
  }
}
