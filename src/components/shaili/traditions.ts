/**
 * THE SHAILIS — six real Indian painting traditions, each with its own true
 * palette and drawing grammar. Nothing here is invented decoration: these are
 * the actual conventions of each school.
 *
 * shaili (शैली) = style / school.
 */

export interface Shaili {
  id: string;
  n: string;
  name: string;
  nameLocal: string;
  lang: "hi" | "pa" | "or";
  region: string;
  /** The one-line formal rule that defines the school. */
  rule: string;
  ground: string;
  ink: string;
  accent: string;
  second: string;
  /** Solid plate the text sits on. Text is NEVER set on the patterned ground. */
  plate: string;
  plateInk: string;
  accentOnPlate: string;
}

export const SHAILIS: Shaili[] = [
  {
    id: "madhubani",
    n: "01",
    name: "Madhubani",
    nameLocal: "मधुबनी",
    lang: "hi",
    region: "Mithila, Bihar",
    rule: "Doubled outline. Flat colour. No empty space left anywhere.",
    ground: "#EDE4D3",
    ink: "#1E1712",
    accent: "#8A2F3B",
    second: "#0C7482",
      plate: "#FBF7EF",
    plateInk: "#1E1712",
    accentOnPlate: "#8A2F3B",
  },
  {
    id: "warli",
    n: "02",
    name: "Warli",
    nameLocal: "वारली",
    lang: "hi",
    region: "Maharashtra",
    rule: "Circle, triangle, square. White rice paste on mud. Nothing else.",
    ground: "#8C4A2F",
    ink: "#F4EFE6",
    accent: "#F4EFE6",
    second: "#C97B4A",
      plate: "#F4EFE6",
    plateInk: "#4A2214",
    accentOnPlate: "#8C4A2F",
  },
  {
    id: "gond",
    n: "03",
    name: "Gond",
    nameLocal: "गोंड",
    lang: "hi",
    region: "Madhya Pradesh",
    rule: "Every surface built from repeated dash and dot. Colour arrives loud.",
    ground: "#12100E",
    ink: "#F2E9D8",
    accent: "#E4572E",
    second: "#37A46A",
      plate: "#F2E9D8",
    plateInk: "#12100E",
    accentOnPlate: "#B33A16",
  },
  {
    id: "pattachitra",
    n: "04",
    name: "Pattachitra",
    nameLocal: "ପଟ୍ଟଚିତ୍ର",
    lang: "or",
    region: "Odisha",
    rule: "The border is not a frame. It is half the painting.",
    ground: "#7A1E14",
    ink: "#F6E7C8",
    accent: "#E2A93B",
    second: "#1E1712",
      plate: "#F6E7C8",
    plateInk: "#4A1009",
    accentOnPlate: "#7A1E14",
  },
  {
    id: "phulkari",
    n: "05",
    name: "Phulkari",
    nameLocal: "ਫੁਲਕਾਰੀ",
    lang: "pa",
    region: "Punjab",
    rule: "Darn stitch, counted on the reverse, worked until no cloth shows.",
    ground: "#C2185B",
    ink: "#FFF3D6",
    accent: "#F5B301",
    second: "#E4572E",
      plate: "#FFF3D6",
    plateInk: "#5C0A2B",
    accentOnPlate: "#A3123F",
  },
  {
    id: "kalamkari",
    n: "06",
    name: "Kalamkari",
    nameLocal: "कलमकारी",
    lang: "hi",
    region: "Andhra Pradesh",
    rule: "Drawn with a bamboo pen. Only what the earth can dye.",
    ground: "#1C3B4A",
    ink: "#EFE0C4",
    accent: "#B5482E",
    second: "#C9A227",
      plate: "#EFE0C4",
    plateInk: "#122730",
    accentOnPlate: "#8A3520",
  },
];
