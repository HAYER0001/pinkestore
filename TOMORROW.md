# What I need from you

Everything below is something I genuinely cannot decide or invent. The site is
built around these gaps rather than papering over them — nothing fabricated,
nothing placeholder-filled. Each item says what it blocks.

Updated as I go. Ordered by how much it blocks.

---

## Where the site got to overnight

Phases 1–11 and 14–19 of the roadmap are built. **472 tests pass, none fail.**

The three that matter most for you:

- **Someone can buy something now.** Checkout is an honest concierge handover —
  they see the piece, get a reference, and message you. It was a dead end.
- **Your photographs are in**, converted from 241 MB of PNGs to 14 MB of WebP,
  with three frames left out (reasons in §3).
- **The whole site is one design now** — one header, one footer, one type
  scale, one bag, across every route including 404 and error pages.

I also found and fixed a class of bug I had introduced myself, four times over:
content that starts hidden and waits for an IntersectionObserver callback that
never arrives. It left headlines blank, masks stuck over photographs, and the
mobile add-to-bag bar hidden from exactly the person it exists for. That
primitive no longer uses IntersectionObserver at all.

---

## 1 · Blocking real money

### Razorpay account
Stripe cannot take domestic Indian payments. Razorpay is the standard.
**I need:** an account, and the key id + secret.

**What I changed tonight.** Checkout used to collect a full name, mobile, email
and postal address, validate them, and then pop a browser alert saying payment
was not connected. It looked like a real checkout right up until that alert, so
a stranger had no way to know their address was going nowhere. It also promised
"we pack by hand and write to you with a tracking number" while `/shipping` says
no courier has been chosen — the site contradicting itself on the one page
where money changes hands.

Checkout is now an honest **concierge handover**: the buyer sees exactly what
they are buying, gets a reference like `PK-LV37JA`, and is handed to you on
Instagram. No personal data is collected, because there is nowhere to put it.

**This means someone can actually buy something tonight** — through you, by
message. That is how a shop selling one-of-one pieces at these prices usually
works anyway. The address form comes back the day Razorpay is behind it.

### Real prices
Every price in the catalogue is a placeholder I made up to have something to
render. `Rs 18,500 / 42,000 / 65,000 / ...` — all invented.
**I need:** the actual price of each of the five pieces.
**Blocks:** launch. Obviously.

### Shipping insurance decision
A Rs 65,000 shawl lost in transit with no cover is a loss you absorb personally.
**I need:** insured courier or not, and who pays.
**Blocks:** `/shipping`, and your downside risk on the first big order.

---

## 2 · Blocking pages that exist but are empty

Run the site and visit these — each one lists exactly what it needs in a pink
box that only appears in development.

| Page | What it needs |
|---|---|
| `/shipping` | Where you ship, cost, dispatch time, courier, insurance |
| `/returns` | Window, condition, who pays return postage, refund or exchange |
| `/terms` | Registered name, GSTIN, whether prices include GST, jurisdiction |
| `/about` | **Your story.** Why Chandigarh, how it started, how you find pieces |
| `/contact` | A working email, and a WhatsApp number |
| `/privacy` | Only one gap: what happens to order data once Razorpay exists |

**The two I would do first:**
- **A WhatsApp number on `/contact`.** At Rs 18,000–65,000 people want a voice
  before they commit. This is the single highest-conversion thing you can add.
- **Your story on `/about`.** It is the one paragraph people actually read and
  the one thing on this site I cannot write for you.

---

## 3 · Photography

Four of five pieces now have frames, and they are wired in. Thank you — they
changed how the whole collection reads.

**What I did with them.** They were 8–10 MB PNGs, 241 MB in total, which is far
too heavy to serve. I converted them to WebP at 1400px wide: 241 MB → 14 MB,
with no visible loss at the sizes they display. I also renamed the folders to
`public/pieces/<slug>/` so the trailing space in `Baraat Shawl ` stopped being
a problem. Nothing to do here.

**Three frames I left out, and why.** I looked at all 28 individually. A
gallery is a claim about what the object looks like, and the generator has no
idea which object it is describing:

- **Baraat Shawl 02** and **Sozni Ivory 02** — near-black macros. Both pieces
  are ivory. A black close-up in the gallery for a cream shawl misleads someone
  deciding at ₹42,000.
- **Kairi Noir 05** — an ivory shawl with fringe. Kairi Noir has a black
  ground. It is a different object.
- **Kairi Noir 06** — a macro of raised metallic **embroidery**. Kairi Noir is
  printed. Our second promise is that the printed one is labelled printed
  everywhere; an embroidery close-up in its gallery contradicts that more
  loudly than any label could correct.

If you disagree with any of those calls, say so and I will put them back.

**Still needed:**
- **Lucknowi Chikankari** — no frames yet. It is the one piece still on a single
  photograph, and it shows next to the other four.
- Useful extras for the four that are done: a **reverse** shot and something
  with **scale** (worn, or beside a known object).

---

## 4 · Product facts

There are 16 `NEEDS_REAL_DATA` fields in the catalogue. Pages omit them rather
than show a placeholder, so nothing is broken — the pages are just thinner than
they should be.

Per piece:
- **Measurements** in cm — measured, not estimated
- **Fibre composition** — decides whether a piece can touch water at all, so it
  also blocks piece-specific care advice
- **Making time** — hours or days of actual handwork. This is the product, not
  a delay, and it is the number that justifies the price
- **Weight**, care specifics, dispatch time
- Any **GI certificate numbers** you actually hold (a number, or nothing — never
  an unbacked badge)

---

## 5 · The biggest differentiator available

**Artisan names, photographs, and their permission to publish them.**

No competitor in this market names a single human maker. Not one. Doing it
would be the strongest thing on this site by a distance, and it is the whole
reason the provenance fields exist.

I will not invent a name. If you can get even one maker's name and consent, it
changes what this shop is.

---

## 6 · Two things I could not build without infrastructure

### Stock reservation
Two people can currently both put the same one-of-one piece in their bag and
both reach checkout. With the concierge handover this is survivable — you see
both messages and can tell one of them — but it is the worst failure this shop
can have once payments are live.

A real fix needs shared server state (Vercel KV, Postgres, Upstash — any of
them). It cannot be done in the browser, because two browsers cannot see each
other. **Whichever you set up, tell me and I will wire it.**

### Order records
Same reason. Right now the reference is computed from the bag contents so both
sides can quote it, but nothing is stored anywhere.

---

## 7 · Smaller, whenever

- **Year the shop started** — for the footer copyright range
- **Newsletter**: do you want one? Resend is already in the stack. About an hour
  once you say yes and there is an API key. I left the field out entirely
  rather than ship a form that posts nowhere
- **Ambient audio**: your track (`pankajsethjmt-indian-beats-3-494269.mp3`, 39s) is now the
  bed — loudness-normalised to a gentle level and faded at the loop seam. The
  filename looks like a stock-library download: keep its licence page somewhere,
  and if it needs attribution tell me and I will add it to `/about`
- **Press or collectors**, if any exist — real ones only
- **Packaging**: what does a piece actually arrive in? Roadmap item 10 wants
  packaging treated as part of the brand, and I will not invent a box
