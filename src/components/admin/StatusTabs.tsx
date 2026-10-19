import Link from "next/link";
import { statusLabel } from "@/lib/admin/types";

export function StatusTabs({
  base,
  statuses,
  counts,
  current,
}: {
  base: string;
  statuses: readonly string[];
  counts: Record<string, number>;
  current?: string;
}) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <nav aria-label="Status" className="flex flex-wrap gap-2">
      {[undefined, ...statuses].map((s) => {
        const on = s === current;
        return (
          <Link
            key={s ?? "all"}
            href={s ? `${base}?status=${s}` : base}
            aria-current={on ? "page" : undefined}
            className={`border px-4 py-2 font-semibold no-underline ${on ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-ink hover:border-ink"}`}
          >
            {s ? statusLabel(s) : "All"} <span className={on ? "text-white/70" : "text-subtle"}>{s ? (counts[s] ?? 0) : total}</span>
          </Link>
        );
      })}
    </nav>
  );
}
