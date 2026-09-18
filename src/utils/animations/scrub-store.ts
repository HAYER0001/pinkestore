/**
 * Tiny external store for scrub state.
 *
 * Deliberately NOT React state: this updates every frame, and setState at
 * 60fps would re-render the tree 60 times a second. The R3F loop reads it
 * directly; DOM components subscribe only when they need to paint.
 */
type Listener = () => void;

let progress = 0;
let load = 0;
let ready = false;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l());

export const scrubStore = {
  setProgress(v: number) {
    progress = v;
  },
  getProgress: () => progress,
  setLoad(v: number) {
    load = v;
    emit();
  },
  getLoad: () => load,
  setReady(v: boolean) {
    if (ready !== v) {
      ready = v;
      emit();
    }
  },
  getReady: () => ready,
  subscribe(l: Listener): () => void {
    listeners.add(l);
    /* Set.delete returns boolean; React's cleanup must return void or a
       destructor, so swallow it explicitly rather than leaking the boolean. */
    return () => {
      listeners.delete(l);
    };
  },
};
