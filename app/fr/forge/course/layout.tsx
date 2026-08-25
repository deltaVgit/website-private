import type { ReactNode } from 'react';
import '../../../forge/course/course.css';

/**
 * Exists only to scope the course stylesheet to the French course routes.
 *
 * The English tree gets `course.css` from `app/forge/course/layout.tsx`, but
 * App Router attaches a layout's CSS to its own segment — `/fr/forge/course/**`
 * never passed through it, so the French lessons shipped with no course styles
 * at all: plain-text toc, no chrome, no spine. Same import, French segment.
 */
export default function FrCourseLayout({ children }: { children: ReactNode }) {
  return children;
}
