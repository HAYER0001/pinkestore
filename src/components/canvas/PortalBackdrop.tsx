"use client";

import { useEffect, useRef } from "react";
import { portalStore } from "@/utils/animations/portal-store";

/**
 * What lies BEHIND the canvas.
 *
 * The WebGL layer sits at z-index -1. This sits at -2, so when the portal
 * dissolves a hole in the fabric there is something on the far side of it:
 * a warm gallery ground that fades up as the camera pushes through.
 *
 * Driven by rAF reading the module store directly — putting this on React
 * state would re-render the tree every frame of the flight.
 */
export function PortalBackdrop() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let shown = -1;
    const loop = () => {
      const p = portalStore.progress;
      /* only start warming once the hole is genuinely opening */
      const v = Math.max(0, Math.min((p - 0.35) / 0.5, 1));
      const rounded = Math.round(v * 100) / 100;
      if (rounded !== shown && ref.current) {
        shown = rounded;
        ref.current.style.opacity = String(rounded);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -2,
        background:
          "radial-gradient(120% 90% at 50% 45%, #FBF7EF 0%, #F1E8DA 55%, #E4D7C3 100%)",
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}
