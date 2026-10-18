import type { Metadata } from "next";
import { QuoteWizard } from "@/components/QuoteWizard";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request a quote",
  description: "Get materials and pricing for your project — homeowners, contractors and property managers.",
};

export default function QuotePage() {
  return (
    <div className="mx-auto flex max-w-[860px] flex-col gap-6 px-4 pb-[72px] pt-10 sm:px-6">
      <div>
        <h1 className="font-display text-[48px] font-bold uppercase leading-none sm:text-[56px]">Request a quote</h1>
        <p className="mt-2 text-[17px] text-muted">
          Tell us about your project and we&apos;ll reply with materials and pricing. Prefer to talk? Call{" "}
          <a href={site.phoneHref} className="font-semibold text-ink">
            {site.phone}
          </a>
          .
        </p>
      </div>
      <QuoteWizard />
    </div>
  );
}
