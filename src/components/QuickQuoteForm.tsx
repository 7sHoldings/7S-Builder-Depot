"use client";

import Link from "next/link";
import { useState } from "react";
import { openEmail, storeMailto } from "@/lib/mailto";
import { site } from "@/lib/site";

const field = "h-12 border border-[#4b5563] bg-[#27323d] px-3 font-normal text-white placeholder:text-[#9aa3ab] focus:border-glow focus:outline-none";

export function QuickQuoteForm() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    openEmail(storeMailto(`Quote request from ${name}`, [
      `Name: ${name}`,
      `Phone: ${data.get("phone")}`,
      `Project: ${data.get("project")}`,
      "",
      "Details:",
      String(data.get("details") ?? ""),
    ]));
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-[1_1_480px] flex-col justify-center gap-3 border border-[#4b5563] bg-[#27323d] p-8" role="status">
        <span className="font-display text-3xl font-bold uppercase">Almost done</span>
        <p className="text-night-text">
          Your email app opened with your request filled in — just press <strong className="text-white">Send</strong>. If nothing opened, email us at{" "}
          <a className="text-white underline" href={`mailto:${site.email}`}>
            {site.email}
          </a>{" "}
          or call {site.phone}.
        </p>
        <button type="button" onClick={() => setSent(false)} className="self-start py-2 font-semibold text-glow underline">
          Start another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid flex-[1_1_480px] grid-cols-1 gap-4 sm:grid-cols-2">
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
          <option>Flooring (vinyl)</option>
          <option>Doors</option>
          <option>Windows</option>
          <option>Tile</option>
          <option>Multiple / full remodel</option>
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">
        Details &amp; measurements
        <textarea name="details" rows={4} className={`${field} h-auto resize-y py-3`} />
      </label>
      <button type="submit" className="h-[52px] bg-brand text-[17px] font-semibold text-white hover:bg-brand-dark sm:col-span-2">
        Send quote request
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
