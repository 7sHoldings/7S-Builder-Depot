import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { categories, getCategory, productsIn } from "@/lib/catalog";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  return c ? { title: c.name, description: c.intro } : {};
}

export default async function CategoryPage({ params }: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-[72px] pt-6 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-subtle">
        <Link href="/" className="text-subtle">
          Home
        </Link>{" "}
        / <span className="text-ink">{c.name}</span>
      </nav>
      <h1 className="font-display text-[48px] font-bold uppercase leading-none sm:text-[56px]">{c.name}</h1>
      <p className="mb-6 mt-2 text-[17px] text-muted">{c.intro}</p>
      <CategoryBrowser types={c.types} products={productsIn(c.id)} />
    </div>
  );
}
