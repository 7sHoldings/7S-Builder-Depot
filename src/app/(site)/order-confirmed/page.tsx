import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/OrderConfirmation";

export const metadata: Metadata = { title: "Order placed", robots: { index: false } };

export default function OrderConfirmedPage() {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-16 sm:px-6">
      <OrderConfirmation />
    </div>
  );
}
