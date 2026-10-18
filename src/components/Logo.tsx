import Image from "next/image";
import Link from "next/link";
import logo from "../../public/brand/logo.png";

export function Logo({ height = 52 }: { height?: number }) {
  return (
    <Link href="/" className="flex shrink-0 items-center no-underline" aria-label="7S Builder Depot home">
      <Image
        src={logo}
        alt="7S Builder Depot — Supply · Deliver · Build"
        priority
        style={{ height, width: "auto" }}
        sizes={`${Math.round((height * logo.width) / logo.height)}px`}
      />
    </Link>
  );
}
