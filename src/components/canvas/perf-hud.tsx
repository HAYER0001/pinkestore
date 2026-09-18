"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dev-only performance readout.
 *
 * Automated browser tabs run backgrounded, and Chrome clamps requestAnimationFrame
 * to ~1fps when document.visibilityState is "hidden" — so an agent measuring
 * FPS headlessly gets 1fps regardless of how the shader actually performs.
 * The only trustworthy reading comes from a visible window, which means a human
 * has to see it. Hence this.
 *
 * Never rendered in production.
 */
export function PerfHUD({ particles }: { particles: number }) {
  const [fps, setFps] = useState(0);
  const [worst, setWorst] = useState(0);
  /* dpr must not be read during render: the server has no window, so it emits
     "—" while the client emits "2" and React reports a hydration mismatch.
     Read it after mount instead. */
  const [dpr, setDpr] = useState<number | null>(null);
  useEffect(() => setDpr(Math.min(window.devicePixelRatio || 1, 2)), []);
  const frames = useRef(0);
  const last = useRef(performance.now());
  const worstRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    let mark = performance.now();

    const loop = (t: number) => {
      const dt = t - last.current;
      last.current = t;
      if (dt > worstRef.current) worstRef.current = dt;
      frames.current++;

      if (t - mark >= 1000) {
        setFps(Math.round((frames.current * 1000) / (t - mark)));
        setWorst(Math.round(worstRef.current));
        frames.current = 0;
        worstRef.current = 0;
        mark = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const ok = fps >= 55;
  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        bottom: 12,
        zIndex: 60,
        font: "11px/1.5 ui-monospace, monospace",
        color: ok ? "#8FE3B0" : fps > 0 && fps < 30 ? "#FF8A73" : "#E8BC57",
        background: "rgba(8,7,6,0.82)",
        border: "1px solid rgba(232,188,87,0.28)",
        borderRadius: 3,
        padding: "6px 9px",
        letterSpacing: "0.06em",
        pointerEvents: "none",
      }}
    >
      {fps} FPS · worst {worst}ms
      <br />
      {particles.toLocaleString()} particles · dpr {dpr ?? "—"}
    </div>
  );
}
