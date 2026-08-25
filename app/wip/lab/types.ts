import type { ReactNode } from 'react';
import type { CourseModule } from '@/app/data/courses/open-harness';

/** Every layout receives the same lesson and decides everything else itself. */
export type LayoutProps = {
  module: CourseModule;
  index: number;
  total: number;
  partTitle?: string;
};

export type LayoutDef = {
  n: number;
  id: string;
  name: string;
  /** One sentence: what reading model this proposes, not how it is decorated. */
  blurb: string;
  /** Does it want the standard left TOC + right rail around it? */
  chrome: 'full' | 'reading-only';
  Component: (props: LayoutProps) => ReactNode;
};

/** The lab writes its own progress; ticking a box here never touches the real course. */
export const LAB_COURSE_ID = 'wip-lab';

/**
 * How a lesson splits, decided once for the whole lab.
 *
 * Six of the ten layouts used to write `filter((s) => !s.advanced)` inline and
 * render nothing in place of what they removed. That is deletion, not folding:
 * the live lesson publishes those sections in a `<details>` tail, so lessons
 * 02, 03 and 06 were being compared with a whole section missing on some
 * layouts and present on others. A stakeholder reading that difference as a
 * property of the layout would have been reading a bug.
 *
 * Splitting here makes the omission impossible to write by accident: a layout
 * receives both lists and has to decide what to do with the second one.
 */
export function lessonSections(mod: CourseModule) {
  const all = mod.sections ?? [];
  return {
    main: all.filter((s) => !s.advanced),
    advanced: all.filter((s) => s.advanced),
  };
}
