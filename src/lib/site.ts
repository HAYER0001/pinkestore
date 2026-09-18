import { BRAND, CRAFTS, type Craft } from "./catalog";

/**
 * THE INFORMATION ARCHITECTURE.
 *
 * Phase 3 exists so that Phase 4 has somewhere to point. Navigation cannot be
 * designed against routes that do not exist, and a nav built first always ends
 * up describing pages nobody ever wrote.
 *
 * THE RULE THIS FILE ENFORCES — and it is the same rule as catalog.ts:
 *
 *   A section with no `body` is OMITTED from the page and the page is marked
 *   noindex. It is never rendered as "Coming soon", "Lorem ipsum", "[TBD]", or
 *   a plausible-sounding paragraph written by me.
 *
 * That matters more here than anywhere else on the site. A returns window, a
 * shipping rate and a data-retention period are not copy — they are promises
 * made in the shop owner's name, and a court reads them that way. Inventing a
 * 14-day return policy because 14 is a normal number would be manufacturing a
 * contractual term on behalf of someone who never agreed to it.
 *
 * So: everything below is either TRUE and verified, or absent.
 */

/**
 * Small numbers spelled out. "5 pieces. 4 of them made by hand" reads like a
 * dashboard; "Five pieces. Four of them made by hand" reads like a shop. Above
 * twelve, digits are correct again — and prices always stay digits.
 */
const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];
export const spell = (n: number, caps = false) => {
  const w = n >= 0 && n < WORDS.length ? WORDS[n] : String(n);
  return caps && w[0] >= "a" && w[0] <= "z" ? w[0].toUpperCase() + w.slice(1) : w;
};

export type NavGroup = {
  label: string;
  items: { label: string; href: string; note?: string }[];
};

/** The complete IA. Phase 4's header and footer both read from this. */
export const NAV: NavGroup[] = [
  {
    label: "Shop",
    items: [
      { label: "The Collection", href: "/collection" },
      { label: "Shawls", href: "/collection?category=shawl" },
      { label: "Suit sets", href: "/collection?category=suit-set" },
    ],
  },
  {
    label: "The Craft",
    items: [
      { label: "All techniques", href: "/craft" },
      ...Object.entries(CRAFTS).map(([slug, c]) => ({
        label: c.label,
        href: `/craft/${slug}`,
        note: c.region,
      })),
    ],
  },
  {
    label: "The House",
    items: [
      { label: "About", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Service",
    items: [
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Care", href: "/care" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

/**
 * THE PROMISE (item 32).
 *
 * Every line here is a claim the SITE ITSELF can be checked against, and the
 * test suite checks them. That is the point: the competitive scan found GI
 * badges with no certificate number, "handcrafted" on printed goods, and
 * restock buttons on pieces sold as unique. Those are all promises too — they
 * are just not kept.
 *
 * So nothing goes in this list unless a test can fail when it stops being
 * true. A promise that cannot be falsified is marketing.
 */
export type Promise_ = {
  title: string;
  body: string;
  /** how the claim is verified — shown to nobody, but it keeps this honest */
  verifiedBy: string;
};

export const PROMISES: Promise_[] = [
  {
    title: "Stock is literal",
    body: "Where a piece says one, there is one. Not one 'in this colourway', not one until the next batch — one. When it sells it comes down, because the next one would be a different object.",
    verifiedBy: "Catalogue stock counts; the shop cannot render a quantity it does not hold.",
  },
  {
    title: "The printed one says printed",
    body: "Four of our five pieces are made entirely by hand. The fifth is printed, and it is labelled printed in the index, in the menu, and on its own page — in the same type as everything else, not buried in a description.",
    verifiedBy: "Tests assert the word appears on the craft index, the mega-menu and the technique page.",
  },
  {
    title: "We do not invent provenance",
    body: "Where we do not know something — a measurement, a fibre, how long a piece took — the page simply does not show that line. It never shows a plausible guess. An invented number is the most confident-looking thing on any product page and the one a buyer repeats to someone else.",
    verifiedBy: "Unknown fields render nothing; no page may contain placeholder copy.",
  },
  {
    title: "No badge without a number",
    body: "If we ever print a GI certification mark it will carry its certificate number. Until then there is no mark, because a seal with nothing behind it is the standard of this trade and not one worth meeting.",
    verifiedBy: "The footer and product pages carry no trust badges at all.",
  },
];

export type Section = {
  heading: string;
  /** Verified prose. Omit the field entirely when the answer is not yet known. */
  body?: string[];
  /** What the owner has to supply before this section can be written. */
  needs?: string;
  /**
   * A section the page is publishable without.
   *
   * The distinction is legal exposure, not tidiness. A returns policy missing
   * its window is a contract with a hole in it and must stay out of the index.
   * A care page missing piece-specific notes is a complete, useful page with
   * one more thing coming — noindexing that is a real loss for no gain.
   * Default is REQUIRED, so forgetting this flag fails safe.
   */
  optional?: boolean;
};

export type PolicyDoc = {
  title: string;
  /** Two or three lines for the composed display heading. */
  display: string[];
  standfirst?: string;
  sections: Section[];
};

/* ------------------------------------------------------------------ */

const CARE_BY_CRAFT: Record<Craft, string[]> = {
  "madhubani-hand-painted": [
    "The pigment sits ON the cloth, not in it. Never soak, never wring, and never let a spot sit under running water — the line will bleed before the stain lifts.",
    "Dry clean only, and tell the cleaner it is hand-painted before they take it. Solvent is fine; agitation and heat are not.",
    "Store flat or rolled, never creased along a painted line. A fold held for a year will eventually crack the paint along its spine.",
  ],
  "sozni-hand-embroidered": [
    "Dry clean only, with a cleaner who has handled pashmina before. Domestic washing felts the fibre and there is no way back from that.",
    "Never hang on a narrow hanger. The weight of the shawl pulls through the embroidery and distorts the ground around every stitch.",
    "Fold with acid-free tissue along the folds and rest it in a breathable cotton bag. Plastic traps moisture against the fibre.",
  ],
  "jamawar-kani": [
    "Dry clean only. Kani is woven, not printed — the colour is structural, but the hand-spun weft will not survive a domestic machine.",
    "Rotate the folds every few months. A kani shawl carries its weight in the palla, and a single fold held indefinitely wears a line into it.",
    "Keep it dark. Sustained direct sunlight will shift the madder and indigo long before it touches the undyed ground.",
  ],
  "kairi-print": [
    "Gentle hand wash in cold water with a mild detergent, or dry clean. Wash separately the first two or three times — printed grounds release colour early.",
    "Dry flat in shade. Direct sun on a black ground is the fastest way to a grey one.",
    "Press on the reverse, with a cloth between the iron and the print.",
  ],
  "lucknowi-chikankari": [
    "Hand wash cold and alone, or dry clean. Chikankari on fine cotton is strong in the ground and delicate at the stitch.",
    "Never wring. Press the water out between two towels and dry flat in shade.",
    "Starch lightly if at all. Heavy starch stiffens the shadow-work and flattens the relief that makes the technique worth having.",
    "Mukaish and pearl accents should be kept away from the iron entirely — press around them.",
  ],
};

export const POLICIES: Record<string, PolicyDoc> = {
  /* ---------------- care: genuinely writable ---------------- */
  care: {
    title: "Care",
    display: ["How to keep", "what you bought"],
    standfirst:
      "Care differs by technique, not by piece. Find the craft your piece is made in — it is named on its product page — and follow that.",
    sections: [
      ...Object.entries(CRAFTS).map(([slug, c]) => ({
        heading: c.label,
        body: CARE_BY_CRAFT[slug as Craft],
      })),
      {
        heading: "Piece-specific care",
        /* Deliberately unwritten. Fibre content decides whether a piece can
           take water at all, and we do not have it measured yet. The five
           technique sections above already answer the question a buyer
           actually asks, so the page stands without this one. */
        optional: true,
        needs: "Confirmed fibre composition per piece (the `fabric` field in the catalogue).",
      },
    ],
  },

  /* ---------------- privacy: verified against the code ---------------- */
  privacy: {
    title: "Privacy",
    display: ["What we", "do not collect"],
    standfirst:
      "Almost nothing, and that is a design decision rather than an oversight. This page describes what the site actually does, checked against its own source.",
    sections: [
      {
        heading: "No analytics, no tracking",
        body: [
          "This site loads no analytics, no advertising pixels, no session recorders and no third-party scripts of any kind. There is nothing here counting you.",
          "It sets no cookies. Not essential ones, not preference ones, not any — which is why you will never see a consent banner.",
        ],
      },
      {
        heading: "What is stored in your browser",
        body: [
          "One thing. Your bag is kept in your browser's local storage under the key `pk-cart`, holding only which pieces you added and how many.",
          "It never leaves your device. Prices, availability and descriptions are re-read from our catalogue each time the page loads, so a stale bag cannot carry an old price.",
          "Clearing your browser's site data empties it. Nothing else of yours is kept.",
        ],
      },
      {
        heading: "Fonts and images",
        body: [
          "Typefaces are downloaded once when the site is built and served from our own domain. Your browser never contacts Google to render this page.",
          "Photographs are served from the same origin. No image CDN sees your address.",
        ],
      },
      {
        heading: "When you place an order",
        needs:
          "The payment processor (Razorpay is the likely choice for domestic India), what order data is retained, for how long, and who to contact about it. Worth a lawyer's eye — India's DPDP Act has specific requirements, including a named grievance contact, that I should not paraphrase for you.",
      },
    ],
  },

  /* ---------------- the ones that are genuinely the owner's call ------- */
  shipping: {
    title: "Shipping",
    display: ["Getting it", "to you"],
    sections: [
      {
        heading: "Where we ship",
        needs: "India only, or international too? International changes customs, duties and insurance wording.",
      },
      { heading: "Cost", needs: "Flat rate, free over a threshold, or calculated by weight and destination." },
      { heading: "Dispatch time", needs: "How long between an order and the courier collecting it." },
      { heading: "Courier and tracking", needs: "Which courier, and whether a tracking number is sent automatically." },
      {
        heading: "Insurance",
        needs:
          "At these values this is not optional to decide. A ₹65,000 shawl lost in transit with no cover is a loss you absorb personally.",
      },
    ],
  },

  returns: {
    title: "Returns",
    display: ["If it is not", "what you hoped"],
    sections: [
      { heading: "Window", needs: "How many days from delivery. This is a contractual term — it has to be your number, not a typical one." },
      { heading: "Condition", needs: "Unworn with tags attached? Original packaging required?" },
      { heading: "Who pays return shipping", needs: "You, the buyer, or split." },
      { heading: "Refund or exchange", needs: "Whether a refund is offered at all, and how long it takes to reach them." },
      {
        heading: "One-of-one pieces",
        needs:
          "Every piece here is a single item. Decide explicitly whether a returned piece goes back on sale, and say so — buyers of one-of-one work ask.",
      },
    ],
  },

  terms: {
    title: "Terms",
    display: ["The terms", "of sale"],
    sections: [
      { heading: "Who you are buying from", needs: "Registered business name, GSTIN, and registered address." },
      { heading: "Pricing and tax", needs: "Whether listed prices include GST, and at what rate for textiles." },
      { heading: "Availability", needs: "What happens when two people order the same one-of-one piece — see the note below." },
      { heading: "Governing law", needs: "Jurisdiction. Chandigarh is the obvious answer but it has to be stated." },
      { heading: "Contact for disputes", needs: "A named person and a working address." },
    ],
  },

  about: {
    title: "About",
    display: ["A small shop", "in Chandigarh"],
    standfirst: `${BRAND.name} sells handmade textiles from ${BRAND.city}, ${BRAND.state}. The work is not from here — it is from Mithila, from Kashmir, from Lucknow — and each piece is bought as a single object rather than ordered by the dozen.`,
    sections: [
      {
        heading: "What we sell",
        body: [
          "Shawls and suit sets in five techniques: hand-painted Madhubani from Mithila in Bihar, sozni embroidery and jamawar kani from Kashmir, chikankari from Lucknow, and printed kairi.",
          "Four of those five are made entirely by hand. The fifth is printed, and it says so on its own page — a printed piece sold as handwork is the oldest trick in this trade and we are not going to run it.",
          "Stock is literal. Where a piece says one, there is one.",
        ],
      },
      {
        heading: "Why Chandigarh",
        needs:
          "Your own story — how the shop started, why these crafts, how you find the pieces. This is the paragraph people actually read, and it is the one thing on this site I genuinely cannot write for you.",
      },
      { heading: "The makers", needs: "Artisan names, and their permission to publish them. No competitor names a single human maker; doing it would be the strongest thing on this site." },
    ],
  },

  contact: {
    title: "Contact",
    display: ["Talk to", "a person"],
    standfirst:
      "These are pieces people ask questions about before buying. That is expected, and there is no form standing between you and an answer.",
    sections: [
      {
        heading: "Instagram",
        body: [`The shop is on Instagram at @the_pinkestore, and messages there are read.`],
      },
      { heading: "Email", needs: "A working address you will actually check." },
      { heading: "Phone or WhatsApp", needs: "At ₹18,000–₹65,000, buyers want a voice. A WhatsApp number is the single highest-conversion thing you can add." },
      { heading: "Where to find us", needs: "Shop address and opening hours, if there is a physical shop to visit." },
    ],
  },
};

/** Publishable once every REQUIRED section is written. Optional gaps do not block. */
export const isComplete = (doc: PolicyDoc) =>
  doc.sections.every((s) => s.optional || s.body?.length);

/** What is still missing, for the dev-only build note. */
export const missingFrom = (doc: PolicyDoc) =>
  doc.sections.filter((s) => !s.body?.length).map((s) => ({ heading: s.heading, needs: s.needs }));
