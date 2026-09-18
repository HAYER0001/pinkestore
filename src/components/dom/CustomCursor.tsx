"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useCursor } from "./CursorContext";

/**
 * DUAL-LAYER CURSOR.
 *
 *  · inner dot  — 4px, tracks clientX/Y with ZERO smoothing. This is what makes
 *    the cursor feel accurate; a single laggy blob always feels broken because
 *    the point of contact no longer matches the pointer.
 *  · outer ring — a Madhubani diamond trailing on a heavy spring. This is what
 *    makes it feel weighty.
 *
 * Position NEVER enters React state. Every value here is a MotionValue written
 * straight to the compositor — a setState per pointermove would re-render the
 * tree ~120 times a second and the cursor would be the jankiest thing on the
 * page.
 *
 * Only mounts on fine pointers. On a touch device there is no cursor to
 * replace, `cursor: none` would hide nothing, and the listeners would be pure
 * cost.
 */

const RING = { stiffness: 150, damping: 20, mass: 0.5 } as const;

export function CustomCursor() {
  const [fine, setFine] = useState(false);
  const { target } = useCursor();

  /* raw pointer — no spring */
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  /* trailing ring */
  const rx = useSpring(x, RING);
  const ry = useSpring(y, RING);

  /* the ring grows and squares off when locked to a target */
  const locked = !!target.rect;
  const size = useSpring(locked ? 0 : 34, { stiffness: 260, damping: 26 });
  const lockX = useSpring(target.rect ? target.rect.x + target.rect.w / 2 : 0, RING);
  const lockY = useSpring(target.rect ? target.rect.y + target.rect.h / 2 : 0, RING);
  const lockW = useSpring(target.rect?.w ?? 0, { stiffness: 220, damping: 28 });
  const lockH = useSpring(target.rect?.h ?? 0, { stiffness: 220, damping: 28 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setFine(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!fine) return;
    document.body.style.cursor = "none";

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    /* pointerrawupdate fires more often than pointermove where supported,
       which is what keeps the inner dot genuinely glued to the pointer */
    const evt = "onpointerrawupdate" in window ? "pointerrawupdate" : "pointermove";
    window.addEventListener(evt, move as EventListener, { passive: true });

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener(evt, move as EventListener);
    };
  }, [fine, x, y]);

  useEffect(() => {
    size.set(locked ? 0 : 34);
    if (target.rect) {
      lockX.set(target.rect.x + target.rect.w / 2);
      lockY.set(target.rect.y + target.rect.h / 2);
      lockW.set(target.rect.w);
      lockH.set(target.rect.h);
    }
  }, [locked, target.rect, size, lockX, lockY, lockW, lockH]);

  const ringX = useTransform([rx, lockX], ([a, b]: number[]) => (locked ? b : a));
  const ringY = useTransform([ry, lockY], ([a, b]: number[]) => (locked ? b : a));
  const w = useTransform([size, lockW], ([s, l]: number[]) => (locked ? l + 14 : s));
  const h = useTransform([size, lockH], ([s, l]: number[]) => (locked ? l + 14 : s));

  if (!fine) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647, // above everything, including the dev overlay
        pointerEvents: "none",
        mixBlendMode: "difference",
      }}
    >
      {/* outer: Madhubani diamond, trailing */}
      <motion.div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          x: ringX,
          y: ringY,
          width: w,
          height: h,
          translateX: "-50%",
          translateY: "-50%",
          border: "1px solid #FFFFFF",
          borderRadius: 0,
          rotate: locked ? 0 : 45, // diamond at rest, square when locked on
        }}
        animate={{ rotate: locked ? 0 : 45 }}
        transition={{ type: "spring", stiffness: 180, damping: 22 }}
      />

      {/* inner: exact, unsmoothed */}
      <motion.div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          x,
          y,
          width: 4,
          height: 4,
          translateX: "-50%",
          translateY: "-50%",
          background: "#FFFFFF",
          borderRadius: 0,
        }}
      />
    </div>
  );
}
