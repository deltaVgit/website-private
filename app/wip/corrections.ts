import type { CourseModule } from '@/app/data/courses/open-harness';

/**
 * Content corrections, proposed rather than applied.
 *
 * Everything here is a defect found while reading the thirteen lessons. None
 * of it is fixed in `app/data/courses/open-harness.ts`, because that file is
 * the live course and is shared with every open branch. Instead the WIP
 * renderer patches a copy on its way to the page, so the correction can be
 * read in place and judged before anyone edits the source.
 *
 * Each entry states the exact string it replaces. An entry that stops matching
 * is reported rather than silently skipped: if someone fixes one of these
 * upstream, this file should shrink, not rot.
 */
export type Correction = {
  /** Which lesson it belongs to, for the report. */
  slug: string;
  was: string;
  now: string;
  /** What is actually wrong. Written for the person deciding whether to ship it. */
  why: string;
  /**
   * How many keys in `open-harness.fr.json` are keyed on the old English
   * string.
   *
   * The French file maps EN text to FR text, so correcting the English
   * upstream orphans its translation and the page silently falls back to the
   * new English. Counted here so the cost of shipping a correction is visible
   * at the point of deciding, not discovered afterwards. Verified against the
   * file: all five corrections have one, and the MEMORY.md heading has two
   * because the same string also appears in a quiz explanation.
   */
  frKeys: number;
};

/**
 * Empty on purpose: all twelve proposals shipped upstream on 2026-08-26 with
 * the spine layout (PR #71) — the six hand-typed heading numbers in lesson 01,
 * the lesson 02 subtitle, the lesson 06 authoring note, and the three
 * backticked headings, with `open-harness.fr.json` re-keyed to match. New
 * defects found while reading go here first, ship later.
 */
export const CORRECTIONS: Correction[] = [];

/**
 * Apply every correction that belongs to this lesson.
 *
 * The module tree mixes locale objects, nested blocks and arrays, so it is
 * walked through a JSON round-trip: one pass, no assumptions about block
 * shapes, and a new block type can never quietly escape the substitution.
 * Returns the patched copy plus exactly which corrections landed, so the page
 * can show its own diff instead of asking you to take its word for it.
 */
export function correctModule(mod: CourseModule): {
  module: CourseModule;
  applied: Correction[];
  missing: Correction[];
} {
  const mine = CORRECTIONS.filter((c) => c.slug === mod.slug);
  if (!mine.length) return { module: mod, applied: [], missing: [] };

  let text = JSON.stringify(mod);
  const applied: Correction[] = [];
  const missing: Correction[] = [];

  for (const c of mine) {
    // JSON-encode the needle so it matches the escaping inside the string.
    const needle = JSON.stringify(c.was).slice(1, -1);
    const patch = JSON.stringify(c.now).slice(1, -1);
    const hits = text.split(needle).length - 1;
    if (hits > 0) {
      // split/join rewrites every occurrence. `MEMORY.md and USER.md` appears
      // both as a heading and inside a quiz explanation, so reporting one
      // while changing two made the second edit invisible — which is exactly
      // what this report exists to prevent.
      text = text.split(needle).join(patch);
      applied.push(hits > 1 ? { ...c, why: `${c.why} (applied to ${hits} occurrences)` } : c);
    } else {
      missing.push(c);
    }
  }

  return { module: JSON.parse(text) as CourseModule, applied, missing };
}
