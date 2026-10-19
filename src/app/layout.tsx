import type { Metadata } from "next";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: `${site.name} — Vinyl, Doors, Windows & Tile in Kerens, TX`,
    template: `%s | ${site.name}`,
  },
  description:
    "Building materials for homeowners and contractors: luxury vinyl flooring, doors, windows and tile. Shop online, request a quote, and pick up or get delivery.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-ground text-ink">{children}</body>
    </html>
  );
}
