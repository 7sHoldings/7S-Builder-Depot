import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetail } from "@/components/ProductDetail";
import { getCategory } from "@/lib/catalog";
import { getAllProducts, getProduct } from "@/lib/products";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  return p ? { title: p.name, description: p.description } : {};
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const category = getCategory(product.category)!;
  const related = (await getAllProducts())
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-[72px] pt-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm text-subtle">
        <Link href="/" className="text-subtle">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/shop/${category.id}`} className="text-subtle">
          {category.name}
        </Link>{" "}
        / <span className="text-ink">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-[36px] font-bold uppercase leading-none">More {category.name.toLowerCase()}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
