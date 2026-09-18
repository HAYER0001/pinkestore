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
