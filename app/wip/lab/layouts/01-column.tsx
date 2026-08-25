'use client';

import { LessonSection } from '@/app/components/course/lesson/LessonSection';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import { t } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID, type LayoutProps, lessonSections } from '../types';
import { AdvancedTail } from '../AdvancedTail';
import { ProviderStrip } from '../kit/Glyph';

/**
 * 01 — Single column, one edge.
 *
 * The control. It is the live lesson with the three width proposals applied and
 * nothing else, so every other layout is judged against a fair baseline rather
 * than against a page that still has the alignment bug.
 *
 * Reading model: linear, one thing after another, one right edge for every
 * block. Nothing competes for attention; nothing is hidden behind an
 * interaction. If a richer layout cannot beat this, the richer layout is
 * decoration.
 */
export default function ColumnLayout({ module: mod, index, total, partTitle }: LayoutProps) {
  const { main: sections, advanced } = lessonSections(mod);

  return (
    <article className="course-prose lay-column">
      <p className="course-meta">
        <span className="course-meta-num">
          {String(index + 1).padStart(2, '0')} / {total}
        </span>
        {partTitle ? ` · ${partTitle}` : ''} · {mod.minutes} min read
      </p>

      <h1 className="course-h1">{t(mod.title, 'en')}</h1>
      {mod.subtitle && <p className="course-lead">{formatCourseText(t(mod.subtitle, 'en'), 'en')}</p>}

      {/* Reads the lesson and shows only the providers it genuinely names,
          so a conceptual module correctly shows nothing at all. */}
      <ProviderStrip module={mod} />

      <div className="mt-14 space-y-14">
        {sections.map((section, i) => (
          <LessonSection
            key={i}
            section={section}
            lang="en"
            moduleSlug={mod.slug}
            courseId={LAB_COURSE_ID}
          />
        ))}
      </div>

      {/* Advanced sections are published content: the live lesson folds them
          into a details tail rather than hiding them. Dropping them made this
          layout look shorter than its peers for reasons that were not about
          the layout at all. */}
      <AdvancedTail sections={advanced} moduleSlug={mod.slug} />

      <div className="course-proof mt-16">
        <h2 className="course-h3">Proof</h2>
        <InteractiveChecklist
          courseId={LAB_COURSE_ID}
          moduleSlug={mod.slug}
          sectionKey="module-proof"
          items={[t(mod.proof, 'en')]}
          accent="cyan"
          mode="proof"
          lang="en"
        />
        <MarkCompleteButton courseId={LAB_COURSE_ID} slug={mod.slug} accent="orange" lang="en" />
      </div>
    </article>
  );
}
