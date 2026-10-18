"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { categories } from "@/lib/catalog";
import { postJson } from "@/lib/api";
import { openEmail, storeMailto } from "@/lib/mailto";
import { site } from "@/lib/site";
import { Honeypot } from "./Honeypot";
import { CheckIcon } from "./Icons";

const steps = ["Project", "Details", "Contact", "Done"];
const input = "h-12 border border-line-strong bg-surface px-3 font-normal focus:border-ink focus:outline-none";
const labelCls = "flex flex-col gap-1.5 text-sm font-semibold";

export function QuoteWizard() {
  const [step, setStep] = useState(1);
  const [picked, setPicked] = useState<string[]>(["vinyl"]);
  const [error, setError] = useState("");
  const [mailto, setMailto] = useState("");
  const [reference, setReference] = useState("");
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  function go(n: number) {
    setStep(n);
    setError("");
    window.requestAnimationFrame(() => headingRef.current?.focus());
  }

  function next() {
    const form = formRef.current!;
    if (step === 1 && picked.length === 0) {
      setError("Pick at least one type of material.");
      return;
    }
    // Validate only the fields on the current step
    const fields = Array.from(form.querySelectorAll<HTMLInputElement>(`[data-step="${step}"] [required]`));
    const bad = fields.find((f) => !f.checkValidity());
    if (bad) {
      bad.reportValidity();
      return;
    }
    if (step < 3) {
      go(step + 1);
      return;
    }
    send(new FormData(form));
  }

  async function send(f: FormData) {
    if (sending) return;
    setSending(true);
    const get = (k: string) => String(f.get(k) ?? "").trim();
    const names = categories.filter((c) => picked.includes(c.id)).map((c) => c.name);

    const res = await postJson<{ reference: string }>("/api/quotes", {
      source: "quote_form",
      name: get("name"),
      company: get("company"),
      phone: get("phone"),
      email: get("email"),
      customerType: get("role"),
      materials: picked,
      area: get("area"),
      count: get("count"),
      timeline: get("timeline"),
      zip: get("zip"),
      details: get("details"),
      website: get("website"),
    });
    setSending(false);
    if (res.ok) {
      setReference(res.data.reference);
      go(4);
      return;
    }
    if (!res.fallback) {
      setError(res.message);
      return;
    }

    // Database unavailable → send through the customer's email app instead
    const link = storeMailto(`Quote request — ${get("name")} (${names.join(", ")})`, [
      `Name: ${get("name")}`,
      get("company") && `Company: ${get("company")}`,
      `Phone: ${get("phone")}`,
      `Email: ${get("email")}`,
      `Customer type: ${get("role")}`,
      "",
      `Materials: ${names.join(", ")}`,
      get("area") && `Flooring / tile area: ${get("area")} sq ft`,
      get("count") && `Doors / windows: ${get("count")}`,
      `Timeline: ${get("timeline")}`,
      get("zip") && `Project ZIP: ${get("zip")}`,
      "",
      "Details:",
      get("details") || "(none)",
      "",
      "(Attach plans or photos to this email if you have them.)",
    ]);
    setMailto(link);
    openEmail(link);
    go(4);
  }

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <>
      <ol aria-label="Progress" className="grid grid-cols-4 gap-2">
        {steps.map((label, i) => {
          const n = i + 1;
          return (
            <li key={label} className="flex flex-col gap-2 text-sm font-semibold" aria-current={n === step ? "step" : undefined}>
              <span className={`block h-1.5 ${n <= step ? "bg-brand" : "bg-line"}`} />
              <span className={n === step ? "text-ink" : "text-subtle"}>
                {n}. {label}
              </span>
            </li>
          );
        })}
      </ol>

      <form
        ref={formRef}
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
        className="relative flex flex-col gap-6 border border-line bg-surface p-6 sm:p-8"
      >
        <Honeypot />
        {/* Step 1 */}
        <div data-step="1" hidden={step !== 1} className="flex flex-col gap-4">
          <h2 ref={step === 1 ? headingRef : undefined} tabIndex={-1} className="font-display text-[30px] font-bold uppercase outline-none">
            What are you working on?
          </h2>
          <p className="-mt-2 text-muted">Pick everything that applies.</p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
            {categories.map((c) => {
              const on = picked.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(c.id)}
                  className={`flex min-h-24 flex-col items-start gap-1 border-2 p-[18px] text-left ${on ? "border-brand bg-brand-soft" : "border-line-strong bg-surface hover:border-ink"}`}
                >
                  <span className="font-display text-2xl font-bold uppercase">{c.name}</span>
                  <span className="text-sm text-muted">{c.blurb}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 */}
        <div data-step="2" hidden={step !== 2} className="flex flex-col gap-4">
          <h2 ref={step === 2 ? headingRef : undefined} tabIndex={-1} className="font-display text-[30px] font-bold uppercase outline-none">
            Project details
          </h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelCls}>
              Flooring / tile area (sq ft)
              <input name="area" type="number" min="0" inputMode="numeric" placeholder="e.g. 850" className={input} />
            </label>
            <label className={labelCls}>
              Number of doors / windows
              <input name="count" type="number" min="0" inputMode="numeric" placeholder="e.g. 6" className={input} />
            </label>
            <label className={labelCls}>
              When do you need materials?
              <select name="timeline" className={input}>
                <option>Within 1 week</option>
                <option>2–4 weeks</option>
                <option>1–3 months</option>
                <option>Just planning</option>
              </select>
            </label>
            <label className={labelCls}>
              Project ZIP code
              <input name="zip" inputMode="numeric" autoComplete="postal-code" placeholder="ZIP" className={input} />
            </label>
            <label className={`${labelCls} sm:col-span-2`}>
              Anything else?
              <textarea
                name="details"
                rows={4}
                placeholder="Room sizes, colors you like, door swing, window rough openings…"
                className={`${input} h-auto resize-y py-3`}
              />
            </label>
          </div>
          <p className="text-sm text-muted">Have plans or photos? You can email them to us after you send this request.</p>
        </div>

        {/* Step 3 */}
        <div data-step="3" hidden={step !== 3} className="flex flex-col gap-4">
          <h2 ref={step === 3 ? headingRef : undefined} tabIndex={-1} className="font-display text-[30px] font-bold uppercase outline-none">
            How do we reach you?
          </h2>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <label className={labelCls}>
              Full name
              <input name="name" required autoComplete="name" className={input} />
            </label>
            <label className={labelCls}>
              Company (optional)
              <input name="company" autoComplete="organization" className={input} />
            </label>
            <label className={labelCls}>
              Phone
              <input name="phone" type="tel" required autoComplete="tel" className={input} />
            </label>
            <label className={labelCls}>
              Email
              <input name="email" type="email" required autoComplete="email" className={input} />
            </label>
          </div>
          <fieldset className="flex flex-wrap gap-x-6 gap-y-2.5">
            <legend className="mb-2.5 text-sm font-semibold">I am a…</legend>
            {["Homeowner", "Contractor / builder", "Property manager"].map((r, i) => (
              <label key={r} className="flex items-center gap-2.5">
                <input type="radio" name="role" value={r} defaultChecked={i === 0} className="h-[18px] w-[18px] accent-brand" />
                {r}
              </label>
            ))}
          </fieldset>
        </div>

        {/* Step 4 */}
        {step === 4 && (
          <div className="flex flex-col items-center gap-3.5 py-6 text-center" role="status">
            <span className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-ok-soft text-ok">
              <CheckIcon size={36} />
            </span>
            <h2 ref={headingRef} tabIndex={-1} className="font-display text-[40px] font-bold uppercase outline-none">
              {reference ? "Request received" : "Almost done"}
            </h2>
            {reference ? (
              <p className="max-w-[520px] text-[17px] text-muted">
                Thanks! Your reference is <strong className="text-ink">{reference}</strong>. We&apos;ll reply with materials and pricing within 1 business day.
                Have plans or photos? Email them to {site.email} with your reference.
              </p>
            ) : (
              <>
                <p className="max-w-[520px] text-[17px] text-muted">
                  Your email app opened with your quote request filled in — <strong className="text-ink">press Send</strong> to submit it. We&apos;ll reply within
                  1 business day.
                </p>
                <a href={mailto} className="font-semibold text-brand-dark underline">
                  Email app didn&apos;t open? Click here
                </a>
              </>
            )}
            <p className="text-sm text-muted">
              Or email {site.email} · call {site.phone}
            </p>
            <Link href="/" className="mt-2 inline-flex h-[50px] items-center bg-brand px-7 font-semibold text-white no-underline hover:bg-brand-dark hover:text-white">
              Back to home
            </Link>
          </div>
        )}

        {error && step < 4 && (
          <p role="alert" className="font-semibold text-brand-dark">
            {error}
          </p>
        )}

        {step < 4 && (
          <div className="flex justify-between gap-3 border-t border-line pt-5">
            <button
              type="button"
              onClick={() => go(step - 1)}
              disabled={step === 1}
              className="h-[52px] border-2 border-ink bg-surface px-7 font-semibold disabled:border-line disabled:text-[#8a8d90]"
            >
              Back
            </button>
            <button type="submit" className="h-[52px] bg-brand px-8 text-[17px] font-semibold text-white hover:bg-brand-dark">
              {step === 3 ? (sending ? "Sending…" : "Send quote request") : "Continue"}
            </button>
          </div>
        )}
      </form>
    </>
  );
}
