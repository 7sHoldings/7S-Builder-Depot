// Shapes shared by the admin product editor (browser) and its server actions.
// Number fields are strings so the form can hold what the user is typing.

import { categories, type CategoryId, type Product, type Variant } from "../catalog";

export type EditorVariant = {
  /** set for sizes that already exist */
  id?: string;
  sku: string;
  label: string;
  widthIn: string;
  heightIn: string;
  swing: "" | "RH" | "LH";
  stock: string;
  price: string;
  image: string;
  active: boolean;
};

export type EditorProduct = {
  /** set when editing an existing product (the web address can't change after creation) */
  originalSlug?: string;
  slug: string;
  sku: string;
  name: string;
  category: CategoryId;
  type: string;
  price: string;
  priceNote: string;
  unit: "sqft" | "each";
  sqftPerBox: string;
  summary: string;
  description: string;
  specs: [string, string][];
  images: string[];
  stock: string;
  featured: boolean;
  active: boolean;
  sortOrder: string;
  variants: EditorVariant[];
};

export type AdminProduct = Omit<Product, "variants"> & { active: boolean; sortOrder: number; variants: (Variant & { active: boolean })[] };

const s = (n: number | null | undefined) => (n == null ? "" : String(n));

export function toEditor(p: AdminProduct): EditorProduct {
  return {
    originalSlug: p.slug,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    category: p.category,
    type: p.type,
    price: s(p.price),
    priceNote: p.priceNote ?? "",
    unit: p.unit,
    sqftPerBox: s(p.sqftPerBox),
    summary: p.summary,
    description: p.description,
    specs: p.specs,
    images: p.images,
    stock: s(p.stock),
    featured: !!p.featured,
    active: p.active,
    sortOrder: String(p.sortOrder),
    variants: p.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      label: v.label,
      widthIn: s(v.widthIn),
      heightIn: s(v.heightIn),
      swing: v.swing ?? "",
      stock: s(v.stock),
      price: s(v.price),
      image: v.image ?? "",
      active: v.active,
    })),
  };
}

export function blankProduct(category: CategoryId = "doors"): EditorProduct {
  const sqft = category === "vinyl" || category === "tile";
  return {
    slug: "",
    sku: "",
    name: "",
    category,
    type: categories.find((c) => c.id === category)?.types[0] ?? "",
    price: "",
    priceNote: "",
    unit: sqft ? "sqft" : "each",
    sqftPerBox: sqft ? "20" : "",
    summary: "",
    description: "",
    specs: [["", ""]],
    images: [],
    stock: "",
    featured: false,
    active: true,
    sortOrder: "0",
    variants: [],
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** e.g. 30" × 80" · Right-hand */
export function autoVariantLabel(v: Pick<EditorVariant, "widthIn" | "heightIn" | "swing">): string {
  const dims = v.widthIn && v.heightIn ? `${v.widthIn}" × ${v.heightIn}"` : "";
  const swing = v.swing === "RH" ? "Right-hand" : v.swing === "LH" ? "Left-hand" : "";
  return [dims, swing].filter(Boolean).join(" · ");
}

export const ORDER_STATUSES = ["new", "confirmed", "ready", "completed", "cancelled"] as const;
export const QUOTE_STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;

const statusLabels: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
};

export const statusLabel = (s: string) => statusLabels[s] ?? s;
