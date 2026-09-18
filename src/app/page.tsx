import { ScrubTrack } from "@/components/dom/scrub-track";
import { SequenceLoader } from "@/components/dom/sequence-loader";
import { CinematicText } from "@/components/dom/CinematicText";

/**
 * PHASE 5 — the editorial overlay.
 *
 * Luxury breathes: every section is a full viewport or 32-unit padding, no
 * section is dense, and nothing here has a corner radius or a shadow.
 * mix-blend-difference lets the type invert itself against whatever the WebGL
 * canvas is doing behind it, so it stays legible over both the indigo void and
 * the bright cream shawls without a line of colour-tracking JS.
 */
export default function Home() {
  return (
    <>
      <SequenceLoader />

      <main>
        {/* ---------- MORPH ZONE: the particles own this 150vh ---------- */}
        <section className="flex h-[150vh] items-center px-[clamp(1.25rem,5vw,6rem)]">
          <div className="sticky top-[34vh]">
            <p
              className="t-micro-ed"
              style={{
                color: "#E8BC57",
                letterSpacing: "var(--tracking-luxe-widest)",
                marginBottom: "clamp(1.5rem,3vw,2.5rem)",
              }}
            >
              शैली ०१ — Mithila
            </p>

            {/* difference inverts the glyphs against whatever the canvas is
                rendering behind them, so this stays legible over the indigo
                void AND over the bright cream shawls with no colour-tracking
                JS at all. */}
            <CinematicText
              as="h1"
              text="The dust remembers the drawing"
              className="t-hero-ed max-w-[14ch]"
              style={{ color: "#FFFFFF", mixBlendMode: "difference" }}
            />

            <div className="mt-[clamp(2rem,4vw,3.5rem)] max-w-[44ch]">
              <CinematicText
                as="p"
                text="Hand-painted in Mithila, embroidered in Kashmir, stitched in Lucknow. Every piece exists once."
                className="t-body-ed"
                style={{ color: "#FFFFFF", mixBlendMode: "difference" }}
                delay={0.35}
                stagger={0.022}
              />
            </div>
          </div>
        </section>

        {/* ---------- the cinematic scrubber ---------- */}
        <ScrubTrack />

        {/* ---------- editorial close ---------- */}
        <section
          id="craft"
          className="flex min-h-screen items-center justify-center px-[clamp(1.25rem,5vw,6rem)] py-32"
        >
          <div className="max-w-[52ch] text-center">
            <p
              className="t-micro-ed"
              style={{ color: "#E8BC57", letterSpacing: "var(--tracking-luxe-widest)" }}
            >
              The Craft
            </p>
            <div className="mt-[clamp(2rem,4vw,3rem)]">
              <CinematicText
                as="h2"
                text="Nothing here was made twice"
                className="t-display-ed"
                style={{ color: "#FFFFFF", mixBlendMode: "difference" }}
              />
            </div>
            <div className="mt-[clamp(2rem,4vw,3rem)]">
              <CinematicText
                as="p"
                text="A sozni shawl can hold a year of one person's hands. A kani weave advances one pass at a time against a coded talim. We do not restock, because the next piece will be different."
                className="t-body-ed"
                style={{ color: "#FFFFFF", opacity: 0.75, mixBlendMode: "difference" }}
                delay={0.2}
                stagger={0.018}
              />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
