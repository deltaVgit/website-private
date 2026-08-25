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

export const CORRECTIONS: Correction[] = [
  {
    slug: '01',
    was: '1 · Core stack',
    now: 'Core stack',
    why:
      'Section numbers belong to the layout, not to the sentence. Six headings in this one module carry a hand-typed number and the other sixty-six across the course carry none, which is what made the numbering look broken: a number written into the text cannot stay in step with the section it labels. Removing it here lets the renderer number all seventy-two.',
    frKeys: 1,
  },
  {
    slug: '01',
    was: '2 · The agent loop (not the LLM alone)',
    now: 'The agent loop (not the LLM alone)',
    why:
      'Section numbers belong to the layout, not to the sentence. Six headings in this one module carry a hand-typed number and the other sixty-six across the course carry none, which is what made the numbering look broken: a number written into the text cannot stay in step with the section it labels. Removing it here lets the renderer number all seventy-two.',
    frKeys: 1,
  },
  {
    slug: '01',
    was: '3 · Models, cost, and keys',
    now: 'Models, cost, and keys',
    why:
      'Section numbers belong to the layout, not to the sentence. Six headings in this one module carry a hand-typed number and the other sixty-six across the course carry none, which is what made the numbering look broken: a number written into the text cannot stay in step with the section it labels. Removing it here lets the renderer number all seventy-two.',
    frKeys: 1,
  },
  {
    slug: '01',
    was: '4 · What it remembers, and what it forgets',
    now: 'What it remembers, and what it forgets',
    why:
      'Section numbers belong to the layout, not to the sentence. Six headings in this one module carry a hand-typed number and the other sixty-six across the course carry none, which is what made the numbering look broken: a number written into the text cannot stay in step with the section it labels. Removing it here lets the renderer number all seventy-two.',
    frKeys: 1,
  },
  {
    slug: '01',
    was: '5 · Tools, skills, plugins, and MCP',
    now: 'Tools, skills, plugins, and MCP',
    why:
      'Section numbers belong to the layout, not to the sentence. Six headings in this one module carry a hand-typed number and the other sixty-six across the course carry none, which is what made the numbering look broken: a number written into the text cannot stay in step with the section it labels. Removing it here lets the renderer number all seventy-two.',
    frKeys: 1,
  },
  {
    slug: '01',
    was: '6 · Reach outside the Desktop window',
    now: 'Reach outside the Desktop window',
    why:
      'Section numbers belong to the layout, not to the sentence. Six headings in this one module carry a hand-typed number and the other sixty-six across the course carry none, which is what made the numbering look broken: a number written into the text cannot stay in step with the section it labels. Removing it here lets the renderer number all seventy-two.',
    frKeys: 1,
  },
  {
    slug: '02',
    was: 'Pick where you’ll run Hermes (your laptop is fine).',
    now: 'Pick where you’ll run Hermes (a machine that is not your daily laptop).',
    why:
      'The subtitle contradicts its own lesson. The body asks for “a machine that exists for the agent … not the computer that holds banking, work SSO, passwords”, and the proof closes with “Baseline is a dedicated box — not ‘whatever laptop is open.’” The reassuring version is the first sentence a beginner reads, so it is the one they act on.',
    frKeys: 1,
  },
  {
    slug: '06',
    was: 'Lane A — Switzerland (after this PR is live)',
    now: 'Lane A — Switzerland',
    why:
      'An authoring note that shipped. “After this PR is live” describes the state of a repository, which means nothing to a reader and quietly suggests the command does not work yet. The command itself resolves today.',
    frKeys: 1,
  },
  {
    slug: '04',
    was: 'What `SOUL.md` is',
    now: 'What SOUL.md is',
    why:
      'Section headings are rendered as plain text (LessonSection.tsx:32 does not run formatCourseText), so the backticks appear literally on the page. Either the heading drops them or the renderer learns to read them; dropping them is the change that touches nothing shared.',
    frKeys: 1,
  },
  {
    slug: '04',
    was: 'What `AGENTS.md` is',
    now: 'What AGENTS.md is',
    why: 'Same cause as the SOUL.md heading: backticks shown to the reader.',
    frKeys: 1,
  },
  {
    slug: '07',
    was: '`MEMORY.md` and `USER.md`',
    now: 'MEMORY.md and USER.md',
    why: 'Same cause: backticks shown to the reader.',
    frKeys: 2,
  },
];

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
