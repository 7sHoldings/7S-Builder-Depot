import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { requireAdmin } from "@/lib/admin/auth";
import { adminProducts } from "@/lib/admin/data";
import { toEditor } from "@/lib/admin/types";

export const metadata: Metadata = { title: "Edit product" };

export default function EditProductPage(props: PageProps<"/admin/products/[slug]">) {
  return (
    <Suspense fallback={<p className="mx-auto max-w-[1100px] px-4 py-8 text-muted">Loading…</p>}>
      <EditProduct params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function EditProduct({ params, searchParams }: Pick<PageProps<"/admin/products/[slug]">, "params" | "searchParams">) {
  await requireAdmin();
  const { slug } = await params;
  const all = await adminProducts();
  const product = all.find((p) => p.slug === slug);
  if (!product) notFound();
  const types = [...new Set(all.map((p) => `${p.category}|${p.type}`))];
  const { created } = await searchParams;
  return <ProductEditor key={product.slug} initial={toEditor(product)} knownTypes={types} created={created === "1"} />;
}
