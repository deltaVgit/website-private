'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BlockRenderer } from '@/app/components/course/lesson/BlockRenderer';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import { t, type CourseBlock, type CourseSection } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID, type LayoutProps } from '../types';
import { ProviderStrip, HeadingGlyph } from '../kit/Glyph';
import './10-dense.css';

/**
 * 10 — Dense, reference mode.
 *
 * Not a first read. This is the page you open six weeks later because you
 * cannot remember which flag went where, and every design decision follows
 * from that one reader:
 *
 * - Prose runs at 14px in two short columns per run, so a section that took
 *   four screens in the control takes one. Tables, commands, quizzes and card
 *   grids break out of the columns at full width, newspaper-style, because
 *   they are the things you actually came back for.
 * - Screenshots stop being illustrations and become a contact sheet: a row of
 *   small plates you click to open at full size. Ten of them (lesson 03) cost
 *   two rows instead of ten screens.
 * - A sticky mini-index of the section titles carries a content signature per
 *   section (commands / table / visuals / quiz / checklist), so you can aim
 *   before you scroll. It tracks the section you are in.
 * - Nothing is folded away, and `advanced` sections — hidden in every other
 *   proposal — are shown here with a tag. A reference that hides half the
 *   install options is not a reference.
 */

/** Kinds that read as running prose and can share a column. */
const FLOW: ReadonlySet<CourseBlock['k']> = new Set<CourseBlock['k']>(['p', 'list', 'callout']);

type ImageBlock = Extract<CourseBlock, { k: 'image' }>;

type Run =
  | { kind: 'flow'; blocks: CourseBlock[] }
  | { kind: 'plates'; blocks: ImageBlock[] }
  | { kind: 'wide'; block: CourseBlock };

/**
 * Consecutive prose becomes one two-column run; consecutive screenshots become
 * one contact sheet; everything else stands alone at full width. Grouping is
 * the whole layout — the rest is type scale.
 */
function group(blocks: readonly CourseBlock[]): Run[] {
  const runs: Run[] = [];
  for (const block of blocks) {
    const last = runs[runs.length - 1];
    if (block.k === 'image') {
      if (last && last.kind === 'plates') last.blocks.push(block);
      else runs.push({ kind: 'plates', blocks: [block] });
    } else if (FLOW.has(block.k)) {
      if (last && last.kind === 'flow') last.blocks.push(block);
      else runs.push({ kind: 'flow', blocks: [block] });
    } else {
      runs.push({ kind: 'wide', block });
    }
  }
  return runs;
}

/** Rough character count of a prose run — two columns of one short line looks broken. */
function weight(blocks: readonly CourseBlock[]): number {
  let n = 0;
  for (const b of blocks) {
    if (b.k === 'p' || b.k === 'callout') n += t(b.text, 'en').length;
    else if (b.k === 'list') n += b.items.reduce((a, i) => a + t(i, 'en').length, 0);
  }
  return n;
}

type Badge = { glyph: string; label: string };

/** What is inside a section, as four glyphs you can read at 10px. */
function signature(section: CourseSection): Badge[] {
  const kinds = new Set((section.blocks ?? []).map((b) => b.k));
  const out: Badge[] = [];
  if (kinds.has('code') || kinds.has('steps')) out.push({ glyph: '⌘', label: 'commands' });
  if (kinds.has('table')) out.push({ glyph: '▦', label: 'table' });
  if (kinds.has('image') || kinds.has('figure') || kinds.has('tweet'))
    out.push({ glyph: '▣', label: 'visuals' });
  if (kinds.has('quiz')) out.push({ glyph: '?', label: 'quiz' });
  if (kinds.has('checklist')) out.push({ glyph: '✓', label: 'checklist' });
  return out;
}

const pad = (n: number) => String(n).padStart(2, '0');
const secId = (i: number) => `dense-s${pad(i + 1)}`;

export default function DenseLayout({ module: mod, index, total, partTitle }: LayoutProps) {
  /** Reference mode shows the advanced sections too — see the header comment. */
  const sections = useMemo(() => mod.sections ?? [], [mod.sections]);
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState('');

  // secId(i) yields the same dense-sNN in every lesson, so a stale value marks
  // whatever section happens to sit at that index in the next one.
  useEffect(() => {
    setActive('');
  }, [mod.slug]);

  const stats = useMemo(() => {
    let cmd = 0;
    let tables = 0;
    let shots = 0;
    let quizzes = 0;
    for (const section of sections) {
      for (const b of section.blocks ?? []) {
        if (b.k === 'code') cmd += 1;
        else if (b.k === 'steps') cmd += b.items.filter((s) => s.code).length;
        else if (b.k === 'table') tables += 1;
        else if (b.k === 'image' || b.k === 'figure') shots += 1;
        else if (b.k === 'quiz') quizzes += 1;
      }
    }
    return [
      { n: sections.length, k: 'sections' },
      { n: cmd, k: 'commands' },
      { n: tables, k: 'tables' },
      { n: shots, k: 'visuals' },
      { n: quizzes, k: 'quizzes' },
    ].filter((s) => s.n > 0);
  }, [sections]);

  /**
   * The lab picker is sticky at 4rem and wraps to two rows on narrow screens,
   * so the mini-index cannot hard-code where it stops. Measure it instead;
   * the CSS fallback covers the no-JS / no-picker case.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const picker = document.querySelector('.lab-picker');
    if (!picker) return;
    const apply = () => {
      root.style.setProperty('--lay-dense-top', `${64 + picker.getBoundingClientRect().height}px`);
    };
    apply();
    window.addEventListener('resize', apply);
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(apply);
      ro.observe(picker);
    }
    return () => {
      window.removeEventListener('resize', apply);
      ro?.disconnect();
    };
  }, []);

  /** Which section you are in, mirrored back into the sticky index. */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const heads = Array.from(root.querySelectorAll<HTMLElement>('.lay-dense-h'));
    if (heads.length < 2 || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive((e.target as HTMLElement).id);
      },
      { rootMargin: '-180px 0px -68% 0px' },
    );
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [mod.slug]);

  return (
    <article ref={rootRef} className="course-prose lay-dense-root">
      <header className="lay-dense-head">
        <div className="lay-dense-ident">
          <p className="lay-dense-id">
            <b>
              {pad(index + 1)} / {pad(total)}
            </b>
            {partTitle ? <span> · {partTitle}</span> : null}
            <span> · {mod.minutes} min</span>
            <span> · reference mode</span>
          </p>
          <h1 className="lay-dense-title">{t(mod.title, 'en')}</h1>
          {mod.subtitle && (
            <p className="lay-dense-sub">{formatCourseText(t(mod.subtitle, 'en'), 'en')}</p>
          )}
        </div>

        {/* Only the providers this lesson genuinely names. */}
        <ProviderStrip module={mod} size={15} />

        {stats.length > 0 && (
          <dl className="lay-dense-stats">
            {stats.map((s) => (
              <div key={s.k} className="lay-dense-stat">
                <dt className="lay-dense-stat-k">{s.k}</dt>
                <dd className="lay-dense-stat-n">{s.n}</dd>
              </div>
            ))}
          </dl>
        )}
      </header>

      {sections.length > 0 && (
        <nav className="lay-dense-index" aria-label="Section index">
          <span className="lay-dense-index-label" aria-hidden>
            Index
          </span>
          <ol className="lay-dense-index-list">
            {sections.map((section, i) => {
              const id = secId(i);
              const badges = signature(section);
              const heading = t(section.heading, 'en');
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`lay-dense-index-link${active === id ? ' is-active' : ''}`}
                    aria-current={active === id ? 'true' : undefined}
                    aria-label={
                      badges.length
                        ? `${heading} — contains ${badges.map((b) => b.label).join(', ')}`
                        : heading
                    }
                  >
                    <span className="lay-dense-index-num" aria-hidden>
                      {pad(i + 1)}
                    </span>
                    <span aria-hidden>{heading}</span>
                    {badges.length > 0 && (
                      <span className="lay-dense-index-sig" aria-hidden>
                        {badges.map((b) => b.glyph).join('')}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <div className="lay-dense-body">
        {mod.hero && (
          <div className="lay-dense-wide lay-dense-wide--code">
            <BlockRenderer
              block={{ k: 'code', block: mod.hero }}
              lang="en"
              moduleSlug={mod.slug}
              courseId={LAB_COURSE_ID}
            />
          </div>
        )}

        {sections.map((section, i) => {
          const runs = group(section.blocks ?? []);
          return (
            <section key={secId(i)} className="lay-dense-sec">
              {/* The number is a CSS counter and the tag sits outside the
                  heading: OnThisPage builds the right rail from h.textContent,
                  which ignores aria-hidden, so anything inside the h2 ends up
                  glued into the rail entry. */}
              <div className="lay-dense-h-row">
                <h2 id={secId(i)} className="course-h2 lay-dense-h">
                  <HeadingGlyph heading={t(section.heading, 'en')} />{' '}
                  {t(section.heading, 'en')}
                </h2>
                {section.advanced && <span className="lay-dense-h-tag">advanced</span>}
              </div>

              {runs.map((run, ri) => {
                if (run.kind === 'plates') {
                  return (
                    <div key={ri} className="lay-dense-plates-wrap">
                      <p className="lay-dense-plates-label">
                        {run.blocks.length} {run.blocks.length > 1 ? 'screenshots' : 'screenshot'} ·
                        click to enlarge
                      </p>
                      <div className="lay-dense-plates">
                        {run.blocks.map((img, bi) => (
                          <div key={bi} className="lay-dense-plate">
                            <BlockRenderer
                              block={img}
                              lang="en"
                              moduleSlug={mod.slug}
                              courseId={LAB_COURSE_ID}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (run.kind === 'wide') {
                  return (
                    <div key={ri} className={`lay-dense-wide lay-dense-wide--${run.block.k}`}>
                      <BlockRenderer
                        block={run.block}
                        lang="en"
                        moduleSlug={mod.slug}
                        courseId={LAB_COURSE_ID}
                      />
                    </div>
                  );
                }

                const two = weight(run.blocks) >= 340;
                return (
                  <div key={ri} className={two ? 'lay-dense-flow' : 'lay-dense-solo'}>
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
                );
              })}
            </section>
          );
        })}
      </div>

      <footer className="lay-dense-foot">
        <div className="lay-dense-foot-col">
          <p className="lay-dense-foot-title">Proof</p>
          <InteractiveChecklist
            courseId={LAB_COURSE_ID}
            moduleSlug={mod.slug}
            sectionKey="module-proof"
            items={[t(mod.proof, 'en')]}
            accent="cyan"
            mode="proof"
            lang="en"
          />
        </div>
        <div className="lay-dense-foot-col lay-dense-foot-col--end">
          <MarkCompleteButton courseId={LAB_COURSE_ID} slug={mod.slug} accent="orange" lang="en" />
        </div>
      </footer>
    </article>
  );
}
