/**
 * TEXTURE SAMPLER
 *
 * Rasterises vector artwork to an offscreen 2D canvas, reads the pixels back,
 * and returns the coordinates of every "inked" pixel as world-space targets
 * for a particle morph.
 *
 * We sample OUR OWN Mithila linework rather than requiring a new asset — the
 * paths already exist in components/ornament/mithila-geometry.ts, so the motif
 * the particles form is the same drawing used elsewhere on the site.
 */

export interface SampleOptions {
  /** complete SVG markup, self-contained (no external refs) */
  svg: string;
  /** raster resolution — higher finds finer line detail, costs a one-off read */
  rasterWidth?: number;
  rasterHeight?: number;
  /** alpha cutoff, 0-255 */
  threshold?: number;
  /** how many targets to return */
  maxPoints: number;
  /** world-space extents the motif should occupy */
  worldWidth: number;
  worldHeight: number;
}

export interface SampleResult {
  /** xyz triples, length = maxPoints * 3 */
  positions: Float32Array;
  /** how many of those are real hits; the remainder are parked off-screen */
  hitCount: number;
}

/**
 * Deterministic shuffle. Math.random would give a different motif on every
 * reload and a different one on server vs client.
 */
function xorshift(seed: number) {
  let s = seed || 0x9e3779b9;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1000000) / 1000000;
  };
}

export async function sampleSvgToPoints(opts: SampleOptions): Promise<SampleResult> {
  const {
    svg,
    rasterWidth = 420,
    rasterHeight = 540,
    threshold = 40,
    maxPoints,
    worldWidth,
    worldHeight,
  } = opts;

  const positions = new Float32Array(maxPoints * 3);

  /* Park every particle far off-screen first. Anything the motif does not
     need keeps this value and simply never appears, rather than collapsing
     into a visible clump at the origin. */
  for (let i = 0; i < maxPoints; i++) {
    positions[i * 3] = 9999;
    positions[i * 3 + 1] = 9999;
    positions[i * 3 + 2] = 9999;
  }

  if (typeof document === "undefined") return { positions, hitCount: 0 };

  const canvas = document.createElement("canvas");
  canvas.width = rasterWidth;
  canvas.height = rasterHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { positions, hitCount: 0 };

  try {
    const img = await loadSvg(svg);
    ctx.clearRect(0, 0, rasterWidth, rasterHeight);
    ctx.drawImage(img, 0, 0, rasterWidth, rasterHeight);

    const data = ctx.getImageData(0, 0, rasterWidth, rasterHeight).data;

    /* Collect hits. Storing packed indices instead of {x,y} objects keeps this
       one flat array rather than ~30k short-lived objects for the GC. */
    const hits: number[] = [];
    for (let y = 0; y < rasterHeight; y++) {
      for (let x = 0; x < rasterWidth; x++) {
        const a = data[(y * rasterWidth + x) * 4 + 3];
        if (a > threshold) hits.push(y * rasterWidth + x);
      }
    }

    if (hits.length === 0) return { positions, hitCount: 0 };

    /* Fisher-Yates with a seeded PRNG, so which pixels win is stable but not
       spatially biased — taking the first N would fill only the top of the
       motif and leave the rest empty. */
    const rnd = xorshift(0x5eed1234);
    for (let i = hits.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const t = hits[i];
      hits[i] = hits[j];
      hits[j] = t;
    }

    const use = Math.min(maxPoints, hits.length);
    for (let i = 0; i < use; i++) {
      const idx = hits[i];
      const px = idx % rasterWidth;
      const py = (idx / rasterWidth) | 0;

      /* canvas space (y down, origin top-left) → world space (y up, centred) */
      const nx = px / rasterWidth - 0.5;
      const ny = 0.5 - py / rasterHeight;

      positions[i * 3] = nx * worldWidth;
      positions[i * 3 + 1] = ny * worldHeight;
      /* a shallow wave in z so the motif is a relief, not a flat decal */
      positions[i * 3 + 2] =
        Math.sin(nx * 5.0) * 0.28 + Math.cos(ny * 4.0) * 0.22;
    }

    return { positions, hitCount: use };
  } finally {
    /* Free the backing store immediately. A 420x540 canvas is small, but on
       iOS every live canvas counts against a hard per-tab budget. */
    canvas.width = 0;
    canvas.height = 0;
  }
}

function loadSvg(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    /* A data: URL keeps the canvas untainted. A blob: URL would work too but
       needs revoking, and an un-revoked blob leaks for the page's lifetime. */
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("motif SVG failed to rasterise"));
  });
}
