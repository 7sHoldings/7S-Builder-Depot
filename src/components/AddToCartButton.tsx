"use client";

import Link from "next/link";
import { useState } from "react";
import { cart } from "@/lib/cart";
import { CheckIcon } from "./Icons";

export function AddToCartButton({
  slug,
  qty = 1,
  color,
  label = "Add to cart",
  variant = "solid",
}: {
  slug: string;
  qty?: number;
  color?: string;
  label?: string;
  variant?: "solid" | "outline";
}) {
  const [added, setAdded] = useState(false);

  const base = "flex h-11 w-full items-center justify-center gap-2 font-semibold transition-colors";
  const style =
    variant === "solid"
      ? "h-[54px] bg-brand text-[17px] text-white hover:bg-brand-dark"
      : "border-2 border-ink bg-surface text-ink hover:bg-ink hover:text-white";

  if (added) {
    return (
      <div className="flex flex-col gap-2" role="status">
        <span className={`${base} border-2 border-ok bg-ok-soft text-ok ${variant === "solid" ? "h-[54px]" : ""}`}>
          <CheckIcon size={18} /> Added
        </span>
        <Link href="/cart" className="text-center text-sm font-semibold text-brand-dark">
          View cart →
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={`${base} ${style}`}
      onClick={() => {
        cart.add(slug, qty, color);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 2500);
      }}
    >
      {label}
    </button>
  );
}
