// Small input validators for the API routes (no extra dependencies).

export class InputError extends Error {}

type Obj = Record<string, unknown>;

export function asObject(v: unknown): Obj {
  if (typeof v !== "object" || v === null || Array.isArray(v)) throw new InputError("Invalid request.");
  return v as Obj;
}

export function str(o: Obj, key: string, { required = false, max = 200 } = {}): string | undefined {
  const v = o[key];
  if (v == null || v === "") {
    if (required) throw new InputError(`Missing ${key}.`);
    return undefined;
  }
  if (typeof v !== "string") throw new InputError(`Invalid ${key}.`);
  const t = v.trim();
  if (required && !t) throw new InputError(`Missing ${key}.`);
  if (t.length > max) throw new InputError(`${key} is too long.`);
  return t || undefined;
}

export function requiredStr(o: Obj, key: string, max = 200): string {
  return str(o, key, { required: true, max })!;
}

export function email(o: Obj, key: string, required: boolean): string | undefined {
  const v = str(o, key, { required, max: 254 });
  if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw new InputError("Please enter a valid email address.");
  return v;
}

export function phone(o: Obj, key: string): string {
  const v = requiredStr(o, key, 40);
  if ((v.match(/\d/g) ?? []).length < 7) throw new InputError("Please enter a valid phone number.");
  return v;
}

export function int(o: Obj, key: string, { min = 0, max = 1_000_000 } = {}): number | undefined {
  const v = o[key];
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < min || n > max) throw new InputError(`Invalid ${key}.`);
  return Math.round(n);
}

export function oneOf<T extends string>(o: Obj, key: string, options: readonly T[], fallback?: T): T {
  const v = o[key];
  if (v == null && fallback) return fallback;
  if (typeof v !== "string" || !options.includes(v as T)) throw new InputError(`Invalid ${key}.`);
  return v as T;
}

/** Hidden "website" field — real visitors never fill it in, spam bots do. */
export function isBot(o: Obj): boolean {
  return typeof o.website === "string" && o.website.trim() !== "";
}
