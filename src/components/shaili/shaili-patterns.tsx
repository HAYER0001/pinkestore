/**
 * Each shaili draws itself its own way. These are the real formal rules of
 * each school rendered as tessellating SVG, not generic ornament:
 *
 *   madhubani   doubled kachni contour + cross-hatch fill, nothing left empty
 *   warli       circle / triangle / square only, white on mud
 *   gond        every surface built from repeated dash and dot
 *   phulkari    counted darn stitch worked until no ground shows
 *   pattachitra border-first: stacked ornamental bands
 *   kalamkari   free pen line, vegetal
 */

export function ShailiPattern({
  id,
  ink,
  accent,
  opacity = 1,
}: {
  id: string;
  ink: string;
  accent: string;
  opacity?: number;
}) {
  const pid = `sp-${id}`;
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity }}
    >
      <defs>{tile(id, pid, ink, accent)}</defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

function tile(id: string, pid: string, ink: string, accent: string) {
  const S = { fill: "none", stroke: ink, strokeLinecap: "round" as const };

  switch (id) {
    case "warli":
      return (
        <pattern id={pid} patternUnits="userSpaceOnUse" width="96" height="96">
          {/* the whole vocabulary: circle, triangle, square */}
          <path d="M 48 30 L 40 47 L 56 47 Z" {...S} strokeWidth={2} />
          <path d="M 48 64 L 40 47 L 56 47 Z" {...S} strokeWidth={2} />
          <circle cx="48" cy="22" r="6" {...S} strokeWidth={2} />
          <path d="M 41 38 L 28 30 M 55 38 L 68 30" {...S} strokeWidth={2} />
          <path d="M 44 64 L 36 80 M 52 64 L 60 80" {...S} strokeWidth={2} />
          <circle cx="8" cy="8" r="3" {...S} strokeWidth={1.6} />
          <circle cx="86" cy="72" r="4" {...S} strokeWidth={1.6} />
        </pattern>
      );

    case "gond":
      return (
        <pattern id={pid} patternUnits="userSpaceOnUse" width="44" height="44">
          {[0, 11, 22, 33].map((y, i) => (
            <g key={y}>
              {[0, 12, 24, 36].map((x) => (
                <path
                  key={`${x}-${y}`}
                  d={`M ${x + (i % 2 ? 6 : 0)} ${y + 4} l 7 0`}
                  {...S}
                  stroke={i % 2 ? accent : ink}
                  strokeWidth={2.2}
                />
              ))}
            </g>
          ))}
          <circle cx="22" cy="22" r="2" fill={accent} />
        </pattern>
      );

    case "phulkari":
      return (
        <pattern id={pid} patternUnits="userSpaceOnUse" width="56" height="56">
          {/* counted darn stitch — short parallel runs building a diamond */}
          {[
            [28, 8],
            [16, 20],
            [40, 20],
            [28, 32],
            [4, 32],
            [52, 32],
            [16, 44],
            [40, 44],
          ].map(([x, y], i) => (
            <g key={i} stroke={i % 3 === 0 ? accent : ink} strokeWidth={2.4} strokeLinecap="round">
              <path d={`M ${x - 5} ${y} l 10 0`} />
              <path d={`M ${x - 5} ${y + 4} l 10 0`} />
              <path d={`M ${x - 3} ${y + 8} l 6 0`} />
            </g>
          ))}
        </pattern>
      );

    case "pattachitra":
      return (
        <pattern id={pid} patternUnits="userSpaceOnUse" width="60" height="30">
          <path d="M 0 2 L 60 2 M 0 28 L 60 28" {...S} stroke={accent} strokeWidth={2} />
          <path
            d="M 6 15 C 12 6 22 6 28 15 C 22 24 12 24 6 15 Z"
            {...S}
            strokeWidth={1.8}
          />
          <path d="M 34 8 l 8 7 l -8 7 l -8 -7 Z" {...S} stroke={accent} strokeWidth={1.8} />
          <circle cx="52" cy="15" r="4" {...S} strokeWidth={1.8} />
        </pattern>
      );

    case "kalamkari":
      return (
        <pattern id={pid} patternUnits="userSpaceOnUse" width="72" height="72">
          <path
            d="M 6 66 C 18 50 18 30 36 22 C 52 15 60 26 54 38 C 48 49 34 48 30 38"
            {...S}
            strokeWidth={1.7}
          />
          <path d="M 36 22 c -7 -5 -6 -14 2 -16 c 6 -1 9 6 5 11" {...S} stroke={accent} strokeWidth={1.7} />
          <circle cx="60" cy="58" r="3.4" {...S} stroke={accent} strokeWidth={1.7} />
        </pattern>
      );

    default:
      /* madhubani — doubled contour over cross-hatch, horror vacui */
      return (
        <pattern id={pid} patternUnits="userSpaceOnUse" width="64" height="64">
          <path d="M 0 0 L 64 64 M 64 0 L 0 64" {...S} strokeWidth={0.7} opacity={0.45} />
          <path d="M 32 6 L 58 32 L 32 58 L 6 32 Z" {...S} strokeWidth={3} />
          <path d="M 32 6 L 58 32 L 32 58 L 6 32 Z" fill="none" stroke="transparent" strokeWidth={1.1} />
          <circle cx="32" cy="32" r="5" {...S} stroke={accent} strokeWidth={2.4} />
        </pattern>
      );
  }
}
