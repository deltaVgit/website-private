'use client';

import { LessonSection } from '@/app/components/course/lesson/LessonSection';
import { t, type CourseSection } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID } from './types';

/**
 * The advanced sections, folded but present.
 *
 * Mirrors what the live lesson does at the end of a page, so a layout that has
 * nowhere clever to put this content still publishes it rather than dropping
 * it. Layouts with their own answer (03 tags them Optional, 04 queues them as
 * detours, 07 and 10 badge them inline) do not use this and should not.
 */
export function AdvancedTail({
  sections,
  moduleSlug,
}: {
  sections: CourseSection[];
  moduleSlug: string;
}) {
  if (!sections.length) return null;
  return (
    <div className="mt-14 space-y-3">
      <h2 className="course-h3">Other deployments</h2>
      {sections.map((section, i) => (
        <details key={i} className="course-advanced-details">
          <summary className="course-advanced-summary">
            <span className="course-advanced-chevron" aria-hidden>
              ▸
            </span>
            <span>{t(section.heading, 'en')}</span>
          </summary>
          <div className="course-advanced-body">
            <LessonSection
              section={section}
              lang="en"
              moduleSlug={moduleSlug}
              showHeading={false}
              courseId={LAB_COURSE_ID}
            />
          </div>
        </details>
      ))}
    </div>
  );
}
