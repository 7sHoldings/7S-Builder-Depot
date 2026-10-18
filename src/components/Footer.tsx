import Link from "next/link";
import { categories } from "@/lib/catalog";
import { fullAddress, mapsHref, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-night-deep text-[15px] text-night-text">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8 px-4 pb-8 pt-12 sm:px-6">
        <div className="flex flex-col gap-2.5">
          <span className="font-display text-[26px] font-bold uppercase text-white">{site.name}</span>
          <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="text-night-text">
            {fullAddress}
          </a>
          <a href={site.phoneHref} className="text-night-text">
            {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="break-all text-night-text">
            {site.email}
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-white">Shop</span>
          {categories.map((c) => (
            <Link key={c.id} href={`/shop/${c.id}`} className="text-night-text">
              {c.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-white">Services</span>
          <Link href="/quote" className="text-night-text">
            Request a quote
          </Link>
          <Link href="/quote" className="text-night-text">
            Pro accounts
          </Link>
          <Link href="/cart" className="text-night-text">
            Delivery &amp; pickup
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-white">Hours</span>
          <span>{site.hours}</span>
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] border-t border-night-line px-4 pb-8 pt-4 text-sm sm:px-6">© {site.name}</div>
    </footer>
  );
}
