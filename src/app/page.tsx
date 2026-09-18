/**
 * PHASE 1 — DOM overlay proving the engine.
 *
 * Three full-viewport sections of nothing but type, sitting on a transparent
 * document so the fixed WebGL canvas reads through. The type uses
 * `mix-blend-mode: difference`, so as the particle field rotates behind it the
 * letterforms invert against it rather than sitting on top like a sticker.
 *
 * No commerce chrome is mounted here yet — this phase is the engine only.
 * The previous storefront is preserved at /v1.
 */

const SECTIONS = [
  { kicker: "01 — Mithila", line: "Drawn", sub: "by a hand that does not sketch first." },
  { kicker: "02 — One of one", line: "Once", sub: "and then never again in that exact form." },
  { kicker: "03 — Chandigarh", line: "Sent", sub: "wrapped, by someone who knows the piece." },
];

export default function Phase1() {
  return (
    <main style={{ position: "relative" }}>
      {SECTIONS.map((s) => (
        <section
          key={s.kicker}
          style={{
            height: "100svh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 clamp(1rem, 6vw, 7rem)",
            /* the whole section blends, so kicker and rule invert too */
            mixBlendMode: "difference",
            color: "#F4EFE6",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: "clamp(10px, 1vw, 13px)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: 0.75,
            }}
          >
            {s.kicker}
          </p>

          <h2
            style={{
              fontFamily: "var(--font-display-serif)",
              fontWeight: 300,
              fontSize: "clamp(4.5rem, 19vw, 17rem)",
              lineHeight: 0.86,
              letterSpacing: "-0.04em",
              margin: "0.12em 0 0",
            }}
          >
            {s.line}
          </h2>

          <p
            style={{
              fontFamily: "var(--font-display-serif)",
              fontSize: "clamp(1.1rem, 2.4vw, 2rem)",
              fontStyle: "italic",
              maxWidth: "26ch",
              marginTop: "0.9rem",
              opacity: 0.88,
            }}
          >
            {s.sub}
          </p>
        </section>
      ))}
    </main>
  );
}
