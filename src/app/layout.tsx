import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Geist_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/layout/smooth-scroll";
import { CanvasMount } from "@/components/canvas/CanvasMount";
import { ScrollTriggerReset } from "@/components/canvas/ScrollTriggerReset";
import { Overlay } from "@/components/dom/Overlay";
import { CursorProvider } from "@/components/dom/CursorContext";
import { CustomCursor } from "@/components/dom/CustomCursor";
import { AppShell } from "@/components/ecommerce/AppShell";
import { CartDrawer } from "@/components/ecommerce/CartDrawer";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { RouteCurtain } from "@/components/site/RouteCurtain";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

/* Jost replaces Inter entirely. Inter is a UI face — excellent at it, and
   exactly why it reads as software rather than as an editorial page. Jost is
   geometric and takes wide tracking without falling apart, which is the whole
   trick with uppercase luxury micro-type. */
const body = Jost({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});
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
      className={`${display.variable} ${body.variable} ${mono.variable}`}
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
      {/* NO inline style on <body>. React 19 serialises the style prop
          camelCase client-side and kebab-case into the SSR attribute, and
          reports the difference as a hydration mismatch no matter which form
          you write. Body styling lives in globals.css instead. */}
      <body>
        <ScrollProgress />
        {/* An overlay, NOT a wrapper around {children} — see the component. */}
        <RouteCurtain />
        <CanvasMount />
        <ScrollTriggerReset />
        <CursorProvider>
          <CustomCursor />
          <Overlay />
          {/* AppShell is the layer that gets pushed back. The Overlay and the
              CustomCursor above are SIBLINGS of it, so neither inherits the
              blur or the stacking context the pushback creates. */}
          <SmoothScroll>
            <AppShell>{children}</AppShell>
          </SmoothScroll>
          <CartDrawer />
        </CursorProvider>
      </body>
    </html>
  );
}
