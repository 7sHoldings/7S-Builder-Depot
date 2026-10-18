import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchResults } from "@/components/SearchResults";

export const metadata: Metadata = { title: "Search" };

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-[72px] pt-8 sm:px-6">
      <Suspense fallback={<p className="text-muted">Searching…</p>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
