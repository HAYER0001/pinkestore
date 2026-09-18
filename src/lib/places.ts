import { CRAFTS, BRAND, type Craft } from "./catalog";

/**
 * PLACE, MATERIAL, AND PROCESS.
 *
 * WHY THERE IS NO MAP OF INDIA HERE.
 *
 * Two reasons, and the second is the one that decided it.
 *
 * 1. A hand-drawn national outline at this scale is always slightly wrong, and
 *    slightly wrong reads as careless on a page whose entire argument is care.
 *
 * 2. Depicting India's boundaries is legally constrained in India — maps must
 *    show the full claimed extent of Jammu and Kashmir. An approximate
 *    coastline traced by eye is not a defensible way for an Indian business to
 *    take a position on a border, and this shop has no position to take.
 *
 * So this is explicitly a DIAGRAM, not a map: four places at their true
 * relative latitude and longitude on an empty field, joined by thread. No
 * coastline, no borders, no claims. It also happens to be the more elegant
 * object — a constellation of origins rather than a country with pins in it.
 *
 * MATERIAL IS DESCRIBED AT THE LEVEL OF THE CRAFT, NEVER THE PIECE. What a
 * sozni shawl is traditionally worked on is documented; what OUR sozni shawl
 * is made of is a NEEDS_REAL_DATA field in the catalogue. Those are different
 * claims and the copy keeps them apart.
 *
 * PROCESS, NOT DURATION. How a kani weave advances is documented craft
 * knowledge. How many months THIS one took is not known and is not invented —
 * every step below describes what happens, never how long it takes.
 */

export interface Place {
  id: string;
  label: string;
  /** Real coordinates. The diagram is projected from these, not eyeballed. */
  lat: number;
  lon: number;
  /** Craft techniques that come from here. The shop itself has none. */
  crafts: Craft[];
  /** One line, true. */
  note: string;
  kind: "origin" | "shop";
}

export const PLACES: Place[] = [
  {
    id: "kashmir",
    label: "Kashmir",
    lat: 34.08,
    lon: 74.8,
    crafts: ["sozni-hand-embroidered", "jamawar-kani"],
    note: "Two of the slowest textile techniques in the country come from the same valley.",
    kind: "origin",
  },
  {
    id: "lucknow",
    label: "Lucknow",
    lat: 26.85,
    lon: 80.95,
    crafts: ["lucknowi-chikankari"],
    note: "White-on-white shadow work, worked from the reverse of the cloth.",
    kind: "origin",
  },
  {
    id: "mithila",
    label: "Mithila",
    lat: 26.35,
    lon: 86.07,
    crafts: ["madhubani-hand-painted"],
    note: "A painting tradition from the Bihar plains — and the visual language of this website.",
    kind: "origin",
  },
  {
    id: "chandigarh",
    label: `${BRAND.city}`,
    lat: 30.73,
    lon: 76.78,
    crafts: [],
    note: "Where the shop is. Nothing is made here.",
    kind: "shop",
  },
];

/** Equirectangular, which is honest at this scale and over this small a span. */
export function project(p: Place, w: number, h: number, pad = 56) {
  const LON = [74.0, 87.0];
  const LAT = [25.6, 34.8];
  const x = ((p.lon - LON[0]) / (LON[1] - LON[0])) * (w - pad * 2) + pad;
  const y = ((LAT[1] - p.lat) / (LAT[1] - LAT[0])) * (h - pad * 2) + pad;
  return { x, y };
}

/* ------------------------------------------------------------------ */

export interface MaterialStory {
  /** What the craft is traditionally worked ON. Not what our piece is. */
  ground: string;
  body: string[];
}

export const MATERIALS: Record<Craft, MaterialStory> = {
  "sozni-hand-embroidered": {
    ground: "Pashmina",
    body: [
      "Pashmina is the undercoat of the Changthangi goat, which grows it to survive a Ladakhi winter above 4,000 metres and sheds it in spring. The fibre is finer than a human hair — roughly 12 to 16 microns against 50 to 70 for the hair on your head.",
      "It cannot be machine-spun at that fineness without breaking, which is why the whole chain stays manual and why a shawl is warm without being heavy.",
      "Sozni is worked on top of that with a needle and floss so fine the stitches read as drawing rather than as embroidery.",
    ],
  },
  "jamawar-kani": {
    ground: "Pashmina or fine wool, woven",
    body: [
      "Kani is not embroidered or printed — the pattern IS the weave. Colour is carried by dozens of small wooden bobbins, the kanis, each holding one shade and each passed by hand through a few warp threads at a time.",
      "The weaver does not see a drawing. They read a talim: a coded script that records, line by line, how many threads of which colour come next. One line of talim is one pass of the weft.",
      "Because the colour is structural, a kani shawl has no right or wrong side in the way a printed one does.",
    ],
  },
  "madhubani-hand-painted": {
    ground: "Cotton or silk, painted",
    body: [
      "Mithila painting moved onto cloth and paper from the walls and floors of houses, where it was made for weddings and festivals and then allowed to wash away.",
      "The kachni mode used here is line work: doubled contours filled with hatch and dot rather than flat blocks of colour, and no empty space left anywhere in the field.",
      "There is no pencil underneath. The line is laid down once.",
    ],
  },
  "lucknowi-chikankari": {
    ground: "Fine cotton",
    body: [
      "Chikankari is worked on cloth light enough to see through, because the technique depends on it: much of the stitching is done from the REVERSE, and the pattern reads as a shadow through the ground.",
      "The outline is block-printed on first as a guide, then washed away entirely once the embroidery is finished. A piece that still shows blue printing lines was not finished properly.",
      "Mukaish and pearl are added on the face, which is why those areas must never meet an iron.",
    ],
  },
  "kairi-print": {
    ground: "Printed cloth",
    body: [
      "This is the one printed piece in the collection, and the material story is short because printing is a surface, not a structure.",
      "The kairi — what the rest of the world calls paisley — began as a Persian and Kashmiri motif and was copied onto European looms in the nineteenth century, which is how a Kashmiri mango shape ended up named after a town in Scotland.",
    ],
  },
};

/* ------------------------------------------------------------------ */

export interface Step {
  label: string;
  detail: string;
}

/**
 * The making timeline (item 39). Steps, in order, with NO durations — how long
 * each piece actually took is a NEEDS_REAL_DATA field, and a timeline with
 * invented weeks on it would be the most confident-looking lie on the site.
 */
export const PROCESS: Record<Craft, Step[]> = {
  "sozni-hand-embroidered": [
    { label: "The ground", detail: "Pashmina is spun and woven into a plain shawl before any needle touches it." },
    { label: "The tracing", detail: "The design is transferred to the cloth as a faint guide." },
    { label: "The needle", detail: "Every stitch is placed individually in fine floss. This is the part that takes the months." },
    { label: "The wash", detail: "The finished shawl is washed, which lifts the tracing and settles the stitches into the ground." },
    { label: "Finishing", detail: "Edges are closed by hand and the piece is pressed." },
  ],
  "jamawar-kani": [
    { label: "The talim", detail: "The pattern is written as a coded script — colour and thread count, line by line." },
    { label: "The warp", detail: "The loom is dressed. Once set, the pattern cannot be changed." },
    { label: "The passes", detail: "Dozens of kani bobbins are moved by hand across a few threads at a time, one weft pass per line of talim." },
    { label: "Cutting down", detail: "The shawl is cut from the loom only when the last line of the talim has been woven." },
    { label: "Finishing", detail: "Washing, pressing, and closing the edges." },
  ],
  "madhubani-hand-painted": [
    { label: "The ground", detail: "The cloth is prepared and stretched flat." },
    { label: "The line", detail: "Contours are drawn freehand in the kachni mode. There is no pencil underneath and no second attempt." },
    { label: "The fill", detail: "Hatch and dot close every remaining space in the field." },
    { label: "Fixing", detail: "The pigment is set so it survives handling — though never soaking." },
  ],
  "lucknowi-chikankari": [
    { label: "Block printing", detail: "The pattern is printed onto the cloth in washable blue as a guide." },
    { label: "The embroidery", detail: "Stitches are worked, much of it from the reverse so the motif reads as a shadow." },
    { label: "Mukaish and pearl", detail: "Metal and pearl accents are added on the face, where they are visible." },
    { label: "The wash", detail: "The blue guide is washed out completely. Any left behind means it was rushed." },
    { label: "Finishing", detail: "Cut, stitched into the final garment, and pressed around the accents." },
  ],
  "kairi-print": [
    { label: "Printing", detail: "The kairi field and its border stripes are printed onto the ground cloth." },
    { label: "Fixing", detail: "Colour is set so the black ground holds through early washes." },
    { label: "Finishing", detail: "Edges are finished and the piece is pressed." },
  ],
};

export const placesForCraft = (c: Craft) => PLACES.filter((p) => p.crafts.includes(c));
export const craftLabel = (c: Craft) => CRAFTS[c].label;
