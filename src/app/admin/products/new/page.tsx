import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { requireAdmin } from "@/lib/admin/auth";
import { adminProducts } from "@/lib/admin/data";
import { blankProduct } from "@/lib/admin/types";
import { isCategoryId } from "@/lib/catalog";

export const metadata: Metadata = { title: "Add product" };

export default function NewProductPage(props: PageProps<"/admin/products/new">) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-[1100px] px-4 py-8 text-muted">Loading…</p>}>
      <NewProduct searchParams={props.searchParams} />
    </Suspense>
  );
}

async function NewProduct({ searchParams }: Pick<PageProps<"/admin/products/new">, "searchParams">) {
  await requireAdmin();
  const { cat } = await searchParams;
  const all = await adminProducts();
  const types = [...new Set(all.map((p) => `${p.category}|${p.type}`))];
  return <ProductEditor initial={blankProduct(typeof cat === "string" && isCategoryId(cat) ? cat : "doors")} knownTypes={types} />;
}
