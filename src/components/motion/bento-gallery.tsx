"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "motion/react";
import { PRODUCTS, CRAFTS, formatINR, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

/**
 * BENTO SHOWCASE.
 *
 * Springs only. Hover does not zoom — the card's border lights with a
 * spotlight that tracks the cursor, and the image shifts perspective a little.
 * Quick-add rides in from the bottom on a rigid spring: snappy, not soft.
 */

const RIGID = { type: "spring", stiffness: 420, damping: 32, mass: 0.5 } as const;
const SETTLE = { type: "spring", stiffness: 90, damping: 20 } as const;

/* deliberate asymmetry — the Madhubani piece gets the big cell */
const SPAN = [
  "sm:col-span-2 sm:row-span-2",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
  "sm:col-span-1 sm:row-span-1",
];

export function BentoGallery() {
  return (
    <section
      id="pieces"
      className="relative scroll-mt-20 overflow-hidden"
      style={{ background: "#12100E" }}
      aria-labelledby="bento-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <p className="font-mono" style={{ color: "#E8BC57", fontSize: "var(--fs-sm)", letterSpacing: "0.2em" }}>
          THE COLLECTION
        </p>
        <h2
          id="bento-heading"
          className="font-display mt-4"
          style={{ color: "#F2E9D8", fontSize: "clamp(1.9rem,4.2vw,3.2rem)", letterSpacing: "-0.03em" }}
        >
          Five pieces, five hands
        </h2>

        <div className="mt-12 grid auto-rows-[minmax(200px,auto)] grid-cols-1 gap-5 sm:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <BentoCard key={p.slug} product={p} className={SPAN[i]} big={i === 0} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  product: p,
  className,
  big,
  index,
}: {
  product: Product;
  className?: string;
  big?: boolean;
  index: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const add = useCart((s) => s.add);
  const craft = CRAFTS[p.craft];
  const [hot, setHot] = useState(false);
  const spotlight = useMotionTemplate`radial-gradient(180px circle at ${mx}px ${my}px, #E8BC57, transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      className={`group relative overflow-hidden ${className ?? ""}`}
      style={{ borderRadius: "var(--r-sm)", background: "#1A1512" }}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ ...SETTLE, delay: index * 0.07 }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerEnter={() => setHot(true)}
      onPointerLeave={() => {
        setHot(false);
        mx.set(-300);
        my.set(-300);
      }}
    >
      {/* the spotlight tracing the edge */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20"
        animate={{ opacity: hot ? 1 : 0 }}
        transition={SETTLE}
        style={{
          borderRadius: "var(--r-sm)",
          padding: 1,
          background: spotlight,
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      <Link href={`/product/${p.slug}`} className="block h-full">
        <div className="relative h-full min-h-[200px] w-full overflow-hidden">
          <motion.div
            className="h-full w-full"
            whileHover={reduced ? undefined : { scale: 1.04, rotateZ: -0.4 }}
            transition={SETTLE}
          >
            <Image
              src={p.image}
              alt={`${p.name} — ${craft.label}`}
              width={p.width}
              height={p.height}
              quality={90}
              sizes={big ? "(max-width:640px) 92vw, 60vw" : "(max-width:640px) 92vw, 30vw"}
              className="h-full w-full scale-[1.65] object-cover object-[40%_56%]"
            />
          </motion.div>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4"
            style={{ background: "linear-gradient(to top, rgba(10,8,6,0.92), rgba(10,8,6,0))" }}
          >
            <p className="font-mono" style={{ color: "#E8BC57", fontSize: "var(--fs-xs)", letterSpacing: "0.14em" }}>
              {craft.region.toUpperCase()}
            </p>
            <p
              className="font-display mt-1"
              style={{ color: "#F2E9D8", fontSize: big ? "var(--fs-4xl)" : "var(--fs-2xl)", letterSpacing: "-0.02em" }}
            >
              {p.name}
            </p>
            <p className="font-mono mt-1" style={{ color: "#F2E9D8", fontSize: "var(--fs-md)", opacity: 0.8 }}>
              {formatINR(p.pricePaise)}
            </p>
          </div>
        </div>
      </Link>

      {/* quick add — rides in rigid */}
      <motion.button
        onClick={(e) => {
          e.preventDefault();
          add(p.slug);
        }}
        aria-label={`Add ${p.name} to bag`}
        className="absolute right-3 top-3 z-30 grid h-11 w-11 place-items-center"
        style={{ background: "#E8BC57", color: "#221A08", borderRadius: "var(--r-xs)" }}
        initial={false}
        animate={
          reduced
            ? { opacity: 1, y: 0 }
            : { opacity: hot ? 1 : 0, y: hot ? 0 : -12 }
        }
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.9 }}
        transition={RIGID}
      >
        <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>+</span>
      </motion.button>
    </motion.div>
  );
}
