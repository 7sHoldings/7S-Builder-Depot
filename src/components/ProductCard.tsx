import Link from "next/link";
import { priceLabel, type Product } from "@/lib/catalog";
import { money } from "@/lib/money";
import { AddToCartButton } from "./AddToCartButton";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product, showAdd = true }: { product: Product; showAdd?: boolean }) {
  const href = `/product/${product.slug}`;
  return (
    <article className="flex flex-col border border-line bg-surface">
      <Link href={href} className="block text-ink no-underline">
        <ProductVisual visual={product.visual} label={product.name} className="aspect-[4/3]" />
        <div className="flex flex-col gap-1 px-[18px] pb-2 pt-4">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-subtle">{product.type}</span>
          <h3 className="text-[17px] font-semibold leading-snug">{product.name}</h3>
          <span className="text-sm text-muted">{product.summary}</span>
          <span className="mt-1 font-display text-[26px] font-bold">
            {money(product.price)}
            {priceLabel(product) && <span className="ml-1 font-sans text-sm font-medium text-subtle">{priceLabel(product)}</span>}
          </span>
        </div>
      </Link>
      {showAdd && (
        <div className="mt-auto px-[18px] pb-[18px] pt-2">
          <AddToCartButton slug={product.slug} variant="outline" />
        </div>
      )}
    </article>
  );
}
