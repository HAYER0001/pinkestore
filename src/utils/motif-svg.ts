import * as G from "@/components/ornament/mithila-geometry";

/**
 * Builds the Mithila tree as standalone SVG markup for rasterising.
 *
 * Stroke weights are deliberately FATTER than the on-page version: the
 * sampler rasterises at 420x540, and a 2px line at that size produces a
 * sparse, broken dotted outline once sampled. Thicker strokes give the
 * particles a continuous ribbon to land on.
 */
export function mithilaMotifSvg(): string {
  const stroke = `fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;

  const paths: string[] = [
    G.ARCH_OUTER,
    G.ARCH_INNER,
    G.TRUNK,
    ...G.ROOTS,
    ...G.BRANCHES,
    G.CANOPY,
    ...G.CANOPY_BANDS,
    ...G.TRUNK_TICKS,
    G.SUN_RING,
    ...G.SUN_RAYS,
  ];

  const leaves = G.LEAF_AT.map(
    ([x, y, r]) =>
      `<g transform="translate(${x} ${y}) rotate(${r})"><path d="${G.LEAF}" ${stroke}/></g>`,
  ).join("");

  const birds = [
    "translate(112 454)",
    "translate(368 454) scale(-1 1)",
  ]
    .map(
      (tf) =>
        `<g transform="${tf}">` +
        [G.BIRD_BODY, G.BIRD_HEAD, G.BIRD_TAIL, G.BIRD_CREST]
          .map((d) => `<path d="${d}" ${stroke}/>`)
          .join("") +
        `</g>`,
    )
    .join("");

  const fish = ["translate(150 548)", "translate(263 548)"]
    .map(
      (tf) =>
        `<g transform="${tf}">` +
        [G.FISH, G.FISH_TAIL].map((d) => `<path d="${d}" ${stroke}/>`).join("") +
        `</g>`,
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="620" viewBox="0 0 480 620">
${paths.map((d) => `<path d="${d}" ${stroke}/>`).join("\n")}
${leaves}${birds}${fish}
</svg>`;
}
