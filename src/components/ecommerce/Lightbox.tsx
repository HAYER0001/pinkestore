"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Shot } from "@/lib/shots";

/**
 * FULL-SCREEN VIEWING AND ZOOM (items 54, 55, 92) with swipe (91).
 *
 * At Rs 18,000 to Rs 65,000 the single most common unanswered question is
 * "can I see the actual stitch". Everything here serves that.
 *
 * ZOOM IS CLICK-TO-TOGGLE, anchored at the point clicked. Not pinch, not a
 * hover magnifier: pinch is unreliable to intercept without breaking the
 * browser's own gesture, and a hover lens only works for people using a mouse
 * on a large screen — which is not who buys a shawl on a phone at midnight.
 * One tap in, one tap out, and it lands where you pointed.
 *
 * SWIPE IS A DRAG WITH A DISTANCE THRESHOLD, and it is disabled while zoomed —
 * otherwise panning a zoomed image changes the frame instead, which feels
 * broken every single time.
 */

const SPRING = { type: "spring", stiffness: 300, damping: 34, mass: 0.8 } as const;
const SWIPE_PX = 56;
const ZOOM = 2.6;

export function Lightbox({
  shots,
  index,
  alt,
  onIndex,
  onClose,
}: {
  shots: Shot[];
  index: number | null;
  alt: (s: Shot) => string;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const reduced = useReducedMotion();
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const open = index !== null;

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      setZoom(null);
      onIndex((index + d + shots.length) % shots.length);
    },
    [index, shots.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return zoom ? setZoom(null) : onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, zoom, go, onClose]);

  useEffect(() => {
    if (!open) setZoom(null);
  }, [open]);

  const shot = index !== null ? shots[index] : null;

  return (
    <AnimatePresence>
      {open && shot && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Full screen view"
          className="fixed inset-0 z-[80] flex flex-col"
          style={{ background: "#0F0E0C" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between px-[clamp(1rem,3vw,2.5rem)] py-5">
            <span className="ty-mono" style={{ color: "#FAF8F5" }}>
              {index + 1} / {shots.length} · {shot.frame}
            </span>
            <div className="flex items-center gap-7">
              <span className="ty-mono hidden sm:block" style={{ color: "#8B857C" }}>
                {zoom ? "Tap to zoom out" : "Tap the image to zoom"}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="ty-mono"
                style={{ color: "#FAF8F5", background: "none", border: "none", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>

          <div
            className="relative flex-1 overflow-hidden"
            onPointerDown={(e) => {
              if (zoom) return;
              drag.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
              const d = drag.current;
              drag.current = null;
              if (!d || zoom) return;
              const dx = e.clientX - d.x;
              const dy = e.clientY - d.y;
              /* a mostly-horizontal movement past the threshold is a swipe;
                 anything else was a tap, and a tap zooms */
              if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
                go(dx < 0 ? 1 : -1);
                return;
              }
              if (Math.abs(dx) < 8 && Math.abs(dy) < 8) {
                const box = e.currentTarget as HTMLElement;
                const r = box.getBoundingClientRect();
                const img = box.querySelector("img") as HTMLImageElement | null;

                /* THE ORIGIN MUST BE IN THE IMAGE, NOT THE CONTAINER.
                   object-contain letterboxes a portrait frame inside a
                   landscape viewport, so most of this box is empty black. A
                   click in that band produced an origin outside the picture
                   and scaling threw it off screen entirely. Work out where the
                   photograph actually is, clamp into it, then convert back to
                   container coordinates for transform-origin. */
                let px = (e.clientX - r.left) / r.width;
                let py = (e.clientY - r.top) / r.height;

                if (img?.naturalWidth && img.naturalHeight) {
                  const ar = img.naturalWidth / img.naturalHeight;
                  const boxAr = r.width / r.height;
                  const drawnW = boxAr > ar ? r.height * ar : r.width;
                  const drawnH = boxAr > ar ? r.height : r.width / ar;
                  const offX = (r.width - drawnW) / 2;
                  const offY = (r.height - drawnH) / 2;

                  const fx = Math.min(1, Math.max(0, (e.clientX - r.left - offX) / drawnW));
                  const fy = Math.min(1, Math.max(0, (e.clientY - r.top - offY) / drawnH));

                  px = (offX + fx * drawnW) / r.width;
                  py = (offY + fy * drawnH) / r.height;
                }

                setZoom({ x: px * 100, y: py * 100 });
              }
            }}
            style={{ cursor: zoom ? "zoom-out" : "zoom-in", touchAction: "pan-y" }}
          >
            <motion.div
              key={shot.src}
              className="absolute inset-0"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.28 }}
            >
              <motion.div
                className="absolute inset-0"
                animate={{ scale: zoom ? ZOOM : 1 }}
                transition={reduced ? { duration: 0 } : SPRING}
                style={{ transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : "50% 50%" }}
              >
                <Image
                  src={shot.src}
                  alt={alt(shot)}
                  fill
                  quality={92}
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </motion.div>
          </div>

          {/* frame strip — a real control, and the only way in on a keyboard */}
          <div className="flex justify-center gap-2 px-4 py-6">
            {shots.map((s, i) => (
              <button
                key={s.src}
                type="button"
                onClick={() => {
                  setZoom(null);
                  onIndex(i);
                }}
                aria-label={`Frame ${i + 1}: ${s.frame}`}
                aria-current={i === index ? "true" : undefined}
                style={{
                  width: 34,
                  height: 2,
                  background: i === index ? "#FAF8F5" : "rgba(250,248,245,0.32)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
