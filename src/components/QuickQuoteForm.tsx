"use client";

import Link from "next/link";
import { useState } from "react";
import { postJson } from "@/lib/api";
import { openEmail, storeMailto } from "@/lib/mailto";
import { site } from "@/lib/site";
import { Honeypot } from "./Honeypot";

const field = "h-12 border border-[#4b5563] bg-[#27323d] px-3 font-normal text-white placeholder:text-[#9aa3ab] focus:border-glow focus:outline-none";

const projectToMaterial: Record<string, string[]> = {
  "Flooring (vinyl)": ["vinyl"],
  Doors: ["doors"],
  Windows: ["windows"],
  Tile: ["tile"],
  "Multiple / full remodel": ["vinyl", "doors", "windows", "tile"],
};

type Result = { kind: "saved"; reference: string } | { kind: "email"; mailto: string };

export function QuickQuoteForm() {
  const [result, setResult] = useState<Result | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError("");
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const project = get("project");

    const res = await postJson<{ reference: string }>("/api/quotes", {
      source: "home_page",
      name: get("name"),
      phone: get("phone"),
      materials: projectToMaterial[project] ?? [],
      details: [`Project: ${project}`, get("details")].filter(Boolean).join("\n"),
      website: get("website"),
    });
    setSending(false);

    if (res.ok) {
      setResult({ kind: "saved", reference: res.data.reference });
      return;
    }
    if (!res.fallback) {
      setError(res.message);
      return;
    }
    const mailto = storeMailto(`Quote request from ${get("name")}`, [
      `Name: ${get("name")}`,
      `Phone: ${get("phone")}`,
      `Project: ${project}`,
      "",
      "Details:",
      get("details"),
    ]);
    openEmail(mailto);
    setResult({ kind: "email", mailto });
  }

  if (result) {
    return (
      <div className="flex flex-[1_1_480px] flex-col justify-center gap-3 border border-[#4b5563] bg-[#27323d] p-8" role="status">
        {result.kind === "saved" ? (
          <>
            <span className="font-display text-3xl font-bold uppercase">Request received</span>
            <p className="text-night-text">
              Thanks! Your reference is <strong className="text-white">{result.reference}</strong>. We&apos;ll call you within 1 business day.
            </p>
          </>
        ) : (
          <>
            <span className="font-display text-3xl font-bold uppercase">Almost done</span>
            <p className="text-night-text">
              Your email app opened with your request filled in — just press <strong className="text-white">Send</strong>. If nothing opened,{" "}
              <a className="text-white underline" href={result.mailto}>
                click here
              </a>{" "}
              or call {site.phone}.
            </p>
          </>
        )}
        <button type="button" onClick={() => setResult(null)} className="self-start py-2 font-semibold text-glow underline">
          Start another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid flex-[1_1_480px] grid-cols-1 gap-4 sm:grid-cols-2">
      <Honeypot />
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Name
        <input name="name" required autoComplete="name" className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold">
        Phone
        <input name="phone" type="tel" required autoComplete="tel" className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
        Project type
        <select name="project" className={field}>
          {Object.keys(projectToMaterial).map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
        Details &amp; measurements
        <textarea name="details" rows={4} maxLength={4000} className={`${field} h-auto resize-y py-3`} />
      </label>
      {error && (
        <p role="alert" className="font-semibold text-glow sm:col-span-2">
          {error}
        </p>
      )}
      <button type="submit" disabled={sending} className="h-[52px] bg-brand text-[17px] font-semibold text-white hover:bg-brand-dark disabled:opacity-60 sm:col-span-2">
        {sending ? "Sending…" : "Send quote request"}
      </button>
      <p className="text-sm text-night-text sm:col-span-2">
        Need more room? Use the{" "}
        <Link href="/quote" className="text-white underline">
          full quote form
        </Link>
        .
      </p>
    </form>
  );
}
