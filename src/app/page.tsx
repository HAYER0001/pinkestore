import { ScrubTrack } from "@/components/dom/scrub-track";
import { SequenceLoader } from "@/components/dom/sequence-loader";
import { CinematicText } from "@/components/dom/CinematicText";
import { PortalTransition } from "@/components/dom/PortalTransition";
import { ProductGallery } from "@/components/ecommerce/ProductGallery";
import { VelocityDistort } from "@/components/dom/VelocityDistort";
import { DisplayComposition, Standfirst } from "@/components/type/DisplayComposition";
import { PullQuote } from "@/components/type/PullQuote";
import { ChapterNav } from "@/components/type/ChapterNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CtaPair } from "@/components/site/Cta";
import { PromiseList } from "@/components/site/Promise";
import { HeroDepth, HeroReveal } from "@/components/site/HeroDepth";

/**
 * PHASE 5 — the editorial overlay.
 * PHASE 2 — the type system.
 *
 * Luxury breathes: every section is a full viewport or 32-unit padding, no
 * section is dense, and nothing here has a corner radius or a shadow.
 * mix-blend-difference lets the type invert itself against whatever the WebGL
 * canvas is doing behind it, so it stays legible over both the indigo void and
 * the bright cream shawls without a line of colour-tracking JS.
 *
 * The headings are COMPOSITIONS, not strings set large: each carries internal
 * hierarchy — a scale step between lines, one word taking the weight, an
 * indent that only reads at display size. A single string at one size is a
 * heading no matter how big you set it.
 */

/* The rail tracks these. Ids live on real sections, never on wrappers added
   for the nav — a wrapper around the portal would sit between ScrollTrigger's
   pin and its parent, and this project has already lost a day to that. */
const CHAPTERS = [
  { id: "origin", label: "Origin" },
  { id: "scrub-track", label: "The Cloth" },
  { id: "craft", label: "The Making" },
  { id: "pieces", label: "The Pieces" },
  { id: "promise", label: "The Promise" },
];

export default function Home() {
  return (
    <>
      <SequenceLoader />
      <ChapterNav chapters={CHAPTERS} tone="var(--chrome-ink, #FFFFFF)" />

      <main>
        {/* ---------- MORPH ZONE: the particles own this 150vh ---------- */}
        {/* items-start, not items-center: a three-line composition centred in
            a 150vh box lands its last line on top of the scroll indicator and
            pushes the standfirst off the bottom of the screen entirely.
            lg:pl clears the chapter rail, which is fixed to the left gutter
            and would otherwise print straight through the shaili chip. */}
        <section
          id="origin"
          className="relative flex h-[150vh] items-start px-[clamp(1.25rem,5vw,6rem)] pt-[10vh] lg:pl-[clamp(8rem,14vw,15rem)]"
        >
          {/* atmosphere only — pointer-events:none, so it can never intercept
              a click meant for the CTA behind it */}
          <HeroDepth />

          <div className="relative sticky top-[8vh] grid w-full items-center gap-[clamp(2rem,4vw,5rem)] xl:grid-cols-[minmax(0,1fr)_300px]">
            <div>
            <p
              className="ty-mono"
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
            <DisplayComposition
              as="h1"
              lines={[
                { text: "The dust", scale: "hero" },
                { text: "remembers", scale: "colossal" },
                { text: "the drawing", scale: "hero", italic: true, indent: 0.12 },
              ]}
              style={{ color: "#FFFFFF", mixBlendMode: "difference" }}
            />

            <Standfirst
              className="mt-[clamp(1.5rem,3vw,2.5rem)]"
              tone="#FFFFFF"
              style={{ mixBlendMode: "difference" }}
              delay={0.35}
            >
              Hand-painted in Mithila, embroidered in Kashmir, stitched in
              Lucknow. Every piece exists once.
            </Standfirst>

            {/* The homepage had NO call to action at all. Someone could read
                the entire cinematic run and never be offered anywhere to go. */}
            <CtaPair
              className="mt-[clamp(1.25rem,2.5vh,2rem)]"
              tone="#FAF8F5"
              ground="#0A0B10"
              primary={{ href: "/collection", label: "See the collection" }}
              secondary={{ href: "/craft", label: "How it is made" }}
            />
            </div>

            {/* ART DIRECTION, not decoration: type left, cloth right.
                It lives INSIDE the hero's sticky block rather than in the flow
                below it — placed after the section it landed straight on top
                of the particle morph, which owns that whole 150vh. Two things
                competing for one scroll range, again.
                xl only: below that the morph motif and this column occupy the
                same horizontal band. */}
            <div className="hidden xl:block">
              <HeroReveal />
            </div>
          </div>
        </section>

        {/* ---------- the cinematic scrubber ---------- */}
        <ScrubTrack />

        {/* ---------- the portal: camera pushes through the fabric ---------- */}
        <PortalTransition />

        {/* ---------- 03 · the making ----------
            This used to sit AFTER the shop. A story-led site that sells before
            it explains has the spine backwards: you arrive at a price with no
            reason for it yet. It has to be on this side of the portal though —
            it is a cream section, and the portal is the dark-to-light
            handoff. */}
        <section
          id="craft"
          className="flex min-h-screen items-center justify-center px-[clamp(1.25rem,5vw,6rem)] py-32"
          style={{ background: "#FAF8F5" }}
        >
          <VelocityDistort max={0.055} className="max-w-[52ch] text-center">
            <p
              className="ty-mono"
              style={{ color: "#8A6812", letterSpacing: "var(--tracking-luxe-widest)" }}
            >
              The Making
            </p>

            <div className="mt-[clamp(2rem,4vw,3rem)]">
              <DisplayComposition
                align="center"
                lines={[
                  { text: "Nothing here", scale: "display" },
                  { text: "was made twice", scale: "display", italic: true },
                ]}
                style={{ color: "#1B1916" }}
              />
            </div>

            <div className="mt-[clamp(2rem,4vw,3rem)] flex justify-center">
              <CinematicText
                as="p"
                text="A sozni shawl can hold a year of one person's hands. A kani weave advances one pass at a time against a coded talim. We do not restock, because the next piece will be different."
                className="ty-read measure-read"
                style={{ color: "#1B1916", opacity: 0.72 }}
                delay={0.2}
                stagger={0.018}
              />
            </div>

            <CtaPair
              className="mt-[clamp(2.5rem,5vh,3.5rem)] justify-center"
              tone="#1A1A1A"
              ground="#FAF8F5"
              primary={{ href: "/craft", label: "All five techniques" }}
              secondary={{ href: "/collection", label: "See what is in stock" }}
            />
          </VelocityDistort>
        </section>

        {/* ---------- 04 · the pieces ---------- */}
        <ProductGallery />

        {/* ---------- 05 · the promise ----------
            A pull quote has to be a CLAIM, not a summary of what surrounds it.
            No attribution: we have not interviewed anyone, and inventing a
            maker to put under a sentence is the same lie as inventing the
            provenance. */}
        <div id="promise" className="scroll-mt-24">
          <PullQuote ground="#F3EFE8" tone="#1A1A1A" threadTone="#96605B">
            One of one is not a scarcity tactic. It is simply what happens when
            the only tool is a hand.
          </PullQuote>

          {/* The claim above is a sentence; these are the four things it
              actually commits us to, each one testable. */}
          <div
            className="mx-auto max-w-[1100px] px-[clamp(1rem,5vw,4rem)] pb-[clamp(4rem,11vh,9rem)]"
            style={{ background: "#F3EFE8" }}
          >
            <PromiseList />
          </div>
        </div>

        {/* ---------- the closing statement (item 40) ----------
            The last thing anyone reads has to earn the scroll that got them
            here, and it has to be TRUE. Not a slogan, not a promise we cannot
            keep — the actual reason this shop is different from a shop that
            reorders. */}
        <section
          className="flex min-h-[85vh] items-center justify-center px-[clamp(1.25rem,5vw,6rem)] py-[clamp(4rem,12vh,9rem)]"
          style={{ background: "#1A1A1A" }}
        >
          {/* An explicit width, not a ch measure: `ch` resolves against the
              INHERITED font size, so 46ch here was ~368px of body text while
              the headline inside it is set at 76px. It wrapped to four lines. */}
          <div className="max-w-[860px] text-center">
            <DisplayComposition
              align="center"
              lines={[
                { text: "What you are buying", scale: "display" },
                { text: "is someone's winter", scale: "display", italic: true },
              ]}
              style={{ color: "#FAF8F5" }}
            />

            <Standfirst className="mx-auto mt-[clamp(2rem,4vh,3rem)]" tone="#C9A59F">
              Months of one person's hands, and the fact that they will never
              spend them the same way twice. When a piece is finished they begin
              something else, and it is different. That is the whole business.
            </Standfirst>

            <div className="mt-[clamp(2.5rem,5vh,3.5rem)] flex justify-center">
              <CtaPair
                tone="#FAF8F5"
                ground="#1A1A1A"
                primary={{ href: "/collection", label: "See the collection" }}
                secondary={{ href: "/about", label: "About the shop" }}
              />
            </div>
          </div>
        </section>
      </main>

      {/* The page used to end here, mid-air, on the one route most likely to
          be someone's first. */}
      <SiteFooter />
    </>
  );
}
