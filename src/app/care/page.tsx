import { POLICIES } from "@/lib/site";
import { PolicyDocument, policyMetadata } from "@/components/site/PolicyDocument";

/* Thin by design. The content lives in src/lib/site.ts so that what is written
   and what is still missing are visible in one place rather than scattered
   across twelve files. */
const DOC = POLICIES.care;

export const metadata = policyMetadata(
  DOC,
  "How to keep hand-painted, sozni, kani and printed textiles — care by technique, not by guesswork.",
);

export default function Page() {
  return <PolicyDocument doc={DOC} eyebrow="Service" />;
}
