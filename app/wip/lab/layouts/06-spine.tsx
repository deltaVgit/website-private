'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BlockRenderer } from '@/app/components/course/lesson/BlockRenderer';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import { t, type CourseBlock } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID, type LayoutProps, lessonSections } from '../types';
import { AdvancedTail } from '../AdvancedTail';
import { ProviderStrip, HeadingGlyph } from '../kit/Glyph';
import './06-spine.css';

/**
 * 06 — Vertical spine.
 *
 * Reading model: the lesson is a single thread, drawn. A 2px line runs down the
 * left of the whole reading column and every section hangs off it as a numbered
 * node; visuals hang off it too, but as wider nodes pulled back towards the
 * line, so the eye tells argument from evidence before reading a word.
 *
 * The line is also the progress bar. An IntersectionObserver marks a section
 * read once its bottom crosses the 45% line of the viewport, which fills that
 * section's segment and its node in the accent colour. Look at the gutter and
 * you know how much of the lesson is behind you — no widget, no percentage:
 * the structure IS the read-out.
 *
 * The node of the section you are in is sticky, so it rides down the line while
 * you read and the number of where you are is always in the gutter. It is a
 * real button, and it takes you back to the top of that section.
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
 * order. Everything that is not one of the three visual kinds stays in the flow
 * and is rendered by the real block engine — a table or a lexicon grid is prose
 * furniture here, not evidence hanging off the thread.
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
 * The observer is the trigger, not the source of truth: any intersection change
 * recomputes every section from geometry, so a fast scroll or an anchor jump
 * that skips a boundary still lands on the correct state instead of leaving a
 * stale hollow node half way up the page.
 */
function useSpineProgress(count: number, slug: string) {
  const rows = useRef<Array<HTMLElement | null>>([]);
  const [done, setDone] = useState<boolean[]>(() => new Array(count).fill(false));

  // Two lessons with the same section count kept the same identities, so the
  // recompute effect did not re-run and the spine painted fully read on
  // arrival. Modules 07 and 09 both have five sections.
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

export default function SpineLayout({ module: mod, index, total, partTitle }: LayoutProps) {
  const { main: sections, advanced } = lessonSections(mod);
  const runs = useMemo(() => sections.map((s) => toRuns(s.blocks)), [sections]);
  const { done, setters } = useSpineProgress(sections.length, mod.slug);

  const headings = useRef<Array<HTMLHeadingElement | null>>([]);
  const headingSetters = useMemo(
    () =>
      Array.from({ length: sections.length }, (_, i) => (el: HTMLHeadingElement | null) => {
        headings.current[i] = el;
      }),
    [sections.length],
  );

  const jump = useCallback((i: number) => {
    const el = headings.current[i];
    if (!el) return;
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    el.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
  }, []);

  const readCount = done.filter(Boolean).length;
  const current = done.indexOf(false);
  const allRead = sections.length > 0 && readCount === sections.length;
  const stateOf = (i: number) => (done[i] ? 'done' : i === current ? 'active' : 'ahead');

  return (
    <article className="course-prose lay-spine">
      <div className="lay-spine-track">
        <header className="lay-spine-row lay-spine-head" data-state="done">
          <span className="lay-spine-marker" aria-hidden>
            <span className="lay-spine-cap" />
          </span>

          <p className="course-meta">
            <span className="course-meta-num">
              {String(index + 1).padStart(2, '0')} / {total}
            </span>
            {partTitle ? ` · ${partTitle}` : ''} · {mod.minutes} min read
          </p>

          <h1 className="course-h1">{t(mod.title, 'en')}</h1>
          {mod.subtitle && (
            <p className="course-lead">{formatCourseText(t(mod.subtitle, 'en'), 'en')}</p>
          )}

          {/* Only the providers this lesson genuinely names. */}
          <ProviderStrip module={mod} />

          {mod.hero && (
            <div className="course-blocks lay-spine-hero">
              <BlockRenderer
                block={{ k: 'code', block: mod.hero }}
                lang="en"
                moduleSlug={mod.slug}
                courseId={LAB_COURSE_ID}
              />
            </div>
          )}

          {sections.length > 0 && (
            <p className="lay-spine-readout">
              <span className="lay-spine-readout-num">{String(readCount).padStart(2, '0')}</span>
              <span>of {String(sections.length).padStart(2, '0')} sections behind you</span>
            </p>
          )}
        </header>

        {sections.map((section, i) => (
          <section
            key={i}
            ref={setters[i]}
            data-state={stateOf(i)}
            className="lay-spine-row lay-spine-sec"
          >
            <span className="lay-spine-marker">
              <button
                type="button"
                className="lay-spine-node"
                onClick={() => jump(i)}
                aria-label={`Back to section ${i + 1}: ${t(section.heading, 'en')}`}
              >
                <span aria-hidden>{String(i + 1).padStart(2, '0')}</span>
              </button>
            </span>

            <h2 className="course-h2" ref={headingSetters[i]}>
              <HeadingGlyph heading={t(section.heading, 'en')} />{' '}
              {t(section.heading, 'en')}
            </h2>

            <div className="lay-spine-body">
              {runs[i].map((run, ri) =>
                run.kind === 'prose' ? (
                  <div key={ri} className="course-blocks">
                    {run.blocks.map((block, bi) => (
                      <BlockRenderer
                        key={bi}
                        block={block}
                        lang="en"
                        moduleSlug={mod.slug}
                        courseId={LAB_COURSE_ID}
                      />
                    ))}
                  </div>
                ) : (
                  <div key={ri} className="lay-spine-visual">
                    <span className="lay-spine-vnode" aria-hidden>
                      {VISUAL_TAG[run.block.k]}
                    </span>
                    <div className="course-blocks">
                      <BlockRenderer
                        block={run.block}
                        lang="en"
                        moduleSlug={mod.slug}
                        courseId={LAB_COURSE_ID}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        ))}

        <div className="lay-spine-row lay-spine-end" data-state={allRead ? 'done' : 'ahead'}>
          <span className="lay-spine-marker" aria-hidden>
            <span className="lay-spine-cap lay-spine-cap--end" />
          </span>
          {/* Advanced sections are published content: the live lesson folds them
              into a details tail rather than hiding them. Dropping them made this
              layout look shorter than its peers for reasons that were not about
              the layout at all. */}
          <AdvancedTail sections={advanced} moduleSlug={mod.slug} />

          <div className="course-proof">
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
        </div>
      </div>
    </article>
  );
}
