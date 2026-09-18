import type { ReactNode } from "react";

/**
 * An ornate frame. Every card gets one, because both traditions this shop
 * draws on are border-driven — a piece without a border is unfinished.
 *
 * Four kona corners are placed explicitly: SVG patterns do not miter, so a
 * frame built from bands alone breaks visibly at every join.
 */
export function OrnateFrame({
  children,
  className,
  edge = 18,
  gold = false,
}: {
  children: ReactNode;
  className?: string;
  edge?: number;
  gold?: boolean;
}) {
  const tone = gold ? "ink-gold" : "";
  return (
    <div className={`relative ${className ?? ""}`}>
      <div aria-hidden className={`pointer-events-none absolute inset-0 z-10 ${tone}`}>
        <svg className="absolute inset-x-0 top-0 w-full" height={edge}>
          <rect width="100%" height={edge} fill="url(#pk-band-kairi)" />
        </svg>
        <svg className="absolute inset-x-0 bottom-0 w-full" height={edge}>
          <g transform={`rotate(180 800 ${edge / 2})`}>
            <rect x="0" width="3200" height={edge} fill="url(#pk-band-kairi)" />
          </g>
        </svg>
        <svg className="absolute inset-y-0 left-0" width={edge}>
          <rect width={edge} height="100%" fill="url(#pk-band-kairi-v)" />
        </svg>
        <svg className="absolute inset-y-0 right-0" width={edge}>
          <rect width={edge} height="100%" fill="url(#pk-band-kairi-v)" />
        </svg>
        {[
          { top: 0, left: 0, r: 0 },
          { top: 0, right: 0, r: 90 },
          { bottom: 0, right: 0, r: 180 },
          { bottom: 0, left: 0, r: 270 },
        ].map((pos, i) => (
          <svg
            key={i}
            className="absolute"
            width={edge * 1.9}
            height={edge * 1.9}
            viewBox="0 0 48 48"
            style={{ ...pos, transform: `rotate(${pos.r}deg)` }}
          >
            <use href="#pk-kona" width="48" height="48" />
          </svg>
        ))}
      </div>
      <div style={{ padding: edge }}>{children}</div>
    </div>
  );
}
