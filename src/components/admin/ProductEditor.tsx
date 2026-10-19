"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { deleteProduct, saveProduct } from "@/app/admin/actions";
import { autoVariantLabel, slugify, type EditorProduct, type EditorVariant } from "@/lib/admin/types";
import { categories, type CategoryId, type Visual } from "@/lib/catalog";
import { ProductImage } from "../ProductImage";

const input = "h-11 w-full border border-line-strong bg-surface px-3 text-[15px] font-normal focus:border-ink focus:outline-none";
const small = "h-10 w-full min-w-0 border border-line-strong bg-surface px-2 text-[15px] focus:border-ink focus:outline-none";
const labelCls = "flex flex-col gap-1.5 text-sm font-semibold";
const btn = "inline-flex h-10 items-center border-2 border-ink bg-surface px-4 text-sm font-semibold hover:bg-ground disabled:opacity-50";

const blankVariant = (): EditorVariant => ({ sku: "", label: "", widthIn: "", heightIn: "", swing: "", stock: "", price: "", image: "", active: true });

export function ProductEditor({ initial, knownTypes, created = false }: { initial: EditorProduct; knownTypes: string[]; created?: boolean }) {
  const router = useRouter();
  const [p, setP] = useState<EditorProduct>(initial);
  const [dirty, setDirty] = useState(false);
  const [saving, startSave] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(
    created ? { kind: "ok", text: initial.active ? "Product created — it's on the website now." : "Product created (hidden from the website)." } : null,
  );
  const editing = !!initial.originalSlug;
  const cat = categories.find((c) => c.id === p.category)!;

  function update(patch: Partial<EditorProduct>) {
    setP((cur) => ({ ...cur, ...patch }));
    setDirty(true);
    setMessage(null);
  }
  const setVariant = (i: number, patch: Partial<EditorVariant>) => update({ variants: p.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) });

  // Warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const slug = editing ? p.slug : p.slug || slugify(p.name);
  const types = knownTypes.filter((t) => t.startsWith(`${p.category}|`)).map((t) => t.split("|")[1]);
  const typeOptions = [...new Set([...cat.types, ...types])];

  function save() {
    startSave(async () => {
      const res = await saveProduct({ ...p, slug });
      if (!res.ok) {
        setMessage({ kind: "error", text: res.error });
        return;
      }
      // (a new product is redirected to its edit page by the server)
      setDirty(false);
      setMessage({ kind: "ok", text: "Saved — the website is updated." });
      router.refresh();
    });
  }

  function remove() {
    if (
      !window.confirm(`Delete “${p.name}” permanently? Past orders keep their details. To take it off the website for now, uncheck “Show on website” instead.`)
    )
      return;
    startSave(async () => {
      const res = await deleteProduct(initial.originalSlug!);
      if (res.ok) {
        setDirty(false);
        router.replace("/admin");
      } else setMessage({ kind: "error", text: res.error });
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 pb-32 pt-8 sm:px-6"
    >
      <div>
        <Link href={`/admin?cat=${p.category}`} className="text-sm text-subtle">
          ← All products
        </Link>
        <h1 className="mt-1 font-display text-[40px] font-bold uppercase leading-none">{editing ? p.name || "Edit product" : "Add product"}</h1>
      </div>

      <Section title="Basics">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={`${labelCls} sm:col-span-2`}>
            Product name *
            <input
              className={input}
              value={p.name}
              onChange={(e) => update({ name: e.target.value })}
              required
              maxLength={120}
              placeholder="e.g. 2-Panel Shaker Prehung Door"
            />
          </label>
          <label className={labelCls}>
            Category *
            <select
              className={input}
              value={p.category}
              onChange={(e) => {
                const c = e.target.value as CategoryId;
                const sqft = c === "vinyl" || c === "tile";
                update({ category: c, unit: sqft ? "sqft" : "each", sqftPerBox: sqft ? p.sqftPerBox || "20" : p.sqftPerBox });
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            Type * <span className="font-normal text-subtle">Used for the filter buttons on the category page</span>
            <input
              className={input}
              value={p.type}
              onChange={(e) => update({ type: e.target.value })}
              required
              maxLength={60}
              list="type-options"
              placeholder="e.g. Sliding"
            />
            <datalist id="type-options">
              {typeOptions.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </label>
          <label className={labelCls}>
            SKU *
            <input
              className={input}
              value={p.sku}
              onChange={(e) => update({ sku: e.target.value.toUpperCase() })}
              required
              maxLength={40}
              placeholder="e.g. 7S-DR-2P"
            />
          </label>
          <label className={labelCls}>
            Web address
            <input
              className={`${input} ${editing ? "bg-ground text-subtle" : ""}`}
              value={slug}
              readOnly={editing}
              onChange={(e) => update({ slug: slugify(e.target.value) })}
              placeholder="made from the name"
            />
            <span className="font-normal text-subtle">
              7sbuilderdepot.com/product/{slug || "…"}
              {editing ? " (can't be changed)" : ""}
            </span>
          </label>
        </div>
      </Section>

      <Section title="Price & stock">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className={labelCls}>
            Price ($)
            <input
              className={input}
              inputMode="decimal"
              value={p.price}
              onChange={(e) => update({ price: e.target.value })}
              placeholder="Leave empty = price on request"
            />
          </label>
          <label className={labelCls}>
            Sold
            <select className={input} value={p.unit} onChange={(e) => update({ unit: e.target.value as "sqft" | "each" })}>
              <option value="each">Per item</option>
              <option value="sqft">Per square foot (by the box)</option>
            </select>
          </label>
          {p.unit === "sqft" ? (
            <label className={labelCls}>
              Sq ft per box *
              <input
                className={input}
                inputMode="decimal"
                value={p.sqftPerBox}
                onChange={(e) => update({ sqftPerBox: e.target.value })}
                placeholder="e.g. 20"
              />
            </label>
          ) : (
            <span />
          )}
          {p.price.trim() === "" && (
            <label className={labelCls}>
              Text shown instead of a price
              <input
                className={input}
                value={p.priceNote}
                onChange={(e) => update({ priceNote: e.target.value })}
                placeholder="Price on request"
                maxLength={60}
              />
              <span className="font-normal text-subtle">Customers can request a quote but can&apos;t add it to the cart.</span>
            </label>
          )}
          {p.variants.length === 0 ? (
            <label className={labelCls}>
              Stock on hand
              <input
                className={input}
                inputMode="numeric"
                value={p.stock}
                onChange={(e) => update({ stock: e.target.value })}
                placeholder="Leave empty = don't track"
              />
            </label>
          ) : (
            <p className="self-end text-sm text-subtle sm:col-span-2">This product has sizes, so stock is set for each size below.</p>
          )}
        </div>
      </Section>

      <Section title="Photos" hint="The first photo is the main one. White or plain backgrounds look best. Photos are resized automatically.">
        <Photos images={p.images} onChange={(images) => update({ images })} visual={cat.visual} />
      </Section>

      <Section title="Description">
        <div className="flex flex-col gap-4">
          <label className={labelCls}>
            Short summary <span className="font-normal text-subtle">One line shown on product cards</span>
            <input className={input} value={p.summary} onChange={(e) => update({ summary: e.target.value })} maxLength={200} />
          </label>
          <label className={labelCls}>
            Full description
            <textarea
              className={`${input} h-auto resize-y py-2.5`}
              rows={5}
              value={p.description}
              onChange={(e) => update({ description: e.target.value })}
              maxLength={4000}
            />
          </label>
        </div>
      </Section>

      <Section title="Specifications" hint="Shown as a table on the product page, e.g. Material → PVC.">
        <div className="flex flex-col gap-2">
          {p.specs.map(([k, v], i) => (
            <div key={i} className="flex gap-2">
              <input
                className={`${small} max-w-[260px]`}
                aria-label={`Spec ${i + 1} name`}
                value={k}
                placeholder="Name, e.g. Glass"
                onChange={(e) => update({ specs: p.specs.map((s, j) => (j === i ? [e.target.value, s[1]] : s)) })}
              />
              <input
                className={small}
                aria-label={`Spec ${i + 1} value`}
                value={v}
                placeholder="Value, e.g. Low-E tempered"
                onChange={(e) => update({ specs: p.specs.map((s, j) => (j === i ? [s[0], e.target.value] : s)) })}
              />
              <IconBtn label="Move up" disabled={i === 0} onClick={() => update({ specs: move(p.specs, i, i - 1) })}>
                ↑
              </IconBtn>
              <IconBtn label="Remove" onClick={() => update({ specs: p.specs.filter((_, j) => j !== i) })}>
                ✕
              </IconBtn>
            </div>
          ))}
          <div>
            <button type="button" className={btn} onClick={() => update({ specs: [...p.specs, ["", ""]] })}>
              + Add specification
            </button>
          </div>
        </div>
      </Section>

      <Section
        title="Sizes & options"
        hint="Add a row for each size customers can choose. For doors, add one row per swing (right-hand / left-hand). Leave price empty to use the product price. Leave stock empty to not track it."
      >
        <Variants p={p} setVariant={setVariant} update={update} />
      </Section>

      <Section title="On the website">
        <div className="flex flex-wrap items-end gap-6">
          <Check checked={p.active} onChange={(active) => update({ active })} label="Show on website" />
          <Check checked={p.featured} onChange={(featured) => update({ featured })} label="Feature on home page" />
          <label className={`${labelCls} w-36`}>
            Sort order <span className="font-normal text-subtle">Lower shows first</span>
            <input className={input} inputMode="numeric" value={p.sortOrder} onChange={(e) => update({ sortOrder: e.target.value })} />
          </label>
        </div>
      </Section>

      {/* Save bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <button disabled={saving} className="h-12 bg-brand px-8 font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
          </button>
          {message ? (
            <p role={message.kind === "error" ? "alert" : "status"} className={`font-semibold ${message.kind === "error" ? "text-brand-dark" : "text-ok"}`}>
              {message.text}
            </p>
          ) : (
            dirty && <p className="text-sm text-subtle">Unsaved changes</p>
          )}
          <div className="ml-auto flex items-center gap-4">
            {editing && initial.active && (
              <a href={`/product/${initial.originalSlug}`} target="_blank" className="text-sm font-semibold">
                View on website ↗
              </a>
            )}
            {editing && (
              <button type="button" onClick={remove} disabled={saving} className="text-sm font-semibold text-brand-dark underline">
                Delete product
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- sizes

function Variants({
  p,
  setVariant,
  update,
}: {
  p: EditorProduct;
  setVariant: (i: number, patch: Partial<EditorVariant>) => void;
  update: (patch: Partial<EditorProduct>) => void;
}) {
  const [gen, setGen] = useState({ widths: "", heights: p.category === "doors" ? "80" : "", swings: p.category === "doors" });
  const isDoors = p.category === "doors";

  function generate() {
    const nums = (s: string) =>
      s
        .split(/[\s,]+/)
        .map((x) => x.replace(/"/g, ""))
        .filter((x) => x && Number(x) > 0);
    const ws = nums(gen.widths);
    const hs = nums(gen.heights);
    if (!ws.length || !hs.length) return;
    const have = new Set(p.variants.map((v) => `${Number(v.widthIn)}x${Number(v.heightIn)}${v.swing}`));
    const rows: EditorVariant[] = [];
    for (const h of hs)
      for (const w of ws)
        for (const s of gen.swings && isDoors ? (["RH", "LH"] as const) : ([""] as const)) {
          if (have.has(`${Number(w)}x${Number(h)}${s}`)) continue;
          rows.push({ ...blankVariant(), widthIn: w, heightIn: h, swing: s });
        }
    update({ variants: [...p.variants, ...rows] });
    setGen({ ...gen, widths: "" });
  }

  return (
    <div className="flex flex-col gap-4">
      {p.variants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="text-subtle">
              <tr>
                <th className="w-20 pb-2 pr-2 font-semibold">Width (in)</th>
                <th className="w-20 pb-2 pr-2 font-semibold">Height (in)</th>
                {isDoors && <th className="w-28 pb-2 pr-2 font-semibold">Swing</th>}
                <th className="pb-2 pr-2 font-semibold">Label shown to customers</th>
                <th className="w-20 pb-2 pr-2 font-semibold">Stock</th>
                <th className="w-24 pb-2 pr-2 font-semibold">Price ($)</th>
                <th className="w-32 pb-2 pr-2 font-semibold">Photo</th>
                <th className="w-16 pb-2 pr-2 font-semibold">Show</th>
                <th className="w-20 pb-2" />
              </tr>
            </thead>
            <tbody>
              {p.variants.map((v, i) => (
                <tr key={v.id ?? `new-${i}`} className={v.active ? "" : "opacity-60"}>
                  <td className="py-1 pr-2">
                    <input
                      className={small}
                      aria-label={`Row ${i + 1} width`}
                      inputMode="decimal"
                      value={v.widthIn}
                      onChange={(e) => setVariant(i, { widthIn: e.target.value })}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      className={small}
                      aria-label={`Row ${i + 1} height`}
                      inputMode="decimal"
                      value={v.heightIn}
                      onChange={(e) => setVariant(i, { heightIn: e.target.value })}
                    />
                  </td>
                  {isDoors && (
                    <td className="py-1 pr-2">
                      <select
                        className={small}
                        aria-label={`Row ${i + 1} swing`}
                        value={v.swing}
                        onChange={(e) => setVariant(i, { swing: e.target.value as EditorVariant["swing"] })}
                      >
                        <option value="">—</option>
                        <option value="RH">Right-hand</option>
                        <option value="LH">Left-hand</option>
                      </select>
                    </td>
                  )}
                  <td className="py-1 pr-2">
                    <input
                      className={small}
                      aria-label={`Row ${i + 1} label`}
                      value={v.label}
                      placeholder={autoVariantLabel(v) || "e.g. 12 × 24 in"}
                      onChange={(e) => setVariant(i, { label: e.target.value })}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      className={small}
                      aria-label={`Row ${i + 1} stock`}
                      inputMode="numeric"
                      value={v.stock}
                      placeholder="—"
                      onChange={(e) => setVariant(i, { stock: e.target.value })}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <input
                      className={small}
                      aria-label={`Row ${i + 1} price`}
                      inputMode="decimal"
                      value={v.price}
                      placeholder={p.price || "—"}
                      onChange={(e) => setVariant(i, { price: e.target.value })}
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <select className={small} aria-label={`Row ${i + 1} photo`} value={v.image} onChange={(e) => setVariant(i, { image: e.target.value })}>
                      <option value="">Main photo</option>
                      {p.images.map((src, k) => (
                        <option key={src} value={src}>
                          Photo {k + 1}
                        </option>
                      ))}
                      {v.image && !p.images.includes(v.image) && <option value={v.image}>Current photo</option>}
                    </select>
                  </td>
                  <td className="py-1 pr-2 text-center">
                    <input
                      type="checkbox"
                      aria-label={`Row ${i + 1} show on website`}
                      checked={v.active}
                      onChange={(e) => setVariant(i, { active: e.target.checked })}
                      className="h-5 w-5 accent-brand"
                    />
                  </td>
                  <td className="whitespace-nowrap py-1">
                    <IconBtn
                      label={`Duplicate row ${i + 1}`}
                      onClick={() =>
                        update({ variants: [...p.variants.slice(0, i + 1), { ...v, id: undefined, sku: "", label: "" }, ...p.variants.slice(i + 1)] })
                      }
                    >
                      ⧉
                    </IconBtn>{" "}
                    <IconBtn label={`Remove row ${i + 1}`} onClick={() => update({ variants: p.variants.filter((_, j) => j !== i) })}>
                      ✕
                    </IconBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3 border border-dashed border-line-strong bg-ground p-4">
        <span className="w-full text-sm font-semibold">Quick add sizes</span>
        <label className={`${labelCls} w-56`}>
          Widths (in), comma separated
          <input className={small} value={gen.widths} onChange={(e) => setGen({ ...gen, widths: e.target.value })} placeholder="24, 28, 30, 32" />
        </label>
        <label className={`${labelCls} w-44`}>
          Heights (in)
          <input
            className={small}
            value={gen.heights}
            onChange={(e) => setGen({ ...gen, heights: e.target.value })}
            placeholder={isDoors ? "80, 96" : "36, 48"}
          />
        </label>
        {isDoors && <Check checked={gen.swings} onChange={(swings) => setGen({ ...gen, swings })} label="Right & left-hand" />}
        <button type="button" className={btn} onClick={generate}>
          Add these sizes
        </button>
        <button type="button" className={btn} onClick={() => update({ variants: [...p.variants, blankVariant()] })}>
          + Add one row
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- photos

async function shrink(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // transparent PNGs get a white background, like the website
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bmp, 0, 0, width, height);
  bmp.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86));
  if (!blob) throw new Error("resize failed");
  return { blob, width, height };
}

function Photos({ images, onChange, visual }: { images: string[]; onChange: (v: string[]) => void; visual: Visual }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const added: string[] = [];
    const list = Array.from(files).slice(0, 12 - images.length);
    for (const [i, file] of list.entries()) {
      setBusy(`Uploading ${i + 1} of ${list.length}…`);
      try {
        const { blob, width, height } = await shrink(file);
        const fd = new FormData();
        fd.append("file", blob, "photo.jpg");
        fd.append("width", String(width));
        fd.append("height", String(height));
        const res = await fetch("/api/admin/images", { method: "POST", body: fd });
        const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
        added.push(data.url);
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error && e.message !== "resize failed" ? e.message : "couldn't read this photo. Try a JPG or PNG."}`);
      }
    }
    if (added.length) onChange([...images, ...added]);
    setBusy("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        {images.map((src, i) => (
          <figure key={src} className="flex flex-col border border-line bg-surface">
            <div className="relative">
              <ProductImage src={src} visual={visual} alt={`Photo ${i + 1}`} className="aspect-[4/5]" sizes="160px" />
              {i === 0 && <span className="absolute left-1.5 top-1.5 bg-ink px-1.5 py-0.5 text-xs font-semibold text-white">Main</span>}
            </div>
            <figcaption className="flex items-center justify-between border-t border-line px-1 py-1">
              <IconBtn label={`Move photo ${i + 1} left`} disabled={i === 0} onClick={() => onChange(move(images, i, i - 1))}>
                ←
              </IconBtn>
              <IconBtn label={`Move photo ${i + 1} right`} disabled={i === images.length - 1} onClick={() => onChange(move(images, i, i + 1))}>
                →
              </IconBtn>
              <IconBtn label={`Remove photo ${i + 1}`} onClick={() => onChange(images.filter((_, j) => j !== i))}>
                ✕
              </IconBtn>
            </figcaption>
          </figure>
        ))}
        {images.length < 12 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={!!busy}
            className="flex aspect-[4/5] flex-col items-center justify-center gap-1 border-2 border-dashed border-line-strong bg-ground p-3 text-center text-sm font-semibold text-muted hover:border-ink hover:text-ink disabled:opacity-60"
          >
            <span className="text-3xl leading-none">+</span>
            {busy || "Add photos"}
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => upload(e.target.files)} />
      {error && (
        <p role="alert" className="font-semibold text-brand-dark">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- bits

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [x] = next.splice(from, 1);
  next.splice(to, 0, x);
  return next;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border border-line bg-surface p-5 sm:p-6">
      <div>
        <h2 className="font-display text-[26px] font-bold uppercase leading-none">{title}</h2>
        {hint && <p className="mt-1.5 max-w-[760px] text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex h-11 items-center gap-2.5 font-semibold">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-brand" />
      {label}
    </label>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-line-strong bg-surface text-base hover:border-ink disabled:opacity-30"
    >
      {children}
    </button>
  );
}
