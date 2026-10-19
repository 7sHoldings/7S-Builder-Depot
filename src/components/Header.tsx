"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useState } from "react";
import { useCartCount } from "@/lib/cart";
import { site } from "@/lib/site";
import { CartIcon, CloseIcon, MenuIcon, PhoneIcon, SearchIcon } from "./Icons";
import { Logo } from "./Logo";

const baseLinks = [
  { href: "/shop/vinyl", label: "Vinyl" },
  { href: "/shop/doors", label: "Doors" },
  { href: "/shop/windows", label: "Windows" },
  { href: "/shop/tile", label: "Tile" },
  { href: "/quote", label: "Pro & Contractors" },
];

export function Header({ showTile = false }: { showTile?: boolean }) {
  const links = showTile ? baseLinks : baseLinks.filter((l) => l.href !== "/shop/tile");
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="bg-night text-sm text-[#e7e5e0]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
          <a href={site.phoneHref} className="text-[#e7e5e0] no-underline hover:text-glow">
            Call {site.phone}
          </a>
          <span>Open {site.hours} · Pickup &amp; delivery</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
          <Logo />

          <nav aria-label="Main" className="hidden lg:block">
            <Suspense fallback={<NavLinks links={links} active={null} />}>
              <ActiveNavLinks links={links} />
            </Suspense>
          </nav>

          <div className="ml-auto flex flex-1 items-center justify-end gap-3">
            <SearchForm className="hidden max-w-[360px] flex-1 md:flex" />
            <CartButton />
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center border border-line-strong bg-surface lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {open && (
          <div id="mobile-menu" className="border-t border-line bg-surface lg:hidden">
            <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-4 sm:px-6">
              <SearchForm className="flex md:hidden" />
              <nav aria-label="Mobile" onClick={() => setOpen(false)}>
                <Suspense fallback={<NavLinks links={links} active={null} vertical />}>
                  <ActiveNavLinks links={links} vertical />
                </Suspense>
              </nav>
              <a href={site.phoneHref} className="flex items-center gap-2 font-semibold">
                <PhoneIcon size={18} /> {site.phone}
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

type NavLink = (typeof baseLinks)[number];

function ActiveNavLinks({ links, vertical = false }: { links: NavLink[]; vertical?: boolean }) {
  const pathname = usePathname();
  return <NavLinks links={links} active={pathname} vertical={vertical} />;
}

function NavLinks({ links, active, vertical = false }: { links: NavLink[]; active: string | null; vertical?: boolean }) {
  return (
    <ul className={`flex font-semibold ${vertical ? "flex-col gap-1" : "flex-wrap gap-x-6"}`}>
      {links.map((l) => {
        const isActive = active !== null && active.startsWith(l.href);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={isActive ? "page" : undefined}
              className={`block py-2.5 no-underline ${isActive ? "border-b-[3px] border-brand text-brand" : "text-ink"}`}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SearchForm({ className = "" }: { className?: string }) {
  return (
    <form action="/search" role="search" className={className}>
      <label className="flex h-11 w-full items-center gap-2 border border-line-strong bg-[#fafaf8] px-3.5 focus-within:border-ink">
        <SearchIcon size={18} className="text-subtle" />
        <span className="sr-only">Search products</span>
        <input
          type="search"
          name="q"
          placeholder="Search doors, tile, SKU…"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none"
        />
      </label>
    </form>
  );
}

function CartButton() {
  const count = useCartCount();
  return (
    <Link
      href="/cart"
      aria-label={count ? `Cart, ${count} items` : "Cart"}
      className="relative flex h-11 w-11 items-center justify-center border border-line-strong bg-surface text-ink"
    >
      <CartIcon />
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-xs font-bold text-white"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
