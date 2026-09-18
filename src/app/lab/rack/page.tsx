import type { Metadata } from "next";
import { AlnaRack } from "@/components/shaili/alna-rack";
import { ShailiHero } from "@/components/shaili/shaili-hero";

export const metadata: Metadata = {
  title: "Lab — components in isolation",
  robots: { index: false, follow: false },
};

/** Isolation harness. Verifying a component inside a 7000px page is guesswork. */
export default function Lab() {
  return (
    <main className="flex-1">
      <ShailiHero />
      <AlnaRack />
    </main>
  );
}
