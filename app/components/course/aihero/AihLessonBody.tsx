'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  OPEN_HARNESS_MODULES,
  UI_COPY,
  courseBase,
  t,
  type CourseBlock,
  type CourseLang,
  type CourseModule,
  type LocaleString,
} from '@/app/data/courses/open-harness';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import type { CourseProgressId } from '@/lib/course-progress';
import { HarnessModuleVisual } from '@/app/components/course/CourseVisuals';
import { ModuleNav, useOpenHarnessLang } from '@/app/components/course/CourseShell';
import { CourseCode } from '@/app/components/course/lesson/CourseCode';
import { LessonSection } from '@/app/components/course/lesson/LessonSection';
import { BlockRenderer } from '@/app/components/course/lesson/BlockRenderer';
import { HeadingGlyph } from '@/app/components/course/kit/Glyph';

/**
 * The lesson body, wearing the layout that won the /wip lab: the spine.
 *
 * Reading model: the lesson is a single thread, drawn. A 2px line runs down
 * the left of the reading column and every section hangs off it as a numbered
 * node; visuals hang off it too, but as wider nodes pulled back towards the
 * line, so the eye tells argument from evidence before reading a word.
 *
 * The line is also the progress bar. An IntersectionObserver marks a section
 * read once its bottom crosses the 45% line of the viewport, which fills that
 * section's segment and its node in the accent colour. Look at the gutter and
 * you know how much of the lesson is behind you — no widget, no percentage:
 * the structure IS the read-out.
 *
 * Headings carry a glyph but no ordinal — the right-rail "On this page" list
 * already numbers the sections, and the spine nodes carry the count.
 */

type VisualKind = 'image' | 'figure' | 'tweet';
type VisualBlock = Extract<CourseBlock, { k: VisualKind }>;

/** Short, honest tag for the node — the block kind, not invented prose. */
const VISUAL_TAG: Record<VisualKind, string> = { image: 'IMG', figure: 'FIG', tweet: 'POST' };

function isVisual(block: CourseBlock): block is VisualBlock {
  return block.k === 'image' || block.k === 'figure' || block.k === 'tweet';
}

type Run = { kind: 'prose'; blocks: CourseBlock[] } | { kind: 'visual'; block: VisualBlock };

/**
 * Split a section into prose runs and single visuals, keeping the author's
 * order. Everything that is not one of the three visual kinds stays in the
 * flow and is rendered by the block engine — a table or a lexicon grid is
 * prose furniture here, not evidence hanging off the thread.
 */
function toRuns(blocks: CourseBlock[] | undefined): Run[] {
  const runs: Run[] = [];
  for (const block of blocks ?? []) {
    if (isVisual(block)) {
      runs.push({ kind: 'visual', block });
      continue;
    }
    const last = runs[runs.length - 1];
    if (last && last.kind === 'prose') last.blocks.push(block);
    else runs.push({ kind: 'prose', blocks: [block] });
  }
  return runs;
}

/** Where a section stops counting as "ahead of you". 0.45 = just above centre. */
const READ_LINE = 0.45;

/**
 * Which sections are behind the reader.
 *
 * The observer is the trigger, not the source of truth: any intersection
 * change recomputes every section from geometry, so a fast scroll or an
 * anchor jump that skips a boundary still lands on the correct state instead
 * of leaving a stale hollow node half way up the page.
 */
function useSpineProgress(count: number, slug: string) {
  const rows = useRef<Array<HTMLElement | null>>([]);
  const [done, setDone] = useState<boolean[]>(() => new Array(count).fill(false));

  // Two lessons with the same section count keep the same identities, so the
  // recompute effect would not re-run and the spine would paint fully read on
  // arrival. Reset on the slug, not the count.
  useEffect(() => {
    setDone(new Array(count).fill(false));
  }, [slug, count]);

  const setters = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => (el: HTMLElement | null) => {
        rows.current[i] = el;
      }),
    [count],
  );

  const recompute = useCallback(() => {
    const line = window.innerHeight * READ_LINE;
    setDone((prev) => {
      const next = Array.from({ length: count }, (_, i) => {
        const el = rows.current[i];
        return !!el && el.getBoundingClientRect().bottom <= line;
      });
      const same = next.length === prev.length && next.every((v, i) => v === prev[i]);
      return same ? prev : next;
    });
  }, [count]);

  useEffect(() => {
    rows.current.length = count;
    if (!count || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(() => recompute(), {
      threshold: Array.from({ length: 21 }, (_, i) => i / 20),
    });
    rows.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    recompute();
    window.addEventListener('resize', recompute, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', recompute);
    };
  }, [count, recompute]);

  return { done, setters };
}

export type LessonSeries = {
  modules: CourseModule[];
  courseId: string;
  seriesLabel: LocaleString;
  navBasePath: string;
  indexHref?: string;
  indexLabel?: LocaleString;
  endHref?: string;
  endLabel?: LocaleString;
};

export function AihLessonBody({
  module,
  series,
}: {
  module: CourseModule;
  series?: LessonSeries;
}) {
  const lang = useOpenHarnessLang();
  return <AihLessonBodyView module={module} lang={lang} series={series} />;
}

export function AihLessonBodyView({
  module,
  lang,
  series,
}: {
  module: CourseModule;
  lang: CourseLang;
  series?: LessonSeries;
}) {
  const catalog = series?.modules ?? OPEN_HARNESS_MODULES;
  const courseId = series?.courseId ?? 'open-harness';
  const index = catalog.findIndex((m) => m.slug === module.slug) + 1;
  const seriesTitle = series
    ? t(series.seriesLabel, lang)
    : `${t(UI_COPY.backCourse, lang)} — ${t(UI_COPY.part, lang)} ${module.part === 1 ? 'I' : 'II'}`;
  const main = useMemo(() => module.sections.filter((s) => !s.advanced), [module]);
  const advanced = module.sections.filter((s) => s.advanced);

  const placement = module.visualPlacement ?? 'top';
  const showTopVisual = placement === 'top';
  const visualAfterIndex = typeof placement === 'number' ? placement : -1;

  const runs = useMemo(() => main.map((s) => toRuns(s.blocks)), [main]);
  const { done, setters } = useSpineProgress(main.length, module.slug);

  const headings = useRef<Array<HTMLHeadingElement | null>>([]);
  const headingSetters = useMemo(
    () =>
      Array.from({ length: main.length }, (_, i) => (el: HTMLHeadingElement | null) => {
        headings.current[i] = el;
      }),
    [main.length],
  );

  const jump = useCallback((i: number) => {
    const el = headings.current[i];
    if (!el) return;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
  }, []);

  const readCount = done.filter(Boolean).length;
  const current = done.indexOf(false);
  const allRead = main.length > 0 && readCount === main.length;
  const stateOf = (i: number) => (done[i] ? 'done' : i === current ? 'active' : 'ahead');

  return (
    <article className="course-prose course-spine">
      <div className="course-spine-track">
        <header className="course-spine-row course-spine-head" data-state="done">
          <span className="course-spine-marker" aria-hidden>
            <span className="course-spine-cap" />
          </span>

          <div className="course-meta">
            <span className="course-meta-num">
              {index} / {catalog.length}
            </span>
            <span aria-hidden>·</span>
            <span>
              {seriesTitle} · {module.minutes} {t(UI_COPY.minReadLong, lang)}
            </span>
          </div>
          <h1 className="course-h1 mt-4">{t(module.title, lang)}</h1>
          <p className="course-deck mt-4">{formatCourseText(t(module.subtitle, lang), lang)}</p>

          {module.hero && (
            <div className="mt-8">
              <CourseCode block={module.hero} lang={lang} />
            </div>
          )}

          {showTopVisual && (
            <div className="mt-10">
              <HarnessModuleVisual slug={module.slug} />
            </div>
          )}

          {main.length > 0 && (
            <p className="course-spine-readout">
              <span className="course-spine-readout-num">
                {String(readCount).padStart(2, '0')}
              </span>
              <span>
                {t(UI_COPY.spineBehind, lang).replace(
                  '%TOTAL%',
                  String(main.length).padStart(2, '0'),
                )}
              </span>
            </p>
          )}
        </header>

        {main.map((section, i) => (
          <section
            key={i}
            ref={setters[i]}
            data-state={stateOf(i)}
            className="course-spine-row course-spine-sec"
          >
            <span className="course-spine-marker">
              <button
                type="button"
                className="course-spine-node"
                onClick={() => jump(i)}
                aria-label={`${t(UI_COPY.backToSection, lang)} ${i + 1}: ${t(section.heading, lang)}`}
              >
                <span aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              </button>
            </span>

            {/* The glyph is matched on the English heading: the icon map reads
                meaning, and it reads it in one language. `course-h2` is
                load-bearing — OnThisPage builds the right rail from it. */}
            <h2 className="course-h2" ref={headingSetters[i]}>
              <HeadingGlyph heading={t(section.heading, 'en')} /> {t(section.heading, lang)}
            </h2>

            <div className="course-spine-body">
              {runs[i].map((run, ri) =>
                run.kind === 'prose' ? (
                  <div key={ri} className="course-blocks">
                    {run.blocks.map((block, bi) => (
                      <BlockRenderer
                        key={bi}
                        block={block}
                        lang={lang}
                        moduleSlug={module.slug}
                        courseId={courseId}
                      />
                    ))}
                  </div>
                ) : (
                  <div key={ri} className="course-spine-visual">
                    <span className="course-spine-vnode" aria-hidden>
                      {VISUAL_TAG[run.block.k]}
                    </span>
                    <div className="course-blocks">
                      <BlockRenderer
                        block={run.block}
                        lang={lang}
                        moduleSlug={module.slug}
                        courseId={courseId}
                      />
                    </div>
                  </div>
                ),
              )}
              {visualAfterIndex === i && (
                <div className="mt-10">
                  <HarnessModuleVisual slug={module.slug} />
                </div>
              )}
            </div>
          </section>
        ))}

        <div
          className="course-spine-row course-spine-end"
          data-state={allRead ? 'done' : 'ahead'}
        >
          <span className="course-spine-marker" aria-hidden>
            <span className="course-spine-cap course-spine-cap--end" />
          </span>

          {advanced.length > 0 && (
            <div className="mb-14 space-y-3">
              <h2 className="course-h3">{t(UI_COPY.otherDeploy, lang)}</h2>
              {advanced.map((section, i) => (
                <details key={i} className="course-advanced-details">
                  <summary className="course-advanced-summary">
                    <span className="course-advanced-chevron" aria-hidden>
                      ▸
                    </span>
                    <span>{t(section.heading, lang)}</span>
                  </summary>
                  <div className="course-advanced-body">
                    <LessonSection
                      section={section}
                      lang={lang}
                      moduleSlug={module.slug}
                      showHeading={false}
                    />
                  </div>
                </details>
              ))}
            </div>
          )}

          <div className="course-proof">
            <h2 className="course-h3">{t(UI_COPY.proof, lang)}</h2>
            <InteractiveChecklist
              courseId={courseId}
              moduleSlug={module.slug}
              sectionKey="module-proof"
              items={[t(module.proof, lang)]}
              accent="cyan"
              mode="proof"
              lang={lang}
            />
            <MarkCompleteButton
              courseId={courseId as CourseProgressId}
              slug={module.slug}
              accent="orange"
              lang={lang}
            />
          </div>
        </div>
      </div>

      <ModuleNav
        module={module}
        lang={lang}
        basePath={series?.navBasePath ?? courseBase(lang)}
        catalog={catalog}
        indexHref={series?.indexHref}
        indexLabel={series?.indexLabel}
        endHref={series?.endHref}
        endLabel={series?.endLabel}
      />
    </article>
  );
}
