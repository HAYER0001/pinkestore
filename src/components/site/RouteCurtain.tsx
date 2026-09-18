"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/**
 * PAGE TRANSITIONS (item 71) — as an OVERLAY, never as a wrapper.
 *
 * The obvious implementation is app/template.tsx animating opacity on the page
 * itself. That would break the homepage. The root layout's own comment spells
 * out why: the WebGL canvas sits at z-index -1 in the ROOT stacking context,
 * and for mix-blend-mode: difference on the hero type to see it, no ancestor
 * may create a stacking context. An animated opacity on a wrapper around
 * {children} creates one on every route, and the hero silently stops blending.
 *
 * So the page is never touched. A plate sweeps off the new route instead,
 * anchored at the top so it reads as a curtain being drawn up rather than as a
 * crossfade. pointer-events:none throughout — a transition that eats the first
 * click on the page it just revealed is worse than no transition.
 *
 * It does not play on first load. The first paint already has the preloader
 * and, on the homepage, a 144-frame sequence; a curtain on top of that is one
 * more thing between the reader and the site.
 */

const EASE = [0.32, 0.72, 0, 1] as const;

export function RouteCurtain() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  /* Compare the PATH, not a "have I run before" boolean. StrictMode invokes
     effects twice in development: the first pass flips the boolean and the
     second then treats a fresh page load as a navigation, so the curtain
     played on every single load. Comparing against the previous pathname is
     idempotent and survives the double invoke. */
  const prev = useRef(pathname);
  const [key, setKey] = useState<string | null>(null);

  useEffect(() => {
    if (prev.current === pathname) return;
    prev.current = pathname;
    setKey(pathname);
    const t = setTimeout(() => setKey(null), 900);
    return () => clearTimeout(t);
  }, [pathname]);

  if (reduced) return null;

  return (
    <AnimatePresence>
      {key && (
        <motion.div
          key={key}
          data-route-curtain
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[90]"
          style={{ background: "#FAF8F5", transformOrigin: "top center" }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 0.72, ease: EASE }}
        >
          {/* A hairline on the trailing edge. Without it the plate reads as a
              rectangle sliding; with it, as an edge being drawn. */}
          <span
            className="absolute inset-x-0 bottom-0"
            style={{ height: 1, background: "#C9A59F" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
