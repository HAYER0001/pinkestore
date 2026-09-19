# Homepage redesign — architecture

The current homepage is one 260-line `page.tsx` with sections written inline.
Structurally it is right (Origin → Cloth → Making → Pieces → Promise → Close)
and the brief says so. Visually every section is the same recipe: a centred
column, an eyebrow, a two-line composition, a standfirst, a CTA pair. Five
sections built from one template is why it reads as a template.

The redesign keeps the spine and replaces the sections with named components
that each own a distinct composition. Nothing below changes brand voice,
product data, routes, or the core copy lines — with one exception the owner
asked for explicitly: **chikankari is removed everywhere.**

---

## 1 · What "everywhere" means

Chikankari is both a product (`chikankari-blush-suit-set`) and a craft
(`lucknowi-chikankari`) and a place (Lucknow). Removing the product but keeping
a `/craft/lucknowi-chikankari` page for a technique the shop does not sell
makes no sense, so all three go. The site becomes **four pieces, four
techniques, three regions.**

| Where | What changes |
|---|---|
| `lib/catalog.ts` | product, craft, and the `suit-set` category (it was the only one) |
| `lib/places.ts` | Lucknow node, chikankari material story, chikankari process |
| `lib/site.ts` | care section, about copy, NAV "Suit sets" entry |
| `lib/search.ts` | synonyms (`salwar`, `kurta`, `chikan`…), category words |
| `lib/shots.ts` | fallback comment only — it had no photography |
| `dom/scrub-track.tsx` | beat 04 removed; kairi beat re-timed |
| `public/sequence/{hi,lo}` | **frames f087–f115 cut** — the pink chikankari clip was baked into the Veo film; 144 → 115 frames, renumbered, `FRAME_COUNT` updated |
| `public/products/` | the one jpeg deleted |
| `app/layout.tsx`, `/about`, `/care`, `/collection`, `/craft` metadata | descriptions rewritten |
| `page.tsx` hero standfirst | "stitched in Lucknow" goes |
| `SiteFooter`, `SearchOverlay` placeholder | copy |
| `ProductGallery` | replaced entirely (see §3) |
| tests | `navigation` (salwar/kurta), `place` (Lucknow projection), `routes` (suit-set filter), `shop` ("all five"), `narrative`/`typography` (rail count) |

The `Category` type collapses to `"shawl"` only. The collection filter nav
loses "Suit sets". The mega-menu's Browse column loses it too.

---

## 2 · Section architecture

`src/app/page.tsx` becomes a ~60-line composition of these, in
`src/components/home/`:

```
page.tsx
├── <HeroScene />           01  cinematic hero — NEW
├── <ScrubTrack />          02  the film — kept, re-timed to 4 beats
├── <PortalTransition />        dark → light handoff — kept, untouched
├── <CraftChapters />       03  four distinct compositions — NEW
│     ├── <ChapterMithila />
│     ├── <ChapterKashmir />
│     ├── <ChapterJamawar />      ← the dark chapter
│     └── <ChapterKairi />
├── <GalleryWall />         04  editorial collection — REPLACES ProductGallery
├── <ExhibitionWall />      05  craft story on a full-bleed macro — REPLACES the "Making" section
├── <PromiseChapter />      06  pull quote + the four promises — kept, restaged
└── <FinalScene />          07  "Nothing here was made twice" — NEW closing
```

### Kept as-is
- `ScrubTrack` (film), `PortalTransition`, `ChapterNav`, `SiteFooter`,
  `PromiseList`, `PullQuote`, `HeroDepth` (the parallax motes), the WebGL
  canvas and all of its stores.
- The chapter rail gains chapters: Origin · The Cloth · Mithila · Kashmir ·
  Jamawar · Kairi · The Pieces · The Promise.

### Changed
- **`page.tsx`** — from inline sections to a composition of named components.
- **`ProductGallery`** → **`GalleryWall`**. The 12-column bento with
  scrim-over-photo cards is replaced by an editorial wall: photographs at
  three sizes, breaking the container, type set beside or across them, no
  card chrome. `EditorialCard` (already built for `/collection`) is the basis;
  the homepage variant loses the "View piece / Quick view" row and keeps only
  name, craft, price. The `.pk-bento` selector and the WebGL handoff
  ScrollTrigger move with it.
- **The "Making" section** → **`ExhibitionWall`**. Same copy, restaged: a
  full-bleed macro (jamawar 05 or sozni 07) as the wall, the composition
  overlaid, museum-label metadata in the corner.
- **The closing** → **`FinalScene`**. "What you are buying / is someone's
  winter" moves INTO the exhibition wall as its standfirst. The final scene is
  built around "Nothing here was made twice" as the brief asks, at 10–12vw,
  over a full-bleed frame.
- **`HeroReveal`** (the right-hand product column) is removed from the hero.
  The new hero is a single photographic composition, not type-left/cloth-right.
- **`FabricBand`** moves from before the gallery to after the four chapters,
  as the transition into the wall.

### New
- **`HeroScene`** — the Baraat Shawl full frame (madhubani 04) as a
  full-viewport image, slow film zoom (1.0 → 1.08 over the section's scroll),
  parallax against the particle canvas which stays live behind it. Headline at
  `clamp(3rem, 11vw, 13rem)` overlapping the image's edge, not in a text
  block. Metadata (शैली ०१ · Mithila · Bihar) as small uppercase, separated.
- **`CraftChapters`** — four components sharing a `Chapter` shell (id,
  ground, ink, metadata) but each with its own composition:
  - **Mithila** — warm ivory `#F4EDE2` / terracotta `#B5533C` rule. Image
    left at 55vw with the figures macro (madhubani 07); headline breaks across
    the image's right edge; copy right, low.
  - **Kashmir** — cool ivory `#F2F1EE` / stone `#9A968E`. Reversed: macro
    (sozni 07) right and tall, headline top-left at 9vw, copy narrow beneath.
    Most whitespace of the four.
  - **Jamawar** — indigo `#151A33` / charcoal. Full-bleed loom macro (jamawar
    05) as ground, headline in ivory across it, one line of copy. This is the
    dark chapter the brief asks for.
  - **Kairi** — black `#0F0E0C` / muted pink `#C9A59F`. Graphic: the full
    flat (kairi 01) as a hard-edged panel at 40vw, headline stacked vertically
    beside it in pink at 8vw, printed-not-handmade stated in the metadata
    line. The most editorial, the least "cloth".
- **`FinalScene`** — full-bleed kairi macro or jamawar 01 with
  "Nothing here / was made twice" at 12vw, the promise of the shop in one
  line beneath, CTA pair, then the footer.
- **`useChromeTone` extension** — today the header ink flips once, at the
  portal. With Jamawar and Kairi dark and the wall cream, ink must follow the
  section under the header. Sections declare `data-chrome="light|dark"`; a
  position-based observer (not IntersectionObserver — see `useReveal`) sets
  `--chrome-ink` from whichever section owns the top 80px.

---

## 3 · What does NOT change

- The particle morph, the film scrubber, the portal pin, the camera — the
  WebGL stack is untouched. The hero image sits over the canvas, not instead
  of it.
- Every copy line the site currently carries stays, except the two Lucknow
  references. Lines move between sections; none are rewritten.
- Routes, product data (bar the removal), the promise list, the tests'
  claim sweeps.
- The rule from `useReveal`: nothing that starts hidden may depend on an
  IntersectionObserver callback. Every new reveal uses `useReveal` /
  `RevealIn` / `MaskedImage`.
- The rule from the root layout: no wrapper around `{children}` may gain a
  transform, filter or opacity. The hero blend stays `difference`.

---

## 4 · Motion vocabulary

Restrained, and the same six moves throughout — the brief's list, minus
anything springy:

| Move | Where | Implementation |
|---|---|---|
| mask reveal | every chapter image | `MaskedImage` |
| slow scale | hero (1.0→1.08), chapter grounds (1.04→1.0) | `useScroll` + `useTransform`, linear over the section |
| parallax | hero image vs canvas; chapter image vs headline (0.85x / 1x) | `useTransform` on `scrollYProgress` |
| text drift | headlines drift 24px against scroll | `useTransform`, no spring |
| line drawing | `ThreadRule` between chapters | existing |
| crossfade | gallery hover | existing `EditorialCard` |
| magnetic | CTAs | existing `Magnet` |

Springs are used ONLY where they already are (the bag count, the header
compaction). No new `type: "spring"` on the homepage. All new eases are the
house curve `cubic-bezier(0.32, 0.72, 0, 1)`.

---

## 5 · Mobile

Each chapter has a phone composition, not a stack of the desktop one:

- Hero: image full-bleed, headline at 15vw across three lines over the lower
  third, metadata top-left.
- Mithila / Kashmir: image full-width first, headline overlapping its bottom
  edge by one line, copy beneath. The overlap is what keeps it from reading
  as "image, then text".
- Jamawar: unchanged in kind — full-bleed image with type over it works at
  any width.
- Kairi: the vertical headline becomes horizontal at 14vw, image beneath at
  full width, cropped to 4:5.
- Gallery wall: one column, alternating left/right offset (72vw wide, 28vw
  gutter alternating sides), so it still reads as a wall.
- Nothing under 17px body, nothing under 11px metadata.

---

## 6 · Tests that change

- `shop.spec` — `.pk-bento` selectors and "all five images" → `GalleryWall`
  selector, four.
- `narrative.spec`, `typography.spec` — rail count 5 → 8; order array.
- `hero.spec` — `#origin a[href^="/product/"]` (HeroReveal) removed.
- `editorial-overlay.spec` — h1 still `difference`, still Cormorant; kept.
- `luxury-ecommerce.spec`, `sensory.spec`, `shop-visual.spec` — `.pk-bento`
  hover → gallery wall selector.
- `place.spec` — Lucknow projection assertions; threads 3 → 2.
- `navigation.spec` — `salwar`/`kurta` search cases removed.
- `routes.spec` — `?category=suit-set` filter case removed.
- New: `home.spec` — chapters exist in order, each has a distinct ground
  colour (no two chapters share one), headline sizes ≥ 8vw on desktop,
  chrome ink flips over the dark chapters, no chapter image is inside an
  element with `border-radius` or `box-shadow`.

---

## 7 · Blocked

- **Real artisan hands.** The brief asks for them. There are no photographs
  of a maker with their consent, and an AI-generated pair of hands presented
  as the artisan would be fabricating a person. The macros of the *work* are
  real (worked up from the owner's own photographs) and are used instead. The
  moment a real photograph exists it goes into the Kashmir chapter and the
  exhibition wall.
- Phases 12, 13, 17, 20 remain blocked as listed in `TOMORROW.md`.
