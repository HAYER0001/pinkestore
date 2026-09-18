import { PROMISES } from "@/lib/site";
import { ThreadRule } from "@/components/brand/ThreadRule";

/**
 * Item 32. Four claims, each one something a test can fail on.
 *
 * Deliberately NOT a row of icons with three words under each. That format
 * exists to make weak claims look substantial; these claims are specific
 * enough to be checked, so they get sentences.
 */
export function PromiseList({
  tone = "#1A1A1A",
  body = "#4A443C",
  accent = "#96605B",
}: {
  tone?: string;
  body?: string;
  accent?: string;
}) {
  return (
    <ol
      className="grid gap-x-[clamp(2rem,4vw,4rem)] gap-y-[clamp(2rem,5vh,3rem)] sm:grid-cols-2"
      style={{ margin: 0, padding: 0, listStyle: "none" }}
    >
      {PROMISES.map((p, i) => (
        <li key={p.title}>
          <div className="flex items-baseline gap-4">
            <span className="ty-mono shrink-0" style={{ color: accent }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="ty-title" style={{ color: tone, margin: 0 }}>
              {p.title}
            </h3>
          </div>
          <ThreadRule tone={accent} slack={2} className="mt-4" />
          <p className="ty-read mt-4" style={{ color: body, margin: "1rem 0 0" }}>
            {p.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
