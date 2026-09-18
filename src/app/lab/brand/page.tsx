import type { Metadata } from "next";
import { Monogram, Wordmark } from "@/components/brand/Monogram";
import { GLYPHS } from "@/components/brand/Glyphs";
import { ThreadRule, ThreadKnot } from "@/components/brand/ThreadRule";

export const metadata: Metadata = {
  title: "Brand system",
  robots: { index: false, follow: false },
};

const SWATCHES: [string, string, string][] = [
  ["Ivory", "#FAF8F5", "the page"],
  ["Paper", "#F3EFE8", "alternating band"],
  ["Rose", "#C9A59F", "surface · text on dark"],
  ["Rose ink", "#96605B", "text on ivory"],
  ["Rose deep", "#8A2F3B", "accent only"],
  ["Charcoal", "#1A1A1A", "ink · dark ground"],
  ["Indigo", "#2A3470", "cinematic ground"],
  ["Gold", "#E8BC57", "the one metal"],
];

export default function BrandLab() {
  return (
    <div style={{ background: "#FAF8F5", minHeight: "100svh", color: "#1A1A1A" }}>
      <div className="mx-auto max-w-5xl px-8 py-20">
        <p className="t-micro-ed" style={{ color: "#8A6812", letterSpacing: "var(--tracking-luxe-widest)" }}>
          Phase 1
        </p>
        <h1 className="t-display-ed mt-4">The brand system</h1>
        <ThreadRule tone="#1A1A1A" slack={6} className="mt-8" />

        {/* ---- monogram ---- */}
        <Section n="01" title="Monogram">
          <div className="flex flex-wrap items-end gap-12">
            {[64, 40, 28, 16].map((s) => (
              <div key={s} className="flex flex-col items-center gap-3">
                <Monogram size={s} weight={s >= 40 ? 2 : s >= 28 ? 1.9 : 1.6} />
                <span className="t-micro-ed" style={{ color: "#6B645A" }}>{s}px</span>
              </div>
            ))}
            <div
              className="flex h-16 w-16 items-center justify-center"
              style={{ background: "#12100E" }}
            >
              <Monogram size={40} stroke="#E8BC57" weight={2.2} />
            </div>
          </div>
          <p className="t-body-ed mt-6 max-w-[56ch]" style={{ color: "#6B645A", fontSize: "0.9375rem" }}>
            A P whose bowl is a kairi — the paisley that appears on three of the
            five pieces and in both the Kashmiri and Mithila vocabularies. The
            stem is one unbroken thread that overshoots the baseline and curls.
            Stroked, never filled: a counter-shape is the usual reason a
            monogram dies at 16px.
          </p>
        </Section>

        {/* ---- wordmark ---- */}
        <Section n="02" title="Wordmark">
          <div className="flex flex-wrap items-center gap-14">
            <Wordmark />
            <Wordmark showCity={false} />
            <div className="px-7 py-5" style={{ background: "#2A3470" }}>
              <Wordmark tone="#FAF8F5" />
            </div>
          </div>
        </Section>

        {/* ---- colour ---- */}
        <Section n="03" title="Colour">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {SWATCHES.map(([name, hex, role]) => (
              <div key={hex}>
                <div style={{ background: hex, height: 88, border: "var(--b-rule)" }} />
                <p className="mt-3" style={{ fontFamily: "var(--font-body)", fontSize: "0.8125rem" }}>
                  {name}
                </p>
                <p className="t-micro-ed" style={{ color: "#6B645A", letterSpacing: "0.1em" }}>
                  {hex}
                </p>
                <p className="t-micro-ed mt-1" style={{ color: "#8A8276", letterSpacing: "0.06em", textTransform: "none" }}>
                  {role}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ---- glyphs ---- */}
        <Section n="04" title="Glyphs">
          <div className="flex flex-wrap gap-12">
            {(Object.keys(GLYPHS) as (keyof typeof GLYPHS)[]).map((k) => {
              const G = GLYPHS[k];
              return (
                <div key={k} className="flex flex-col items-center gap-3">
                  <G size={30} />
                  <span className="t-micro-ed" style={{ color: "#6B645A" }}>{k}</span>
                </div>
              );
            })}
          </div>
          <p className="t-body-ed mt-6 max-w-[56ch]" style={{ color: "#6B645A", fontSize: "0.9375rem" }}>
            Drawn from the trades the shop sells, not from a UI kit. A truck for
            shipping and a shield for authenticity are the loudest tell that a
            site was assembled. Anything that cannot be said in one continuous
            line is not in the set.
          </p>
        </Section>

        {/* ---- thread ---- */}
        <Section n="05" title="The thread">
          <div className="space-y-10">
            <ThreadRule tone="#1A1A1A" slack={7} />
            <ThreadRule tone="#96605B" slack={3} weight={1} />
            <div className="px-8 py-10" style={{ background: "#12100E" }}>
              <ThreadRule tone="#E8BC57" slack={9} />
            </div>
            <div className="flex items-center gap-4">
              <ThreadKnot tone="#1A1A1A" />
              <span className="t-micro-ed" style={{ color: "#6B645A" }}>knot — terminates a thread</span>
            </div>
          </div>
          <p className="t-body-ed mt-8 max-w-[56ch]" style={{ color: "#6B645A", fontSize: "0.9375rem" }}>
            A shallow catenary, never a straight rule. A straight line is a
            border; a line with slack is a thread. It recurs under headings,
            between chapters and along the footer — a device earns its keep by
            repeating, not by being elaborate.
          </p>
        </Section>
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-20">
      <div className="flex items-baseline gap-5">
        <span className="t-micro-ed" style={{ color: "#C9A59F", letterSpacing: "var(--tracking-luxe-wide)" }}>
          {n}
        </span>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "1.9rem", letterSpacing: "-0.02em" }}>
          {title}
        </h2>
      </div>
      <ThreadRule tone="rgba(26,26,26,0.35)" slack={3} weight={1} className="mb-9 mt-4" />
      {children}
    </section>
  );
}
