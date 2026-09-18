/**
 * THE JOURNAL.
 *
 * Empty, and empty on purpose. The route exists because Phase 4's navigation
 * has to point somewhere real and because the IA is decided now rather than
 * retrofitted later — but a journal is the one part of a shop that cannot be
 * generated. An invented essay about a craft, published under the shop's name,
 * is a lie about who wrote it and a lie about what the shop knows.
 *
 * Add an entry by adding an object here. The index, the static params and the
 * entry page all read this array, so nothing else has to change.
 */

export interface JournalEntry {
  slug: string;
  title: string;
  /** ISO date, e.g. "2026-03-14". Shown as the dateline. */
  date: string;
  standfirst: string;
  /** Paragraphs. Plain prose — no markdown pipeline until it earns one. */
  body: string[];
  /** Optional lead image from /public. */
  image?: { src: string; alt: string; width: number; height: number };
}

export const JOURNAL: JournalEntry[] = [];

export const getEntry = (slug: string) => JOURNAL.find((e) => e.slug === slug);

/** Newest first. */
export const entriesByDate = () =>
  [...JOURNAL].sort((a, b) => (a.date < b.date ? 1 : -1));
