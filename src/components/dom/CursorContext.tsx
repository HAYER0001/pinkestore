"use client";

import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";

export type CursorMode = "default" | "link" | "product" | "text";

export interface CursorTarget {
  mode: CursorMode;
  /** bounding box the ring should lock onto, in viewport coords */
  rect?: { x: number; y: number; w: number; h: number };
  label?: string;
}

interface Ctx {
  target: CursorTarget;
  setTarget: (t: CursorTarget) => void;
  clear: () => void;
}

const CursorCtx = createContext<Ctx | null>(null);

const DEFAULT: CursorTarget = { mode: "default" };

export function CursorProvider({ children }: { children: ReactNode }) {
  /* Only the MODE lives in React state — it changes a few times a second at
     most. Position never touches state; it stays in motion values. */
  const [target, setTargetState] = useState<CursorTarget>(DEFAULT);
  const last = useRef<string>("default");

  const value = useMemo<Ctx>(
    () => ({
      target,
      setTarget: (t) => {
        const key = `${t.mode}:${t.rect?.x ?? ""}:${t.rect?.y ?? ""}:${t.label ?? ""}`;
        if (key === last.current) return; // don't re-render on identical hovers
        last.current = key;
        setTargetState(t);
      },
      clear: () => {
        if (last.current === "default") return;
        last.current = "default";
        setTargetState(DEFAULT);
      },
    }),
    [target],
  );

  return <CursorCtx.Provider value={value}>{children}</CursorCtx.Provider>;
}

export function useCursor() {
  const ctx = useContext(CursorCtx);
  /* A no-op fallback means components can declare cursor intent without
     caring whether the provider is mounted — e.g. on touch devices where the
     custom cursor never renders at all. */
  return (
    ctx ?? {
      target: DEFAULT,
      setTarget: () => {},
      clear: () => {},
    }
  );
}

/** Declarative helper: wrap anything to describe how the cursor should react. */
export function CursorZone({
  mode,
  lock = false,
  children,
  className,
}: {
  mode: CursorMode;
  /** lock the ring to this element's bounding box */
  lock?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const { setTarget, clear } = useCursor();
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={className}
      onPointerEnter={() => {
        const r = lock ? ref.current?.getBoundingClientRect() : undefined;
        setTarget({
          mode,
          rect: r ? { x: r.x, y: r.y, w: r.width, h: r.height } : undefined,
        });
      }}
      onPointerLeave={clear}
    >
      {children}
    </div>
  );
}
