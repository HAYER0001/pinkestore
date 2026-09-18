import Link from "next/link";
import { NAV, spell } from "@/lib/site";
import { BRAND, PRODUCTS, CRAFTS } from "@/lib/catalog";
import { Monogram } from "@/components/brand/Monogram";
import { ThreadRule } from "@/components/brand/ThreadRule";

/**
 * THE FOOTER. Item 100 — "finish the site with a complete luxury footer".
 *
 * The site used to just stop.
 *
 * WHAT IS DELIBERATELY NOT HERE, and why:
 *
 *   A newsletter field. A form that posts nowhere is worse than no form: the
 *   visitor believes they have subscribed. Resend is in the stack and this is
 *   maybe an hour of work once there is an API key and a decision about what
 *   the list is for — but until then the honest move is to leave it out.
 *
 *   Payment-method logos. We have no payment processor yet. A row of Visa and
 *   Mastercard marks would imply a checkout that does not exist.
 *
 *   Trust badges, "as seen in", certification seals. The competitive scan
 *   found GI-Certified badges printed with no certificate number behind them.
 *   That is the standard of the field and it is not a standard worth meeting.
 *
 * What IS here is true, and most of it is generated from the catalogue, so it
 * cannot drift out of step with the shop.
 */

const YEAR_FOUNDED = null as number | null; // NEEDS_REAL_DATA — the year the shop started

export function SiteFooter() {
  const handmade = PRODUCTS.filter((p) => CRAFTS[p.craft].handmade).length;
  /* Built at render on the server. A date computed in the client would
     hydration-mismatch against the server's clock across midnight. */
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "#F3EFE8", borderTop: "1px solid rgba(26,26,26,0.08)" }}>
      <div className="mx-auto max-w-[1500px] px-[clamp(1rem,3vw,3rem)] py-[clamp(3.5rem,9vh,6rem)]">
        <div className="grid gap-[clamp(2.5rem,5vw,4rem)] lg:grid-cols-[1.25fr_2fr]">
          {/* ---------------- the house ---------------- */}
          <div>
            <Link href="/" aria-label="The Pinkestore — home" className="inline-block">
              <Monogram size={40} stroke="#1A1A1A" weight={1.8} />
            </Link>

            <p
              className="ty-title measure-tight mt-6"
              style={{ color: "#1A1A1A", margin: "1.5rem 0 0" }}
            >
              Handmade textiles, one of each.
            </p>

            <p className="ty-read measure-read mt-5" style={{ color: "#4A443C" }}>
              {spell(handmade, true)} of the {spell(PRODUCTS.length)} pieces we
              hold are made entirely by hand, in Mithila, in Kashmir and in
              Lucknow. The shop is in {BRAND.city}.
            </p>

            <a
              href={BRAND.instagram}
              className="ty-mono mt-7 inline-block"
              style={{ color: "#1A1A1A", borderBottom: "1px solid #96605B", paddingBottom: 3, textDecoration: "none" }}
            >
              @the_pinkestore
            </a>
          </div>

          {/* ---------------- the IA, in full ---------------- */}
          <nav aria-label="Footer" className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {NAV.map((group) => (
              <div key={group.label}>
                <p
                  className="ty-mono"
                  style={{ color: "#96605B", letterSpacing: "var(--tracking-luxe-wide)", margin: 0 }}
                >
                  {group.label}
                </p>
                <ul className="mt-5 space-y-3" style={{ margin: "1.25rem 0 0", padding: 0, listStyle: "none" }}>
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="ty-caption"
                        style={{ color: "#4A443C", textDecoration: "none" }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <ThreadRule tone="#C9A59F" slack={4} className="my-[clamp(2.5rem,6vh,4rem)]" />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="ty-mono" style={{ color: "#6B645A", margin: 0 }}>
            © {YEAR_FOUNDED ? `${YEAR_FOUNDED}–${year}` : year} {BRAND.name} · {BRAND.city},{" "}
            {BRAND.state}, {BRAND.country}
          </p>
          <p className="ty-mono" style={{ color: "#6B645A", margin: 0 }}>
            Prices in Indian rupees
          </p>
        </div>
      </div>
    </footer>
  );
}
