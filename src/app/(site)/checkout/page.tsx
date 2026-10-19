import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-[72px] pt-8 sm:px-6">
      <h1 className="mb-6 font-display text-[48px] font-bold uppercase leading-none sm:text-[56px]">Checkout</h1>
      <Suspense fallback={<p className="text-muted">Loading checkout…</p>}>
        <CheckoutForm />
      </Suspense>
    </div>
  );
}
