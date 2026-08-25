'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { LessonSection } from '@/app/components/course/lesson/LessonSection';
import { BlockRenderer } from '@/app/components/course/lesson/BlockRenderer';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import { t, type CourseBlock, type CourseSection } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID, type LayoutProps, lessonSections } from '../types';
import { AdvancedTail } from '../AdvancedTail';
import { ProviderStrip, HeadingGlyph } from '../kit/Glyph';
import './05-pilot-shot.css';

/**
 * 05 — Pilot screenshot.
 *
 * Reading model: the screen you are supposed to be looking at never leaves the
 * viewport. A section that ships a screenshot has that screenshot lifted out of
 * the prose flow, promoted to the top of the section next to its heading, and
 * pinned there — the instructions then scroll *underneath* it. You read a step
 * with the target window still on screen instead of scrolling up to check what
 * the dialog looked like, then back down to find where you were.
 *
 * A section with several screenshots keeps their original order: each image
 * leaves an invisible marker where it used to sit, and the pinned frame swaps
 * to that shot as you scroll past its marker. The numbered strip is the manual
 * override — it also scrolls the prose to the matching passage, so the pin and
 * the text never disagree.
 *
 * Sections with no image (and whole lessons with none — 10, 11, 12) render as
 * an ordinary column: nothing is faked, nothing is pinned.
 */

type ShotBlock = Extract<CourseBlock, { k: 'image' }>;

const isShot = (b: CourseBlock): b is ShotBlock => b.k === 'image';

/**
 * Where the pinned frame has to stop: under the site header *and* under the
 * lab's own sticky layout picker, whose height changes with the viewport when
 * its ten tabs wrap. Measured rather than guessed, because a wrong value here
 * either hides the screenshot behind the picker or leaves a strip of scrolling
 * text visible above it.
 */
function useStickyTop(): number | null {
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    const picker = document.querySelector<HTMLElement>('.lab-picker');
    if (!picker) return;

    const measure = () => {
      const offset = Number.parseFloat(window.getComputedStyle(picker).top);
      setTop((Number.isFinite(offset) ? offset : 0) + picker.offsetHeight);
    };

    measure();
    window.addEventListener('resize', measure);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(measure);
      ro.observe(picker);
    }

    return () => {
      window.removeEventListener('resize', measure);
      ro?.disconnect();
    };
  }, []);

  return top;
}

/** The line a marker has to cross for its shot to become the pinned one. */
function readLine(stage: HTMLElement | null): number {
  const floor = stage ? stage.getBoundingClientRect().bottom + 24 : 0;
  return Math.max(floor, window.innerHeight * 0.66);
}

function SectionHead({
  n,
  heading,
  children,
}: {
  n: number;
  heading: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="lay-pilot-head">
      <span className="lay-pilot-num" aria-hidden>
        {String(n).padStart(2, '0')}
      </span>
      {/* With a screenshot pinned above, the heading is the reader's only
          moving landmark. A glyph makes it identifiable at a glance while
          the eye keeps returning to the fixed image. */}
      <h2 className="course-h2">
        <HeadingGlyph heading={heading} /> {heading}
      </h2>
      {children}
    </div>
  );
}

/** A section that carries at least one screenshot: pinned frame + steps under it. */
function PilotSection({
  section,
  slug,
  n,
}: {
  section: CourseSection;
  slug: string;
  n: number;
}) {
  const blocks = section.blocks ?? [];
  const shots = blocks.filter(isShot);

  /** block index → shot index, so a marker knows which frame it belongs to. */
  const shotIndex: number[] = [];
  let seen = 0;
  for (const b of blocks) {
    shotIndex.push(isShot(b) ? seen++ : -1);
  }

  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(true);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const marks = useRef<(HTMLElement | null)[]>([]);
  /**
   * The shot the reader picked, until the page has actually scrolled to it.
   *
   * Picking one sets `active` and then smooth-scrolls. The scroll listener
   * recomputes `active` from marker geometry, which has not moved yet, so it
   * overwrote the pick on the very next frame: the strip advertised "Show
   * screen 2 of 3" and the frame never changed, leaving two screenshots of
   * lesson 03 unreachable by any route. Geometry stays in charge of ordinary
   * scrolling; it just does not get to overrule a deliberate choice while
   * that choice is still travelling.
   */
  const pickRef = useRef<number | null>(null);
  const pickTimer = useRef(0);
  const uid = useId();
  const frameId = `${uid}-frame`;

  const count = shots.length;

  useEffect(() => {
    if (count < 2) return;
    let frame = 0;

    const compute = () => {
      frame = 0;
      const line = readLine(stageRef.current);
      let next = 0;
      for (let i = 0; i < marks.current.length; i += 1) {
        const el = marks.current[i];
        if (el && el.getBoundingClientRect().top <= line) next = i;
      }
      if (pickRef.current !== null) {
        // Release as soon as the scroll has actually arrived.
        if (next === pickRef.current) pickRef.current = null;
        return;
      }
      setActive((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [count]);

  /** Picking a shot also takes the prose to the passage it illustrates. */
  const jump = useCallback((i: number) => {
    setActive(i);
    pickRef.current = i;
    // A marker that can never reach the read line — the last one on a short
    // page — would hold the lock forever, so it also expires on its own.
    window.clearTimeout(pickTimer.current);
    pickTimer.current = window.setTimeout(() => {
      pickRef.current = null;
    }, 1200);
    const el = marks.current[i];
    if (!el) return;
    const target = window.scrollY + el.getBoundingClientRect().top - readLine(stageRef.current) + 8;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, target), behavior: reduce ? 'auto' : 'smooth' });
  }, []);

  const current = shots[active] ?? shots[0];
  const hasProse = blocks.some((b) => !isShot(b));

  return (
    <section className="lay-pilot-sec lay-pilot-sec--pilot">
      <div className="lay-pilot-stage" ref={stageRef}>
        <SectionHead n={n} heading={t(section.heading, 'en')}>
          <button
            type="button"
            className="lay-pilot-toggle"
            aria-expanded={open}
            aria-controls={frameId}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? 'Hide screen' : 'Show screen'}
          </button>
        </SectionHead>

        <div id={frameId} className={`lay-pilot-frame${open ? '' : ' is-closed'}`}>
          {current && (
            <BlockRenderer block={current} lang="en" moduleSlug={slug} courseId={LAB_COURSE_ID} />
          )}
        </div>

        {count > 1 && (
          <div
            className={`lay-pilot-strip${open ? '' : ' is-closed'}`}
            role="group"
            aria-label="Screens in this section"
          >
            <span className="lay-pilot-strip-label">Screens</span>
            {shots.map((_, j) => (
              <button
                key={j}
                type="button"
                className="lay-pilot-thumb"
                aria-pressed={j === active}
                aria-label={`Show screen ${j + 1} of ${count}`}
                onClick={() => jump(j)}
              >
                {String(j + 1).padStart(2, '0')}
              </button>
            ))}
          </div>
        )}
      </div>

      {hasProse && (
        <div className="lay-pilot-steps course-blocks">
          {blocks.map((block, bi) =>
            isShot(block) ? (
              <span
                key={bi}
                className="lay-pilot-mark"
                aria-hidden
                ref={(el) => {
                  marks.current[shotIndex[bi]] = el;
                }}
              />
            ) : (
              <BlockRenderer
                key={bi}
                block={block}
                lang="en"
                moduleSlug={slug}
                courseId={LAB_COURSE_ID}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}

/** No screenshot, nothing to pin — the plain column, with the same numbering. */
function PlainSection({
  section,
  slug,
  n,
}: {
  section: CourseSection;
  slug: string;
  n: number;
}) {
  return (
    <section className="lay-pilot-sec lay-pilot-sec--plain">
      <SectionHead n={n} heading={t(section.heading, 'en')} />
      <LessonSection
        section={section}
        lang="en"
        moduleSlug={slug}
        showHeading={false}
        courseId={LAB_COURSE_ID}
      />
    </section>
  );
}

export default function PilotShotLayout({ module: mod, index, total, partTitle }: LayoutProps) {
  const { main: sections, advanced } = lessonSections(mod);
  const stickyTop = useStickyTop();
  const piloted = sections.filter((s) => (s.blocks ?? []).some(isShot)).length;

  return (
    <article
      className="course-prose lay-pilot"
      style={
        {
          '--lay-pilot-top': stickyTop != null ? `${stickyTop}px` : undefined,
        } as CSSProperties
      }
    >
      <p className="course-meta">
        <span className="course-meta-num">
          {String(index + 1).padStart(2, '0')} / {total}
        </span>
        {partTitle ? ` · ${partTitle}` : ''} · {mod.minutes} min read
      </p>

      <h1 className="course-h1">{t(mod.title, 'en')}</h1>
      {mod.subtitle && <p className="course-lead">{formatCourseText(t(mod.subtitle, 'en'), 'en')}</p>}

      {/* Beside the legend: both answer "what does this lesson involve"
          before the first screen pins itself to the top. */}
      <ProviderStrip module={mod} />

      <p className="lay-pilot-legend">
        {piloted > 0
          ? `Screens: ${piloted} of ${sections.length} sections ship one. Each pins to the top of its section and stays in view while the instructions scroll underneath.`
          : `No screens in this lesson — every section reads as a plain column.`}
      </p>

      <div className="lay-pilot-body">
        {sections.map((section, i) =>
          (section.blocks ?? []).some(isShot) ? (
            <PilotSection key={i} section={section} slug={mod.slug} n={i + 1} />
          ) : (
            <PlainSection key={i} section={section} slug={mod.slug} n={i + 1} />
          ),
        )}
      </div>

      {/* Advanced sections are published content: the live lesson folds them
          into a details tail rather than hiding them. Dropping them made this
          layout look shorter than its peers for reasons that were not about
          the layout at all. */}
      <AdvancedTail sections={advanced} moduleSlug={mod.slug} />

      <div className="course-proof lay-pilot-proof">
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
