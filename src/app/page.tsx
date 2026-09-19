import { ScrubTrack } from "@/components/dom/scrub-track";
import { SequenceLoader } from "@/components/dom/sequence-loader";
import { PortalTransition } from "@/components/dom/PortalTransition";
import { ChapterNav } from "@/components/type/ChapterNav";
import { PullQuote } from "@/components/type/PullQuote";
import { PromiseList } from "@/components/site/Promise";
import { FabricBand } from "@/components/site/FabricBand";
import { SiteFooter } from "@/components/site/SiteFooter";
import { HeroScene } from "@/components/home/HeroScene";
import { CraftChapters } from "@/components/home/CraftChapters";
import { GalleryWall } from "@/components/home/GalleryWall";
import { ExhibitionWall } from "@/components/home/ExhibitionWall";
import { FinalScene } from "@/components/home/FinalScene";

/**
 * THE HOMEPAGE — a composition of named scenes. See REDESIGN.md.
 *
 *   01 HeroScene        the painting, the headline across it, the canvas live
 *   02 ScrubTrack       the film, four beats, buyable on the film itself
 *      PortalTransition the dark -> light handoff (untouched)
 *   03 CraftChapters    Mithila · Kashmir · Jamawar · Kairi — four compositions
 *      FabricBand       a length of cloth drawn sideways, into the wall
 *   04 GalleryWall      the pieces, hung, not carded
 *   05 ExhibitionWall   the making, on a full-bleed macro
 *   06 the promise      the claim, and the four things it commits us to
 *   07 FinalScene       "Nothing here was made twice."
 *
 * Every scene declares data-chrome so the fixed header's ink follows the
 * ground under it — there are now two dark chapters after the portal, and the
 * old single flip at the portal would have left dark type on the indigo.
 *
 * The rule from the root layout still holds: nothing here wraps {children}
 * in a transform, filter or opacity. The hero's h1 blends with `difference`
 * against the WebGL canvas, and it can only do that in the root stacking
 * context.
 */

/* The rail. Ids live on real sections, never on wrappers added for the nav —
   a wrapper around the portal would sit between ScrollTrigger's pin and its
   parent, and this project has already lost a day to that. */
const CHAPTERS = [
  { id: "origin", label: "Origin" },
  { id: "scrub-track", label: "The Cloth" },
  { id: "mithila", label: "Mithila" },
  { id: "kashmir", label: "Kashmir" },
  { id: "jamawar", label: "Jamawar" },
  { id: "kairi", label: "Kairi" },
  { id: "pieces", label: "The Pieces" },
  { id: "promise", label: "The Promise" },
];

export default function Home() {
  return (
    <>
      <SequenceLoader />
      <ChapterNav chapters={CHAPTERS} tone="var(--chrome-ink, #FFFFFF)" />

      <main>
        <HeroScene />

        <ScrubTrack />

        <PortalTransition />

        <CraftChapters />

        <FabricBand />

        <GalleryWall />

        <ExhibitionWall />

        {/* ---------- 06 · the promise ----------
            A pull quote has to be a CLAIM, not a summary of what surrounds it.
            No attribution: we have not interviewed anyone, and inventing a
            maker to put under a sentence is the same lie as inventing the
            provenance. */}
        <div id="promise" data-chrome="light" className="ground-paper scroll-mt-24" style={{ background: "#F3EFE8" }}>
          <PullQuote ground="#F3EFE8" tone="#1A1A1A" threadTone="#96605B">
            One of one is not a scarcity tactic. It is simply what happens when
            the only tool is a hand.
          </PullQuote>
          <div className="mx-auto max-w-[1100px] px-[clamp(1rem,5vw,4rem)] pb-[clamp(4rem,11vh,9rem)]">
            <PromiseList />
          </div>
        </div>

        <FinalScene />
      </main>

      <SiteFooter />
    </>
  );
}
