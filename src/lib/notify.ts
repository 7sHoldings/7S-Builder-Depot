import "server-only";
import { site } from "./site";

// Optional email alerts to the store when an order or quote request comes in.
// Turned on by setting RESEND_API_KEY (from resend.com) in Vercel.
//   NOTIFY_EMAIL  – where alerts go (default: the store email in site.ts)
//   RESEND_FROM   – sender, must be on a domain verified in Resend
//                   (default: "7S Builder Depot <onboarding@resend.dev>", Resend's test sender)

export async function notifyStore(subject: string, lines: string[], replyTo?: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? `${site.name} <onboarding@resend.dev>`,
        to: [process.env.NOTIFY_EMAIL ?? site.email],
        reply_to: replyTo,
        subject,
        text: lines.join("\n"),
      }),
    });
    if (!res.ok) console.error("[notify] Resend returned", res.status, await res.text());
  } catch (err) {
    console.error("[notify] Could not send alert email", err);
  }
}
