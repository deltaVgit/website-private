'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LessonSection } from '@/app/components/course/lesson/LessonSection';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import { t, type CourseSection } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID, type LayoutProps } from '../types';
import { ProviderStrip, HeadingGlyph } from '../kit/Glyph';
import './03-panels.css';

/**
 * 03 — One section, one screen.
 *
 * Reading model: the lesson stops being a scroll and becomes a deck. The whole
 * lesson lives in its own scroll container with `scroll-snap-type: y mandatory`,
 * and every section is a panel exactly the height of that container. You cannot
 * half-see two sections at once: the snap always lands you on one, whole.
 *
 * Inside a panel the composition is a slide, not a column — the section number
 * and its heading sit in a fixed left rail, the blocks live in their own
 * scroller on the right, vertically centred by auto margins when they are short
 * and scrolling in place when they are not. So a section that does not fit is
 * contained instead of pushing the next one off the deck.
 *
 * The cover panel doubles as the agenda (every heading is a jump button) and a
 * small pill at the bottom keeps "Section n of N" plus a dot per panel on
 * screen at all times, because a snap deck with no position indicator is a
 * corridor with no doors.
 *
 * Everything textual comes from the block engine (`LessonSection` with the
 * heading suppressed, so the rail owns it) — no block kind is hand-rendered,
 * which is why lessons with ten images and lessons with none both work.
 */

type Panel =
  | { kind: 'cover' }
  | { kind: 'section'; section: CourseSection; n: number }
  | { kind: 'proof' };

export default function PanelsLayout({ module: mod, index, total, partTitle }: LayoutProps) {
  const sections = useMemo(() => mod.sections ?? [], [mod]);

  const panels = useMemo<Panel[]>(() => {
    const list: Panel[] = [{ kind: 'cover' }];
    sections.forEach((section, i) => list.push({ kind: 'section', section, n: i + 1 }));
    list.push({ kind: 'proof' });
    return list;
  }, [sections]);

  const rootRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement | null>(null);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [overflowing, setOverflowing] = useState<boolean[]>([]);

  /** Which panel is under the middle of the deck. */
  /**
   * How much chrome sits above the deck.
   *
   * The height was hard-coded as `100vh - 8rem`, but the deck does not
   * start at the viewport top: the WIP crumbs, the banner, the sticky
   * picker (two rows of ten tabs on a narrow window) and the blurb all
   * come first. The deck therefore ran past the fold and took its own
   * position indicator with it, which is the only thing telling a reader
   * that more panels exist.
   */
  // The read-out is fixed to the window so it cannot fall below the fold,
  // which means it also has to know when the deck has scrolled away: the
  // proof and the advanced tail sit underneath it.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    // Watch the deck, not the root: the root also contains the proof and
    // the advanced tail, so it intersects the viewport for the whole page
    // and the read-out would never hide.
    const deck = root.querySelector('.lay-panels-deck');
    if (!deck) return;
    const io = new IntersectionObserver(
      ([entry]) => root.toggleAttribute('data-deck-onscreen', entry.isIntersecting),
      { rootMargin: '-25% 0px -25% 0px' },
    );
    io.observe(deck);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const apply = () => {
      const top = root.getBoundingClientRect().top + window.scrollY;
      const sticky = document.querySelector('.lab-picker');
      const stickyH = sticky ? sticky.getBoundingClientRect().height : 0;
      // 4rem of site header, plus the picker, plus whatever the deck
      // itself is pushed down by on first paint.
      root.style.setProperty('--lay-panels-top', `${Math.max(64 + stickyH, Math.min(top, 400))}px`);
    };
    apply();
    window.addEventListener('resize', apply);
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      const sticky = document.querySelector('.lab-picker');
      if (sticky) {
        ro = new ResizeObserver(apply);
        ro.observe(sticky);
      }
    }
    return () => {
      window.removeEventListener('resize', apply);
      ro?.disconnect();
    };
  }, []);

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const at = Number((entry.target as HTMLElement).dataset.panel);
          if (!Number.isNaN(at)) setActive(at);
        }
      },
      { root: deck, rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    );
    deck.querySelectorAll<HTMLElement>('[data-panel]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [panels.length, mod.slug]);

  /**
   * A panel that scrolls internally looks identical to one that does not, so
   * the rail says so. Measured rather than guessed, because images decide it.
   */
  useEffect(() => {
    const measure = () =>
      setOverflowing(bodyRefs.current.map((el) => !!el && el.scrollHeight - el.clientHeight > 8));
    const ro = new ResizeObserver(measure);
    for (const el of bodyRefs.current) {
      if (!el) continue;
      ro.observe(el);
      if (el.firstElementChild) ro.observe(el.firstElementChild);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [panels.length, mod.slug]);

  /** New lesson, top of the deck. */
  useEffect(() => {
    setActive(0);
    deckRef.current?.scrollTo({ top: 0 });
  }, [mod.slug]);

  const goTo = useCallback((at: number) => {
    const deck = deckRef.current;
    if (!deck) return;
    const el = deck.querySelector<HTMLElement>(`[data-panel="${at}"]`);
    if (!el) return;
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    deck.scrollTo({ top: el.offsetTop, behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  /** Left / right advance the deck; up / down keep their native scroll. */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(Math.min(active + 1, panels.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(Math.max(active - 1, 0));
      }
    },
    [active, goTo, panels.length],
  );

  const count = sections.length;
  const current = panels[active] ?? panels[0];
  const hudLabel =
    current.kind === 'section'
      ? `Section ${current.n} of ${count}`
      : current.kind === 'proof'
        ? 'Proof'
        : 'Cover';

  const dotLabel = (panel: Panel) =>
    panel.kind === 'section'
      ? `Section ${panel.n} of ${count} — ${t(panel.section.heading, 'en')}`
      : panel.kind === 'proof'
        ? 'Proof'
        : 'Cover';

  return (
    <div className="lay-panels-root" ref={rootRef}>
      <div
        ref={deckRef}
        className="lay-panels-deck"
        role="region"
        aria-label={`${t(mod.title, 'en')} — deck of ${panels.length} panels`}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {panels.map((panel, pi) => {
          const headingId = `lay-panels-h-${mod.slug}-${pi}`;
          const isActive = pi === active;

          if (panel.kind === 'cover') {
            return (
              <section
                key={pi}
                data-panel={pi}
                className={`lay-panels-panel lay-panels-panel--cover${isActive ? ' is-active' : ''}`}
                aria-labelledby={headingId}
              >
                <div className="lay-panels-inner lay-panels-inner--cover">
                  <div className="lay-panels-cover course-prose">
                    <p className="course-meta lay-panels-meta">
                      <span className="course-meta-num">
                        {String(index + 1).padStart(2, '0')} / {total}
                      </span>
                      {partTitle ? ` · ${partTitle}` : ''} · {mod.minutes} min read
                    </p>
                    <h1 id={headingId} className="course-h1 lay-panels-title">
                      {t(mod.title, 'en')}
                    </h1>
                    {mod.subtitle && (
                      <p className="course-lead lay-panels-sub">
                        {formatCourseText(t(mod.subtitle, 'en'), 'en')}
                      </p>
                    )}
                    {/* On the cover panel, where a reader takes stock before
                        committing to the deck. Silent when nothing is named. */}
                    <ProviderStrip module={mod} />
                    <p className="lay-panels-hint">
                      {count} {count === 1 ? 'panel' : 'panels'} · scroll or press
                      <kbd className="lay-panels-kbd">→</kbd>
                      to advance
                    </p>
                  </div>

                  {count > 0 && (
                    <nav className="lay-panels-agenda" aria-label="Sections in this lesson">
                      <p className="lay-panels-agenda-title">Contents</p>
                      <ol className="lay-panels-agenda-list">
                        {sections.map((section, si) => (
                          <li key={si}>
                            <button
                              type="button"
                              className="lay-panels-agenda-row"
                              onClick={() => goTo(si + 1)}
                            >
                              <span className="lay-panels-agenda-num">
                                {String(si + 1).padStart(2, '0')}
                              </span>
                              <span className="lay-panels-agenda-label">
                                {t(section.heading, 'en')}
                              </span>
                              {section.advanced && (
                                <span className="lay-panels-tag">Optional</span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ol>
                    </nav>
                  )}
                </div>
              </section>
            );
          }

          if (panel.kind === 'proof') {
            return (
              <section
                key={pi}
                data-panel={pi}
                className={`lay-panels-panel lay-panels-panel--proof${isActive ? ' is-active' : ''}`}
                aria-labelledby={headingId}
              >
                <div className="lay-panels-inner lay-panels-inner--solo">
                  <div className="lay-panels-proof course-prose">
                    <p className="lay-panels-kicker">End of lesson</p>
                    <h2 id={headingId} className="course-h2 lay-panels-heading">
                      Proof
                    </h2>
                    {mod.proof && (
                      <InteractiveChecklist
                        courseId={LAB_COURSE_ID}
                        moduleSlug={mod.slug}
                        sectionKey="module-proof"
                        items={[t(mod.proof, 'en')]}
                        accent="cyan"
                        mode="proof"
                        lang="en"
                      />
                    )}
                    <MarkCompleteButton
                      courseId={LAB_COURSE_ID}
                      slug={mod.slug}
                      accent="orange"
                      lang="en"
                    />
                  </div>
                </div>
              </section>
            );
          }

          return (
            <section
              key={pi}
              data-panel={pi}
              className={`lay-panels-panel${isActive ? ' is-active' : ''}`}
              aria-labelledby={headingId}
            >
              <div className="lay-panels-inner">
                <div className="lay-panels-aside">
                  <p className="lay-panels-index" aria-hidden>
                    {String(panel.n).padStart(2, '0')}
                    <span className="lay-panels-index-of">/{String(count).padStart(2, '0')}</span>
                  </p>
                  <h2 id={headingId} className="course-h2 lay-panels-heading">
                    <HeadingGlyph
                      heading={t(panel.section.heading, 'en')}
                      className="lay-panels-glyph"
                    />{' '}
                    {t(panel.section.heading, 'en')}
                  </h2>
                  {panel.section.advanced && (
                    <p className="lay-panels-tag lay-panels-tag--block">Optional setup</p>
                  )}
                  {overflowing[pi] && (
                    <p className="lay-panels-more">
                      <span aria-hidden>▾</span> This panel scrolls
                    </p>
                  )}
                </div>

                <div
                  className="lay-panels-body course-prose"
                  // Chrome and Safari do not make a scroll container
                  // focusable on their own, so a panel with no link and no
                  // checkbox had no way to be scrolled from the keyboard.
                  tabIndex={0}
                  role="group"
                  aria-label="Panel content, scrollable"
                  ref={(el) => {
                    bodyRefs.current[pi] = el;
                  }}
                >
                  <LessonSection
                    section={panel.section}
                    lang="en"
                    moduleSlug={mod.slug}
                    showHeading={false}
                    courseId={LAB_COURSE_ID}
                  />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="lay-panels-hud">
        <button
          type="button"
          className="lay-panels-step"
          onClick={() => goTo(Math.max(active - 1, 0))}
          disabled={active === 0}
          aria-label="Previous panel"
        >
          <span aria-hidden>↑</span>
        </button>

        <span className="lay-panels-hud-label">{hudLabel}</span>

        <ol className="lay-panels-dots">
          {panels.map((panel, pi) => (
            <li key={pi}>
              <button
                type="button"
                className={`lay-panels-dot${pi === active ? ' is-active' : ''}`}
                onClick={() => goTo(pi)}
                aria-current={pi === active ? 'true' : undefined}
                aria-label={dotLabel(panel)}
              />
            </li>
          ))}
        </ol>

        <button
          type="button"
          className="lay-panels-step"
          onClick={() => goTo(Math.min(active + 1, panels.length - 1))}
          disabled={active === panels.length - 1}
          aria-label="Next panel"
        >
          <span aria-hidden>↓</span>
        </button>
      </div>
    </div>
  );
}
