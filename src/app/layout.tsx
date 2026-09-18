import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Geist_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { GlobalCanvas } from "@/components/canvas/global-canvas";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const SITE = "https://thepinkestore.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "The Pinkestore — Hand-painted Mithila textiles",
    template: "%s · The Pinkestore",
  },
  description:
    "Hand-painted Mithila work, Kashmiri sozni and jamawar kani, Lucknowi chikankari. Every piece one of one, from Chandigarh.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${display.variable} ${inter.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      {/*
        TRANSPARENT ALL THE WAY DOWN.

        The WebGL canvas sits at z-index -1 in the ROOT stacking context. For
        `mix-blend-mode: difference` on the DOM text to actually see it, no
        ancestor may create a new stacking context — so nothing here gets a
        transform, filter, opacity or isolation. That is also why the previous
        PageShell wrapper (which animated `scale` and `filter`) is not mounted
        on this layout: it would have silently broken every blend mode.
      */}
      <body style={{ background: "transparent", minHeight: "100svh" }}>
        <GlobalCanvas />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
