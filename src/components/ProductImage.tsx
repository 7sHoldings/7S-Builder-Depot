import Image from "next/image";
import type { Visual } from "@/lib/catalog";
import { ProductVisual } from "./ProductVisual";

/** Product photo (white 4:5 card) with a drawn fallback when there is no photo. */
export function ProductImage({
  src,
  visual,
  alt,
  className = "",
  sizes = "(max-width: 640px) 100vw, 400px",
  priority = false,
}: {
  src?: string;
  visual: Visual;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return <ProductVisual visual={visual} label={alt} className={className} />;
  return (
    <div className={`relative overflow-hidden bg-white ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-contain" />
    </div>
  );
}
