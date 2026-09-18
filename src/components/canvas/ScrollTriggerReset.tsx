"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/utils/animations/gsap";

/**
 * ROUTE-CHANGE CLEANUP.
 *
 * Components kill their OWN ScrollTriggers on unmount, but App Router client
 * navigation can leave orphans behind: a trigger whose element was removed
 * still holds its pinned element, its pin-spacer and its scroll listeners, and
 * ScrollTrigger keeps recalculating positions against a document that no
 * longer contains them. The visible symptom is a phantom gap the height of a
 * pinned section on the NEXT page, which looks like a layout bug with no
 * obvious cause.
 *
 * So on every pathname change: kill any trigger whose trigger element has
 * detached from the document, then refresh the survivors against the new
 * layout.
 */
export function ScrollTriggerReset() {
  const pathname = usePathname();

  useEffect(() => {
    const orphans = ScrollTrigger.getAll().filter((st) => {
      const el = st.trigger as Element | undefined;
      return el ? !document.documentElement.contains(el) : false;
    });

    /* kill(true) removes the pin-spacer as well — without the flag the spacer
       div survives and keeps its height */
    orphans.forEach((st) => st.kill(true));

    /* the new route has a different document height; stale start/end values
       would put every surviving trigger at the wrong scroll position */
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll()
        .filter((st) => {
          const el = st.trigger as Element | undefined;
          return el ? !document.documentElement.contains(el) : false;
        })
        .forEach((st) => st.kill(true));
    };
  }, [pathname]);

  return null;
}
