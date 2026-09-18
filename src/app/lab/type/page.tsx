import type { Metadata } from "next";
import { DisplayComposition, Standfirst } from "@/components/type/DisplayComposition";
import { PullQuote } from "@/components/type/PullQuote";
import { ChapterMark } from "@/components/type/ChapterNav";
import { ThreadRule } from "@/components/brand/ThreadRule";

export const metadata: Metadata = { title: "Type scale", robots: { index: false } };

const STEPS: [string, string, string][] = [
  ["ty-colossal", "Colossal", "3.75 → 12rem · one word, compositional"],
  ["ty-hero", "Hero", "2.75 → 8rem"],
  ["ty-display", "Display", "2.25 → 4.75rem"],
  ["ty-quote", "Quote", "1.75 → 3.5rem · italic"],
  ["ty-title", "Title", "1.5 → 2.5rem"],
  ["ty-lede", "Lede", "1.125 → 1.5rem"],
  ["ty-read", "Read", "1 → 1.125rem"],
  ["ty-caption", "Caption", "0.8125rem"],
  ["ty-mono", "Mono", "0.6875rem · luxe tracking"],
];

export default function TypeLab() {
  return (
    <div style={{ background: "#FAF8F5", color: "#1A1A1A" }}>
      <div className="mx-auto max-w-6xl px-8 py-20">
        <ChapterMark n={2} label="Typography" />
        <DisplayComposition
          as="h1"
          className="mt-6"
          lines={[
            { text: "The", scale: "display", tone: "#96605B" },
            { text: "type", scale: "colossal" },
            { text: "scale", scale: "colossal", italic: true, indent: 0.16 },
          ]}
        />
        <Standfirst className="mt-10" tone="#4A443C">
          A composition has internal hierarchy — lines at different sizes, a
          deliberate indent, one word carrying the weight. A single string set
          large is still just a heading.
        </Standfirst>

        <ThreadRule tone="#1A1A1A" slack={6} className="my-20" />

        {/* the ramp */}
        <div className="space-y-12">
          {STEPS.map(([cls, name, note]) => (
            <div key={cls}>
              <div className="flex items-baseline gap-4">
                <span className="ty-mono" style={{ color: "#C9A59F" }}>{name}</span>
                <span className="ty-mono" style={{ color: "#8A8276", letterSpacing: "0.06em", textTransform: "none" }}>
                  {note}
                </span>
              </div>
              <p className={`${cls} mt-3`} style={{ margin: 0 }}>
                Painted, not printed
              </p>
            </div>
          ))}
        </div>
      </div>

      <PullQuote
        attribution="On why nothing is restocked"
        ground="#F3EFE8"
        tone="#1A1A1A"
        threadTone="#96605B"
      >
        The next piece will be different, because a different pair of hands will
        have made it.
      </PullQuote>

      <div className="mx-auto max-w-6xl px-8 py-24">
        <p className="ty-mono" style={{ color: "#8A6812" }}>Measure</p>
        <p className="ty-read measure-read mt-5">
          Prose past roughly sixty-eight characters loses the reader between
          lines — the eye has to travel too far back to find the start of the
          next one, and it lands on the wrong line. This paragraph is capped at
          62ch, which is why it breaks where it does rather than running the
          full width of the page.
        </p>
      </div>

      <PullQuote ground="#12100E" tone="#F7F3EC" threadTone="#E8BC57">
        One of one, and then never again in that exact form.
      </PullQuote>
    </div>
  );
}
