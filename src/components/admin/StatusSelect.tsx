"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setOrderStatus, setQuoteStatus } from "@/app/admin/actions";
import { statusLabel } from "@/lib/admin/types";

export function StatusSelect({ kind, id, value, options }: { kind: "order" | "quote"; id: number; value: string; options: readonly string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Status"
      value={value}
      disabled={pending}
      onChange={(e) => {
        const status = e.target.value;
        start(async () => {
          await (kind === "order" ? setOrderStatus(id, status) : setQuoteStatus(id, status));
          router.refresh();
        });
      }}
      className="h-10 border border-line-strong bg-surface px-2 font-semibold disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {statusLabel(o)}
        </option>
      ))}
    </select>
  );
}
