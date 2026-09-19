/**
 * THE PINKESTORE — canonical product truth.
 *
 * RULE: Mithila/Madhubani is the SITE's visual identity. It is NOT the product
 * line. Exactly one piece in this catalogue is Madhubani. (Four pieces since
 * the chikankari suit set was withdrawn at the owner's request.) Never describe any
 * other piece as Madhubani, Mithila, or "folk-painted" — each craft is named
 * accurately below. The house ornament must never be placed so that it reads
 * as part of a product's own decoration.
 *
 * Punjab is where the SHOP is, not where these crafts come from.
 */

/** Single source of truth for brand facts. Never restate these inline. */
export const BRAND = {
  name: "The Pinkestore",
  city: "Chandigarh",
  state: "Punjab",
  country: "India",
  instagram: "https://www.instagram.com/the_pinkestore/",
} as const;

export type Craft =
  | "madhubani-hand-painted"
  | "sozni-hand-embroidered"
  | "jamawar-kani"
  | "kairi-print";

/* Shawls only since the chikankari suit set was withdrawn. Kept as a union so
   a second category can return without touching every call site. */
export type Category = "shawl";

export interface CraftMeta {
  label: string;
  region: string;
  technique: string;
  handmade: boolean;
}

export const CRAFTS: Record<Craft, CraftMeta> = {
  "madhubani-hand-painted": {
    label: "Hand-painted Madhubani",
    region: "Mithila, Bihar",
    technique:
      "Painted freehand in the kachni line mode — doubled contours, flat unmodulated colour, and narrative registers read left to right.",
    handmade: true,
  },
  "sozni-hand-embroidered": {
    label: "Sozni hand embroidery",
    region: "Kashmir",
    technique:
      "Needle-worked one stitch at a time in fine floss. A single shawl can occupy an artisan for months.",
    handmade: true,
  },
  "jamawar-kani": {
    label: "Jamawar kani",
    region: "Kashmir",
    technique:
      "Woven on a handloom with small wooden kani spools, one weft pass at a time, following a coded talim pattern.",
    handmade: true,
  },
  "kairi-print": {
    label: "Printed kairi",
    region: "India",
    technique:
      "A dense all-over kairi (paisley) print on a black ground, finished with a multi-stripe border.",
    handmade: false,
  },
};

/**
 * Provenance. The competitive scan found that NO Indian textile site names a
 * human artisan, and that "GI Certified" badges are printed with no
 * certificate number. We build the slots — but we do not invent the values.
 * Anything marked NEEDS_REAL_DATA must come from the owner before launch.
 * Fabricated provenance is worse than none.
 */
export interface Provenance {
  /** NEEDS_REAL_DATA — the maker's actual name, with their permission. */
  artisan?: string;
  /** Where it was made. */
  madeIn: string;
  /** Hours or days of actual handwork. This is the product, not a delay. */
  makingTime?: string;
  /** Measured, not estimated. */
  dimensions?: string;
  fabric?: string;
  /** A certificate NUMBER, or nothing at all. Never an unbacked badge. */
  giCertificate?: string;
}

export interface Product {
  slug: string;
  name: string;
  /** Native-script name. Rendered with lang= so the right face is selected. */
  nameLocal?: { text: string; lang: "hi" | "pa" | "ur" };
  craft: Craft;
  category: Category;
  image: string;
  /** Pixel dimensions of the source photograph. */
  width: number;
  height: number;
  blurb: string;
  /** PLACEHOLDER — the owner must set real prices before launch. Paise (INR). */
  pricePaise: number;
  /** These pieces are genuinely one-of-one unless stated otherwise. */
  stock: number;
  provenance: Provenance;
}

export const PRODUCTS: Product[] = [
  {
    slug: "madhubani-baraat-shawl",
    name: "Baraat Shawl",
    nameLocal: { text: "बारात", lang: "hi" },
    craft: "madhubani-hand-painted",
    category: "shawl",
    image: "/products/madhubani-baraat-shawl.jpeg",
    width: 720,
    height: 1280,
    blurb:
      "A wedding procession walks the lower border. Above it, arched panels hold seated figures, and a tree of life fills the field — every empty space closed with hatch and dot.",
    pricePaise: 1_850_000,
    stock: 1,
    provenance: {
      madeIn: "Mithila, Bihar",
      makingTime: "NEEDS_REAL_DATA — painting time in days",
      dimensions: "NEEDS_REAL_DATA — measure in cm",
      fabric: "NEEDS_REAL_DATA",
    },
  },
  {
    slug: "sozni-ivory-pashmina",
    name: "Sozni Ivory",
    craft: "sozni-hand-embroidered",
    category: "shawl",
    image: "/products/sozni-ivory-pashmina.jpeg",
    width: 720,
    height: 1280,
    blurb:
      "Madder, teal and gold kairi worked into the corners and border, with fine buti scattered across an undyed ivory field.",
    pricePaise: 4_200_000,
    stock: 1,
    provenance: {
      madeIn: "Kashmir",
      makingTime: "NEEDS_REAL_DATA — sozni hours",
      dimensions: "NEEDS_REAL_DATA — measure in cm",
      fabric: "NEEDS_REAL_DATA",
    },
  },
  {
    slug: "jamawar-indigo-kani-shawl",
    name: "Jamawar Indigo",
    craft: "jamawar-kani",
    category: "shawl",
    image: "/products/jamawar-indigo-kani-shawl.jpeg",
    width: 720,
    height: 1280,
    blurb:
      "Chinar leaf and flowering vine packed edge to edge on deep indigo, closed by a palla of vertical colour bands.",
    pricePaise: 6_500_000,
    stock: 1,
    provenance: {
      madeIn: "Kashmir",
      makingTime: "NEEDS_REAL_DATA — loom time",
      dimensions: "NEEDS_REAL_DATA — measure in cm",
      fabric: "NEEDS_REAL_DATA",
    },
  },
  {
    slug: "kairi-noir-paisley-shawl",
    name: "Kairi Noir",
    craft: "kairi-print",
    category: "shawl",
    image: "/products/kairi-noir-paisley-shawl.jpeg",
    width: 720,
    height: 1280,
    blurb:
      "A dense paisley field on black, bordered in stacked stripe. The loudest thing in the room, worn quietly.",
    pricePaise: 320_000,
    stock: 3,
    provenance: {
      madeIn: "India",
      dimensions: "NEEDS_REAL_DATA — measure in cm",
      fabric: "NEEDS_REAL_DATA",
    },
  },
];

export const formatINR = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);

export const getProduct = (slug: string) =>
  PRODUCTS.find((p) => p.slug === slug);
