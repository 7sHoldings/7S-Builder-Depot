// Product types, categories and the SAMPLE product list.
//
// The live site reads products from the database (src/lib/products.ts).
// `seedProducts` below is used to fill a new database (npm run db:seed-sql)
// and as a fallback when no DATABASE_URL is set, e.g. on a developer's laptop.

export type CategoryId = "vinyl" | "doors" | "windows" | "tile";

export type Visual =
  | { kind: "plank"; color: string }
  | { kind: "tile"; color: string; grout: string; size: "small" | "large" }
  | { kind: "sheet"; color: string }
  | { kind: "door"; color: string; panels: boolean }
  | { kind: "patio" }
  | { kind: "window"; panes: 1 | 2 | 4 };

export type ColorOption = { name: string; hex: string };

export type Product = {
  slug: string;
  sku: string;
  name: string;
  category: CategoryId;
  type: string;
  /** Price in USD. Per square foot when `unit` is "sqft", otherwise per item. */
  price: number;
  unit: "sqft" | "each";
  /** Square feet in one box (flooring and tile are sold by the box). */
  sqftPerBox?: number;
  summary: string;
  description: string;
  specs: [string, string][];
  colors?: ColorOption[];
  visual: Visual;
  imageUrl?: string;
  stock: number;
  featured?: boolean;
};

export type Category = {
  id: CategoryId;
  name: string;
  blurb: string;
  intro: string;
  types: string[];
  visual: Visual;
};

export const categories: Category[] = [
  {
    id: "vinyl",
    name: "Vinyl",
    blurb: "Luxury plank, tile & sheet flooring",
    intro: "Waterproof luxury vinyl plank, tile and sheet — for kitchens, baths, basements and more.",
    types: ["Luxury vinyl plank", "Luxury vinyl tile", "Sheet vinyl"],
    visual: { kind: "plank", color: "#d9c29e" },
  },
  {
    id: "doors",
    name: "Doors",
    blurb: "Interior, exterior & patio doors",
    intro: "Entry, interior and patio doors — prehung or slab, in the sizes builders use most.",
    types: ["Exterior", "Interior prehung", "Interior slab", "Patio"],
    visual: { kind: "door", color: "#8a5a3b", panels: true },
  },
  {
    id: "windows",
    name: "Windows",
    blurb: "Double-hung, sliding & casement",
    intro: "Energy-efficient vinyl windows for new construction and replacement projects.",
    types: ["Double-hung", "Sliding", "Casement", "Picture"],
    visual: { kind: "window", panes: 4 },
  },
  {
    id: "tile",
    name: "Tile",
    blurb: "Porcelain, ceramic & mosaic",
    intro: "Porcelain, ceramic and mosaic tile for floors, walls, showers and backsplashes.",
    types: ["Porcelain", "Ceramic", "Mosaic"],
    visual: { kind: "tile", color: "#dcdad5", grout: "#b9b5ad", size: "large" },
  },
];

const woodColors: ColorOption[] = [
  { name: "Natural Oak", hex: "#d9c29e" },
  { name: "Honey Oak", hex: "#c08a52" },
  { name: "Smoked Oak", hex: "#7a5a43" },
  { name: "Driftwood Grey", hex: "#a9a49b" },
];

export const seedProducts: Product[] = [
  // ---------- VINYL ----------
  {
    slug: "oak-luxury-vinyl-plank",
    sku: "7S-LVP-2041",
    name: "Oak Luxury Vinyl Plank",
    category: "vinyl",
    type: "Luxury vinyl plank",
    price: 3.49,
    unit: "sqft",
    sqftPerBox: 20,
    summary: "6 mm · 20 mil wear layer · Waterproof",
    description:
      "A realistic oak look with a 100% waterproof core. Click-lock planks float over most existing floors, so it's a fast install for kitchens, basements and rentals.",
    specs: [
      ["Plank size", '7.1" × 48"'],
      ["Thickness", "6 mm"],
      ["Wear layer", "20 mil"],
      ["Coverage per box", "20 sq ft"],
      ["Installation", "Click-lock floating"],
      ["Warranty", "Lifetime residential"],
    ],
    colors: woodColors,
    visual: { kind: "plank", color: "#d9c29e" },
    stock: 340,
    featured: true,
  },
  {
    slug: "hickory-vinyl-plank-saddle",
    sku: "7S-LVP-2066",
    name: "Hickory Vinyl Plank — Saddle",
    category: "vinyl",
    type: "Luxury vinyl plank",
    price: 3.29,
    unit: "sqft",
    sqftPerBox: 22,
    summary: "6 mm · Attached pad",
    description: "Warm hickory tones with an attached underlayment pad for a quieter, softer floor.",
    specs: [
      ["Plank size", '7" × 48"'],
      ["Thickness", "6 mm"],
      ["Wear layer", "12 mil"],
      ["Coverage per box", "22 sq ft"],
      ["Installation", "Click-lock floating"],
      ["Warranty", "25-year residential"],
    ],
    visual: { kind: "plank", color: "#c9a57e" },
    stock: 180,
  },
  {
    slug: "walnut-vinyl-plank-espresso",
    sku: "7S-LVP-2088",
    name: "Walnut Vinyl Plank — Espresso",
    category: "vinyl",
    type: "Luxury vinyl plank",
    price: 4.19,
    unit: "sqft",
    sqftPerBox: 18.5,
    summary: "8 mm · 20 mil wear layer · Waterproof",
    description: "A rich, dark walnut plank with a thick 8 mm core that hides minor subfloor flaws.",
    specs: [
      ["Plank size", '9" × 60"'],
      ["Thickness", "8 mm"],
      ["Wear layer", "20 mil"],
      ["Coverage per box", "18.5 sq ft"],
      ["Installation", "Click-lock floating"],
      ["Warranty", "Lifetime residential"],
    ],
    visual: { kind: "plank", color: "#8a6a50" },
    stock: 95,
  },
  {
    slug: "maple-vinyl-plank-whitewash",
    sku: "7S-LVP-2012",
    name: "Maple Vinyl Plank — Whitewash",
    category: "vinyl",
    type: "Luxury vinyl plank",
    price: 2.59,
    unit: "sqft",
    sqftPerBox: 24,
    summary: "4 mm · Attached pad",
    description: "A bright, budget-friendly plank that's popular for rental turns and bedrooms.",
    specs: [
      ["Plank size", '6" × 36"'],
      ["Thickness", "4 mm"],
      ["Wear layer", "8 mil"],
      ["Coverage per box", "24 sq ft"],
      ["Installation", "Click-lock floating"],
      ["Warranty", "15-year residential"],
    ],
    visual: { kind: "plank", color: "#ede2cc" },
    stock: 260,
  },
  {
    slug: "stone-look-vinyl-tile-slate",
    sku: "7S-LVT-3101",
    name: "Stone-Look Vinyl Tile — Slate Grey",
    category: "vinyl",
    type: "Luxury vinyl tile",
    price: 3.79,
    unit: "sqft",
    sqftPerBox: 20,
    summary: '12" × 24" · Waterproof',
    description: "The look of slate without the cold floor or the grout lines to scrub.",
    specs: [
      ["Tile size", '12" × 24"'],
      ["Thickness", "6 mm"],
      ["Wear layer", "20 mil"],
      ["Coverage per box", "20 sq ft"],
      ["Installation", "Click-lock floating"],
      ["Warranty", "Lifetime residential"],
    ],
    visual: { kind: "tile", color: "#c3c7c8", grout: "#a3a8aa", size: "large" },
    stock: 120,
  },
  {
    slug: "sheet-vinyl-hex",
    sku: "7S-SV-4005",
    name: "Sheet Vinyl — Hex Pattern",
    category: "vinyl",
    type: "Sheet vinyl",
    price: 1.49,
    unit: "sqft",
    sqftPerBox: 144,
    summary: "12 ft roll width · Sold in 12 × 12 ft pieces",
    description: "Seamless sheet flooring for laundry rooms and baths. Each piece covers 144 sq ft.",
    specs: [
      ["Roll width", "12 ft"],
      ["Piece size", "12 ft × 12 ft"],
      ["Thickness", "2.5 mm"],
      ["Coverage per piece", "144 sq ft"],
      ["Installation", "Loose-lay or full spread"],
      ["Warranty", "10-year residential"],
    ],
    visual: { kind: "sheet", color: "#b5bbbd" },
    stock: 40,
  },

  // ---------- DOORS ----------
  {
    slug: "craftsman-fiberglass-entry-door-36",
    sku: "7S-DR-3680F",
    name: 'Craftsman Fiberglass Entry Door 36"',
    category: "doors",
    type: "Exterior",
    price: 649,
    unit: "each",
    summary: '36" × 80" · Prehung · Left inswing',
    description: "A stain-grade fiberglass door with Craftsman panels. Won't warp, rot or dent like wood.",
    specs: [
      ["Size", '36" × 80"'],
      ["Material", "Fiberglass"],
      ["Configuration", "Prehung, left-hand inswing"],
      ["Jamb depth", '4-9/16"'],
      ["Finish", "Ready to stain"],
      ["Warranty", "Limited lifetime"],
    ],
    visual: { kind: "door", color: "#8a5a3b", panels: true },
    stock: 8,
  },
  {
    slug: "steel-6-panel-entry-door-36",
    sku: "7S-DR-3680",
    name: 'Steel 6-Panel Entry Door 36"',
    category: "doors",
    type: "Exterior",
    price: 389,
    unit: "each",
    summary: '36" × 80" · Prehung · Primed white',
    description: "An insulated steel entry door — secure, energy-efficient and ready to paint.",
    specs: [
      ["Size", '36" × 80"'],
      ["Material", "Steel, foam core"],
      ["Configuration", "Prehung, left-hand inswing"],
      ["Jamb depth", '4-9/16"'],
      ["Finish", "Primed white"],
      ["Warranty", "5 years"],
    ],
    visual: { kind: "door", color: "#f2f1ee", panels: true },
    stock: 14,
    featured: true,
  },
  {
    slug: "shaker-1-panel-prehung-32",
    sku: "7S-DR-3280S",
    name: 'Shaker 1-Panel Prehung Door 32"',
    category: "doors",
    type: "Interior prehung",
    price: 189,
    unit: "each",
    summary: '32" × 80" · Composite · Primed',
    description: "Clean Shaker styling for bedrooms and closets. Hinged in the frame for a quick install.",
    specs: [
      ["Size", '32" × 80"'],
      ["Material", "Molded composite, hollow core"],
      ["Configuration", "Prehung, reversible"],
      ["Jamb depth", '4-9/16"'],
      ["Finish", "Primed white"],
      ["Warranty", "1 year"],
    ],
    visual: { kind: "door", color: "#e9e7e2", panels: false },
    stock: 32,
  },
  {
    slug: "solid-pine-6-panel-slab-30",
    sku: "7S-DR-3080P",
    name: 'Solid Pine 6-Panel Slab 30"',
    category: "doors",
    type: "Interior slab",
    price: 149,
    unit: "each",
    summary: '30" × 80" · Unfinished',
    description: "A solid pine slab door for replacing an existing door in its current frame.",
    specs: [
      ["Size", '30" × 80" × 1-3/8"'],
      ["Material", "Solid pine"],
      ["Configuration", "Slab (no frame)"],
      ["Finish", "Unfinished — paint or stain"],
      ["Warranty", "1 year"],
    ],
    visual: { kind: "door", color: "#d9b98c", panels: true },
    stock: 21,
  },
  {
    slug: "sliding-patio-door-72",
    sku: "7S-PD-7280",
    name: 'Sliding Patio Door 72" × 80"',
    category: "doors",
    type: "Patio",
    price: 899,
    unit: "each",
    summary: "Vinyl frame · Low-E glass",
    description: "A two-panel sliding door with Low-E insulated glass to keep heat out in Texas summers.",
    specs: [
      ["Size", '72" × 80"'],
      ["Frame", "White vinyl"],
      ["Glass", "Low-E, argon filled"],
      ["Operation", "Right panel slides"],
      ["Warranty", "Limited lifetime"],
    ],
    visual: { kind: "patio" },
    stock: 5,
  },
  {
    slug: "fiberglass-french-patio-door-60",
    sku: "7S-PD-6080F",
    name: 'Fiberglass French Patio Door 60"',
    category: "doors",
    type: "Patio",
    price: 1249,
    unit: "each",
    summary: '60" × 80" · Inswing · Low-E glass',
    description: "Double French doors with full-view Low-E glass and a fiberglass frame.",
    specs: [
      ["Size", '60" × 80"'],
      ["Material", "Fiberglass"],
      ["Glass", "Low-E, full view"],
      ["Configuration", "Prehung, inswing"],
      ["Warranty", "Limited lifetime"],
    ],
    visual: { kind: "patio" },
    stock: 3,
  },

  // ---------- WINDOWS ----------
  {
    slug: "double-hung-window-36x60",
    sku: "7S-WN-DH3660",
    name: 'Double-Hung Window 36" × 60"',
    category: "windows",
    type: "Double-hung",
    price: 279,
    unit: "each",
    summary: "White vinyl · Low-E glass · Tilt-in sashes",
    description: "Our most popular window. Both sashes tilt in for easy cleaning from inside.",
    specs: [
      ["Rough opening", '36" × 60"'],
      ["Frame", "White vinyl"],
      ["Glass", "Low-E, argon filled"],
      ["Screen", "Half screen included"],
      ["Warranty", "Limited lifetime"],
    ],
    visual: { kind: "window", panes: 2 },
    stock: 24,
    featured: true,
  },
  {
    slug: "double-hung-window-24x36",
    sku: "7S-WN-DH2436",
    name: 'Double-Hung Window 24" × 36"',
    category: "windows",
    type: "Double-hung",
    price: 189,
    unit: "each",
    summary: "White vinyl · Low-E glass",
    description: "A smaller double-hung size for bathrooms and over-sink openings.",
    specs: [
      ["Rough opening", '24" × 36"'],
      ["Frame", "White vinyl"],
      ["Glass", "Low-E, argon filled"],
      ["Screen", "Half screen included"],
      ["Warranty", "Limited lifetime"],
    ],
    visual: { kind: "window", panes: 2 },
    stock: 30,
  },
  {
    slug: "sliding-window-48x36",
    sku: "7S-WN-SL4836",
    name: 'Sliding Window 48" × 36"',
    category: "windows",
    type: "Sliding",
    price: 249,
    unit: "each",
    summary: "White vinyl · Left panel slides",
    description: "A horizontal slider that's easy to open over counters and in wide openings.",
    specs: [
      ["Rough opening", '48" × 36"'],
      ["Frame", "White vinyl"],
      ["Glass", "Low-E, argon filled"],
      ["Operation", "Left panel slides"],
      ["Warranty", "Limited lifetime"],
    ],
    visual: { kind: "window", panes: 2 },
    stock: 18,
  },
  {
    slug: "egress-sliding-window-36x48",
    sku: "7S-WN-SL3648E",
    name: 'Egress Sliding Window 36" × 48"',
    category: "windows",
    type: "Sliding",
    price: 269,
    unit: "each",
    summary: "Meets typical bedroom egress size",
    description: "Sized for bedroom emergency exits. Check your local code before ordering.",
    specs: [
      ["Rough opening", '36" × 48"'],
      ["Frame", "White vinyl"],
      ["Glass", "Low-E, argon filled"],
      ["Operation", "Slides horizontally"],
      ["Warranty", "Limited lifetime"],
    ],
    visual: { kind: "window", panes: 2 },
    stock: 12,
  },
  {
    slug: "casement-window-24x48",
    sku: "7S-WN-CS2448",
    name: 'Casement Window 24" × 48"',
    category: "windows",
    type: "Casement",
    price: 319,
    unit: "each",
    summary: "Crank-out · Seals tight when closed",
    description: "Opens fully with a crank to catch breezes, and seals tightly when closed.",
    specs: [
      ["Rough opening", '24" × 48"'],
      ["Frame", "White vinyl"],
      ["Glass", "Low-E, argon filled"],
      ["Operation", "Crank, hinged left"],
      ["Warranty", "Limited lifetime"],
    ],
    visual: { kind: "window", panes: 1 },
    stock: 10,
  },
  {
    slug: "picture-window-48x48",
    sku: "7S-WN-PC4848",
    name: 'Picture Window 48" × 48"',
    category: "windows",
    type: "Picture",
    price: 299,
    unit: "each",
    summary: "Fixed · Maximum light",
    description: "A fixed window with no moving parts — the most light and the best seal for the price.",
    specs: [
      ["Rough opening", '48" × 48"'],
      ["Frame", "White vinyl"],
      ["Glass", "Low-E, argon filled"],
      ["Operation", "Fixed"],
      ["Warranty", "Limited lifetime"],
    ],
    visual: { kind: "window", panes: 1 },
    stock: 9,
  },

  // ---------- TILE ----------
  {
    slug: "porcelain-tile-12x24-matte-grey",
    sku: "7S-TL-1224G",
    name: "Porcelain Tile 12×24 — Matte Grey",
    category: "tile",
    type: "Porcelain",
    price: 2.19,
    unit: "sqft",
    sqftPerBox: 15.5,
    summary: '12" × 24" · Floor & wall · Rectified',
    description: "A versatile through-body porcelain in a soft matte grey. Rated for floors and walls.",
    specs: [
      ["Tile size", '12" × 24"'],
      ["Material", "Porcelain"],
      ["Finish", "Matte"],
      ["Coverage per box", "15.5 sq ft"],
      ["Use", "Floor & wall, indoor"],
    ],
    visual: { kind: "tile", color: "#c3c7c8", grout: "#a9aeb0", size: "large" },
    stock: 410,
    featured: true,
  },
  {
    slug: "marble-look-porcelain-24x24-carrara",
    sku: "7S-TL-2424C",
    name: "Marble-Look Porcelain 24×24 — Carrara",
    category: "tile",
    type: "Porcelain",
    price: 3.49,
    unit: "sqft",
    sqftPerBox: 15.5,
    summary: '24" × 24" · Polished',
    description: "The look of Carrara marble in a durable, stain-resistant porcelain.",
    specs: [
      ["Tile size", '24" × 24"'],
      ["Material", "Porcelain"],
      ["Finish", "Polished"],
      ["Coverage per box", "15.5 sq ft"],
      ["Use", "Floor & wall, indoor"],
    ],
    visual: { kind: "tile", color: "#efeeeb", grout: "#d2cfc8", size: "large" },
    stock: 150,
  },
  {
    slug: "wood-look-porcelain-8x48-ash",
    sku: "7S-TL-0848A",
    name: "Wood-Look Porcelain 8×48 — Ash",
    category: "tile",
    type: "Porcelain",
    price: 2.89,
    unit: "sqft",
    sqftPerBox: 13.3,
    summary: '8" × 48" plank · Matte',
    description: "Wood-look plank tile that handles water, pets and heavy traffic.",
    specs: [
      ["Tile size", '8" × 48"'],
      ["Material", "Porcelain"],
      ["Finish", "Matte"],
      ["Coverage per box", "13.3 sq ft"],
      ["Use", "Floor, indoor & covered outdoor"],
    ],
    visual: { kind: "plank", color: "#b9ab98" },
    stock: 200,
  },
  {
    slug: "slate-look-porcelain-12x12",
    sku: "7S-TL-1212S",
    name: "Slate-Look Porcelain 12×12",
    category: "tile",
    type: "Porcelain",
    price: 1.79,
    unit: "sqft",
    sqftPerBox: 15,
    summary: '12" × 12" · Textured · Slip resistant',
    description: "A textured, slip-resistant tile for entries, patios and mudrooms.",
    specs: [
      ["Tile size", '12" × 12"'],
      ["Material", "Porcelain"],
      ["Finish", "Textured"],
      ["Coverage per box", "15 sq ft"],
      ["Use", "Floor, indoor & outdoor"],
    ],
    visual: { kind: "tile", color: "#7d8183", grout: "#606466", size: "small" },
    stock: 175,
  },
  {
    slug: "ceramic-subway-tile-3x6-white",
    sku: "7S-TL-0306W",
    name: "Ceramic Subway Tile 3×6 — White",
    category: "tile",
    type: "Ceramic",
    price: 1.29,
    unit: "sqft",
    sqftPerBox: 12.5,
    summary: '3" × 6" · Gloss · Wall',
    description: "Classic glossy white subway tile for backsplashes and shower walls.",
    specs: [
      ["Tile size", '3" × 6"'],
      ["Material", "Ceramic"],
      ["Finish", "Gloss"],
      ["Coverage per box", "12.5 sq ft"],
      ["Use", "Wall, indoor"],
    ],
    visual: { kind: "tile", color: "#f7f7f5", grout: "#d9d7d1", size: "small" },
    stock: 300,
  },
  {
    slug: "hexagon-mosaic-white-black",
    sku: "7S-TL-HEX2",
    name: "Hexagon Mosaic — White & Black",
    category: "tile",
    type: "Mosaic",
    price: 7.99,
    unit: "sqft",
    sqftPerBox: 9.6,
    summary: '2" hex on mesh sheets · Matte',
    description: "Small hex mosaic on mesh-backed sheets — a classic bathroom floor.",
    specs: [
      ["Tile size", '2" hexagon'],
      ["Sheet size", '12" × 12"'],
      ["Material", "Porcelain"],
      ["Coverage per box", "9.6 sq ft (10 sheets)"],
      ["Use", "Floor & wall, indoor"],
    ],
    visual: { kind: "tile", color: "#f2f2f0", grout: "#c9c6bf", size: "small" },
    stock: 60,
  },
];

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export const categoryIds = categories.map((c) => c.id);

export function isCategoryId(v: string): v is CategoryId {
  return (categoryIds as string[]).includes(v);
}

/** What the cart remembers about a product at the moment it was added.
 *  The server re-checks prices against the database when an order is placed. */
export type CartSnapshot = {
  slug: string;
  sku: string;
  name: string;
  unitPrice: number;
  unitLabel: string;
  sqftPerBox?: number;
  visual: Visual;
};

export function cartSnapshot(p: Product): CartSnapshot {
  return {
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    unitPrice: unitPrice(p),
    unitLabel: unitLabel(p),
    sqftPerBox: p.sqftPerBox,
    visual: p.visual,
  };
}

/** Price of one sellable unit: a box for flooring/tile, or one item. */
export function unitPrice(p: Product): number {
  return p.unit === "sqft" && p.sqftPerBox ? round2(p.price * p.sqftPerBox) : p.price;
}

export function unitLabel(p: Product): string {
  if (p.unit === "each") return "each";
  return p.category === "vinyl" && p.type === "Sheet vinyl" ? "per piece" : "per box";
}

export function priceLabel(p: Product): string {
  return p.unit === "sqft" ? "/ sq ft" : "";
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function searchIn(products: Product[], query: string): Product[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return products.filter((p) => {
    const haystack = [p.name, p.sku, p.type, p.category, p.summary].join(" ").toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}
