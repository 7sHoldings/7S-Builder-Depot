import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-[72px] pt-8 sm:px-6">
      <CartView />
    </div>
  );
}
