import type { Metadata } from "next";
import {
  Fraunces,
  Inter,
  Geist_Mono,
  Noto_Sans_Devanagari,
  Noto_Sans_Gurmukhi,
} from "next/font/google";
import { MotifDefs } from "@/components/ornament/motif-defs";
import { SiteHeader } from "@/components/commerce/site-header";
import { CartDrawer } from "@/components/commerce/cart-drawer";
import { PageFrame } from "@/components/ornament/page-frame";
import "./globals.css";

/* Display. The WONK axis swells the stroke along its own path — the closest
   type equivalent to Madhubani's double-line kachni contour. */
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/* Indic partners. next/font emits these behind a unicode-range, so a
   Latin-only page downloads zero bytes of them. */
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-deva",
  subsets: ["devanagari"],
  display: "swap",
});

const notoGurmukhi = Noto_Sans_Gurmukhi({
  variable: "--font-noto-guru",
  subsets: ["gurmukhi"],
  display: "swap",
});

const SITE = "https://thepinkestore.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "The Pinkestore — Handmade textiles, one piece at a time",
    template: "%s · The Pinkestore",
  },
  description:
    "Kashmiri sozni pashminas, jamawar kani weaves, Lucknowi chikankari and hand-painted Mithila work. Every piece is one of one. A Punjab shop, carrying India's needle and loom traditions.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "The Pinkestore",
    title: "The Pinkestore — Handmade textiles, one piece at a time",
    description:
      "Sozni, jamawar kani, chikankari and hand-painted Mithila. One of one, every time.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={[
        fraunces.variable,
        inter.variable,
        geistMono.variable,
        notoDevanagari.variable,
        notoGurmukhi.variable,
        "h-full",
      ].join(" ")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col px-[22px] py-[22px]">
        <MotifDefs />
        <PageFrame />
        <SiteHeader />
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
