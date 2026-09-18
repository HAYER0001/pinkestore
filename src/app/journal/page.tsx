import Link from "next/link";
import type { Metadata } from "next";
import { entriesByDate } from "@/lib/journal";
import { PageShell } from "@/components/site/PageShell";
import { ThreadRule } from "@/components/brand/ThreadRule";

const entries = entriesByDate();

export const metadata: Metadata = {
  title: "Journal",
  description: "Notes on the crafts, the regions and the pieces.",
  /* An empty journal must not be indexed. A search result promising writing
     that leads to a page saying there is none is worse than not appearing. */
  robots: entries.length > 0 ? { index: true, follow: true } : { index: false, follow: true },
};

export default function JournalIndexPage() {
  return (
    <PageShell
      eyebrow="Journal"
      display={["Notes on", "the making"]}
      standfirst={
        entries.length > 0
          ? "Writing about the crafts, the regions they come from, and the pieces as they arrive."
          : undefined
      }
      trail={[{ label: "Home", href: "/" }, { label: "Journal" }]}
    >
      {entries.length === 0 ? (
        <div>
          <p className="ty-read measure-read" style={{ color: "#4A443C" }}>
            Nothing published yet. This is where writing about the crafts will
            go — how a talim is read, why sozni takes months, what separates a
            kachni line from a bharni fill — and it will go here when someone
            who actually knows those things has written it.
          </p>
          <p className="ty-read measure-read mt-5" style={{ color: "#6B645A" }}>
            In the meantime, the technique pages carry what we can state
            plainly:{" "}
            <Link href="/craft" className="underline underline-offset-4" style={{ color: "#96605B" }}>
              the crafts
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="space-y-[clamp(2.5rem,6vh,4rem)]" style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {entries.map((e, i) => (
            <li key={e.slug}>
              {i > 0 && <ThreadRule tone="#C9A59F" slack={3} className="mb-[clamp(2.5rem,6vh,4rem)]" />}
              <article>
                <time className="ty-mono" style={{ color: "#6B645A" }} dateTime={e.date}>
                  {new Date(e.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </time>
                <h2 className="mt-3" style={{ margin: 0 }}>
                  <Link
                    href={`/journal/${e.slug}`}
                    className="ty-title"
                    style={{ color: "#1A1A1A", textDecoration: "none" }}
                  >
                    {e.title}
                  </Link>
                </h2>
                <p className="ty-read measure-read mt-4" style={{ color: "#4A443C" }}>
                  {e.standfirst}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
