import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JOURNAL, getEntry } from "@/lib/journal";
import { PageShell } from "@/components/site/PageShell";

/* With no entries, every slug 404s — which is correct. dynamicParams:false
   makes that a static 404 rather than an attempted render at request time. */
export const dynamicParams = false;

export function generateStaticParams() {
  return JOURNAL.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(
  props: PageProps<"/journal/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const e = getEntry(slug);
  if (!e) return {};
  return {
    title: e.title,
    description: e.standfirst,
    openGraph: e.image
      ? { images: [{ url: e.image.src, width: e.image.width, height: e.image.height }] }
      : undefined,
  };
}

export default async function JournalEntryPage(props: PageProps<"/journal/[slug]">) {
  const { slug } = await props.params;
  const e = getEntry(slug);
  if (!e) notFound();

  /* Split the title for the composition. A single-word title pairs with the
     dateline so it still has a scale step. */
  const words = e.title.split(" ");
  const cut = Math.ceil(words.length / 2);
  const display = words.length > 1 ? [words.slice(0, cut).join(" "), words.slice(cut).join(" ")] : [e.title];

  return (
    <PageShell
      eyebrow={new Date(e.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}
      display={display}
      standfirst={e.standfirst}
      trail={[
        { label: "Home", href: "/" },
        { label: "Journal", href: "/journal" },
        { label: e.title },
      ]}
    >
      <article>
        {e.image && (
          <Image
            src={e.image.src}
            alt={e.image.alt}
            width={e.image.width}
            height={e.image.height}
            quality={90}
            className="mb-[clamp(2rem,5vh,3.5rem)] w-full"
            style={{ height: "auto" }}
          />
        )}
        <div className="space-y-5">
          {e.body.map((para, i) => (
            <p key={i} className="ty-read measure-read" style={{ color: "#4A443C", margin: 0 }}>
              {para}
            </p>
          ))}
        </div>
      </article>

      <Link
        href="/journal"
        className="ty-mono mt-[clamp(3rem,7vh,5rem)] inline-block"
        style={{ color: "#1A1A1A", borderBottom: "1px solid #96605B", paddingBottom: 3, textDecoration: "none" }}
      >
        All notes
      </Link>
    </PageShell>
  );
}
