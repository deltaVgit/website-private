/**
 * Plain module, deliberately WITHOUT 'use client'.
 *
 * These used to live in `WipChrome.tsx`. That file is a client component, so
 * when a *server* page imported a constant from it Next replaced the export
 * with a stub that throws on call — and `${WIP_COURSE_BASE}${slug}/` happily
 * stringified that stub into the href. The result was links like
 * `/wip/course/function()%20%7B%20throw%20new%20Error(...)%7D01/`, which 404.
 *
 * Constants shared across the client/server boundary belong in their own
 * module. Nothing here imports React.
 */
export const WIP_BASE = '/wip/';
export const WIP_COURSE_BASE = '/wip/course/';
export const WIP_LAB_BASE = '/wip/lab/';

/** The WIP tree keeps its own progress: ticking a box here never marks the real course as done. */
export const WIP_COURSE_ID = 'wip-course';

/** The course all three WIP surfaces render. Its own name, not a description. */
export const WIP_COURSE_NAME = 'My First AI Agent';

/**
 * The three surfaces, in one place.
 *
 * They were listed twice — once in the navbar menu, once on the WIP index — with
 * different wording in each, and neither said which course they showed. Reading
 * "Ten versions" told you nothing about what was being versioned.
 *
 * One entry per surface, one shape for all three: the course name, then what
 * this particular copy of it is. Each consumer renders the labels in its own
 * language, but the hrefs and the ordering come from here, so the two lists
 * cannot drift apart again.
 */
// Three surfaces, all under /wip/. The first lab used to live at
// /forge/course/visual-lab/, which meant the work in progress was split across
// two parts of the site; it moved here so there is one place to look.
export const WIP_SURFACES = [
  {
    key: 'fixes',
    href: `${WIP_COURSE_BASE}00/`,
    label: `${WIP_COURSE_NAME} · proposed fixes`,
    detail: 'The live course with the layout corrections applied',
  },
  {
    key: 'layouts',
    href: `${WIP_LAB_BASE}00/`,
    label: `${WIP_COURSE_NAME} · ten layouts`,
    detail: 'The same course in ten reading models, one click apart',
  },
  {
    key: 'archive',
    href: `${WIP_BASE}archive/00/`,
    label: `${WIP_COURSE_NAME} · first attempt`,
    detail: 'The archived first pass, kept for honest comparison',
  },
] as const;
