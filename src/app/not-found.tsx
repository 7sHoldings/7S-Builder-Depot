import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function NotFound() {
  return (
    <>
    <Header />
    <main id="main" className="flex-1">
    <div className="mx-auto flex max-w-[760px] flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="font-display text-[56px] font-bold uppercase leading-none">Page not found</h1>
      <p className="text-lg text-muted">That page doesn&apos;t exist — it may have moved.</p>
      <Link href="/" className="inline-flex h-[50px] items-center bg-brand px-7 font-semibold text-white no-underline hover:bg-brand-dark hover:text-white">
        Back to home
      </Link>
    </div>
    </main>
    <Footer />
    </>
  );
}
