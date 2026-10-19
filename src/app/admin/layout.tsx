import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | 7S Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-night-line bg-night text-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <span className="rounded-sm bg-white px-2 py-1">
            <Logo height={34} />
          </span>
          <span className="font-display text-xl font-bold uppercase tracking-wide text-night-text">Admin</span>
          <Suspense>
            <AdminNav />
          </Suspense>
        </div>
      </header>
      <main id="main" className="flex-1">
        {children}
      </main>
    </>
  );
}
