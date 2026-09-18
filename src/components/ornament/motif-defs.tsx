/**
 * Mithila ornament defs — mounted ONCE in the root layout.
 *
 * THE SANDWICH TECHNIQUE
 * Madhubani's kachni contour is a doubled line with a narrow channel between.
 * We never author two parallel paths (their miters disagree at corners).
 * Instead each shape is ONE <path> geometry, stroked twice via <use>:
 * ink at 3.2, then ground colour at 1.2 on the identical geometry. The
 * sandwich leaves a 1-unit ink rail either side. Scale-safe, corner-safe.
 *
 * SEPARATION RULE: this is HOUSE ornament. It must never be placed so that it
 * reads as part of a product's own decoration — only one product in the
 * catalogue is actually Madhubani. See src/lib/catalog.ts.
 */

const G = {
  /** 24x8 tile — the lightest divider. */
  rule: "M 0 4 H 24",
  lozenge: "M 12 1.4 L 13.8 4 L 12 6.6 L 10.2 4 Z",

  /** Kairi (paisley) tooth, drawn in a 24x28 box, tip curling inward. */
  kairi:
    "M 11 25 C 4 21 4 11 10 7 C 14.5 4 20 5.5 20 10.5 C 20 14.5 16.5 16 14.5 13",
  kairiEcho:
    "M 11.6 21.4 C 7.4 18.6 7.4 12.2 11 9.8 C 13.8 8 16.8 8.8 16.8 11.4 C 16.8 13.4 15.4 14.4 14.5 13",

  /** One lotus petal, pointing up from centre (24,24) in a 48x48 box. */
  petal: "M 24 24 C 20.4 17 20.4 10 24 5 C 27.6 10 27.6 17 24 24",

  /** Wheat: stalk plus one grain, mirrored and repeated. */
  stalk: "M 20 37 L 20 9",
  grain: "M 20 16 C 24.2 13.8 26.4 16.8 25.2 20 C 22.4 21 20.6 19 20 16",

  /** Phulkari bagh diamond, centred in a 64x64 tile. */
  diamond: "M 32 6 L 58 32 L 32 58 L 6 32 Z",
  darn: "M 24 32 L 40 32 M 28 26 L 36 26 M 28 38 L 36 38",
};

/** Ink stroke then ground stroke on identical geometry = the kachni channel. */
function Kachni({ href, scale = 1 }: { href: string; scale?: number }) {
  return (
    <>
      <use href={href} className="pk-ink" style={{ strokeWidth: 3.2 * scale }} />
      <use href={href} className="pk-ground" style={{ strokeWidth: 1.2 * scale }} />
    </>
  );
}

export function MotifDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {/* ---- raw geometry, never rendered directly ---- */}
        <path id="pk-g-rule" d={G.rule} />
        <path id="pk-g-kairi" d={G.kairi} />
        <path id="pk-g-kairi-echo" d={G.kairiEcho} />
        <path id="pk-g-petal" d={G.petal} />
        <path id="pk-g-stalk" d={G.stalk} />
        <path id="pk-g-grain" d={G.grain} />
        <path id="pk-g-diamond" d={G.diamond} />
        <path id="pk-g-darn" d={G.darn} />

        {/* ---- composed symbols ---- */}
        <symbol id="pk-lotus" viewBox="0 0 48 48">
          {Array.from({ length: 8 }, (_, i) => (
            <g key={i} transform={`rotate(${i * 45} 24 24)`}>
              <Kachni href="#pk-g-petal" />
            </g>
          ))}
          <circle cx="24" cy="24" r="3.4" className="pk-fill-ink" />
        </symbol>

        <symbol id="pk-wheat" viewBox="0 0 40 40">
          <Kachni href="#pk-g-stalk" />
          {[0, 7, 14].map((dy, i) => (
            <g key={i} transform={`translate(0 ${dy})`}>
              <Kachni href="#pk-g-grain" />
              <g transform="translate(40 0) scale(-1 1)">
                <Kachni href="#pk-g-grain" />
              </g>
            </g>
          ))}
        </symbol>

        <symbol id="pk-kairi" viewBox="0 0 24 28">
          <Kachni href="#pk-g-kairi" />
          <use href="#pk-g-kairi-echo" className="pk-ink" style={{ strokeWidth: 1.4 }} />
        </symbol>

        {/* ---- BAND 1: kachni rule. 24x8 ---- */}
        <pattern
          id="pk-band-rule"
          patternUnits="userSpaceOnUse"
          width="24"
          height="8"
        >
          <Kachni href="#pk-g-rule" />
          <path d={G.lozenge} className="pk-fill-ink" />
        </pattern>

        {/* ---- BAND 2: kairi tooth, alternating upright / inverted. 48x28 ---- */}
        <pattern
          id="pk-band-kairi"
          patternUnits="userSpaceOnUse"
          width="48"
          height="28"
        >
          <use href="#pk-kairi" x="0" y="0" width="24" height="28" />
          <g transform="translate(24 0) rotate(180 12 14)">
            <use href="#pk-kairi" x="0" y="0" width="24" height="28" />
          </g>
        </pattern>

        {/* ---- BAND 3: wheat + lotus alternation. The fusion band. 160x40 ---- */}
        <pattern
          id="pk-band-wheat-lotus"
          patternUnits="userSpaceOnUse"
          width="160"
          height="40"
        >
          <use href="#pk-wheat" x="0" y="0" width="40" height="40" />
          <g transform="translate(40 16)">
            <Kachni href="#pk-g-rule" scale={0.7} />
          </g>
          <use href="#pk-lotus" x="76" y="-4" width="48" height="48" />
          <g transform="translate(124 16)">
            <Kachni href="#pk-g-rule" scale={0.7} />
          </g>
        </pattern>

        {/* ---- BAND 2v: kairi tooth rotated for vertical edges. 28x48 ---- */}
        <pattern
          id="pk-band-kairi-v"
          patternUnits="userSpaceOnUse"
          width="28"
          height="48"
        >
          <g transform="rotate(90 14 14) translate(0 -14)">
            <use href="#pk-kairi" x="0" y="0" width="24" height="28" />
          </g>
          <g transform="translate(0 24) rotate(90 14 14) translate(0 -14) rotate(180 12 14)">
            <use href="#pk-kairi" x="0" y="0" width="24" height="28" />
          </g>
        </pattern>

        {/* ---- GOLD variants. A pattern's contents inherit CSS from the <defs>
                 where they are DEFINED, not from the element that references
                 them — so a gold frame cannot be made by setting a variable on
                 the consumer. These carry the colours explicitly. ---- */}
        <symbol id="pk-kairi-gold" viewBox="0 0 24 28">
          <use href="#pk-g-kairi" fill="none" stroke="#E8BC57" strokeWidth={3.2} />
          <use href="#pk-g-kairi" fill="none" stroke="#17120F" strokeWidth={1.2} />
          <use href="#pk-g-kairi-echo" fill="none" stroke="#E8BC57" strokeWidth={1.4} />
        </symbol>

        <pattern id="pk-band-kairi-gold" patternUnits="userSpaceOnUse" width="48" height="28">
          <use href="#pk-kairi-gold" x="0" y="0" width="24" height="28" />
          <g transform="translate(24 0) rotate(180 12 14)">
            <use href="#pk-kairi-gold" x="0" y="0" width="24" height="28" />
          </g>
        </pattern>

        <pattern id="pk-band-kairi-v-gold" patternUnits="userSpaceOnUse" width="28" height="48">
          <g transform="rotate(90 14 14) translate(0 -14)">
            <use href="#pk-kairi-gold" x="0" y="0" width="24" height="28" />
          </g>
          <g transform="translate(0 24) rotate(90 14 14) translate(0 -14) rotate(180 12 14)">
            <use href="#pk-kairi-gold" x="0" y="0" width="24" height="28" />
          </g>
        </pattern>

        {/* ---- Kona: the corner. Patterns do not miter, so a frame needs a
                 dedicated corner placed four times at 0/90/180/270. ---- */}
        <symbol id="pk-kona" viewBox="0 0 48 48">
          <Kachni href="#pk-g-rule" />
          <g transform="rotate(90 24 24) translate(0 0)">
            <Kachni href="#pk-g-rule" />
          </g>
          <use href="#pk-lotus" x="8" y="8" width="32" height="32" />
        </symbol>

        {/* ---- Phulkari bagh lattice: the site-wide field fill. 64x64 ---- */}
        <pattern
          id="pk-phulkari"
          patternUnits="userSpaceOnUse"
          width="64"
          height="64"
        >
          <use href="#pk-g-diamond" className="pk-hair" />
          <use href="#pk-g-darn" className="pk-hair" />
          {[
            [-32, -32],
            [32, -32],
            [-32, 32],
            [32, 32],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <use href="#pk-g-diamond" className="pk-hair" />
            </g>
          ))}
        </pattern>
      </defs>
    </svg>
  );
}
