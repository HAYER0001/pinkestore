"use client";

import { useEffect, useRef } from "react";
import { portalStore } from "@/utils/animations/portal-store";

/**
 * The fixed chrome crosses from a near-black scene to a warm cream one.
 *
 * mix-blend-mode: difference cannot solve this. It inverts against what is
 * painted BELOW the element in the same stacking context — and the reveal
 * layer lives at z-index -2, behind the canvas, so the chrome never sees it
 * and keeps inverting against the dark scene it is no longer sitting on.
 *
 * So the tone is driven explicitly from portal progress instead: white while
 * the scene is dark, ink once it is warm. Written straight to a CSS custom
 * property on <html> via rAF — no React state, no re-render per frame.
 */
export function useChromeTone() {
  const last = useRef(-1);

  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;

    const loop = () => {
      /* cross over the same window the backdrop warms across */
      const t = Math.max(0, Math.min((portalStore.progress - 0.4) / 0.4, 1));
      const rounded = Math.round(t * 50) / 50;

      if (rounded !== last.current) {
        last.current = rounded;
        /* 255 -> 27 : white on the dark side, near-black on the warm side */
        const v = Math.round(255 + (27 - 255) * rounded);
        root.style.setProperty("--chrome-ink", `rgb(${v}, ${v - 2}, ${v - 5})`);
        /* difference is only correct while the ground is dark; past the
           midpoint it would invert our now-dark ink back to light */
        root.style.setProperty("--chrome-blend", rounded > 0.5 ? "normal" : "difference");
      }
      raf = requestAnimationFrame(loop);
    };

    root.style.setProperty("--chrome-ink", "rgb(255, 255, 255)");
    root.style.setProperty("--chrome-blend", "difference");
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      root.style.removeProperty("--chrome-ink");
      root.style.removeProperty("--chrome-blend");
    };
  }, []);
}
