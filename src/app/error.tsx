"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/catalog";

/**
 * THE RUNTIME ERROR PAGE.
 *
 * Deliberately plain, and deliberately NOT rendering SiteHeader or SiteFooter.
 * Something has already thrown inside this tree; mounting the cart store, the
 * search index and the mega-menu on top of that is how a single broken
 * component becomes a blank white screen with a second error in the console.
 * The header is not worth the risk on the one page whose job is to survive.
 *
 * It also never prints the error message. A stack trace is meaningless to a
 * buyer and can leak internals; the digest is enough to find it in logs.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    /* No error service is wired up yet. When one is, it goes here — and until
       then the console is the only place this exists, which is worth knowing. */
    console.error("[pinkestore]", error);
  }, [error]);

  return (
    <div
      style={{
        background: "#FAF8F5",
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(1.5rem, 5vw, 4rem)",
      }}
    >
      <div style={{ maxWidth: "46ch" }}>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.6875rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#96605B",
            margin: 0,
          }}
        >
          Something broke
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 300,
            fontSize: "clamp(2rem, 5vw, 3.25rem)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
            color: "#1A1A1A",
            margin: "1.5rem 0 0",
          }}
        >
          That is ours, not yours
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 300,
            fontSize: "1rem",
            lineHeight: 1.75,
            color: "#4A443C",
            margin: "1.5rem 0 0",
          }}
        >
          Try again — it may well work. If it does not, tell us what you were
          doing and we will fix it. Nothing you had in your bag has been lost.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.75rem", marginTop: "2.25rem" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              background: "#1A1A1A",
              color: "#FAF8F5",
              border: "none",
              borderRadius: 0,
              padding: "1rem 2.25rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>

          <Link
            href="/"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.6875rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#1A1A1A",
              textDecoration: "none",
              borderBottom: "1px solid #96605B",
              paddingBottom: 3,
              alignSelf: "center",
            }}
          >
            Back to the shop
          </Link>
        </div>

        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.8125rem",
            color: "#6B645A",
            margin: "2.5rem 0 0",
          }}
        >
          <a href={BRAND.instagram} style={{ color: "#96605B" }}>
            @the_pinkestore
          </a>
          {error.digest ? ` · reference ${error.digest}` : ""}
        </p>
      </div>
    </div>
  );
}
