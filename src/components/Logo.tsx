import Link from "next/link";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-3 no-underline ${dark ? "text-white" : "text-ink"}`} aria-label="7S Builder Depot home">
      <span className="flex h-12 w-12 items-center justify-center bg-brand font-display text-[26px] font-bold text-white">7S</span>
      <span className="font-display text-2xl font-bold uppercase leading-none tracking-wide">
        Builder
        <br />
        Depot
      </span>
    </Link>
  );
}
