import { cn } from "@/lib/utils";

type BandVariant = "rule" | "kairi" | "wheat-lotus";

/** Band heights sit on the 4px grid, per the border system. */
const HEIGHTS: Record<BandVariant, number> = {
  rule: 8,
  kairi: 28,
  "wheat-lotus": 40,
};

const PATTERN: Record<BandVariant, string> = {
  rule: "pk-band-rule",
  kairi: "pk-band-kairi",
  "wheat-lotus": "pk-band-wheat-lotus",
};

export function Band({
  variant = "rule",
  colorway = "pk-on-ivory",
  className,
}: {
  variant?: BandVariant;
  colorway?: "pk-on-ivory" | "pk-on-indigo" | "pk-on-madder";
  className?: string;
}) {
  const h = HEIGHTS[variant];
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="100%"
      height={h}
      className={cn("block w-full", colorway, className)}
      style={{ height: h }}
    >
      <rect width="100%" height={h} fill={`url(#${PATTERN[variant]})`} />
    </svg>
  );
}
