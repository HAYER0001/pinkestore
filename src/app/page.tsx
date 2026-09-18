import { ScrubTrack } from "@/components/dom/scrub-track";
import { SequenceLoader } from "@/components/dom/sequence-loader";

/**
 * PHASE 3 — the cinematic scrubber.
 *
 * The DOM is almost empty on purpose: the track exists to BE scroll distance,
 * and everything visual lives on the WebGL canvas behind it.
 */
export default function Home() {
  return (
    <>
      <SequenceLoader />
      <main>
        {/* ---- MORPH ZONE ----
            150vh that belongs to the particles alone. The scrubber's
            ScrollTrigger is anchored to #scrub-track, so the footage cannot
            begin until this has been scrolled past. */}
        <section
          style={{
            height: "150vh",
            display: "flex",
            alignItems: "center",
            padding: "0 clamp(1rem, 5vw, 5rem)",
            pointerEvents: "none",
          }}
        >
          <div style={{ position: "sticky", top: "38vh" }}>
            <p
              style={{
                fontFamily: "var(--font-geist-mono)",
                fontSize: "clamp(10px,1vw,12px)",
                letterSpacing: "0.28em",
                color: "#E8BC57",
              }}
            >
              शैली ०१ · मिथिला
            </p>
            <h1
              style={{
                fontFamily: "var(--font-display-serif)",
                fontWeight: 300,
                fontSize: "clamp(2.8rem, 9vw, 7.5rem)",
                lineHeight: 0.92,
                letterSpacing: "-0.04em",
                color: "#F7F3EC",
                margin: "0.3em 0 0",
                mixBlendMode: "difference",
              }}
            >
              The dust
              <br />
              remembers
              <br />
              the drawing
            </h1>
          </div>
        </section>

        <ScrubTrack />
        <section
          style={{
            minHeight: "60svh",
            display: "grid",
            placeItems: "center",
            padding: "6rem 1.5rem",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-display-serif)",
              fontStyle: "italic",
              fontSize: "clamp(1.2rem,2.4vw,2rem)",
              color: "#F7F3EC",
              opacity: 0.7,
              textAlign: "center",
              maxWidth: "30ch",
            }}
          >
            Five pieces. Each made once, by one pair of hands.
          </p>
        </section>
      </main>
    </>
  );
}
