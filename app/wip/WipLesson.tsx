'use client';

import { LessonSection } from '@/app/components/course/lesson/LessonSection';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import {
  OPEN_HARNESS_MODULES,
  OPEN_HARNESS_PARTS,
  t,
  type CourseModule,
  type CourseSection,
} from '@/app/data/courses/open-harness';
import { WIP_COURSE_ID, WIP_COURSE_BASE } from './constants';
import { HarnessModuleVisual } from '@/app/components/course/CourseVisuals';
import { CourseCode } from '@/app/components/course/lesson/CourseCode';
import { ModuleNav } from '@/app/components/course/CourseShell';
import { HermesOverviewShot } from './lab/kit/HermesShot';
import { correctModule } from './corrections';
import { PinLayer } from './lab/kit/PinLayer';
import { HeadingMarks } from './HeadingMarks';

/**
 * One lesson, rendered through the real components on the WIP surface.
 *
 * Deliberately thin: the content comes from `open-harness.ts` by import and
 * the blocks go through `LessonSection` → `BlockRenderer`, exactly as the live
 * lesson does. If this file grew its own rendering, the comparison would stop
 * being a comparison.
 *
 * The one substantive difference is the progress id: checkboxes here write
 * under the WIP key, so reading a proposal never marks the real course as done.
 */
export function WipLesson({ module: mod }: { module: CourseModule }) {
  // Content defects are patched on the way to the page, never in the course
  // data. `applied` is rendered below so the change is visible rather than
  // silent, and `missing` surfaces a correction that stopped matching.
  const { module: fixed, applied, missing } = correctModule(mod);
  mod = fixed;

  const index = OPEN_HARNESS_MODULES.findIndex((m) => m.slug === mod.slug);
  const part = OPEN_HARNESS_PARTS.find((p) => p.id === mod.part);
  const sections: CourseSection[] = mod.sections ?? [];
  const main = sections.filter((s) => !s.advanced);
  const placement = mod.visualPlacement ?? 'top';
  const visualAfterIndex = typeof placement === 'number' ? placement : -1;
  const advanced = sections.filter((s) => s.advanced);

  return (
    <article className="course-prose">
      <HeadingMarks />

      <p className="course-meta">
        <span className="course-meta-num">
          {String(index + 1).padStart(2, '0')} / {OPEN_HARNESS_MODULES.length}
        </span>
        {part ? ` · Open Harness — ${t(part.title, 'en')}` : ''} · {mod.minutes} min read
      </p>

      <h1 className="course-h1 mt-4">{t(mod.title, 'en')}</h1>
      {mod.subtitle && (
        <p className="course-deck mt-4">{formatCourseText(t(mod.subtitle, 'en'), 'en')}</p>
      )}

      {mod.hero && (
        <div className="mt-8">
          <CourseCode block={mod.hero} lang="en" />
        </div>
      )}

      {/* The per-module diagram. It was missing, which mattered more here than
          anywhere: these are the widest figures on the page and Proposal 1 is
          entirely about how full-width figures relate to the text measure. */}
      {placement === 'top' && (
        <div className="mt-10">
          <HarnessModuleVisual slug={mod.slug} />
        </div>
      )}

      {/* Module 01 is the one module HarnessModuleVisual returns null for, so
          the annotated overview goes there rather than to 00 as first written. */}
      {mod.slug === '01' && <HermesOverviewShot />}

      <div className="mt-14 space-y-14">
        {main.map((section, i) => (
          <div key={i}>
            <LessonSection
              section={section}
              lang="en"
              moduleSlug={mod.slug}
              courseId={WIP_COURSE_ID}
            />
            {visualAfterIndex === i && (
              <div className="mt-10">
                <HarnessModuleVisual slug={mod.slug} />
              </div>
            )}
          </div>
        ))}
      </div>

      {advanced.length > 0 && (
        <div className="mt-14 space-y-3">
          <h2 className="course-h3">Other deployments</h2>
          {advanced.map((section, i) => (
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
                  moduleSlug={mod.slug}
                  showHeading={false}
                  courseId={WIP_COURSE_ID}
                />
              </div>
            </details>
          ))}
        </div>
      )}

      {(applied.length > 0 || missing.length > 0) && (
        <aside className="wip-fixes">
          <h2>Content corrections proposed on this page</h2>
          <ol>
            {applied.map((c, i) => (
              <li key={i}>
                <p className="wip-fix-diff">
                  <del>{c.was}</del> <ins>{c.now}</ins>
                </p>
                <p className="wip-fix-why">{c.why}</p>
                {c.frKeys > 0 && (
                  <p className="wip-fix-fr">
                    Shipping this renames {c.frKeys} key{c.frKeys > 1 ? 's' : ''} in
                    open-harness.fr.json, which is keyed on the English string.
                  </p>
                )}
              </li>
            ))}
          </ol>
          {missing.length > 0 && (
            <p className="wip-fix-stale">
              {missing.length} correction(s) no longer match the source. Either they were
              fixed upstream, or the text moved: check before trusting this list.
            </p>
          )}
        </aside>
      )}

      <ModuleNav module={mod} lang="en" basePath={WIP_COURSE_BASE} />

      <PinLayer />

      <div className="course-proof mt-16">
        <h2 className="course-h3">Proof</h2>
        <InteractiveChecklist
          courseId={WIP_COURSE_ID}
          moduleSlug={mod.slug}
          sectionKey="module-proof"
          items={[t(mod.proof, 'en')]}
          accent="cyan"
          mode="proof"
          lang="en"
        />
        <MarkCompleteButton courseId={WIP_COURSE_ID} slug={mod.slug} accent="orange" lang="en" />
      </div>
    </article>
  );
}
