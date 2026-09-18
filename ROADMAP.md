# The Pinkestore — 20-Phase Roadmap

Sequenced by **dependency**, not by the order the list was written. Brand tokens
must exist before chrome can use them; routes must exist before navigation can
link to them; photography must exist before a gallery can show it.

**Progress as of 19 September 2026** — phases 1–11 and 14–19 are built, with
450 tests passing. What remains is what only you can supply: photographs of the
chikankari, measurements, prices, a Razorpay account, artisan consent, craft
audio, and somewhere to keep shared state so two people cannot buy the same
one-of-one piece. All of it is in TOMORROW.md.

**Legend**
`◑` partially built already · `⛔` blocked on something only you can supply

**Coverage note.** The first draft of this roadmap assigned only 81 of the 100
items to a phase; 19 were silently dropped. They are folded in now — CTAs into
the hero phase, the product-fact items into Phase 13 where they were always
going to live, the touch and gallery items into the product and mobile phases.
Item 93 (menus as editorial overlays) landed in Phase 5.

---

## FOUNDATION — phases 1–4
Nothing downstream is stable until these land.

### Phase 1 · Brand system
✅ **Done**
**Items 1, 3, 4, 5, 9**
Monogram + favicon (none exists today), the recurring line/thread device, the
custom glyph set (stitch, loom, needle, leaf) replacing generic icons, and the
full colour system formalised: ivory, paper, muted rose, charcoal, indigo, one
metallic. Everything after this consumes these tokens.
*Effort: M*

### Phase 2 · Typographic scale
✅ **Done**
**Items 2 ◑, 25, 37, 38, 88**
Display/UI pairing is done. This adds the oversized compositional headline,
editorial pull-quotes, chapter numerals as a navigation device, and the mobile
type ramp.
*Effort: S*

### Phase 3 · Route skeleton
✅ **Done**
**Prerequisite for 11–15 and 100**
Create `/collection`, `/craft`, `/craft/[technique]`, `/journal`,
`/journal/[slug]`, `/about`, `/contact`, `/shipping`, `/returns`, `/care`,
`/privacy`, `/terms`. Stub content, real IA. **Navigation cannot be built
before the things it points at.**
*Effort: M*

### Phase 4 · Header + footer
✅ **Done**
**Items 11, 12, 16, 17, 18, 19, 20 ◑, 100**
Full nav, sticky scroll-state identity, designed bag icon with an isolated
count animation, utility bar, dedicated mobile header, and the complete footer.
The site currently just stops at the bottom.
*Effort: M*

---

## NARRATIVE — phases 5–9

### Phase 5 · Navigation depth
✅ **Done**
**Items 13, 14, 15**
Collection mega-menu, browse-by-craft, full-screen search overlay.
*Effort: M*

### Phase 6 · Cinematic hero
✅ **Done**
**Items 21, 22, 23, 24, 26, 27, 28, 29, 30**
The Veo footage already extracted (144 frames) becomes the hero film. Adds
foreground/background staging, scroll-progress indicator, the descending
thread, and a hero piece emerging as a physical object.
*Effort: L*

### Phase 7 · Narrative spine
✅ **Done**
**Items 31, 38, 40, 87, 89**
Restructure the homepage as `Origin → Craft → Hands → Object → Collection →
Proof → Purchase`, with chapter numerals and a real closing statement.
*Effort: M*

### Phase 8 · Place & material
✅ **Done**
**Items 34, 35, 36, 39**
Interactive region map (Mithila, Kashmir, Lucknow), region→technique→artisan→
object chain, material stories, and the making timeline.
*Effort: L*

### Phase 9 · Hands & promise
◑ **Partly done**
**Items 32, 33 ⛔, 66 ⛔**
The one-of-one philosophy, sourcing and inspection promise.
**⛔ "Meet the hands" needs artisan photographs and their consent.** This is the
single biggest differentiator available — no competitor names a human maker.
*Effort: M*

---

## COMMERCE — phases 10–13

### Phase 10 · Editorial collection
✅ **Done**
**Items 41 ◑, 42, 43 ⛔, 44 ◑, 45, 46, 47, 48, 49, 50**
Larger imagery, price hierarchy, prominent location, "View piece", quick-view.
**⛔ Item 43 (hover image transition) needs a second image per product.**
*Effort: M*

### Phase 11 · Product page depth
✅ **Done**
**Items 51 ◑, 52, 54, 55, 56, 57, 58, 59, 60, 90, 91, 92**
Vertical immersive gallery, zoom, fullscreen mode, "Enquire privately" (essential
at ₹42k–₹65k), sticky mobile purchase bar.
*Effort: L*

### Phase 12 · Photography ⛔
⛔ **Blocked on you**
**Items 6, 8, 53**
**The hard blocker. You have ONE image per product; item 53 asks for 4–8.**
Needed per piece: full, detail, edge, texture, reverse, scale, styled.
Consistent lighting, crop, background, shadow and colour temperature.
Until this exists, phases 10 and 11 ship at half strength.
*Effort: L — a shoot, not code*

### Phase 13 · Product data ⛔
⛔ **Blocked on you**
**Items 61, 62, 63, 64, 65, 66, 67, 68, 69, 70**
16 `NEEDS_REAL_DATA` fields today. Dimensions, composition, weight, care,
provenance, making time, dispatch, certificates, returns accordion.
Fields render nothing rather than a placeholder, so pages simply omit them.
*Effort: S once supplied*

---

## SENSORY — phases 14–17

### Phase 14 · Texture & material
✅ **Done**
**Items 7, 10**
Subtle paper/cotton/woven grain on selected sections; packaging implied in the
purchase flow. **⛔ Item 10 is stronger with real packaging photography.**
*Effort: S*

### Phase 15 · Page transitions
✅ **Done**
**Items 71, 74, 75, 76 ◑, 94**
Route transitions, animated section numerals, masked image reveals.
*Effort: M*

### Phase 16 · Tactile motion
✅ **Done**
**Items 72 ◑, 73, 77, 78, 79 ◑, 80 ◑**
Fabric-like horizontal movement and the thread-following cursor.
*Effort: M*

### Phase 17 · Sound design ⛔
⛔ **Blocked on you**
**Items 81 ◑, 82 ◑, 83, 84, 85**
Toggle and muted-default exist; the track is a synthesised placeholder.
**⛔ Needs real recordings: loom rhythm, brush on paper, needle through cotton.**
Per-section audio: Mithila→brush, Kashmir→loom, Lucknow→needle.
*Effort: M*

---

## HARDENING — phases 18–20

### Phase 18 · Mobile as its own design
✅ **Done**
**Items 86–95**
Not a squeezed desktop layout. Vertical chapters, swipeable galleries,
full-screen image viewing, editorial menu overlays, persistent add-to-bag.
*Effort: L*

### Phase 19 · Conversion & trust
✅ **Done**
**Items 96 ◑, 97, 98, 99 ⛔**
Checkout reassurance, concierge purchasing.
**⛔ Item 99 needs REAL press, collectors or exhibitions. Fabricated social
proof is the exact failure mode found across the competitor scan — every site
asserts authenticity and none evidences it.**
*Effort: M*

### Phase 20 · Launch readiness
⛔ **Blocked on you**
**Not in the 100, but the site cannot open without it**
- **Razorpay** — Stripe cannot process domestic Indian payments (see PAYMENTS.md)
- **Stock reservation** — two buyers can currently both reach checkout for the
  same one-of-one piece. This is the worst failure this shop can have.
- Admin so you can add pieces yourself
- Real prices (all five are placeholders)
- GST, legal pages, order emails
*Effort: L*

---

## What blocks what

| Blocker | Blocks | Who |
|---|---|---|
| 4–8 photos per piece | Phases 10, 11, 12 | You (shoot) |
| Artisan names + photos | Phase 9 | You |
| Product measurements & times | Phase 13 | You |
| Real prices | Phase 20 | You |
| Press / collectors | Phase 19 | You |
| Craft audio recordings | Phase 17 | You |
| Razorpay account | Phase 20 | You |

Everything else is code and can proceed in order.
