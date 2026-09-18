"use client";

/**
 * Canvas lifecycle. A single boolean toggled a handful of times per session,
 * so unlike the per-frame stores this one is genuinely allowed to notify React.
 */
type Listener = () => void;

let active = true;
const listeners = new Set<Listener>();

export const canvasStore = {
  getActive: () => active,
  setActive(v: boolean) {
    if (active === v) return;
    active = v;
    listeners.forEach((l) => l());
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
