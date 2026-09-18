import { POLICIES } from "@/lib/site";
import { PolicyDocument, policyMetadata } from "@/components/site/PolicyDocument";

/* Thin by design. The content lives in src/lib/site.ts so that what is written
   and what is still missing are visible in one place rather than scattered
   across twelve files. */
const DOC = POLICIES.contact;

export const metadata = policyMetadata(
  DOC,
  "Talk to a person before you buy.",
);

export default function Page() {
  return <PolicyDocument doc={DOC} eyebrow="The House" />;
}
