'use client';

import { useState, type ReactNode } from 'react';
import { BlockRenderer } from '@/app/components/course/lesson/BlockRenderer';
import { LessonSection } from '@/app/components/course/lesson/LessonSection';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import { t, type CourseBlock } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID, type LayoutProps, lessonSections } from '../types';
import { AdvancedTail } from '../AdvancedTail';
import { ProviderStrip } from '../kit/Glyph';
import './08-terminal.css';

/**
 * 08 — Terminal first.
 *
 * Reading model: the lesson is a run sheet, not an essay. Everything the reader
 * has to *do* — a command, a procedure, a verification, a drill — is lifted out
 * of the flow and rendered large in a terminal frame down the wide centre of
 * the page, numbered and linkable. The prose that explains each action is
 * demoted to a narrow margin column beside it, at annotation size. Sections
 * that ask for no action at all are not given a frame: they collapse to a
 * quiet, centred interstitial between two runs of commands.
 *
 * The inversion is the proposal: you scan the actions, and read the prose only
 * where an action is unclear. "Commands only" makes that literal by folding the
 * margin away entirely.
 *
 * Nothing here rewrites the course. Every word comes from `open-harness.ts`
 * through the same BlockRenderer the live lesson uses; this file only decides
 * which lane a block lands in.
 */

/** Which lane a block belongs to. Unknown kinds fall back to margin prose. */
type Role = 'act' | 'stage' | 'note';

/**
 * `act` is anything the reader performs: run this, follow these, verify that,
 * answer this. Deliberately wider than "code block" — three of the thirteen
 * lessons contain no shell at all, and a model that only frames `sh` would
 * leave them empty.
 */
function roleOf(block: CourseBlock): Role {
  switch (block.k) {
    case 'code':
    case 'steps':
    case 'checklist':
    case 'quiz':
      return 'act';
    // Evidence and reference: too wide for the margin, not an action either.
    case 'image':
    case 'figure':
    case 'tweet':
    case 'table':
    case 'lexicon':
    case 'links':
    case 'refs':
    case 'copycards':
      return 'stage';
    // 'p', 'list', 'callout' — and anything added later, which is why this is
    // a default and not an exhaustive list: a new kind must never vanish.
    default:
      return 'note';
  }
}

/** One word of English chrome naming what the frame asks for. */
function actKind(block: CourseBlock): string {
  switch (block.k) {
    case 'code':
      return 'run';
    case 'steps':
      return 'steps';
    case 'checklist':
      return 'verify';
    case 'quiz':
      return 'drill';
    default:
      return 'act';
  }
}

/** The run-sheet row label: the command's own label when it has one. */
function actTitle(block: CourseBlock, heading: string): string {
  if (block.k === 'code' && block.block.label) return t(block.block.label, 'en');
  return heading;
}

type Beat = {
  /** 0 for a trailing beat that has no action of its own. */
  n: number;
  notes: CourseBlock[];
  before: CourseBlock[];
  act: CourseBlock | null;
  after: CourseBlock[];
};

type Plan =
  | { quiet: true; heading: string; beats?: undefined }
  | { quiet: false; heading: string; beats: Beat[] };

const pad = (n: number) => String(n).padStart(2, '0');

export default function TerminalLayout({ module: mod, index, total, partTitle }: LayoutProps) {
  const [bare, setBare] = useState(false);

  const { main: sections, advanced } = lessonSections(mod);

  // Walk every section once: number the actions across the whole lesson (the
  // run sheet needs a flat list) and split each section into beats.
  const acts: { n: number; kind: string; title: string }[] = [];
  let counter = 0;

  const plans: Plan[] = sections.map((section) => {
    const blocks = section.blocks ?? [];
    const heading = t(section.heading, 'en');

    if (!blocks.some((b) => roleOf(b) === 'act')) {
      return { quiet: true, heading };
    }

    const beats: Beat[] = [];
    let notes: CourseBlock[] = [];
    let before: CourseBlock[] = [];
    let current: Beat | null = null;

    for (const block of blocks) {
      const role = roleOf(block);
      if (role === 'act') {
        counter += 1;
        acts.push({ n: counter, kind: actKind(block), title: actTitle(block, heading) });
        current = { n: counter, notes, before, act: block, after: [] };
        beats.push(current);
        notes = [];
        before = [];
      } else if (role === 'note') {
        // A note only earns the margin lane while the stage lane of this
        // beat is still empty. The aside is emitted before the stage, so
        // diverting a note that was authored *after* a table or a diagram
        // printed it ahead of them — module 01 §3 rendered its callouts
        // before the diagram, the glossary and the table that precede them
        // in the source. Once the stage has content, the note stays in it.
        const stageStarted = current ? current.after.length > 0 : before.length > 0;
        if (!stageStarted) {
          notes.push(block);
        } else if (current) {
          current.after.push(block);
        } else {
          before.push(block);
        }
      } else if (current) {
        current.after.push(block);
      } else {
        before.push(block);
      }
    }

    // Prose left over after the last action still belongs to the section, so
    // it gets a frameless beat rather than being dropped.
    if (notes.length || before.length) {
      beats.push({ n: 0, notes, before, act: null, after: [] });
    }

    return { quiet: false, heading, beats };
  });

  const hero: CourseBlock | null = mod.hero ? { k: 'code', block: mod.hero } : null;

  return (
    <article className={`course-prose lay-term ${bare ? 'is-bare' : ''}`}>
      <header className="lay-term-boot">
        <div className="lay-term-bar">
          <span className="lay-term-bar-path">~/open-harness/{mod.slug}</span>
          <span className="lay-term-bar-meta">
            {pad(index + 1)} / {pad(total)} · {mod.minutes} min ·{' '}
            {acts.length === 1 ? '1 action' : `${acts.length} actions`}
          </span>
        </div>

        <div className="lay-term-boot-body">
          {partTitle && <p className="lay-term-part">{partTitle}</p>}
          <h1 className="course-h1 lay-term-title">
            {t(mod.title, 'en')}
            <span className="lay-term-caret" aria-hidden>
              ▌
            </span>
          </h1>
          {mod.subtitle && (
            <p className="course-lead lay-term-sub">{formatCourseText(t(mod.subtitle, 'en'), 'en')}</p>
          )}

          {/* Kept out of the console text, which has to stay monospace to
              read as a terminal, and put in the chrome above the run sheet. */}
          <ProviderStrip module={mod} label="Requires" />

          <div className="lay-term-sheet">
            <div className="lay-term-sheet-head">
              <span className="lay-term-sheet-label">Run sheet</span>
              <button
                type="button"
                className="lay-term-toggle"
                aria-pressed={bare}
                onClick={() => setBare((v) => !v)}
              >
                {bare ? 'Show annotations' : 'Commands only'}
              </button>
            </div>

            {acts.length === 0 ? (
              <p className="lay-term-sheet-empty">
                Nothing to run in this lesson — it is read, not executed.
              </p>
            ) : (
              <nav aria-label="Actions in this lesson">
                <ol className="lay-term-sheet-list">
                  {acts.map((a) => (
                    <li key={a.n}>
                      <a className="lay-term-sheet-row" href={`#lay-term-act-${a.n}`}>
                        <span className="lay-term-sheet-n">{pad(a.n)}</span>
                        <span className="lay-term-sheet-kind">{a.kind}</span>
                        <span className="lay-term-sheet-title">{a.title}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
          </div>
        </div>
      </header>

      {hero && (
        <div className="lay-term-beat">
          <div className="lay-term-note lay-term-note--empty" aria-hidden />
          <div className="lay-term-stage">
            <Frame kind="hero" tag="first">
              <BlockRenderer block={hero} lang="en" moduleSlug={mod.slug} courseId={LAB_COURSE_ID} />
            </Frame>
          </div>
        </div>
      )}

      <div className="lay-term-run">
        {plans.map((plan, si) =>
          plan.quiet ? (
            <section key={si} className="lay-term-rest">
              <LessonSection
                section={sections[si]}
                lang="en"
                moduleSlug={mod.slug}
                courseId={LAB_COURSE_ID}
              />
            </section>
          ) : (
            <section key={si} className="lay-term-section">
              <div className="lay-term-sec-head">
                <h2 className="course-h2">{plan.heading}</h2>
                <span className="lay-term-sec-rule" aria-hidden />
              </div>

              {plan.beats.map((beat, bi) => (
                <div className="lay-term-beat" key={bi}>
                  {beat.notes.length > 0 ? (
                    <aside className="lay-term-note course-blocks">
                      {beat.notes.map((block, i) => (
                        <BlockRenderer
                          key={i}
                          block={block}
                          lang="en"
                          moduleSlug={mod.slug}
                          courseId={LAB_COURSE_ID}
                        />
                      ))}
                    </aside>
                  ) : (
                    <div className="lay-term-note lay-term-note--empty" aria-hidden />
                  )}

                  <div className="lay-term-stage">
                    {beat.before.map((block, i) => (
                      <div className="lay-term-slot" key={`b${i}`}>
                        <BlockRenderer
                          block={block}
                          lang="en"
                          moduleSlug={mod.slug}
                          courseId={LAB_COURSE_ID}
                        />
                      </div>
                    ))}

                    {beat.act && (
                      <Frame
                        id={`lay-term-act-${beat.n}`}
                        kind={actKind(beat.act)}
                        tag={`act ${pad(beat.n)}`}
                      >
                        <BlockRenderer
                          block={beat.act}
                          lang="en"
                          moduleSlug={mod.slug}
                          courseId={LAB_COURSE_ID}
                        />
                      </Frame>
                    )}

                    {beat.after.map((block, i) => (
                      <div className="lay-term-slot" key={`a${i}`}>
                        <BlockRenderer
                          block={block}
                          lang="en"
                          moduleSlug={mod.slug}
                          courseId={LAB_COURSE_ID}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ),
        )}
      </div>

      {/* Advanced sections are published content: the live lesson folds them
          into a details tail rather than hiding them. Dropping them made this
          layout look shorter than its peers for reasons that were not about
          the layout at all. */}
      <AdvancedTail sections={advanced} moduleSlug={mod.slug} />

      <div className="lay-term-beat lay-term-beat--proof">
        <div className="lay-term-note lay-term-note--empty" aria-hidden />
        <div className="lay-term-stage">
          <Frame kind="proof" tag="end of lesson">
            <InteractiveChecklist
              courseId={LAB_COURSE_ID}
              moduleSlug={mod.slug}
              sectionKey="module-proof"
              items={[t(mod.proof, 'en')]}
              accent="cyan"
              mode="proof"
              lang="en"
            />
            <div className="lay-term-proof-cta">
              <MarkCompleteButton
                courseId={LAB_COURSE_ID}
                slug={mod.slug}
                accent="orange"
                lang="en"
              />
            </div>
          </Frame>
        </div>
      </div>
    </article>
  );
}

/** The terminal frame: a labelled bar, then whatever the block engine draws. */
function Frame({
  id,
  kind,
  tag,
  children,
}: {
  id?: string;
  kind: string;
  tag: string;
  children: ReactNode;
}) {
  return (
    <div className="lay-term-frame" id={id}>
      <div className="lay-term-frame-bar">
        <span className="lay-term-frame-kind">{kind}</span>
        <span className="lay-term-frame-tag">{tag}</span>
      </div>
      <div className="lay-term-frame-body">{children}</div>
    </div>
  );
}
