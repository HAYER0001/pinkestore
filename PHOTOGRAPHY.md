# Photography — generation prompts

Every product needs 4–8 images. You have one each. These prompts generate the
rest **image-to-image**, seeded with your real photograph.

---

## THE RULE THAT MATTERS MOST

**Denoising strength: 0.25 – 0.45.** Higher and the model invents a different
shawl — different motifs, different border, different colours. You would then
be selling a photograph of something you do not own.

**Check every output against the original before using it.** If a motif,
border or colour appears that is not on your actual piece, discard it. Re-roll
at lower strength. This is not fussiness: the competitive scan found the entire
category asserting authenticity and never evidencing it, and our whole position
is that we do not do that.

Safe shots (low risk of invention): TEXTURE, EDGE, SCALE, FOLD.
Risky shots (high risk): STYLED / ON-BODY — the model will re-draw the cloth.
Generate those last and inspect hardest.

---

## THE ART DIRECTION BLOCK

Paste this into **every** prompt, unchanged. Consistency across the set is what
makes a catalogue look art-directed rather than assembled.

> Editorial product photography on a seamless warm ivory paper background
> (#FAF8F5), no props, no mannequin, no furniture, no vase, no patterned carpet,
> nothing else in frame. Single soft key light from upper left at roughly 35
> degrees, raking across the surface so the weave and stitch cast their own
> micro-shadows. Soft short contact shadow grounding the cloth. Neutral-warm
> colour temperature around 5200K. Natural fibre colour, no colour grading, no
> filter, no vignette, no bloom. Sharp focus on the textile. Shot on a 100mm
> macro, f/8. No text, no watermark, no logo, no hands, no face.

---

## THE SEVEN SHOTS

Replace `[PIECE]` with the description under each product below.

**1 · FULL** — the whole cloth, flat
> [ART DIRECTION] The complete [PIECE] laid flat and square to camera, filling
> the frame edge to edge, slight natural relaxation in the cloth. Whole piece
> visible including all four borders.

**2 · DETAIL** — macro into the work
> [ART DIRECTION] Extreme macro of [PIECE], filling the frame with a single
> motif so individual threads and brush strokes are legible. Shallow depth,
> focus on the raised work.

**3 · EDGE** — the border and selvedge
> [ART DIRECTION] Close crop on the border and selvedge edge of [PIECE], the
> cloth edge running diagonally through frame, showing the finish and the
> transition from field to border.

**4 · TEXTURE** — raking light, no subject
> [ART DIRECTION] Raking side light almost parallel to the surface of [PIECE],
> so the texture is described entirely by shadow. Abstract, filling the frame,
> no recognisable motif needed.

**5 · REVERSE** — the back
> [ART DIRECTION] The reverse side of [PIECE], showing the underside of the
> work — loose threads, the shadow of the design showing through, the honesty
> of the back of handwork.

**6 · SCALE** — folded, three-dimensional
> [ART DIRECTION] [PIECE] folded into a neat rectangle and stacked, seen at a
> slight three-quarter angle, so the thickness, drape and weight of the cloth
> read. The fold edges are crisp.

**7 · FOLD** — drape and movement
> [ART DIRECTION] [PIECE] draped over a plain ivory form so the cloth falls in
> two or three soft folds, showing how it hangs. Cloth only — no mannequin
> head, no body, no person.

---

## PER-PRODUCT DESCRIPTIONS

Swap these in for `[PIECE]`. Keep them literal — the more precisely the model
is told what is already there, the less it invents.

**Baraat Shawl** — hand-painted Madhubani
> an ivory hand-painted Mithila shawl with a wedding procession in a lower
> border register, arched panels containing seated figures, a tree of life,
> birds and fish, drawn in fine doubled dark outlines and filled with flat
> unmodulated pink, green, ochre and mauve, every empty area closed with
> cross-hatch and dots

**Sozni Ivory** — Kashmiri sozni embroidery
> an undyed ivory wool shawl with fine Kashmiri sozni needlework, paisley
> kairi clusters in madder red, teal, green and gold worked into the corners
> and border, with small scattered buti across the plain field

**Jamawar Indigo** — Kashmiri kani weave
> a deep indigo kani jamawar shawl, the field packed edge to edge with
> multicoloured chinar leaves and flowering vine in blue, rose, green, orange
> and cream, closed by a palla border of vertical multicolour stripes

**Kairi Noir** — printed paisley
> a black-ground shawl with a dense all-over multicoloured kairi paisley
> print, finished with a stacked multi-stripe border

**Chikankari Blush** — Lucknowi chikankari
> a blush pink cotton kurta and dupatta with white Lucknowi chikankari shadow
> work, floral and paisley motifs, accented with small pearl beads and mukaish
> mirror work along the yoke

---

## PRIORITY ORDER

If you generate nothing else, do these first — they unblock the most:

1. **Jamawar Indigo · DETAIL** — it is the bento hero, the largest cell
2. **Baraat Shawl · DETAIL** — the Madhubani piece is the brand's argument
3. A **second image for all five** — any shot. Item 43 (hover image
   transition) needs somewhere to transition *to*, and that is currently the
   single cheapest upgrade to the collection grid.

Then fill out to 4–6 per piece.

---

## FILE NAMING

Drop them in `public/products/` as:

```
madhubani-baraat-shawl-full.jpeg
madhubani-baraat-shawl-detail.jpeg
madhubani-baraat-shawl-edge.jpeg
...
```

The catalogue reads them automatically once the naming matches.
