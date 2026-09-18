/**
 * THE GLYPH SET.
 *
 * Generic UI icons (a truck for shipping, a shield for authenticity) are the
 * loudest tell that a site was assembled from a kit. These are drawn from the
 * trades the shop actually sells: a running stitch, a loom, a needle and
 * thread, a spool, a chinar leaf, a kairi.
 *
 * All share one grammar so they read as a family: 24x24, 1.6 stroke, round
 * caps, no fill. Anything that cannot be said with a single continuous line is
 * not in the set.
 */

type GlyphProps = {
  size?: number;
  stroke?: string;
  weight?: number;
  className?: string;
  title?: string;
};

function Glyph({
  size = 24,
  stroke = "currentColor",
  weight = 1.6,
  className,
  title,
  children,
}: GlyphProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {children}
    </svg>
  );
}

/** Running stitch — handwork, "made by hand" */
export const GlyphStitch = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M2 12h3.4M8.6 12H12M15.2 12h3.4M21.8 12H22" />
    <path d="M5.4 12c1.1 0 1.1-3.4 3.2-3.4M12 12c1.1 0 1.1 3.4 3.2 3.4" />
  </Glyph>
);

/** Loom — weaving, kani, jamawar */
export const GlyphLoom = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M3 4v16M21 4v16" />
    <path d="M3 8h18M3 12h18M3 16h18" />
    <path d="M8 4v16M16 4v16" />
  </Glyph>
);

/** Needle and thread — sozni, chikankari */
export const GlyphNeedle = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M20 4 8.5 15.5" />
    <path d="M18.4 5.6a1.6 1.6 0 1 0 2.2-2.2" />
    <path d="M8.5 15.5 6 21c2.6-.6 4-2 4.4-4.2" />
    <path d="M6 21c-2.4-.8-3.6-3-2.4-5s3.8-1.6 4.4.4" />
  </Glyph>
);

/** Spool — thread, material */
export const GlyphSpool = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M6 3h12M6 21h12" />
    <path d="M8 3v18M16 3v18" />
    <path d="M8 8h8M8 12h8M8 16h8" />
  </Glyph>
);

/** Chinar leaf — Kashmir */
export const GlyphChinar = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M12 21V11" />
    <path d="M12 11 6.5 6.5M12 11l5.5-4.5M12 11 8 14M12 11l4 3" />
    <path d="M12 11c-1.6-3.4-.8-6.4 0-8 .8 1.6 1.6 4.6 0 8Z" />
  </Glyph>
);

/** Kairi — the paisley, shared across every tradition here */
export const GlyphKairi = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M9.5 20.5C4.8 17.4 4.8 10 9 7.2c3-2 6.8-1 6.8 2.4 0 2.7-2.4 3.7-3.8 1.9" />
    <path d="M10 17.2c-2.4-1.9-2.4-5.6 0-7" />
  </Glyph>
);

/** Brush — Mithila, hand-painting */
export const GlyphBrush = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M18.5 3.5 10 12" />
    <path d="M10 12c-1.6-.4-3.2.4-3.8 2C5.4 16 4.6 17.4 3 18c1.6 2 4.6 2.4 6.4.8 1.4-1.2 1.8-2.8 1.2-4.4" />
    <path d="m16.6 5.4 2 2" />
  </Glyph>
);

/** Fold — the parcel, packing, dispatch */
export const GlyphFold = (p: GlyphProps) => (
  <Glyph {...p}>
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5Z" />
    <path d="M3 7.5 12 12l9-4.5M12 12v9" />
  </Glyph>
);

export const GLYPHS = {
  stitch: GlyphStitch,
  loom: GlyphLoom,
  needle: GlyphNeedle,
  spool: GlyphSpool,
  chinar: GlyphChinar,
  kairi: GlyphKairi,
  brush: GlyphBrush,
  fold: GlyphFold,
} as const;

export type GlyphName = keyof typeof GLYPHS;
