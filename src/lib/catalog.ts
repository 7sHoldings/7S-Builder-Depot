// Product types, categories and the 7S Builder Depot catalog.
//
// The live site reads products from the database (src/lib/products.ts).
// `seedProducts` below fills a new database (npm run db:seed-sql) and is the
// fallback when no DATABASE_URL is set (for example on a developer's laptop).

export type CategoryId = "vinyl" | "doors" | "windows" | "tile";

export type Visual =
  | { kind: "plank"; color: string }
  | { kind: "tile"; color: string; grout: string; size: "small" | "large" }
  | { kind: "sheet"; color: string }
  | { kind: "door"; color: string; panels: boolean }
  | { kind: "patio" }
  | { kind: "window"; panes: 1 | 2 | 4 };

export type ColorOption = { name: string; hex: string };

export type Variant = {
  id: string;
  sku: string;
  label: string;
  widthIn?: number;
  heightIn?: number;
  swing?: "RH" | "LH";
  /** null = stock not tracked */
  stock: number | null;
  /** overrides the product price */
  price?: number;
  image?: string;
};

export type Product = {
  slug: string;
  sku: string;
  name: string;
  category: CategoryId;
  type: string;
  /** USD. Per square foot when `unit` is "sqft", otherwise per item. null = price on request. */
  price: number | null;
  priceNote?: string;
  unit: "sqft" | "each";
  /** Square feet in one box (flooring is sold by the box). */
  sqftPerBox?: number;
  summary: string;
  description: string;
  specs: [string, string][];
  colors?: ColorOption[];
  visual: Visual;
  images: string[];
  /** null = stock not tracked (or tracked per variant) */
  stock: number | null;
  featured?: boolean;
  variants: Variant[];
};

export type Category = {
  id: CategoryId;
  name: string;
  blurb: string;
  intro: string;
  types: string[];
  visual: Visual;
  image?: string;
};

export const categories: Category[] = [
  {
    id: "vinyl",
    name: "Vinyl",
    blurb: "Waterproof luxury vinyl plank",
    intro: "Waterproof luxury vinyl plank in three in-stock looks — one price on every color.",
    types: [],
    visual: { kind: "plank", color: "#d9c29e" },
    image: "/products/vinyl-light-maple.jpg",
  },
  {
    id: "doors",
    name: "Doors",
    blurb: "Prehung interior doors, 6'8\" & 8'",
    intro: "Fully assembled prehung interior doors — slab, jamb/frame, casing and hinges included.",
    types: ["2-Panel Shaker", "5-Panel Shaker", "6-Panel Shaker"],
    visual: { kind: "door", color: "#f2f1ee", panels: true },
    image: "/products/door-2panel-a.jpg",
  },
  {
    id: "windows",
    name: "Windows",
    blurb: "Single hung, sliding, fixed & casement",
    intro: "American-style PVC windows with nail flange, Low-E tempered glass and argon fill. Black exterior, white interior.",
    types: ["Single hung", "Sliding", "Fixed", "Casement"],
    visual: { kind: "window", panes: 4 },
    image: "/products/window-single-hung-30x60.jpg",
  },
  {
    id: "tile",
    name: "Tile",
    blurb: "Coming soon",
    intro: "Tile is coming soon. Call us or request a quote and we'll help you source what you need.",
    types: [],
    visual: { kind: "tile", color: "#dcdad5", grout: "#b9b5ad", size: "large" },
  },
];

// ---------------------------------------------------------------- vinyl
// TODO(owner): confirm square feet per box (calculator uses this)
const VINYL_SQFT_PER_BOX = 20;
const vinylSpecs = (perBox: number): [string, string][] => [
  ["Price", "$1.99 per sq ft"],
  ["Type", "Luxury vinyl plank, waterproof"],
  ["Installation", "Click-lock floating"],
  ["Coverage per box", `${perBox} sq ft`],
];

const vinyl: Product[] = [
  {
    slug: "vinyl-light-spalted-maple",
    sku: "7S-LVP-LSM",
    name: "Light Spalted Maple",
    category: "vinyl",
    type: "Luxury vinyl plank",
    price: 1.99,
    unit: "sqft",
    sqftPerBox: VINYL_SQFT_PER_BOX,
    summary: "Creamy maple with dark spalting lines",
    description: "A bright, creamy maple look with dark spalting lines — keeps rooms feeling open and hides everyday dust.",
    specs: vinylSpecs(VINYL_SQFT_PER_BOX),
    visual: { kind: "plank", color: "#e3d3b5" },
    images: ["/products/vinyl-light-maple.jpg"],
    stock: null,
    featured: true,
    variants: [],
  },
  {
    slug: "vinyl-weathered-oak",
    sku: "7S-LVP-WO",
    name: "Weathered Oak",
    category: "vinyl",
    type: "Luxury vinyl plank",
    price: 1.99,
    unit: "sqft",
    sqftPerBox: VINYL_SQFT_PER_BOX,
    summary: "Warm greige oak with a natural grain",
    description: "A warm greige oak with a soft, natural grain that goes with almost any wall color or cabinet.",
    specs: vinylSpecs(VINYL_SQFT_PER_BOX),
    visual: { kind: "plank", color: "#b9ab98" },
    images: ["/products/vinyl-weathered-oak.jpg"],
    stock: null,
    variants: [],
  },
  {
    slug: "vinyl-smoky-grey-oak",
    sku: "7S-LVP-SGO",
    name: "Smoky Grey Oak",
    category: "vinyl",
    type: "Luxury vinyl plank",
    price: 1.99,
    unit: "sqft",
    sqftPerBox: VINYL_SQFT_PER_BOX,
    summary: "Rustic grey oak with knots and cathedral grain",
    description: "A rustic grey oak with knots and cathedral grain — a bold, modern farmhouse look.",
    specs: vinylSpecs(VINYL_SQFT_PER_BOX),
    visual: { kind: "plank", color: "#6f6862" },
    images: ["/products/vinyl-smoky-grey-oak.jpg"],
    stock: null,
    variants: [],
  },
];

// ---------------------------------------------------------------- doors
// From the owner's stock sheet; rows with the same size + style combined.
type DoorRow = [width: number, height: number, rh: number, lh: number];

function doorVariants(code: string, rows: DoorRow[]): Variant[] {
  return rows.flatMap(([w, h, rh, lh]) =>
    (["RH", "LH"] as const).map((swing) => ({
      id: `${code}-${w}x${h}-${swing.toLowerCase()}`,
      sku: `7S-DR-${code.toUpperCase()}-${w}${h}-${swing}`,
      label: `${w}" × ${h}" · ${swing === "RH" ? "Right-hand" : "Left-hand"}`,
      widthIn: w,
      heightIn: h,
      swing,
      stock: swing === "RH" ? rh : lh,
    })),
  );
}

const doorBaseSpecs: [string, string][] = [
  ["Assembly", "Fully assembled prehung"],
  ["Included", "Slab + jamb/frame + casing + hinges"],
  ["Slab thickness", '1-3/8" (35 mm)'],
  ["Finish", "Primed white, bored for knob"],
];

const doors: Product[] = [
  {
    slug: "2-panel-shaker-prehung-door",
    sku: "7S-DR-2P",
    name: "2-Panel Shaker Prehung Door",
    category: "doors",
    type: "2-Panel Shaker",
    price: 189,
    unit: "each",
    summary: "Honeycomb core · 6'8\" and 8' heights",
    description:
      "A classic two-panel Shaker door, fully assembled in its frame with casing and four black hinges — set it in the opening and go.",
    specs: [["Core", "Honeycomb"], ["Hinges", '4 black hinges, 3.5"'], ...doorBaseSpecs],
    visual: { kind: "door", color: "#f2f1ee", panels: true },
    images: ["/products/door-2panel-a.jpg", "/products/door-2panel-b.jpg", "/products/door-2panel-c.jpg", "/products/door-2panel-d.jpg"],
    stock: null,
    featured: true,
    variants: doorVariants("2p", [
      [24, 80, 19, 17],
      [28, 80, 23, 20],
      [30, 80, 40, 35],
      [32, 80, 6, 4],
      [24, 96, 10, 10],
      [28, 96, 5, 5],
      [30, 96, 8, 7],
    ]),
  },
  {
    slug: "6-panel-shaker-prehung-door-8ft",
    sku: "7S-DR-6P",
    name: "6-Panel Shaker Prehung Door (8 ft)",
    category: "doors",
    type: "6-Panel Shaker",
    price: 189,
    unit: "each",
    summary: "Solid MDF core · 8' tall",
    description: "A tall six-panel Shaker door with a solid MDF core for a heavier, quieter feel. Fully assembled prehung with casing.",
    specs: [["Core", "Solid MDF"], ["Hinges", '4 black hinges, 4"'], ...doorBaseSpecs],
    visual: { kind: "door", color: "#f2f1ee", panels: true },
    images: ["/products/door-6panel-a.jpg"],
    stock: null,
    featured: true,
    variants: doorVariants("6p", [
      [28, 96, 3, 1],
      [32, 96, 5, 5],
    ]),
  },
  {
    slug: "5-panel-shaker-prehung-door",
    sku: "7S-DR-5P",
    name: "5-Panel Shaker Prehung Door",
    category: "doors",
    type: "5-Panel Shaker",
    price: 189,
    unit: "each",
    summary: "Solid MDF core · 32\" × 80\"",
    description: "A modern-farmhouse five-panel Shaker door with a solid MDF core. Fully assembled prehung with casing.",
    specs: [["Core", "Solid MDF"], ["Hinges", '4 black hinges, 3.5"'], ...doorBaseSpecs],
    visual: { kind: "door", color: "#f2f1ee", panels: true },
    images: ["/products/door-5panel-a.jpg", "/products/door-5panel-b.jpg"],
    stock: null,
    variants: doorVariants("5p", [[32, 80, 3, 3]]),
  },
];

// ---------------------------------------------------------------- windows
const windowSpecs = (opening: string, glass: string, screen: boolean, dp?: string): [string, string][] => [
  ["Material", "82 series American-style PVC"],
  ["Mounting", "Nail flange"],
  ["Operation", opening],
  ["Frame color", "Black exterior / white interior"],
  ["Glass", glass],
  ["Screen", screen ? "Included" : "None"],
  ["Grilles", "None"],
  ...(dp ? ([["Performance", `U-value 0.30 · SHGC 0.25 · ${dp}`]] as [string, string][]) : []),
];

function windowVariants(kind: string, sizes: [number, number][]): Variant[] {
  return sizes.map(([w, h]) => ({
    id: `${kind}-${w}x${h}`,
    sku: `7S-WN-${kind.toUpperCase().replace(/-/g, "")}-${w}${h}`,
    label: `${w}" × ${h}"`,
    widthIn: w,
    heightIn: h,
    stock: null,
    image: `/products/window-${kind}-${w}x${h}.jpg`,
  }));
}

const GLASS = "3 + 12A + 3 mm Low-E tempered, argon filled";

const windows: Product[] = [
  {
    slug: "single-hung-window",
    sku: "7S-WN-SH",
    name: "Single Hung Window",
    category: "windows",
    type: "Single hung",
    price: null,
    priceNote: "Price on request",
    unit: "each",
    summary: "8 sizes · Low-E argon · screen included",
    description: "The everyday window: the bottom sash slides up, the top stays fixed. Black exterior, white interior, with nail flange for new construction.",
    specs: windowSpecs("Single hung", GLASS, true, "DP-40"),
    visual: { kind: "window", panes: 2 },
    images: ["/products/window-single-hung-30x60.jpg"],
    stock: null,
    featured: true,
    variants: windowVariants("single-hung", [
      [24, 36], [24, 48], [24, 60], [30, 60], [36, 60], [36, 84], [50, 60], [60, 60],
    ]),
  },
  {
    slug: "sliding-window",
    sku: "7S-WN-SL",
    name: "Sliding Window",
    category: "windows",
    type: "Sliding",
    price: null,
    priceNote: "Price on request",
    unit: "each",
    summary: "6 sizes · Low-E argon · screen included",
    description: "A horizontal slider that's easy to open over counters and in wide openings. Black exterior, white interior, nail flange.",
    specs: windowSpecs("Single sliding", GLASS, true, "DP-25"),
    visual: { kind: "window", panes: 2 },
    images: ["/products/window-sliding-48x48.jpg"],
    stock: null,
    variants: windowVariants("sliding", [
      [40, 40], [48, 36], [48, 48], [60, 48], [60, 60], [72, 48],
    ]),
  },
  {
    slug: "fixed-window",
    sku: "7S-WN-FX",
    name: "Fixed Window",
    category: "windows",
    type: "Fixed",
    price: null,
    priceNote: "Price on request",
    unit: "each",
    summary: "6 sizes · single & twin units",
    description: "A fixed picture window — maximum light and a tight seal. Larger sizes come as twin units. Black exterior, white interior, nail flange.",
    specs: windowSpecs("Fixed (does not open)", GLASS, false, "DP-40"),
    visual: { kind: "window", panes: 1 },
    images: ["/products/window-fixed-48x48.jpg"],
    stock: null,
    variants: windowVariants("fixed", [
      [36, 36], [40, 40], [48, 48], [60, 48], [60, 60], [72, 72],
    ]),
  },
  {
    slug: "casement-window",
    sku: "7S-WN-CS",
    name: "Casement Window",
    category: "windows",
    type: "Casement",
    price: null,
    priceNote: "Price on request",
    unit: "each",
    summary: '30" × 50" · Low-E argon · screen included',
    description: "Opens fully on a hinge to catch the breeze and seals tight when closed. Black exterior, white interior, nail flange.",
    specs: windowSpecs("Casement", "3 + 16A + 3 mm Low-E tempered, argon filled", true),
    visual: { kind: "window", panes: 1 },
    images: ["/products/window-casement-30x50.jpg"],
    stock: null,
    variants: windowVariants("casement", [[30, 50]]),
  },
];

export const seedProducts: Product[] = [...vinyl, ...doors, ...windows];

export const categoryIds = categories.map((c) => c.id);

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function isCategoryId(v: string): v is CategoryId {
  return (categoryIds as string[]).includes(v);
}

/** What the cart remembers about a product at the moment it was added.
 *  The server re-checks prices and stock against the database when an order is placed. */
export type CartSnapshot = {
  slug: string;
  sku: string;
  name: string;
  unitPrice: number;
  unitLabel: string;
  sqftPerBox?: number;
  visual: Visual;
  image?: string;
  variantId?: string;
  variantLabel?: string;
};

export function cartSnapshot(p: Product, v?: Variant): CartSnapshot {
  return {
    slug: p.slug,
    sku: v?.sku ?? p.sku,
    name: p.name,
    unitPrice: unitPrice(p, v) ?? 0,
    unitLabel: unitLabel(p),
    sqftPerBox: p.sqftPerBox,
    visual: p.visual,
    image: v?.image ?? p.images[0],
    variantId: v?.id,
    variantLabel: v?.label,
  };
}

/** Price of one sellable unit: a box for flooring, or one item. null = price on request. */
export function unitPrice(p: Product, v?: Variant): number | null {
  const base = v?.price ?? p.price;
  if (base == null) return null;
  return p.unit === "sqft" && p.sqftPerBox ? round2(base * p.sqftPerBox) : base;
}

export function unitLabel(p: Product): string {
  return p.unit === "each" ? "each" : "per box";
}

export function priceLabel(p: Product): string {
  return p.unit === "sqft" ? "/ sq ft" : "";
}

export function hasPrice(p: Product): boolean {
  return p.price != null || p.variants.some((v) => v.price != null);
}

/** Total stock across variants (or the product), null when not tracked. */
export function totalStock(p: Product): number | null {
  if (p.variants.length > 0) {
    const tracked = p.variants.filter((v) => v.stock != null);
    return tracked.length ? tracked.reduce((n, v) => n + (v.stock ?? 0), 0) : null;
  }
  return p.stock;
}

/** Short list of sizes, e.g. 24", 28", 30" × 80" · 24", 28" × 96" */
export function sizeSummary(p: Product): string {
  const byH = new Map<number, Set<number>>();
  for (const v of p.variants) {
    if (v.widthIn == null || v.heightIn == null) continue;
    if (!byH.has(v.heightIn)) byH.set(v.heightIn, new Set());
    byH.get(v.heightIn)!.add(v.widthIn);
  }
  return [...byH.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([h, ws]) => `${[...ws].sort((a, b) => a - b).map((w) => `${w}"`).join(", ")} × ${h}"`)
    .join(" · ");
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function searchIn(products: Product[], query: string): Product[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return products.filter((p) => {
    const haystack = [p.name, p.sku, p.type, p.category, p.summary, ...p.variants.map((v) => v.label)].join(" ").toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}
