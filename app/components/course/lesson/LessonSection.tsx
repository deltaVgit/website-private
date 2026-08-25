'use client';

import { t, type CourseLang, type CourseSection } from '@/app/data/courses/open-harness';
import { BlockRenderer } from './BlockRenderer';

/**
 * `course-h2` is load-bearing: OnThisPage queries that exact class to build the
 * right-hand rail, and mutates the id in place. Renaming it empties the rail
 * with no error.
 */
export function LessonSection({
  section,
  lang,
  moduleSlug,
  showHeading = true,
  /**
   * Which course the checkbox state belongs to. Defaults to the real course,
   * so every existing caller is untouched; the WIP sandbox passes its own id
   * so reading a proposal never marks the live lesson as done.
   */
  courseId,
}: {
  section: CourseSection;
  lang: CourseLang;
  moduleSlug: string;
  showHeading?: boolean;
  courseId?: string;
}) {
  const blocks = section.blocks ?? [];
  return (
    <section>
      {showHeading && <h2 className="course-h2">{t(section.heading, lang)}</h2>}
      <div className="course-blocks">
        {blocks.map((block, i) => (
          <BlockRenderer key={i} block={block} lang={lang} moduleSlug={moduleSlug} courseId={courseId} />
        ))}
      </div>
    </section>
  );
}
