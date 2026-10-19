import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getProductsIn } from "@/lib/products";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const tile = await getProductsIn("tile");
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-surface focus:p-3">
        Skip to content
      </a>
      <Header showTile={tile.length > 0} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
