import { site } from "./site";

export type Fulfillment = "pickup" | "delivery";

export function orderTotals(subtotal: number, fulfillment: Fulfillment) {
  const delivery = fulfillment === "delivery" && subtotal > 0 ? site.deliveryFee : 0;
  const tax = Math.round(subtotal * site.taxRate * 100) / 100;
  return { subtotal, delivery, tax, total: subtotal + delivery + tax };
}
