import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { ProductImage } from "@/components/ProductImage";
import { requireAdmin } from "@/lib/admin/auth";
import { adminProducts } from "@/lib/admin/data";
import { categories, priceLabel, totalStock } from "@/lib/catalog";

export const metadata: Metadata = { title: "Products" };

export default function AdminProductsPage(props: PageProps<"/admin">) {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-8 sm:px-6">
      <Suspense fallback={<p className="text-muted">Loading products…</p>}>
        <Products searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Products({ searchParams }: Pick<PageProps<"/admin">, "searchParams">) {
  await requireAdmin();
  const { cat } = await searchParams;
  const all = await adminProducts();
  const current = categories.find((c) => c.id === cat)?.id;
  const list = current ? all.filter((p) => p.category === current) : all;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[44px] font-bold uppercase leading-none">Products</h1>
          <p className="mt-1 text-muted">
            {all.filter((p) => p.active).length} on the website · {all.filter((p) => !p.active).length} hidden. Changes show on the website right away.
          </p>
        </div>
        <Link
          href={`/admin/products/new${current ? `?cat=${current}` : ""}`}
          className="inline-flex h-12 items-center bg-brand px-6 font-semibold text-white no-underline hover:bg-brand-dark hover:text-white"
        >
          + Add product
        </Link>
      </div>

      <nav aria-label="Category" className="flex flex-wrap gap-2">
        {[{ id: undefined, name: "All" }, ...categories].map((c) => {
          const on = c.id === current;
          const n = c.id ? all.filter((p) => p.category === c.id).length : all.length;
          return (
            <Link
              key={c.name}
              href={c.id ? `/admin?cat=${c.id}` : "/admin"}
              aria-current={on ? "page" : undefined}
              className={`border px-4 py-2 font-semibold no-underline ${on ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-ink hover:border-ink"}`}
            >
              {c.name} <span className={on ? "text-white/70" : "text-subtle"}>{n}</span>
            </Link>
          );
        })}
      </nav>

      {list.length === 0 ? (
        <div className="border border-line bg-surface p-8 text-muted">No products here yet. Use “Add product” to create one.</div>
      ) : (
        <div className="overflow-x-auto border border-line bg-surface">
          <table className="w-full min-w-[860px] text-left text-[15px]">
            <thead className="border-b border-line bg-ground text-sm text-subtle">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Sizes</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const stock = totalStock({ ...p, variants: p.variants.filter((v) => v.active) });
                return (
                  <tr key={p.slug} className={`border-b border-line last:border-0 ${p.active ? "" : "bg-ground/60 text-muted"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.images[0]} visual={p.visual} alt="" className="h-14 w-12 shrink-0 border border-line" sizes="48px" />
                        <div>
                          <Link href={`/admin/products/${p.slug}`} className="font-semibold text-ink">
                            {p.name}
                          </Link>
                          <div className="text-sm text-subtle">SKU {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {categories.find((c) => c.id === p.category)?.name}
                      <div className="text-sm text-subtle">{p.type}</div>
                    </td>
                    <td className="px-4 py-3">{priceLabel(p)}</td>
                    <td className="px-4 py-3">{p.variants.length || "—"}</td>
                    <td className="px-4 py-3">{stock == null ? <span className="text-subtle">Not tracked</span> : stock}</td>
                    <td className="px-4 py-3">
                      {p.active ? (
                        <span className="bg-ok-soft px-2 py-1 text-sm font-semibold text-ok">On website</span>
                      ) : (
                        <span className="bg-line px-2 py-1 text-sm font-semibold text-muted">Hidden</span>
                      )}
                      {p.featured && <div className="mt-1 text-sm text-subtle">★ Featured</div>}
                    </td>
                    <td className="px-4 py-3">
                      <ProductRowActions slug={p.slug} active={p.active} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
