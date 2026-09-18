"use client";

import { useEffect, useState } from "react";
import { scrubStore } from "@/utils/animations/scrub-store";

/**
 * Minimal loader. A hairline fills as the gate frames arrive, then it lifts.
 *
 * It does NOT block paint — the particle field is already running behind it.
 * It only holds scrolling until there are enough frames that the sequence
 * cannot stutter on the first flick of the wheel.
 */
export function SequenceLoader() {
  const [load, setLoad] = useState(0);
  const [ready, setReady] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const sync = () => {
      setLoad(scrubStore.getLoad());
      setReady(scrubStore.getReady());
    };
    sync();
    return scrubStore.subscribe(sync);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(t);
  }, [ready]);

  /* lock scrolling until the gate is met */
  useEffect(() => {
    document.documentElement.style.overflow = ready ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [ready]);

  if (gone) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        background: "#0A0B10",
        opacity: ready ? 0 : 1,
        transition: "opacity 620ms cubic-bezier(0.32,0.72,0,1)",
        pointerEvents: ready ? "none" : "auto",
      }}
    >
      <div style={{ width: "min(34vw, 300px)" }}>
        <p
          style={{
            fontFamily: "var(--font-geist-mono)",
            fontSize: 10,
            letterSpacing: "0.3em",
            color: "#E8BC57",
            textAlign: "center",
            marginBottom: 14,
          }}
        >
          THE PINKESTORE
        </p>
        <div style={{ height: 1, background: "rgba(232,188,87,0.2)" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.round(Math.min(load / 0.21, 1) * 100)}%`,
              background: "#E8BC57",
            }}
          />
        </div>
      </div>
    </div>
  );
}
