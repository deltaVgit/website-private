'use client';

import Link from 'next/link';
import { useOpenHarnessLang } from '@/app/components/course/CourseShell';
import { CoursePrivacyNote } from '@/app/components/course/CourseLearning';
import { LabsLandingVisual } from '@/app/components/course/CourseVisuals';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import {
  HARNESS_LABS,
  HARNESS_LABS_META,
  LABS_INDEX_COPY,
  labsT,
} from '@/app/data/courses/harness-labs';
import { courseBase, t } from '@/app/data/courses/open-harness';

const levelCopy = {
  'after-part-i': LABS_INDEX_COPY.afterPartI,
  'after-part-ii': LABS_INDEX_COPY.afterPartII,
  advanced: LABS_INDEX_COPY.advanced,
} as const;

/**
 * Harness Labs index — same bilingual pattern as AihLanding: one body,
 * language from the course chrome (EN at /labs/, FR at /fr/.../labs/).
 */
export function LabsLanding() {
  const lang = useOpenHarnessLang();
  const base = courseBase(lang);

  return (
    <article className="course-prose">
      <div className="course-meta">
        <span className="course-meta-num">＋</span>
        <span aria-hidden>·</span>
        <span>{t(LABS_INDEX_COPY.kicker, lang)}</span>
      </div>
      <h1 className="course-h1 mt-4">{t(HARNESS_LABS_META.title, lang)}</h1>
      <CoursePrivacyNote className="mt-4" />
      <p className="mt-6 max-w-2xl text-xl text-[var(--text-secondary)] leading-relaxed">
        {t(HARNESS_LABS_META.tagline, lang)}
      </p>
      <p className="mt-4 max-w-2xl text-[var(--text-secondary)] leading-relaxed">
        {t(HARNESS_LABS_META.description, lang)}
      </p>

      <div className="mt-6 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 max-w-2xl">
        <div className="font-mono text-[10px] tracking-[2px] uppercase text-[var(--accent-cyan)]">
          {t(LABS_INDEX_COPY.assumesLabel, lang)}
        </div>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          {formatCourseText(t(LABS_INDEX_COPY.assumesBody, lang), lang)}
        </p>
        <Link href={base} className="mt-3 inline-block text-sm font-medium text-[var(--course-accent)]">
          {t(LABS_INDEX_COPY.courseCta, lang)}
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`${base}00/`} className="button-primary">
          {t(LABS_INDEX_COPY.startMastery, lang)}
        </Link>
        <Link href="/forge/course/open-design/" className="button-secondary">
          Open Design
        </Link>
      </div>

      <section className="mt-12" aria-labelledby="labs-glance">
        <h2 id="labs-glance" className="course-h2">
          {t(LABS_INDEX_COPY.glance, lang)}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          {t(LABS_INDEX_COPY.glanceBlurb, lang)}
        </p>
        <LabsLandingVisual
          title={t(LABS_INDEX_COPY.threeLayers, lang)}
          steps={[
            { label: t(LABS_INDEX_COPY.masteryLayer, lang), detail: t(LABS_INDEX_COPY.masteryDetail, lang) },
            { label: t(LABS_INDEX_COPY.labsLayer, lang), detail: t(LABS_INDEX_COPY.labsDetail, lang) },
            { label: t(LABS_INDEX_COPY.skillsLayer, lang), detail: t(LABS_INDEX_COPY.skillsDetail, lang) },
          ]}
        />
      </section>

      <div className="mt-14 divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
        {HARNESS_LABS.map((lab) => (
          <Link
            key={lab.slug}
            href={`${base}labs/${lab.slug}/`}
            className="forge-course-link group grid md:grid-cols-[4rem_minmax(0,1fr)_8rem] gap-4 py-6"
          >
            <span className="font-mono text-xs text-[var(--course-accent)]">{lab.number}</span>
            <span>
              <h2 className="text-lg font-semibold group-hover:text-[var(--course-accent)]">
                {labsT(lab.title, lang)}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{labsT(lab.subtitle, lang)}</p>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                {t(LABS_INDEX_COPY.requires, lang)}: {labsT(lab.requires, lang)}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[1px] text-[var(--text-muted)]">
                  {t(levelCopy[lab.level], lang)}
                </span>
                {lab.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border-default)] px-2 py-0.5 text-[10px] text-[var(--text-tertiary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)] self-center">
              ~{lab.minutes} min
            </span>
          </Link>
        ))}
      </div>
    </article>
  );
}
