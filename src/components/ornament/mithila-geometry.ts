/** Shared Mithila path geometry. One source, used by every composition. */

export const ARCH_OUTER =
  "M 44 592 L 44 208 C 44 116 116 44 240 44 C 364 44 436 116 436 208 L 436 592";
export const ARCH_INNER =
  "M 68 592 L 68 213 C 68 131 131 68 240 68 C 349 68 412 131 412 213 L 412 592";

export const CANOPY =
  "M 240 386 C 148 386 106 332 123 270 C 139 211 190 188 240 196 C 290 188 341 211 357 270 C 374 332 332 386 240 386 Z";

export const TRUNK = "M 240 580 C 233 504 233 442 240 386";
export const ROOTS = [
  "M 240 580 C 219 574 203 563 194 550",
  "M 240 580 C 261 574 277 563 286 550",
];
export const BRANCHES = [
  "M 240 474 C 204 466 181 447 171 416",
  "M 240 474 C 276 466 299 447 309 416",
  "M 240 424 C 209 416 189 399 181 372",
  "M 240 424 C 271 416 291 399 299 372",
];
export const CANOPY_BANDS = [
  "M 140 300 C 190 282 290 282 340 300",
  "M 150 336 C 196 320 284 320 330 336",
  "M 168 258 C 200 242 280 242 312 258",
];
export const TRUNK_TICKS = [
  "M 229 470 L 251 470",
  "M 230 508 L 250 508",
  "M 231 544 L 249 544",
];
export const LEAF =
  "M 0 0 c -13 -8 -17 -23 -6 -29 c 9 -5 17 3 15 14 c -2 9 -6 14 -9 15";
export const LEAF_AT: Array<[number, number, number]> = [
  [171, 416, -18],
  [309, 416, 18],
  [181, 372, -14],
  [299, 372, 14],
];
export const SUN: [number, number, number] = [240, 140, 30];
export const SUN_RING = `M ${SUN[0] - SUN[2]} ${SUN[1]} a ${SUN[2]} ${SUN[2]} 0 1 0 ${SUN[2] * 2} 0 a ${SUN[2]} ${SUN[2]} 0 1 0 ${-SUN[2] * 2} 0`;
export const SUN_RAYS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI * 2) / 12;
  const [cx, cy, r] = SUN;
  return `M ${(cx + Math.cos(a) * (r + 6)).toFixed(1)} ${(cy + Math.sin(a) * (r + 6)).toFixed(1)} L ${(cx + Math.cos(a) * (r + 17)).toFixed(1)} ${(cy + Math.sin(a) * (r + 17)).toFixed(1)}`;
});

export const FISH = "M 0 0 C 19 -13 48 -13 67 0 C 48 13 19 13 0 0 Z";
export const FISH_TAIL = "M 0 0 L -17 -11 L -17 11 Z";
export const BIRD_BODY =
  "M 0 0 C 9 -15 28 -19 41 -9 C 50 -2 48 12 37 16 C 24 21 7 14 0 0 Z";
export const BIRD_HEAD = "M 39 -11 C 43 -22 52 -24 56 -20 C 59 -17 58 -11 54 -9";
export const BIRD_BEAK = "M 56 -16 L 68 -19";
export const BIRD_TAIL = "M 2 2 C -13 11 -26 26 -33 44";
export const BIRD_CREST = "M 47 -22 L 44 -32 M 52 -22 L 52 -33 M 57 -21 L 60 -31";

export const EASE = [0.32, 0.72, 0, 1] as const;
