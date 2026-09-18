"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

/**
 * Client boundary for the WebGL layer.
 *
 * `dynamic(..., { ssr: false })` cannot be called from a Server Component in
 * Next 15+, and the root layout is one — hence this wrapper.
 *
 * Two wins:
 *  · three.js, R3F and drei leave the initial JS bundle entirely and arrive in
 *    their own chunk after first paint, so the editorial typography renders
 *    immediately instead of waiting behind ~500KB of renderer.
 *  · WebGL has no meaning on the server; ssr:false removes a guaranteed
 *    hydration mismatch rather than papering over it.
 *
 * No loading placeholder on purpose: the page has its own dark ground and the
 * DOM is designed to be readable with no canvas at all.
 */
const GlobalCanvas = dynamic(
  () => import("./global-canvas").then((m) => m.GlobalCanvas),
  { ssr: false },
);

/**
 * The cinematic layer belongs to the HOMEPAGE ONLY.
 *
 * It was mounted in the root layout, so the WebGL void and its gold dust were
 * rendering behind the product and checkout pages too — which are designed for
 * a light ground. The result was dark type on a dark canvas: technically
 * "working", completely unreadable.
 *
 * Route-gating also means those pages never download three.js at all.
 */
export function CanvasMount() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <GlobalCanvas />;
}
