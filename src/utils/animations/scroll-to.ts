/**
 * Anchor navigation under Lenis.
 *
 * Lenis owns scrollTop. A plain `<a href="#id">` — and any `window.scrollTo`
 * or `element.scrollIntoView` — sets the native position, and Lenis overwrites
 * it on its very next frame. The jump either snaps back or fights visibly.
 * Every in-page link must route through lenis.scrollTo instead.
 */
type LenisLike = {
  scrollTo: (
    target: string | number | HTMLElement,
    opts?: { offset?: number; duration?: number; immediate?: boolean },
  ) => void;
};

export function scrollToId(id: string, offset = 0) {
  const lenis = (window as unknown as { lenis?: LenisLike }).lenis;
  const el = document.getElementById(id.replace(/^#/, ""));
  if (!el) return;

  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.4 });
  } else {
    /* reduced-motion users never get a Lenis instance, so fall back to native */
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
