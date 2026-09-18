import Image from "next/image";
import Link from "next/link";
import { CRAFTS, formatINR, type Product } from "@/lib/catalog";

export function ProductCard({
  product: p,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const craft = CRAFTS[p.craft];
  return (
    <Link href={`/product/${p.slug}`} className="group block">
      {/* Cropped into the cloth. The source photos are shot on a mannequin
          against a grey wall with a vase and a patterned carpet in frame — the
          scan found the whole category cannot photograph a shawl. Cropping hard
          into the weave removes the room and shows the thing being sold. */}
      <div className="relative aspect-4/5 overflow-hidden rounded-sm border border-pk-border bg-pk-surface">
        <Image
          src={p.image}
          alt={`${p.name} — ${craft.label}`}
          width={p.width}
          height={p.height}
          quality={90}
          sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="h-full w-full scale-[1.75] object-cover object-[40%_58%] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.85]"
        />
        {p.stock === 1 && (
          <span className="absolute left-3 top-3 rounded-sm bg-pk-bg/92 px-2 py-1 font-mono text-[11px] text-pk-fg">
            1 of 1
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="t-body truncate text-pk-fg">{p.name}</p>
          <p className="t-small truncate text-pk-fg-muted">{craft.label}</p>
        </div>
        <p className="font-mono t-small shrink-0 text-pk-fg">
          {formatINR(p.pricePaise)}
        </p>
      </div>
    </Link>
  );
}
