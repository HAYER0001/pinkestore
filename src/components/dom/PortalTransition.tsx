"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/utils/animations/gsap";
import { portalStore } from "@/utils/animations/portal-store";

/**
 * PORTAL TRANSITION
 *
 * 300vh of track. The headline pins dead centre while the WebGL camera behind
 * it is pushed through the cinematic plane.
 *
 * The GSAP onUpdate writes straight into a module-scope object — no setState,
 * so nothing in the React tree re-renders while the camera flies.
 */
export function PortalTransition() {
  const section = useRef<HTMLElement>(null);
  const pinned = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = section.current;
    const target = pinned.current;
    if (!el || !target) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      pin: target,
      pinSpacing: false, // the 300vh section IS the spacing
      /* anticipatePin stops the classic one-frame jump where the pinned element
         visibly lags at the moment it latches */
      anticipatePin: 1,
      scrub: true,
      onUpdate: (self) => {
        portalStore.progress = self.progress;
      },
      onLeaveBack: () => {
        portalStore.progress = 0;
      },
    });

    /* Fonts and the frame sequence both change document height after first
       paint; without a refresh the pin latches at a stale position. */
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});

    if (reduced) portalStore.progress = 0;

    return () => {
      /* Killing WITH the pin spacer is essential — a surviving pin-spacer div
         after a client-side route change leaves a phantom gap the height of
         the section, and the next page looks broken for no visible reason. */
      st.kill(true);
      portalStore.progress = 0;
    };
  }, []);

  return (
    <section ref={section} style={{ position: "relative", height: "300vh" }}>
      <div
        ref={pinned}
        style={{
          position: "absolute",
          inset: 0,
          height: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(1.5rem, 3vw, 2.5rem)",
          pointerEvents: "none",
        }}
      >
        <p
          className="t-micro-ed"
          style={{
            color: "#E8BC57",
            letterSpacing: "var(--tracking-luxe-widest)",
          }}
        >
          Keep going
        </p>

        <h2
          className="t-display-ed"
          style={{
            color: "#FFFFFF",
            mixBlendMode: "difference",
            textAlign: "center",
            maxWidth: "14ch",
            margin: 0,
          }}
        >
          Enter the collection
        </h2>
      </div>
    </section>
  );
}
