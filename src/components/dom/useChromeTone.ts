"use client";

import { useEffect, useRef } from "react";
import { portalStore } from "@/utils/animations/portal-store";

/**
 * The fixed chrome crosses from a near-black scene to a warm cream one — and,
 * since the redesign, back into two dark chapters and out again.
 *
 * mix-blend-mode: difference cannot solve this. It inverts against what is
 * painted BELOW the element in the same stacking context — and the reveal
 * layer lives at z-index -2, behind the canvas, so the chrome never sees it
 * and keeps inverting against the dark scene it is no longer sitting on.
 *
 * So the tone is driven explicitly. Two sources, in priority order:
 *
 *   1. A section declaring data-chrome="light" | "dark" that currently sits
 *      under the header (the top 72px of the viewport). Chapters declare it.
 *   2. Otherwise, portal progress — white while the scene is dark, ink once
 *      it is warm — exactly as before.
 *
 * Read from a rAF loop, written straight to a CSS custom property on <html>.
 * No React state, no re-render per frame. Position is read with
 * getBoundingClientRect, NOT IntersectionObserver: an instant jump can move a
 * section from below the header to above it without the ratio ever crossing
 * a threshold, and the callback simply never arrives (see useReveal).
 */
export function useChromeTone() {
  const last = useRef<string>("");

  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const HEADER_PX = 72;

    const apply = (t: number) => {
      /* 0 = white chrome (dark ground), 1 = ink chrome (light ground) */
      const rounded = Math.round(t * 50) / 50;
      const key = String(rounded);
      if (key === last.current) return;
      last.current = key;
      /* 255 -> 27 : white on the dark side, near-black on the warm side */
      const v = Math.round(255 + (27 - 255) * rounded);
      root.style.setProperty("--chrome-ink", `rgb(${v}, ${v - 2}, ${v - 5})`);
      /* difference is only correct while the ground is dark; past the
         midpoint it would invert our now-dark ink back to light */
      root.style.setProperty("--chrome-blend", rounded > 0.5 ? "normal" : "difference");
    };

    const loop = () => {
      /* 1. a declared section under the header wins */
      let declared: "light" | "dark" | null = null;
      const sections = document.querySelectorAll<HTMLElement>("[data-chrome]");
      for (const el of sections) {
        const r = el.getBoundingClientRect();
        if (r.top <= HEADER_PX && r.bottom > HEADER_PX) {
          declared = el.dataset.chrome === "dark" ? "dark" : "light";
          break;
        }
      }

      if (declared) {
        apply(declared === "dark" ? 0 : 1);
      } else {
        /* 2. cross over the same window the backdrop warms across */
        const t = Math.max(0, Math.min((portalStore.progress - 0.4) / 0.4, 1));
        apply(t);
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
