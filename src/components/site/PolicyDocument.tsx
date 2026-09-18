import type { Metadata } from "next";
import { PageShell } from "./PageShell";
import { type PolicyDoc, isComplete, missingFrom } from "@/lib/site";

/**
 * Renders a policy document — and, just as importantly, does not render the
 * parts of one that have not been decided yet.
 *
 * THREE RULES, in order of how much trouble breaking them causes:
 *
 * 1. A section with no body is dropped entirely. Never "Coming soon", never a
 *    plausible paragraph. A shipping rate or a returns window is a promise in
 *    the owner's name; writing a normal-sounding one because it sounds normal
 *    manufactures a contractual term nobody agreed to.
 *
 * 2. An incomplete document is noindex. A half-written returns policy that
 *    Google has cached is worse than no page at all, because it is the version
 *    a customer will quote back at you.
 *
 * 3. The gaps are still visible — but only in development. The owner needs to
 *    see exactly what is outstanding; the customer must never see scaffolding.
 */

export function policyMetadata(doc: PolicyDoc, description?: string): Metadata {
  return {
    title: doc.title,
    description,
    /* Rule 2. Incomplete documents stay out of the index until they are real. */
    robots: isComplete(doc) ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export function PolicyDocument({ doc, eyebrow }: { doc: PolicyDoc; eyebrow?: string }) {
  const written = doc.sections.filter((s) => s.body?.length);
  const missing = missingFrom(doc);

  return (
    <PageShell
      eyebrow={eyebrow ?? "The Pinkestore"}
      display={doc.display}
      standfirst={doc.standfirst}
      trail={[{ label: "Home", href: "/" }, { label: doc.title }]}
    >
      {written.length > 0 && (
        <div className="space-y-[clamp(2.5rem,6vh,4.5rem)]">
          {written.map((s) => (
            <section key={s.heading}>
              <h2 className="ty-title" style={{ color: "#1A1A1A", margin: 0 }}>
                {s.heading}
              </h2>
              <div className="mt-[clamp(1rem,2.5vh,1.5rem)] space-y-4">
                {s.body!.map((para, i) => (
                  <p key={i} className="ty-read measure-read" style={{ color: "#4A443C", margin: 0 }}>
                    {para}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Rule 1 + 3. One honest line to the customer — no invented specifics,
          no fake completeness — and the full outstanding list only in dev. */}
      {missing.length > 0 && (
        <section className={written.length > 0 ? "mt-[clamp(3rem,8vh,6rem)]" : ""}>
          <p className="ty-read measure-read" style={{ color: "#6B645A", margin: 0 }}>
            The rest of this page is not written yet, and we would rather leave it
            blank than guess at it. Ask us directly and you will get a straight
            answer:{" "}
            <a
              href="https://www.instagram.com/the_pinkestore/"
              className="underline underline-offset-4"
              style={{ color: "#96605B" }}
            >
              @the_pinkestore
            </a>
            .
          </p>

          {process.env.NODE_ENV !== "production" && (
            <div
              data-build-note
              className="mt-10 border-l-2 p-5"
              style={{ borderColor: "#96605B", background: "#F3EFE8" }}
            >
              <p className="ty-mono" style={{ color: "#96605B", margin: 0 }}>
                Build note — not shown in production
              </p>
              <ul className="mt-4 space-y-3" style={{ margin: 0, paddingLeft: "1.1rem" }}>
                {missing.map((m) => (
                  <li key={m.heading} className="ty-caption" style={{ color: "#4A443C" }}>
                    <strong style={{ fontWeight: 500 }}>{m.heading}</strong>
                    {m.needs ? ` — ${m.needs}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </PageShell>
  );
}
