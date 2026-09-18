/**
 * FRAME PRELOADER
 *
 * Loading 144 stills naively does two bad things: it opens 144 parallel
 * requests (the browser queues them and the FIRST frame arrives late), and it
 * leaves every image undecoded, so the first draw of each one blocks the
 * compositor for several milliseconds — visible as a stutter exactly when the
 * user starts scrolling.
 *
 * So: a bounded-concurrency queue, gate frames first, and an explicit
 * `decode()` on every image before it is considered ready. decode() moves the
 * JPEG/WebP → bitmap work off the critical path, which is the single biggest
 * win available here.
 */

export interface PreloaderOptions {
  count: number;
  /** index → url */
  src: (i: number) => string;
  /** how many must be resident before scrolling is allowed */
  gate?: number;
  /** parallel requests; above ~8 the browser queues anyway */
  concurrency?: number;
  onProgress?: (loaded: number, total: number) => void;
}

export interface FrameSequence {
  frames: (HTMLImageElement | undefined)[];
  /** resolves once `gate` frames are decoded and drawable */
  ready: Promise<void>;
  /** resolves when every frame is resident */
  complete: Promise<void>;
  loadedCount: () => number;
  /** nearest decoded frame at or before `i` — never returns a blank plane */
  nearest: (i: number) => HTMLImageElement | undefined;
  dispose: () => void;
}

export function preloadFrames(opts: PreloaderOptions): FrameSequence {
  const { count, src, gate = 30, concurrency = 6, onProgress } = opts;

  const frames: (HTMLImageElement | undefined)[] = new Array(count);
  let loaded = 0;
  let cancelled = false;

  let resolveReady!: () => void;
  let resolveComplete!: () => void;
  const ready = new Promise<void>((r) => (resolveReady = r));
  const complete = new Promise<void>((r) => (resolveComplete = r));

  const loadOne = (i: number) =>
    new Promise<void>((resolve) => {
      if (cancelled) return resolve();
      const img = new Image();
      img.decoding = "async";
      /* Same-origin, but set explicitly: an anonymous request is what lets the
         bitmap be used as a WebGL texture without tainting the canvas. */
      img.crossOrigin = "anonymous";

      const done = () => {
        loaded++;
        onProgress?.(loaded, count);
        if (loaded >= Math.min(gate, count)) resolveReady();
        if (loaded >= count) resolveComplete();
        resolve();
      };

      img.onload = () => {
        /* decode() before we call it ready, or the first paint of this frame
           blocks the main thread. Safari < 15 lacks it, hence the guard. */
        if (typeof img.decode === "function") {
          img.decode().then(
            () => {
              frames[i] = img;
              done();
            },
            () => {
              /* decode can reject on a detached image; the bitmap is still
                 usable, so accept it rather than dropping the frame */
              frames[i] = img;
              done();
            },
          );
        } else {
          frames[i] = img;
          done();
        }
      };

      img.onerror = () => {
        /* a missing frame must not stall the gate forever */
        done();
      };

      img.src = src(i);
    });

  /* Gate frames first and in order, so the sequence can start from frame 0
     rather than waiting on a random scatter. */
  const order: number[] = [];
  for (let i = 0; i < Math.min(gate, count); i++) order.push(i);
  for (let i = gate; i < count; i++) order.push(i);

  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (cursor < order.length && !cancelled) {
      const i = order[cursor++];
      await loadOne(i);
    }
  };

  void Promise.all(Array.from({ length: Math.min(concurrency, count) }, worker)).then(
    () => {
      resolveReady();
      resolveComplete();
    },
  );

  return {
    frames,
    ready,
    complete,
    loadedCount: () => loaded,
    nearest: (i: number) => {
      const clamped = Math.max(0, Math.min(count - 1, i));
      if (frames[clamped]) return frames[clamped];
      /* walk backwards to the last decoded frame — holding the previous image
         is always better than flashing an empty plane */
      for (let k = clamped - 1; k >= 0; k--) if (frames[k]) return frames[k];
      for (let k = clamped + 1; k < count; k++) if (frames[k]) return frames[k];
      return undefined;
    },
    dispose: () => {
      cancelled = true;
      for (let i = 0; i < frames.length; i++) {
        const f = frames[i];
        if (f) {
          f.onload = null;
          f.onerror = null;
          /* dropping src lets the decoder free the bitmap promptly */
          f.src = "";
          frames[i] = undefined;
        }
      }
    },
  };
}

/** Desktop gets 1024px frames, phones 560px — iOS texture memory is unforgiving. */
export function sequenceSrc(i: number, lowRes: boolean) {
  const dir = lowRes ? "lo" : "hi";
  /* ffmpeg numbers from 1 */
  return `/sequence/${dir}/f${String(i + 1).padStart(3, "0")}.webp`;
}

export const FRAME_COUNT = 144;
