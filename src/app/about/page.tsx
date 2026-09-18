import { POLICIES } from "@/lib/site";
import { PolicyDocument, policyMetadata } from "@/components/site/PolicyDocument";
import { PromiseList } from "@/components/site/Promise";
import { ThreadRule } from "@/components/brand/ThreadRule";

/* Thin by design. The content lives in src/lib/site.ts so that what is written
   and what is still missing are visible in one place rather than scattered
   across twelve files. */
const DOC = POLICIES.about;

export const metadata = policyMetadata(
  DOC,
  "A small shop in Chandigarh selling one-of-one handmade textiles from Mithila, Kashmir and Lucknow.",
);

export default function Page() {
  return (
    <PolicyDocument doc={DOC} eyebrow="The House">
      <div className="mt-[clamp(3rem,8vh,5.5rem)]">
        <ThreadRule tone="#C9A59F" slack={4} className="mb-[clamp(2.5rem,7vh,4.5rem)]" />
        <h2 className="ty-title" style={{ color: "#1A1A1A", margin: 0 }}>
          What we promise
        </h2>
        <p className="ty-read measure-read mt-4" style={{ color: "#6B645A" }}>
          Four claims, each one something this site can be checked against —
          and is, by its own test suite. A promise nobody can falsify is
          marketing.
        </p>
        <div className="mt-[clamp(2rem,5vh,3rem)]">
          <PromiseList />
        </div>
      </div>
    </PolicyDocument>
  );
}
