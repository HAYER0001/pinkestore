"use client";

import { useEffect, useState } from "react";
import { scrubStore } from "@/utils/animations/scrub-store";

/**
 * The scroll track. 450vh of runway that ScrollTrigger maps onto 144 frames.
 *
 * The DOM here is deliberately almost empty — its job is to BE the scroll
 * distance. Copy is pinned in sticky viewports so it reads over the footage
 * without adding height of its own.
 */

const BEATS = [
  { at: 0.06, k: "०१ · मिथिला", t: "Painted, not printed", s: "No pencil underneath. No second attempt." },
  { at: 0.30, k: "०२ · कश्मीर", t: "Months, not minutes", s: "One sozni shawl can hold a year of someone's hands." },
  { at: 0.54, k: "०३ · जामावार", t: "Woven one pass at a time", s: "Small wooden spools, a coded talim, no shortcut." },
  { at: 0.76, k: "०४ · लखनऊ", t: "White on blush", s: "Shadow-work, worked from the reverse." },
  { at: 0.93, k: "०५", t: "Yours, once", s: "When a piece goes, it is not restocked." },
];

export function ScrubTrack() {
  const [p, setP] = useState(0);

  /* Poll the external store on rAF instead of subscribing to every scroll
     event — this component only needs to repaint when a beat crosses, not at
     the 120Hz the scrubber itself runs at. */
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      const v = Math.round(scrubStore.getProgress() * 100) / 100;
      if (v !== last) {
        last = v;
        setP(v);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div id="scrub-track" style={{ position: "relative", height: "450vh" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100svh",
          display: "flex",
          alignItems: "flex-end",
          padding: "0 clamp(1rem, 5vw, 5rem) clamp(3rem, 9vh, 7rem)",
          pointerEvents: "none",
        }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          {BEATS.map((b) => {
            /* each beat is lit within a window around its position */
            const d = Math.abs(p - b.at);
            const on = 1 - Math.min(d / 0.1, 1);
            return (
              <div
                key={b.k}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  opacity: on,
                  transform: `translateY(${(1 - on) * 16}px)`,
                  willChange: "opacity, transform",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-geist-mono)",
                    fontSize: "clamp(10px,1vw,12px)",
                    letterSpacing: "0.26em",
                    color: "#E8BC57",
                    marginBottom: "0.7rem",
                  }}
                >
                  {b.k}
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-display-serif)",
                    fontWeight: 300,
                    fontSize: "clamp(2.4rem, 7vw, 6rem)",
                    lineHeight: 0.95,
                    letterSpacing: "-0.035em",
                    color: "#F7F3EC",
                    margin: 0,
                    textShadow: "0 2px 40px rgba(0,0,0,0.75)",
                  }}
                >
                  {b.t}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-display-serif)",
                    fontStyle: "italic",
                    fontSize: "clamp(1rem, 1.8vw, 1.5rem)",
                    color: "#F7F3EC",
                    opacity: 0.82,
                    maxWidth: "34ch",
                    marginTop: "0.8rem",
                    textShadow: "0 2px 30px rgba(0,0,0,0.8)",
                  }}
                >
                  {b.s}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* progress rule — the only chrome, bottom edge */}
      <div
        aria-hidden
        style={{
          position: "sticky",
          top: "calc(100svh - 2px)",
          height: 2,
          background: "rgba(232,188,87,0.16)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${p * 100}%`,
            background: "#E8BC57",
            transformOrigin: "left",
          }}
        />
      </div>
    </div>
  );
}
