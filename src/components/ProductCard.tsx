import Link from "next/link";
import { cartSnapshot, hasPrice, priceLabel, sizeSummary, totalStock, type Product } from "@/lib/catalog";
import { money } from "@/lib/money";
import { AddToCartButton } from "./AddToCartButton";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const href = `/product/${product.slug}`;
  const stock = totalStock(product);
  const sizes = sizeSummary(product);
  const priced = hasPrice(product);
  const simple = product.variants.length === 0 && priced;

  return (
    <article className="flex flex-col border border-line bg-surface">
      <Link href={href} className="block text-ink no-underline">
        <div className="relative">
          <ProductImage src={product.images[0]} visual={product.visual} alt={product.name} className="aspect-[4/5] border-b border-[#eeece7]" />
          {stock != null && stock > 0 && (
            <span className="absolute left-3 top-3 bg-night px-2.5 py-1 text-[13px] font-semibold text-white">{stock} in stock</span>
          )}
        </div>
        <div className="flex flex-col gap-1 px-5 pb-2 pt-4">
          <span className="text-[13px] font-semibold uppercase tracking-wider text-subtle">{product.type}</span>
          <h3 className="text-[19px] font-semibold leading-snug">{product.name}</h3>
          <span className="text-sm text-muted">{product.summary}</span>
          {sizes && <span className="text-sm text-muted">Sizes: {sizes}</span>}
          {priced ? (
            <span className="mt-1 font-display text-[28px] font-bold">
              {money(product.price ?? 0)}
              <span className="ml-1 font-sans text-sm font-medium text-subtle">{priceLabel(product) || "each"}</span>
            </span>
          ) : (
            <span className="mt-1 font-display text-[24px] font-bold text-brand-dark">{product.priceNote ?? "Price on request"}</span>
          )}
        </div>
      </Link>
      <div className="mt-auto px-5 pb-5 pt-2">
        {simple ? (
          <AddToCartButton item={cartSnapshot(product)} variant="outline" />
        ) : (
          <Link
            href={href}
            className="flex h-11 items-center justify-center border-2 border-ink font-semibold text-ink no-underline hover:bg-ink hover:text-white"
          >
            {priced ? "Choose size" : "Choose size & get a price"}
          </Link>
        )}
      </div>
    </article>
  );
}
