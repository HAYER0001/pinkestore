import { PRODUCTS, CRAFTS, type Product } from "./catalog";

/**
 * PHOTOGRAPHY, per piece.
 *
 * Separate from catalog.ts on purpose: the catalogue is the canonical record of
 * what a piece IS, and this is a record of what we have PHOTOGRAPHED. Those
 * change for different reasons and at different times.
 *
 * WHAT WAS EXCLUDED, AND WHY.
 *
 * Twenty-eight frames were generated; twenty-five are used. Every frame was
 * looked at individually before being listed here, because a gallery is a
 * claim about what the object looks like.
 *
 *   madhubani 02, sozni 02 — a dark, near-black macro in both sets. Both
 *     pieces are ivory-ground. A black paisley close-up in the gallery for a
 *     cream shawl misrepresents its colour to someone deciding at Rs 42,000.
 *
 *   kairi 05 — an ivory shawl with fringe. Kairi Noir has a black ground. It
 *     is a different object.
 *
 *   kairi 06 — a macro of RAISED METALLIC EMBROIDERY. Kairi Noir is printed,
 *     and this site's second promise is that the printed one is labelled
 *     printed everywhere. Putting an embroidery macro in its gallery would
 *     contradict that in the most visceral way available — a buyer would see
 *     handwork that is not there. This is the exact substitution the whole
 *     catalogue exists to refuse.
 *
 * These are AI-generated frames worked up from the owner's own photograph of
 * each piece, which is why they need this level of checking: the generator has
 * no idea which object it is describing, and three times out of twenty-eight
 * it described a different one.
 */

export type ShotKind = "full" | "draped" | "edge" | "detail" | "macro" | "folded" | "texture";

export interface Shot {
  src: string;
  kind: ShotKind;
  /** Describes the FRAME. The piece's own name is added by the component. */
  frame: string;
}

const KIND_WORD: Record<ShotKind, string> = {
  full: "laid flat, the whole piece",
  draped: "draped on a form",
  edge: "the border and edge",
  detail: "a detail of the field",
  macro: "close on the work",
  folded: "folded",
  texture: "the surface, close",
};

/** Ordered: the hero frame first, then the way you would actually look at it. */
const ORDER: Record<string, [number, ShotKind][]> = {
  "madhubani-baraat-shawl": [
    [4, "full"], [3, "draped"], [1, "edge"], [5, "detail"], [7, "macro"], [6, "folded"],
  ],
  "sozni-ivory-pashmina": [
    [3, "full"], [6, "draped"], [5, "edge"], [1, "detail"], [7, "macro"], [4, "folded"],
  ],
  "jamawar-indigo-kani-shawl": [
    [6, "full"], [3, "draped"], [2, "edge"], [1, "macro"], [5, "texture"], [7, "detail"], [4, "folded"],
  ],
  "kairi-noir-paisley-shawl": [
    [1, "full"], [2, "draped"], [3, "edge"], [7, "folded"], [4, "texture"],
  ],
};

const build = (): Record<string, Shot[]> => {
  const out: Record<string, Shot[]> = {};
  for (const [slug, frames] of Object.entries(ORDER)) {
    out[slug] = frames.map(([n, kind]) => ({
      src: `/pieces/${slug}/${String(n).padStart(2, "0")}.webp`,
      kind,
      frame: KIND_WORD[kind],
    }));
  }
  return out;
};

export const SHOTS = build();

/** Every frame we hold for a piece, hero first. Empty when none exist yet. */
export const getShots = (slug: string): Shot[] => SHOTS[slug] ?? [];

/**
 * The hero frame, falling back to the catalogue's single original photograph
 * for any piece we have not shot yet. Chikankari is still on one image.
 */
export function heroImage(p: Product): { src: string; width: number; height: number } {
  const shots = getShots(p.slug);
  /* every generated frame is 1536x2730, downscaled to 1400 wide */
  if (shots.length) return { src: shots[0].src, width: 1400, height: 2488 };
  return { src: p.image, width: p.width, height: p.height };
}

/** The second frame, for the hover transition. Null when there is only one. */
export const hoverImage = (slug: string): string | null => getShots(slug)[1]?.src ?? null;

export const altFor = (p: Product, shot: Shot) =>
  `${p.name} — ${CRAFTS[p.craft].label}, ${shot.frame}`;

/** Pieces still waiting on photography. Surfaced in TOMORROW.md, not on the site. */
export const unshot = () => PRODUCTS.filter((p) => getShots(p.slug).length === 0);
