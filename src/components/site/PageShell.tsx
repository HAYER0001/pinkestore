import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { DisplayComposition, Standfirst } from "@/components/type/DisplayComposition";
import { ThreadRule } from "@/components/brand/ThreadRule";

/**
 * The shell every editorial and service route sits in.
 *
 * Deliberately NOT the homepage's cinematic chrome: the canvas is route-gated
 * to "/", the fixed Overlay returns null everywhere else, and these pages have
 * a light ground that a difference-blended overlay would fight rather than
 * complement. They get the real sticky header instead.
 *
 * The heading is a DisplayComposition rather than a string set large, for the
 * same reason the homepage's is — a service page still belongs to the house.
 */

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-6">
      <ol className="tap-row flex flex-wrap items-center gap-2" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {trail.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="ty-mono" style={{ color: "#6B645A", opacity: 0.5 }}>
                /
              </span>
            )}
            {c.href ? (
              <Link
                href={c.href}
                className="ty-mono tap"
                style={{ color: "#6B645A", textDecoration: "none" }}
              >
                {c.label}
              </Link>
            ) : (
              <span className="ty-mono" style={{ color: "#1A1A1A" }} aria-current="page">
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageShell({
  eyebrow,
  display,
  standfirst,
  trail,
  children,
  wide = false,
}: {
  eyebrow?: string;
  /** Two or three lines. The composition needs a scale step to be a composition. */
  display: string[];
  standfirst?: string;
  trail: Crumb[];
  children?: ReactNode;
  wide?: boolean;
}) {
  return (
    <div style={{ background: "#FAF8F5", minHeight: "100svh" }}>
      <SiteHeader />

      <main
        className={`mx-auto px-[clamp(1rem,3vw,3rem)] pb-[clamp(5rem,12vh,9rem)] ${
          wide ? "max-w-[1500px]" : "max-w-[1100px]"
        }`}
      >
        <Breadcrumbs trail={trail} />

        <header className="pt-[clamp(1rem,4vh,3rem)]">
          {eyebrow && (
            <p
              className="ty-mono"
              style={{
                color: "#8A6812",
                letterSpacing: "var(--tracking-luxe-widest)",
                marginBottom: "clamp(1.25rem,3vh,2rem)",
              }}
            >
              {eyebrow}
            </p>
          )}

          <DisplayComposition
            as="h1"
            lines={display.map((text, i) => ({
              text,
              /* the second line steps down and goes italic — the pair reads as
                 one composition rather than two headings stacked */
              scale: i === 0 ? ("display" as const) : ("title" as const),
              italic: i > 0,
            }))}
            style={{ color: "#1A1A1A" }}
          />

          {standfirst && (
            <Standfirst className="mt-[clamp(1.5rem,4vh,2.5rem)]" tone="#4A443C">
              {standfirst}
            </Standfirst>
          )}
        </header>

        <ThreadRule tone="#C9A59F" slack={4} className="my-[clamp(2.5rem,7vh,5rem)]" />

        {children}
      </main>

      <SiteFooter />
    </div>
  );
}
