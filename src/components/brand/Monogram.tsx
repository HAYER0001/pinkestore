/**
 * THE MONOGRAM.
 *
 * A "P" whose bowl is a kairi — the paisley contour that appears on three of
 * the five pieces and in both the Kashmiri and Mithila vocabularies. The stem
 * is a single unbroken thread that overshoots the baseline and curls, so the
 * mark reads as one continuous line laid down rather than a letter drawn.
 *
 * One path, stroked. No fill, no counter-shape to lose at 16px — which is the
 * usual reason a monogram dies in a browser tab.
 */

export const MONOGRAM_PATH =
  "M 11 27.5 L 11 5.5 C 19.5 5.5 24 8.5 24 12.5 C 24 16.4 20 18.6 15.4 18.6 L 11 18.6";
export const MONOGRAM_TAIL =
  "M 11 27.5 C 11 30.6 14.2 31.6 16.2 29.8 C 17.6 28.5 17.2 26.6 15.6 26.4";

export function Monogram({
  size = 28,
  stroke = "currentColor",
  weight = 2,
  className,
  title,
}: {
  size?: number;
  stroke?: string;
  weight?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 34 34"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
    >
      <path
        d={MONOGRAM_PATH}
        stroke={stroke}
        strokeWidth={weight}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={MONOGRAM_TAIL}
        stroke={stroke}
        strokeWidth={weight * 0.78}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Wordmark lockup: monogram + name, optionally with the city line. */
export function Wordmark({
  showCity = true,
  tone = "currentColor",
  className,
}: {
  showCity?: boolean;
  tone?: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-3.5 ${className ?? ""}`}>
      <Monogram size={26} stroke={tone} weight={1.9} />
      <span className="flex flex-col">
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            letterSpacing: "var(--tracking-luxe-widest)",
            textTransform: "uppercase",
            color: tone,
            lineHeight: 1.2,
          }}
        >
          The Pinkestore
        </span>
        {showCity && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.625rem",
              letterSpacing: "var(--tracking-luxe)",
              textTransform: "uppercase",
              color: tone,
              opacity: 0.55,
              lineHeight: 1.2,
              marginTop: "0.28rem",
            }}
          >
            Chandigarh
          </span>
        )}
      </span>
    </span>
  );
}
