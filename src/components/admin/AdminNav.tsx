"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/auth-actions";

const links = [
  { href: "/admin", label: "Products", match: (p: string) => p === "/admin" || p.startsWith("/admin/products") },
  { href: "/admin/orders", label: "Orders", match: (p: string) => p.startsWith("/admin/orders") },
  { href: "/admin/quotes", label: "Quote requests", match: (p: string) => p.startsWith("/admin/quotes") },
];

export function AdminNav() {
  const path = usePathname();
  if (path.startsWith("/admin/login")) return null;
  return (
    <>
      <nav aria-label="Admin" className="flex flex-wrap gap-1">
        {links.map((l) => {
          const on = l.match(path);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={on ? "page" : undefined}
              className={`px-3 py-2 font-semibold no-underline ${on ? "bg-white/10 text-white" : "text-night-text hover:text-white"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <a href="/" target="_blank" className="text-sm font-semibold text-night-text no-underline hover:text-white">
          View website ↗
        </a>
        <form action={logout}>
          <button className="border border-night-text/40 px-3 py-1.5 text-sm font-semibold text-white hover:border-white">Sign out</button>
        </form>
      </div>
    </>
  );
}
