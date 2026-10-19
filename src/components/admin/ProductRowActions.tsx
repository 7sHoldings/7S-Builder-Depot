"use client";

import Link from "next/link";
import { useTransition } from "react";
import { setProductActive } from "@/app/admin/actions";

export function ProductRowActions({ slug, active }: { slug: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex items-center justify-end gap-3 whitespace-nowrap text-sm font-semibold">
      <Link href={`/admin/products/${slug}`}>Edit</Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => setProductActive(slug, !active))}
        className="text-brand-dark underline disabled:opacity-50"
      >
        {pending ? "Saving…" : active ? "Hide" : "Show"}
      </button>
      {active && (
        <a href={`/product/${slug}`} target="_blank" className="text-subtle">
          View ↗
        </a>
      )}
    </div>
  );
}
