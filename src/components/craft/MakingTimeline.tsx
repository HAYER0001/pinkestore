import { PROCESS, MATERIALS } from "@/lib/places";
import type { Craft } from "@/lib/catalog";

/**
 * MATERIAL (item 36) and THE MAKING TIMELINE (item 39).
 *
 * NO DURATIONS ANYWHERE. Every competitor puts "6–8 weeks" on this kind of
 * component, and we do not know how long any of these pieces actually took —
 * makingTime is a NEEDS_REAL_DATA field. A timeline with invented weeks on it
 * would be the most confident-looking lie on the site, and the one a buyer is
 * most likely to repeat to someone else.
 *
 * So it shows ORDER and DEPENDENCY, which are documented and true: what has to
 * happen before what, and which step is the one that holds the work up.
 */

export function MaterialStory({ craft }: { craft: Craft }) {
  const m = MATERIALS[craft];
  if (!m) return null;

  return (
    <section>
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
        <h2 className="ty-title" style={{ color: "#1A1A1A", margin: 0 }}>
          The material
        </h2>
        <span className="ty-mono" style={{ color: "#96605B" }}>
          {m.ground}
        </span>
      </div>

      <div className="mt-[clamp(1rem,2.5vh,1.5rem)] space-y-4">
        {m.body.map((para, i) => (
          <p key={i} className="ty-read measure-read" style={{ color: "#4A443C", margin: 0 }}>
            {para}
          </p>
        ))}
      </div>

      {/* The distinction this component exists to protect. */}
      <p className="ty-caption measure-read mt-6" style={{ color: "#6B645A" }}>
        That describes the technique. The exact fibre composition of this
        particular piece is measured, not assumed, and is listed on its own page
        once we have it.
      </p>
    </section>
  );
}

export function MakingTimeline({ craft }: { craft: Craft }) {
  const steps = PROCESS[craft];
  if (!steps?.length) return null;

  return (
    <section>
      <h2 className="ty-title" style={{ color: "#1A1A1A", margin: 0 }}>
        How it is made
      </h2>

      <ol
        className="mt-[clamp(1.5rem,4vh,2.5rem)]"
        style={{ margin: "1.5rem 0 0", padding: 0, listStyle: "none" }}
      >
        {steps.map((s, i) => (
          <li key={s.label} className="relative grid grid-cols-[auto_1fr] gap-x-6 pb-9 last:pb-0">
            {/* the spine, drawn per-row so the last row does not trail a
                stub below the final node */}
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute"
                style={{ left: 5, top: 16, bottom: 0, width: 1, background: "#C9A59F" }}
              />
            )}

            <span
              aria-hidden
              className="relative mt-1.5 block shrink-0"
              style={{
                width: 11,
                height: 11,
                borderRadius: "50%",
                border: "1px solid #96605B",
                background: "#FAF8F5",
              }}
            />

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-4">
                <span className="ty-mono" style={{ color: "#96605B" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="ty-title" style={{ color: "#1A1A1A", margin: 0 }}>
                  {s.label}
                </h3>
              </div>
              <p className="ty-read measure-read mt-2" style={{ color: "#4A443C", margin: "0.5rem 0 0" }}>
                {s.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="ty-caption measure-read mt-8" style={{ color: "#6B645A" }}>
        No timings here. How long this piece actually took is a number we do not
        have yet, and an invented one would be the most confident-looking thing
        on this page.
      </p>
    </section>
  );
}
