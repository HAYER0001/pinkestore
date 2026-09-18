"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { search, type Scored } from "@/lib/search";
import { ThreadRule } from "@/components/brand/ThreadRule";

/**
 * FULL-SCREEN SEARCH.
 *
 * Opens on click or Cmd/Ctrl-K. Keyboard-first: arrows move, Enter opens,
 * Escape closes, and the highlighted row is always scrolled into view.
 *
 * NO EMPTY STATE THAT SAYS "NO RESULTS" AND STOPS. On a five-piece catalogue
 * most searches will miss, and a dead end is the moment someone leaves. A miss
 * shows the whole collection instead, because "we have five things, here they
 * are" is always a better answer than "nothing found".
 */

const PANEL = { type: "spring", stiffness: 300, damping: 34, mass: 0.8 } as const;

const KIND_LABEL: Record<Scored["kind"], string> = {
  piece: "Piece",
  craft: "Craft",
  page: "Page",
};

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const reduced = useReducedMotion();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => search(q), [q]);
  /* A query too short to score shows the default set; a query that scored
     nothing shows it too, rather than a dead end. */
  const fallback = useMemo(() => search("shawl", 5), []);
  const shown = results.length > 0 ? results : fallback;
  const missed = q.trim().length >= 2 && results.length === 0;

  useEffect(() => setActive(0), [q]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    /* autoFocus on the input would fight the entrance spring on some
       browsers; focusing after a frame is reliable and looks deliberate. */
    const t = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(t);
      setQ("");
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, shown.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && shown[active]) {
        e.preventDefault();
        router.push(shown[active].href);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, shown, active, onClose, router]);

  /* keep the highlighted row visible when arrowing past the fold */
  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            aria-label="Close search"
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default"
            style={{ background: "rgba(16,14,12,0.55)", border: "none" }}
            tabIndex={-1}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="relative mx-auto w-full max-w-[860px] overflow-hidden"
            style={{ background: "#FAF8F5", marginTop: "clamp(0px,6vh,80px)", maxHeight: "84vh" }}
            initial={reduced ? false : { y: -28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: -20, opacity: 0 }}
            transition={PANEL}
          >
            <div className="flex items-center gap-4 px-[clamp(1.25rem,3vw,2.5rem)] pt-7">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="search"
                placeholder="Pashmina, chikankari, Kashmir…"
                aria-label="Search pieces, crafts and pages"
                className="ty-display w-full"
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#1A1A1A",
                  padding: 0,
                }}
              />
              <button
                type="button"
                onClick={onClose}
                className="ty-mono shrink-0"
                style={{ color: "#6B645A", background: "none", border: "none", cursor: "pointer" }}
              >
                Esc
              </button>
            </div>

            <ThreadRule tone="#C9A59F" slack={3} animate={false} className="mx-[clamp(1.25rem,3vw,2.5rem)] my-6" />

            {missed && (
              <p
                className="ty-caption px-[clamp(1.25rem,3vw,2.5rem)] pb-4"
                style={{ color: "#6B645A" }}
              >
                Nothing matches “{q.trim()}”. We hold five pieces in total —
                here is where to start.
              </p>
            )}

            <ul
              ref={listRef}
              className="overflow-y-auto pb-6"
              style={{ margin: 0, padding: 0, listStyle: "none", maxHeight: "58vh" }}
            >
              {shown.map((r, i) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    onClick={onClose}
                    onPointerEnter={() => setActive(i)}
                    aria-current={i === active ? "true" : undefined}
                    className="flex items-center gap-5 px-[clamp(1.25rem,3vw,2.5rem)] py-4"
                    style={{
                      textDecoration: "none",
                      background: i === active ? "#F3EFE8" : "transparent",
                    }}
                  >
                    {r.image ? (
                      <span
                        className="relative block shrink-0 overflow-hidden"
                        style={{ width: 52, height: 68, background: "#F3EFE8" }}
                      >
                        <Image src={r.image} alt="" fill sizes="52px" className="object-cover" />
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="shrink-0"
                        style={{ width: 52, height: 68, borderLeft: "1px solid #C9A59F" }}
                      />
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="ty-title block truncate" style={{ color: "#1A1A1A" }}>
                        {r.title}
                      </span>
                      <span className="ty-caption block truncate" style={{ color: "#6B645A" }}>
                        {r.meta}
                      </span>
                    </span>

                    <span className="ty-mono shrink-0" style={{ color: "#96605B" }}>
                      {KIND_LABEL[r.kind]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Cmd/Ctrl-K from anywhere. */
export function useSearchHotkey(onOpen: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpen]);
}
