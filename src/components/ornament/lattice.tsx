/** The woven field. Full strength by default — this is a surface, not a tint. */
export function Lattice({
  variant = "ink",
  className,
}: {
  variant?: "ink" | "gold";
  className?: string;
}) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${className ?? ""}`}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`lat-${variant}`} patternUnits="userSpaceOnUse" width="64" height="64">
            <use href="#pk-g-diamond" className={variant === "gold" ? "lattice-gold" : "lattice-full"} />
            <use href="#pk-g-darn" className={variant === "gold" ? "lattice-gold" : "lattice-full"} />
            {[
              [-32, -32],
              [32, -32],
              [-32, 32],
              [32, 32],
            ].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <use href="#pk-g-diamond" className={variant === "gold" ? "lattice-gold" : "lattice-full"} />
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#lat-${variant})`} />
      </svg>
    </div>
  );
}
