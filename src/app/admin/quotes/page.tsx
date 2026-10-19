import type { Metadata } from "next";
import { Suspense } from "react";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { requireAdmin } from "@/lib/admin/auth";
import { adminQuotes, statusCounts } from "@/lib/admin/data";
import { QUOTE_STATUSES } from "@/lib/admin/types";
import { categories } from "@/lib/catalog";

export const metadata: Metadata = { title: "Quote requests" };

const when = (d: Date) => d.toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" });

export default function QuotesPage(props: PageProps<"/admin/quotes">) {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="font-display text-[44px] font-bold uppercase leading-none">Quote requests</h1>
      <Suspense fallback={<p className="text-muted">Loading quote requests…</p>}>
        <Quotes searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Quotes({ searchParams }: Pick<PageProps<"/admin/quotes">, "searchParams">) {
  await requireAdmin();
  const { status } = await searchParams;
  const current = (QUOTE_STATUSES as readonly string[]).includes(String(status)) ? String(status) : undefined;
  const quotes = await adminQuotes(current);
  const counts = await statusCounts("quote_requests");

  return (
    <>
      <StatusTabs base="/admin/quotes" statuses={QUOTE_STATUSES} counts={counts} current={current} />
      {quotes.length === 0 ? (
        <div className="border border-line bg-surface p-8 text-muted">No quote requests here yet.</div>
      ) : (
        <ul className="flex flex-col gap-4">
          {quotes.map((q) => (
            <li key={q.id} className="flex flex-col gap-3 border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-display text-2xl font-bold uppercase">
                    {q.reference} · {q.name}
                    {q.company ? ` (${q.company})` : ""}
                  </div>
                  <div className="text-sm text-subtle">
                    {when(q.created_at)} · {q.source === "home_page" ? "Home page form" : "Quote form"}
                    {q.customer_type ? ` · ${q.customer_type}` : ""}
                  </div>
                </div>
                <StatusSelect kind="quote" id={q.id} value={q.status} options={QUOTE_STATUSES} />
              </div>
              <div className="grid grid-cols-1 gap-3 text-[15px] md:grid-cols-3">
                <div>
                  <a href={`tel:${q.phone}`}>{q.phone}</a>
                  {q.email && (
                    <>
                      <br />
                      <a href={`mailto:${q.email}`}>{q.email}</a>
                    </>
                  )}
                </div>
                <div className="text-muted">
                  {q.materials.length > 0 && <div>Materials: {q.materials.map((m) => categories.find((c) => c.id === m)?.name ?? m).join(", ")}</div>}
                  {q.area_sqft && <div>Area: {Number(q.area_sqft)} sq ft</div>}
                  {q.door_window_count != null && <div>Doors / windows: {q.door_window_count}</div>}
                  {q.timeline && <div>Timeline: {q.timeline}</div>}
                  {q.zip && <div>ZIP: {q.zip}</div>}
                </div>
                <div>{q.details && <p className="whitespace-pre-line">{q.details}</p>}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
