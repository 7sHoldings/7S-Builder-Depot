import type { Metadata } from "next";
import { Suspense } from "react";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { StatusTabs } from "@/components/admin/StatusTabs";
import { requireAdmin } from "@/lib/admin/auth";
import { adminOrders, statusCounts } from "@/lib/admin/data";
import { ORDER_STATUSES } from "@/lib/admin/types";
import { money } from "@/lib/money";

export const metadata: Metadata = { title: "Orders" };

const when = (d: Date) => d.toLocaleString("en-US", { timeZone: "America/Chicago", dateStyle: "medium", timeStyle: "short" });

export default function OrdersPage(props: PageProps<"/admin/orders">) {
  return (
    <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="font-display text-[44px] font-bold uppercase leading-none">Orders</h1>
      <Suspense fallback={<p className="text-muted">Loading orders…</p>}>
        <Orders searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Orders({ searchParams }: Pick<PageProps<"/admin/orders">, "searchParams">) {
  await requireAdmin();
  const { status } = await searchParams;
  const current = (ORDER_STATUSES as readonly string[]).includes(String(status)) ? String(status) : undefined;
  const orders = await adminOrders(current);
  const counts = await statusCounts("orders");

  return (
    <>
      <StatusTabs base="/admin/orders" statuses={ORDER_STATUSES} counts={counts} current={current} />
      {orders.length === 0 ? (
        <div className="border border-line bg-surface p-8 text-muted">No orders here yet.</div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-col gap-4 border border-line bg-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-display text-2xl font-bold uppercase">{o.order_number}</div>
                  <div className="text-sm text-subtle">{when(o.created_at)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl font-bold">{money(Number(o.total))}</span>
                  <StatusSelect kind="order" id={o.id} value={o.status} options={ORDER_STATUSES} />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 text-[15px] md:grid-cols-3">
                <div>
                  <div className="font-semibold">{o.customer_name}</div>
                  <a href={`tel:${o.phone}`}>{o.phone}</a>
                  <br />
                  <a href={`mailto:${o.email}`}>{o.email}</a>
                </div>
                <div>
                  <div className="font-semibold">{o.fulfillment === "delivery" ? "Delivery" : "Store pickup"}</div>
                  {o.delivery_address && <div>{o.delivery_address}</div>}
                  {o.requested_date && <div className="text-muted">Requested: {o.requested_date}</div>}
                  <div className="text-muted">{o.payment_method}</div>
                </div>
                <div>{o.notes && <p className="whitespace-pre-line text-muted">“{o.notes}”</p>}</div>
              </div>
              <table className="w-full text-left text-[15px]">
                <tbody>
                  {o.items.map((i, k) => (
                    <tr key={k} className="border-t border-line">
                      <td className="py-2 pr-3">
                        {i.name}
                        <span className="ml-2 text-sm text-subtle">SKU {i.sku}</span>
                      </td>
                      <td className="py-2 pr-3 text-right text-muted">
                        {i.quantity} × {money(Number(i.unit_price))} {i.unit_label}
                      </td>
                      <td className="py-2 text-right font-semibold">{money(Number(i.line_total))}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-line text-muted">
                    <td colSpan={3} className="py-2 text-right text-sm">
                      Subtotal {money(Number(o.subtotal))} · Delivery {money(Number(o.delivery_fee))} · Tax {money(Number(o.tax))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
