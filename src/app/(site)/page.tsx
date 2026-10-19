import Link from "next/link";
import { ProIcon, QuoteIcon, RulerIcon, TruckIcon } from "@/components/Icons";
import { ProductCard } from "@/components/ProductCard";
import { ProductImage } from "@/components/ProductImage";
import { QuickQuoteForm } from "@/components/QuickQuoteForm";
import { categories } from "@/lib/catalog";
import { getAllProducts, getFeaturedProducts } from "@/lib/products";
import { site } from "@/lib/site";

const services = [
  { icon: QuoteIcon, title: "Free project quotes", text: "Send your measurements, get pricing back." },
  { icon: TruckIcon, title: "Pickup or job-site delivery", text: "Choose what works at checkout." },
  { icon: RulerIcon, title: "Coverage calculators", text: "Know how many boxes before you buy." },
  { icon: ProIcon, title: "Pro accounts", text: "Contractor pricing & job-based orders." },
];

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const all = await getAllProducts();
  // A category with no products yet (tile today) shows as "coming soon"
  const cards = categories.map((c) => {
    const first = all.find((p) => p.category === c.id);
    return { ...c, open: !!first, image: c.image ?? first?.images[0], blurb: first || c.id !== "tile" ? (c.id === "tile" ? "Floor & wall tile" : c.blurb) : c.blurb };
  });
  return (
    <>
      {/* Hero */}
      <section className="bg-surface">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-12 px-4 pb-16 pt-14 sm:px-6">
          <div className="flex flex-[1_1_440px] flex-col gap-6">
            <span className="text-sm font-semibold uppercase tracking-[2px] text-brand">Supply · Deliver · Build</span>
            <h1 className="font-display text-[52px] font-bold uppercase leading-[0.95] tracking-wide sm:text-[72px]">
              Build it right,
              <br />
              from the floor up.
            </h1>
            <p className="max-w-[520px] text-[19px] text-muted">
              Quality building materials for homeowners and contractors. Shop online, get a project quote, and pick up or have it delivered to the job
              site.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="#shop" className="inline-flex h-[52px] items-center bg-brand px-7 text-[17px] font-semibold text-white no-underline hover:bg-brand-dark hover:text-white">
                Shop materials
              </Link>
              <Link href="/quote" className="inline-flex h-[52px] items-center border-2 border-ink bg-surface px-7 text-[17px] font-semibold text-ink no-underline">
                Request a quote
              </Link>
            </div>
          </div>

          {/* Product board: real products from each category */}
          <div className="grid flex-[1_1_440px] grid-cols-2 grid-rows-2 gap-3">
            <Link href="/shop/doors" className="row-span-2 block border border-line" aria-label="Shop doors">
              <ProductImage src="/products/door-2panel-a.jpg" visual={categories[1].visual} alt="2-panel Shaker prehung door" className="h-full min-h-[360px]" priority sizes="(max-width: 900px) 50vw, 300px" />
            </Link>
            <Link href="/shop/vinyl" className="block border border-line" aria-label="Shop vinyl">
              <ProductImage src="/products/vinyl-smoky-grey-oak.jpg" visual={categories[0].visual} alt="Smoky Grey Oak vinyl plank" className="h-[200px] sm:h-[220px]" priority sizes="(max-width: 900px) 50vw, 300px" />
            </Link>
            <Link href="/shop/windows" className="block border border-line" aria-label="Shop windows">
              <ProductImage src="/products/window-single-hung-30x60.jpg" visual={categories[2].visual} alt="Single hung window" className="h-[200px] sm:h-[220px]" priority sizes="(max-width: 900px) 50vw, 300px" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="shop" className="mx-auto max-w-[1280px] scroll-mt-28 px-4 pb-8 pt-[72px] sm:px-6">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-[44px] font-bold uppercase leading-none">Shop by category</h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
          {cards.map((c) => (
            <Link key={c.id} href={`/shop/${c.id}`} className="group flex flex-col border border-line bg-surface text-ink no-underline">
              <ProductImage src={c.image} visual={c.visual} alt={c.name} className="h-[240px] border-b border-[#eeece7]" sizes="(max-width: 640px) 100vw, 300px" />
              <div className="flex flex-col gap-1.5 p-5">
                <span className="font-display text-[28px] font-bold uppercase">{c.name}</span>
                <span className="text-[15px] text-muted">{c.blurb}</span>
                <span className="mt-2 font-semibold text-brand group-hover:underline">{c.open ? `Shop ${c.name.toLowerCase()} →` : `Ask us about ${c.name.toLowerCase()} →`}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Services strip */}
      <section className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-px border border-line bg-line">
          {services.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4 bg-surface p-6">
              <Icon size={32} className="shrink-0 text-brand" />
              <div>
                <div className="text-[17px] font-semibold">{title}</div>
                <div className="text-[15px] text-muted">{text}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-[1280px] px-4 pb-[72px] pt-12 sm:px-6">
        <h2 className="mb-7 font-display text-[44px] font-bold uppercase leading-none">Featured products</h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-5">
          {featuredProducts.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* Quote band */}
      <section id="quote" className="bg-night text-ground">
        <div className="mx-auto flex max-w-[1280px] flex-wrap gap-12 px-4 py-[72px] sm:px-6">
          <div className="flex flex-[1_1_380px] flex-col gap-4">
            <h2 className="font-display text-[52px] font-bold uppercase leading-none">
              Planning a project?
              <br />
              <span className="text-glow">Get a quote.</span>
            </h2>
            <p className="max-w-[440px] text-lg text-night-text">
              Tell us what you&apos;re building. Our team will put together materials and pricing for your job.
            </p>
            <p className="text-lg text-night-text">
              Or call{" "}
              <a href={site.phoneHref} className="font-semibold text-white">
                {site.phone}
              </a>
            </p>
          </div>
          <QuickQuoteForm />
        </div>
      </section>
    </>
  );
}
