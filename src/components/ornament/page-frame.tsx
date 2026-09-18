/**
 * The manuscript frame.
 *
 * Both traditions this shop draws on are border-driven — a Mithila shawl's
 * meaning sits as much in its terminal border of standing figures as in the
 * central field, and phulkari is entirely band-and-lattice. So the page gets a
 * real border on all four edges, on every route, with a kona (corner) placed
 * four times because SVG patterns do not miter.
 *
 * Fixed, pointer-events-none, aria-hidden. Content is inset to clear it.
 */

const EDGE = 22;
const FRAME_BG = "#17120F";
/* Inside the frame the "ground" stroke of every sandwich must be the frame's
   own dark, or the double-line channel disappears. */

export function PageFrame() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-20 ink-gold"
    >
      {/* top */}
      <svg className="absolute left-0 top-0 w-full" height={EDGE}>
        <rect width="100%" height={EDGE} fill={FRAME_BG} />
        <rect width="100%" height={EDGE} fill="url(#pk-band-kairi-gold)" opacity="1" />
      </svg>
      {/* bottom */}
      <svg className="absolute bottom-0 left-0 w-full" height={EDGE}>
        <rect width="100%" height={EDGE} fill={FRAME_BG} />
        <g transform={`rotate(180 500 ${EDGE / 2})`}>
          <rect x="0" width="4000" height={EDGE} fill="url(#pk-band-kairi-gold)" opacity="1" />
        </g>
      </svg>
      {/* left */}
      <svg className="absolute bottom-0 left-0 top-0" width={EDGE}>
        <rect width={EDGE} height="100%" fill={FRAME_BG} />
        <rect width={EDGE} height="100%" fill="url(#pk-band-kairi-v-gold)" opacity="1" />
      </svg>
      {/* right */}
      <svg className="absolute bottom-0 right-0 top-0" width={EDGE}>
        <rect width={EDGE} height="100%" fill={FRAME_BG} />
        <rect width={EDGE} height="100%" fill="url(#pk-band-kairi-v-gold)" opacity="1" />
      </svg>

      {/* four konas */}
      {[
        { top: 0, left: 0, r: 0 },
        { top: 0, right: 0, r: 90 },
        { bottom: 0, right: 0, r: 180 },
        { bottom: 0, left: 0, r: 270 },
      ].map((pos, i) => (
        <svg
          key={i}
          className="absolute"
          width={EDGE * 2}
          height={EDGE * 2}
          viewBox="0 0 48 48"
          style={{ ...pos, transform: `rotate(${pos.r}deg)` }}
        >
          <rect width="48" height="48" fill={FRAME_BG} />
          <use href="#pk-kona" width="48" height="48" />
        </svg>
      ))}
    </div>
  );
}
