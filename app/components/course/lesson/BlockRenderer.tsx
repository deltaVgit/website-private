'use client';

import Link from 'next/link';
import { withBasePath } from '@/lib/site';
import { hrefFor } from '@/lib/i18n';
import { t, UI_COPY, type CourseBlock, type CourseLang, type CourseLink } from '@/app/data/courses/open-harness';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { CourseQuizBlock, InteractiveChecklist } from '@/app/components/course/CourseLearning';
import { HarnessModuleVisual } from '@/app/components/course/CourseVisuals';
import { CopyCards } from '@/app/components/course/CopyCards';
import { CourseTweet } from '@/app/components/course/CourseTweet';
import { CourseShot } from '@/app/components/course/CourseShot';
import { CourseCode } from './CourseCode';
import { CourseSteps } from './CourseSteps';

/**
 * Stable anchor for a lexicon card, derived from the English term so a deep
 * link keeps working whatever the reading language.
 */
export function lexiconAnchor(term: string): string {
  return `term-${term
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60)}`;
}

/**
 * One block, one case. The `never` default is the point of this file: adding a
 * kind to CourseBlock without handling it here is a compile error, instead of a
 * section that silently renders nothing — which is exactly how `paths` and
 * `termChips` stayed dead for months.
 */
export function BlockRenderer({
  block,
  lang,
  moduleSlug,
  /**
   * Which course the checkbox state belongs to. Defaults to the real course,
   * so every existing caller keeps its progress keys untouched. The visual lab
   * passes its own id so ticking a box in a mock-up never marks the real
   * lesson as done.
   */
  courseId = 'open-harness',
}: {
  block: CourseBlock;
  lang: CourseLang;
  moduleSlug: string;
  courseId?: string;
}) {
  switch (block.k) {
    case 'p':
      return (
        <p className={block.lead ? 'course-lead' : 'course-p'}>
          {formatCourseText(t(block.text, lang), lang)}
        </p>
      );

    case 'list':
      return (
        <ul className="course-list">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="course-bullet-mark" aria-hidden>
                ·
              </span>
              <span>{formatCourseText(t(item, lang), lang)}</span>
            </li>
          ))}
        </ul>
      );

    case 'code':
      return <CourseCode block={block.block} lang={lang} />;

    case 'steps':
      // CourseSteps renders each step's command with its own copy button —
      // the previous mapping to InteractiveChecklist dropped `step.code`
      // silently, which is how the $PDD commands never reached the page.
      return (
        <CourseSteps
          courseId={courseId}
          moduleSlug={moduleSlug}
          sectionKey={block.id}
          items={block.items}
          lang={lang}
        />
      );

    case 'checklist':
      return (
        <InteractiveChecklist
          courseId={courseId}
          moduleSlug={moduleSlug}
          sectionKey={block.id}
          items={block.items.map((i) => t(i, lang))}
          lang={lang}
        />
      );

    case 'callout':
      return (
        <div
          className={`course-callout ${
            block.variant === 'warning'
              ? 'course-callout--warn'
              : block.variant === 'quote'
                ? 'course-callout--quote'
                : ''
          }`}
        >
          {formatCourseText(t(block.text, lang), lang)}
        </div>
      );

    case 'table':
      return (
        <div className="course-table-wrap overflow-x-auto">
          <table className="course-table">
            <thead>
              <tr>
                {block.headers.map((h, i) => (
                  <th key={i}>{formatCourseText(t(h, lang), lang)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{formatCourseText(t(cell, lang), lang)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'quiz':
      return (
        <CourseQuizBlock
          question={t(block.quiz.question, lang)}
          options={block.quiz.options.map((o) => t(o, lang))}
          correct={t(block.quiz.correct, lang)}
          explain={t(block.quiz.explain, lang)}
          label={t(UI_COPY.quiz, lang)}
          lang={lang}
        />
      );

    case 'lexicon':
      return (
        <div className="course-grid grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {block.cards.map((card, i) => (
            <article
              key={i}
              id={lexiconAnchor(t(card.term, 'en'))}
              className="course-lex-card course-r-sm border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 flex flex-col"
            >
              <h3 className="course-lex-term">{t(card.term, lang)}</h3>
              <p className="mt-3 course-t-small text-[var(--text-secondary)] flex-1">
                {formatCourseText(t(card.body, lang), lang)}
              </p>
              <p className="mt-4 pt-4 course-t-meta italic text-[var(--text-tertiary)] border-t border-[var(--border-subtle)]">
                {formatCourseText(t(card.remember, lang), lang)}
              </p>
            </article>
          ))}
        </div>
      );

    case 'links':
      return (
        <div className="course-links">
          <div className="course-links-label">
            {block.label ? t(block.label, lang) : t(UI_COPY.goFurther, lang)}
          </div>
          <ul className="course-links-list">
            {block.items.map((link, i) => (
              <li key={i}>
                <LinkItem link={link} lang={lang} />
              </li>
            ))}
          </ul>
        </div>
      );

    case 'refs':
      return (
        <details className="course-refs">
          <summary className="course-refs-summary">
            <span className="course-advanced-chevron" aria-hidden>
              ▸
            </span>
            <span>Sources</span>
          </summary>
          <div className="course-refs-body">
            {block.primary && (
              <ul className="course-links-list">
                {block.primary.map((link, i) => (
                  <li key={i}>
                    <LinkItem link={link} lang={lang} />
                  </li>
                ))}
              </ul>
            )}
            {block.citations && (
              <p className="course-citations course-t-meta font-mono text-[var(--text-muted)]">
                {block.citations.map((c) => t(c, lang)).join(' · ')}
              </p>
            )}
          </div>
        </details>
      );

    case 'figure':
      return <HarnessModuleVisual slug={moduleSlug} variant={block.variant} />;

    case 'copycards':
      return <CopyCards items={block.items} />;

    case 'tweet':
      return (
        <CourseTweet
          id={block.id}
          author={block.author}
          href={block.href}
          height={block.height}
          caption={block.caption ? formatCourseText(t(block.caption, lang), lang) : undefined}
        />
      );

    case 'image':
      return (
        <CourseShot
          src={block.src}
          alt={t(block.alt, lang)}
          width={block.width}
          height={block.height}
          caption={block.caption ? formatCourseText(t(block.caption, lang), lang) : undefined}
        />
      );

    default: {
      // Exhaustiveness guard — see the comment above.
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

function LinkItem({ link, lang }: { link: CourseLink; lang: CourseLang }) {
  const label = t(link.label, lang);
  if (link.href.startsWith('http')) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className="course-links-item">
        <span>{label}</span>
        <span className="course-links-arrow" aria-hidden>
          ↗
        </span>
      </a>
    );
  }
  if (link.href.startsWith('/courses/')) {
    return (
      <a href={withBasePath(link.href)} className="course-links-item" download>
        <span>{label}</span>
        <span className="course-links-arrow" aria-hidden>
          ↓
        </span>
      </a>
    );
  }
  return (
    <Link href={hrefFor(link.href, lang)} className="course-links-item">
      <span>{label}</span>
      <span className="course-links-arrow" aria-hidden>
        →
      </span>
    </Link>
  );
}
