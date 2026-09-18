import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Single registration point. Registering on the server (no `window`) or twice
 * across a hot reload is the usual source of "ScrollTrigger is not defined"
 * and of duplicated triggers. Everything imports gsap from HERE, never from
 * "gsap" directly.
 *
 * gsap.registerPlugin is itself idempotent, so the module-scope guard is only
 * to keep it off the server.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
