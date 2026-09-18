"use client";

import { useState } from "react";
import Image from "next/image";
import { MaskedImage } from "@/components/site/MaskedImage";
import { getShots, altFor } from "@/lib/shots";
import type { Product } from "@/lib/catalog";
import { Lightbox } from "./Lightbox";

/**
 * THE VERTICAL IMMERSIVE GALLERY (item 52).
 *
 * One frame per row at full column width, scrolling. Not a thumbnail strip
 * with a main image: a strip asks you to manage a viewer, and the piece is
 * what you came for. Scrolling is the interaction people already know.
 *
 * Every frame is a real, different photograph now. The previous version faked
 * a second view by rendering the SAME image at scale(2.4) with a shifted
 * object-position — a reasonable hack when there was one photograph per piece,
 * and a misrepresentation the moment there are six.
 */

export function PieceGallery({ product: p }: { product: Product }) {
  const [open, setOpen] = useState<number | null>(null);
  const shots = getShots(p.slug);

  /* No frames yet — the single catalogue photograph, and no invitation to
     open a viewer that would show one image. */
  if (shots.length === 0) {
    return (
      <div className="space-y-4">
        <div className="relative aspect-4/5 overflow-hidden" style={{ border: "1px solid rgba(26,26,26,0.14)" }}>
          <Image
            src={p.image}
            alt={`${p.name}`}
            fill
            quality={90}
            sizes="(max-width: 1024px) 94vw, 56vw"
            priority
            className="object-cover"
          />
        </div>
        <Caption />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-[clamp(0.75rem,1.5vw,1.25rem)]">
        {shots.map((s, i) => (
          /* MASKED, not faded (item 73). A fade renders a half-present ghost
             of the photograph for the better part of a second, which on a shop
             selling colour and thread misrepresents the piece while it plays.
             A travelling mask shows a smaller amount of correct image instead
             of a full amount of wrong one. */
          <button
            key={s.src}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`${altFor(p, s)} — open full screen`}
            className="relative block w-full"
            style={{ border: "1px solid rgba(26,26,26,0.14)", padding: 0, cursor: "zoom-in" }}
          >
            <MaskedImage
              src={s.src}
              alt={altFor(p, s)}
              sizes="(max-width: 1024px) 94vw, 56vw"
              quality={90}
              priority={i === 0}
            />

            <span
              className="ty-mono absolute bottom-0 left-0 z-10"
              style={{
                background: "rgba(250,248,245,0.94)",
                color: "#1A1A1A",
                padding: "0.5rem 0.9rem",
              }}
            >
              {s.frame}
            </span>
          </button>
        ))}

        <Caption />
      </div>

      <Lightbox
        shots={shots}
        index={open}
        alt={(s) => altFor(p, s)}
        onIndex={setOpen}
        onClose={() => setOpen(null)}
      />
    </>
  );
}

function Caption() {
  return (
    <p className="ty-caption" style={{ color: "#6B645A" }}>
      Photographed as it arrived. What you see is the actual piece, not a sample
      of the design.
    </p>
  );
}
