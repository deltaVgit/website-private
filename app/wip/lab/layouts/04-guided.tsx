'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { LessonSection } from '@/app/components/course/lesson/LessonSection';
import { BlockRenderer } from '@/app/components/course/lesson/BlockRenderer';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import { t, type CourseSection } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID, type LayoutProps } from '../types';
import { ProviderStrip, HeadingGlyph } from '../kit/Glyph';
import './04-guided.css';

/**
 * 04 — Guided step by step.
 *
 * Reading model: a wizard, not a page. Exactly one step is on screen at a time
 * — a cover, then one section per step, then the proof — inside a stage of
 * fixed height that owns its own scrollbar. Scrolling can only reveal the rest
 * of the *current* step; the next one costs a deliberate act (Next, a dot, or
 * an arrow key). The step number and its title sit above everything, so the
 * reader always knows where they are inside the procedure.
 *
 * Why: an install lesson is executed, not read. What matters is "which step am
 * I on" and "am I done with it", and a two-metre scroll answers neither. The
 * cost is that you cannot skim ahead — which is the point, and the thing this
 * proposal exists to test.
 *
 * Advanced sections are lifted out of the main path and queued at the end as
 * optional detours, so an infrastructure aside never lands between two steps
 * of a procedure.
 */

type Step =
  | { kind: 'cover'; label: string }
  | { kind: 'section'; label: string; section: CourseSection; n: number; optional: boolean }
  | { kind: 'proof'; label: string };

export default function GuidedLayout({ module: mod, index, total, partTitle }: LayoutProps) {
  const steps = useMemo<Step[]>(() => {
    const all = mod.sections ?? [];
    const main = all.filter((s) => !s.advanced);
    const detours = all.filter((s) => s.advanced);
    const ordered = [...main, ...detours];
    return [
      { kind: 'cover', label: t(mod.title, 'en') },
      ...ordered.map<Step>((section, i) => ({
        kind: 'section',
        label: t(section.heading, 'en'),
        section,
        n: i + 1,
        optional: Boolean(section.advanced),
      })),
      { kind: 'proof', label: 'Proof' },
    ];
  }, [mod]);

  const count = steps.length;
  const sectionCount = count - 2;

  const [step, setStep] = useState(0);
  const [maxSeen, setMaxSeen] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const lastStep = useRef(0);

  // A different lesson is a different procedure: always restart at its cover.
  useEffect(() => {
    setStep(0);
    setMaxSeen(0);
    setDir(1);
  }, [mod.slug]);

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(next, count - 1));
    if (clamped === step) return;
    setDir(clamped > step ? 1 : -1);
    setStep(clamped);
    setMaxSeen((m) => Math.max(m, clamped));
  };

  // Left / right move between steps, unless the reader is typing or the key
  // already belongs to something else.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // The listener is on window, so it also fired while focus sat on a
      // picker button: pressing an arrow key to move between layouts
      // advanced the wizard and stole focus. Only act when the reader is
      // actually inside this layout.
      if (rootRef.current && !rootRef.current.contains(document.activeElement)) return;
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      const delta = e.key === 'ArrowRight' ? 1 : -1;
      const clamped = Math.max(0, Math.min(step + delta, count - 1));
      if (clamped === step) return;
      e.preventDefault();
      setDir(delta > 0 ? 1 : -1);
      setStep(clamped);
      setMaxSeen((m) => Math.max(m, clamped));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, count]);

  // Every step starts at its own top, the header stays in sight, and the new
  // title takes focus so a screen reader announces where we landed.
  useEffect(() => {
    // Comparing against the last step we handled, rather than an "is mounted"
    // flag, keeps this idempotent under StrictMode's double effect run.
    if (lastStep.current === step) return;
    lastStep.current = step;
    if (stageRef.current) stageRef.current.scrollTop = 0;
    rootRef.current?.scrollIntoView({ block: 'nearest' });
    titleRef.current?.focus({ preventScroll: true });
  }, [step]);

  const current = steps[step] ?? steps[0];
  const prev = step > 0 ? steps[step - 1] : undefined;
  const next = step < count - 1 ? steps[step + 1] : undefined;
  const pct = count > 1 ? (step / (count - 1)) * 100 : 100;

  return (
    <article className="course-prose lay-guided" ref={rootRef}>
      <header className="lay-guided-bar">
        <p className="lay-guided-crumb">
          <span className="lay-guided-crumb-num">
            {String(index + 1).padStart(2, '0')} / {total}
          </span>
          {partTitle ? <span className="lay-guided-crumb-part">{partTitle}</span> : null}
          <span className="lay-guided-crumb-time">{mod.minutes} min</span>
        </p>

        <div
          className="lay-guided-track"
          role="progressbar"
          aria-label="Lesson progress"
          aria-valuemin={0}
          aria-valuemax={count - 1}
          aria-valuenow={step}
          aria-valuetext={`Step ${step + 1} of ${count}`}
        >
          <span
            className="lay-guided-fill"
            style={{ '--lay-guided-pct': `${pct}%` } as CSSProperties}
          />
        </div>

        <nav className="lay-guided-dots" aria-label="Steps">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`lay-guided-dot${i === step ? ' is-current' : ''}${
                i <= maxSeen ? ' is-seen' : ''
              }${s.kind === 'section' && s.optional ? ' is-optional' : ''}`}
              aria-current={i === step ? 'step' : undefined}
              aria-label={
                s.kind === 'cover'
                  ? 'Overview'
                  : s.kind === 'proof'
                    ? 'Proof'
                    : `Step ${s.n} of ${sectionCount}: ${s.label}`
              }
              onClick={() => goTo(i)}
            >
              <span aria-hidden>{s.kind === 'cover' ? '◆' : s.kind === 'proof' ? '✓' : s.n}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Focusable: the stage is a fixed-height scroller and on a text-only
          lesson it holds no focusable descendant at all, so the body below
          the fold was unreachable without a mouse. */}
      <div
        className="lay-guided-stage"
        ref={stageRef}
        tabIndex={0}
        role="group"
        aria-label="Step content, scrollable"
      >
        <div className={`lay-guided-slide ${dir > 0 ? 'is-fwd' : 'is-back'}`} key={step}>
          {current.kind === 'cover' ? (
            <section className="lay-guided-cover">
              <p className="lay-guided-kicker">Overview</p>
              <h1 className="course-h1 lay-guided-title" tabIndex={-1} ref={titleRef}>
                {t(mod.title, 'en')}
              </h1>
              {mod.subtitle ? (
                <p className="course-lead lay-guided-deck">
                  {formatCourseText(t(mod.subtitle, 'en'), 'en')}
                </p>
              ) : null}

              {/* Only the providers this lesson genuinely names. */}
              <ProviderStrip module={mod} />

              {mod.hero ? (
                <div className="course-blocks lay-guided-hero">
                  <BlockRenderer
                    block={{ k: 'code', block: mod.hero }}
                    lang="en"
                    moduleSlug={mod.slug}
                    courseId={LAB_COURSE_ID}
                  />
                </div>
              ) : null}

              {sectionCount > 0 ? (
                <>
                  <p className="lay-guided-route-label">
                    {sectionCount} step{sectionCount > 1 ? 's' : ''} ahead
                  </p>
                  <ol className="lay-guided-route">
                    {steps.map((s, i) =>
                      s.kind === 'section' ? (
                        <li key={i}>
                          <button
                            type="button"
                            className="lay-guided-route-item"
                            onClick={() => goTo(i)}
                          >
                            <span className="lay-guided-route-num">
                              {String(s.n).padStart(2, '0')}
                            </span>
                            <span className="lay-guided-route-text">
                              <HeadingGlyph heading={s.label} /> {s.label}
                            </span>
                            {s.optional ? <span className="lay-guided-badge">Optional</span> : null}
                          </button>
                        </li>
                      ) : null,
                    )}
                  </ol>
                </>
              ) : (
                <p className="lay-guided-route-label">This lesson has no steps to walk through.</p>
              )}
            </section>
          ) : current.kind === 'section' ? (
            <section className="lay-guided-step">
              <p className="lay-guided-kicker">
                Step {current.n} of {sectionCount}
                {current.optional ? (
                  <span className="lay-guided-badge">Optional detour</span>
                ) : null}
              </p>
              <h2 className="course-h2 lay-guided-title" tabIndex={-1} ref={titleRef}>
                <HeadingGlyph heading={current.label} />{' '}
                {current.label}
              </h2>
              <div className="lay-guided-body">
                <LessonSection
                  section={current.section}
                  lang="en"
                  moduleSlug={mod.slug}
                  showHeading={false}
                  courseId={LAB_COURSE_ID}
                />
              </div>
            </section>
          ) : (
            <section className="lay-guided-step lay-guided-end">
              <p className="lay-guided-kicker">Last step</p>
              <h2 className="course-h2 lay-guided-title" tabIndex={-1} ref={titleRef}>
                Proof
              </h2>
              <div className="lay-guided-body">
                <InteractiveChecklist
                  courseId={LAB_COURSE_ID}
                  moduleSlug={mod.slug}
                  sectionKey="module-proof"
                  items={[t(mod.proof, 'en')]}
                  accent="cyan"
                  mode="proof"
                  lang="en"
                />
                <MarkCompleteButton
                  courseId={LAB_COURSE_ID}
                  slug={mod.slug}
                  accent="orange"
                  lang="en"
                />
              </div>
            </section>
          )}
        </div>
      </div>

      <nav className="lay-guided-nav" aria-label="Step navigation">
        <button
          type="button"
          className="lay-guided-btn lay-guided-btn--prev"
          onClick={() => goTo(step - 1)}
          disabled={!prev}
        >
          <span className="lay-guided-btn-arrow" aria-hidden>
            ←
          </span>
          <span className="lay-guided-btn-side">
            <span className="lay-guided-btn-kicker">Previous</span>
            <span className="lay-guided-btn-label">{prev ? prev.label : 'Start of lesson'}</span>
          </span>
        </button>

        <p className="lay-guided-pos">
          <span className="lay-guided-pos-now">{step + 1}</span>
          <span className="lay-guided-pos-sep" aria-hidden>
            /
          </span>
          <span className="lay-guided-pos-all">{count}</span>
          <span className="lay-guided-hint">← → to move</span>
        </p>

        <button
          type="button"
          className="lay-guided-btn lay-guided-btn--next"
          onClick={() => goTo(step + 1)}
          disabled={!next}
        >
          <span className="lay-guided-btn-side">
            <span className="lay-guided-btn-kicker">
              {step === 0 ? 'Start' : next && next.kind === 'proof' ? 'Finish' : 'Next'}
            </span>
            <span className="lay-guided-btn-label">{next ? next.label : 'Lesson complete'}</span>
          </span>
          <span className="lay-guided-btn-arrow" aria-hidden>
            →
          </span>
        </button>
      </nav>
    </article>
  );
}
