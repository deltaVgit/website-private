'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { LessonSection } from '@/app/components/course/lesson/LessonSection';
import { BlockRenderer } from '@/app/components/course/lesson/BlockRenderer';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import { t, type CourseBlock, type CourseSection } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID, type LayoutProps } from '../types';
import { ProviderStrip, HeadingGlyph } from '../kit/Glyph';
import './07-folded.css';

/**
 * 07 — Folded cards.
 *
 * Reading model: the lesson is a stack of closed drawers, one line each —
 * number, heading, and the opening words of its own first paragraph, cut where
 * the line ends. Nothing is rewritten; the teaser is the source sentence
 * truncated. A whole lesson therefore fits on one screen *before* it is read,
 * so the reader sees its shape — how many beats, which are procedure, which are
 * reference — and then chooses what to open. Several drawers stay open at once,
 * so this is a table of contents that becomes the lesson in place, rather than
 * a page you scroll with a rail you consult.
 *
 * Two consequences worth naming:
 *  - `advanced` sections are shown here instead of filtered out. They are the
 *    one thing a folded model handles for free: a closed drawer costs one line,
 *    so infrastructure options can stay in the lesson without weighing on it.
 *  - the block engine renders every open drawer verbatim. The proposal is the
 *    ordering and the front door, not a different renderer.
 */

/** Mirrors OnThisPage's slug so the right-hand rail and the drawers share ids. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

/**
 * Course inline markup to plain text. The teaser is the author's sentence with
 * the four markup channels unwrapped, never a paraphrase.
 */
function plain(s: string): string {
  return s
    .replace(/\[[^\]]*\]\(~privacy-warning\)/g, '')
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cut on a word boundary. CSS ellipsis does the rest at the real line width. */
function clamp(s: string, max = 150): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const space = cut.lastIndexOf(' ');
  const kept = space > max * 0.6 ? cut.slice(0, space) : cut;
  return `${kept.replace(/[\s,;:.·—–-]+$/, '')}…`;
}

/** First readable words of a block, whatever kind it is. Empty = not usable. */
function blockText(b: CourseBlock): string {
  switch (b.k) {
    case 'p':
    case 'callout':
      return t(b.text, 'en');
    case 'list':
      return b.items[0] ? t(b.items[0], 'en') : '';
    case 'checklist':
      return b.items[0] ? t(b.items[0], 'en') : '';
    case 'steps':
      return b.items[0] ? t(b.items[0].title, 'en') : '';
    case 'quiz':
      return t(b.quiz.question, 'en');
    case 'table':
      return b.headers.map((h) => t(h, 'en')).join(' · ');
    case 'lexicon':
      return b.cards[0] ? t(b.cards[0].body, 'en') : '';
    case 'links':
      if (b.label) return t(b.label, 'en');
      return b.items[0] ? t(b.items[0].label, 'en') : '';
    case 'refs':
      return b.citations && b.citations[0] ? t(b.citations[0], 'en') : '';
    case 'image':
      return b.caption ? t(b.caption, 'en') : t(b.alt, 'en');
    case 'tweet':
      return b.caption ? t(b.caption, 'en') : '';
    case 'copycards':
      return b.items[0] ? b.items[0].why : '';
    case 'code':
      if (b.block.label) return t(b.block.label, 'en');
      return b.block.note ? t(b.block.note, 'en') : '';
    case 'figure':
      return '';
    default:
      return '';
  }
}

/**
 * The teaser: the section's first paragraph, truncated. Sections that open on a
 * table, a command or a screenshot have no paragraph at all, so the first block
 * carrying words stands in — still the author's words, never invented ones.
 */
function teaserOf(section: CourseSection): string {
  const blocks = section.blocks ?? [];
  const para = blocks.find((b) => b.k === 'p');
  const fallback = blocks.map(blockText).find((x) => x.length > 0) ?? '';
  return clamp(plain(para ? blockText(para) : fallback));
}

type Shape = 'text' | 'action' | 'media' | 'ref';

/** Four families, so the closed stack shows where the work is before opening. */
const SHAPE: Partial<Record<CourseBlock['k'], Shape>> = {
  p: 'text',
  list: 'text',
  callout: 'text',
  table: 'text',
  lexicon: 'text',
  steps: 'action',
  checklist: 'action',
  code: 'action',
  quiz: 'action',
  image: 'media',
  figure: 'media',
  tweet: 'media',
  copycards: 'media',
  links: 'ref',
  refs: 'ref',
};

/** English chrome, singular/plural, for the title on the density strip. */
const NOUNS: Partial<Record<CourseBlock['k'], [string, string]>> = {
  p: ['paragraph', 'paragraphs'],
  list: ['list', 'lists'],
  callout: ['note', 'notes'],
  table: ['table', 'tables'],
  lexicon: ['glossary set', 'glossary sets'],
  steps: ['walkthrough', 'walkthroughs'],
  checklist: ['checklist', 'checklists'],
  code: ['command', 'commands'],
  quiz: ['quiz', 'quizzes'],
  image: ['screenshot', 'screenshots'],
  figure: ['diagram', 'diagrams'],
  tweet: ['post', 'posts'],
  copycards: ['template set', 'template sets'],
  links: ['link set', 'link sets'],
  refs: ['sources', 'sources'],
};

function contentsOf(blocks: CourseBlock[]): string {
  const order: CourseBlock['k'][] = [];
  const count = new Map<CourseBlock['k'], number>();
  blocks.forEach((b) => {
    if (!count.has(b.k)) order.push(b.k);
    count.set(b.k, (count.get(b.k) ?? 0) + 1);
  });
  return order
    .map((k) => {
      const n = count.get(k) ?? 0;
      const noun = NOUNS[k] ?? ['block', 'blocks'];
      return `${n} ${n === 1 ? noun[0] : noun[1]}`;
    })
    .join(' · ');
}

const MAX_SEGS = 18;

export default function FoldedLayout({ module: mod, index, total, partTitle }: LayoutProps) {
  const sections = useMemo(() => mod.sections ?? [], [mod]);

  const cards = useMemo(
    () =>
      sections.map((section, i) => {
        const blocks = section.blocks ?? [];
        return {
          key: i,
          section,
          heading: t(section.heading, 'en'),
          teaser: teaserOf(section),
          contents: contentsOf(blocks),
          segments: blocks.slice(0, MAX_SEGS).map((b) => SHAPE[b.k] ?? 'text'),
          overflow: Math.max(0, blocks.length - MAX_SEGS),
        };
      }),
    [sections],
  );

  const ids = useMemo(() => {
    const used = new Set<string>();
    return cards.map((c, i) => {
      let id = slugify(c.heading) || `section-${i}`;
      while (used.has(id)) id = `${id}-${i}`;
      used.add(id);
      return id;
    });
  }, [cards]);

  // Sets are indexed by position, so without a reset lesson 01's open
  // drawers 7 and 8 survive into lesson 00, which has three sections: the
  // counter then reads "2 of 3 sections open" over three shut drawers.
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set<number>());
  /** Opened at least once: keeps embeds and screenshots out of the closed page. */
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set<number>());

  // Reset on lesson change. The layout is re-rendered with a new module rather
  // than remounted, so position-indexed state would otherwise carry over.
  useEffect(() => {
    setOpen(new Set());
    setSeen(new Set());
  }, [mod.slug]);
  const toggles = useRef<Array<HTMLButtonElement | null>>([]);

  const remember = useCallback((i: number) => {
    setSeen((prev) => {
      if (prev.has(i)) return prev;
      const next = new Set(prev);
      next.add(i);
      return next;
    });
  }, []);

  const reveal = useCallback(
    (i: number) => {
      setOpen((prev) => {
        if (prev.has(i)) return prev;
        const next = new Set(prev);
        next.add(i);
        return next;
      });
      remember(i);
    },
    [remember],
  );

  const toggle = useCallback(
    (i: number) => {
      setOpen((prev) => {
        const next = new Set(prev);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        return next;
      });
      remember(i);
    },
    [remember],
  );

  const expandAll = useCallback(() => {
    const all = new Set(cards.map((_, i) => i));
    setOpen(all);
    setSeen(all);
  }, [cards]);

  const collapseAll = useCallback(() => setOpen(new Set<number>()), []);

  /**
   * The right-hand rail links to the heading ids, so a folded lesson has to
   * open the drawer it was just sent to — otherwise the link lands on a line
   * that stays shut.
   */
  useEffect(() => {
    const fromHash = () => {
      const hash = decodeURIComponent(window.location.hash.replace('#', ''));
      if (!hash) return;
      const i = ids.indexOf(hash);
      if (i >= 0) reveal(i);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [ids, reveal]);

  /** Up/Down/Home/End move between drawer headers, as an accordion should. */
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = cards.length - 1;
    if (last < 0) return;
    let to: number | null = null;
    if (e.key === 'ArrowDown') to = i === last ? 0 : i + 1;
    else if (e.key === 'ArrowUp') to = i === 0 ? last : i - 1;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = last;
    if (to === null) return;
    e.preventDefault();
    toggles.current[to]?.focus();
  };

  const openCount = open.size;

  return (
    <article className="course-prose lay-folded">
      <p className="course-meta">
        <span className="course-meta-num">
          {String(index + 1).padStart(2, '0')} / {total}
        </span>
        {partTitle ? ` · ${partTitle}` : ''} · {mod.minutes} min read
      </p>

      <h1 className="course-h1">{t(mod.title, 'en')}</h1>
      {mod.subtitle && <p className="course-lead">{formatCourseText(t(mod.subtitle, 'en'), 'en')}</p>}

      {/* Only the providers this lesson genuinely names. */}
      <ProviderStrip module={mod} />

      {mod.hero && (
        <div className="lay-folded-hero">
          <BlockRenderer
            block={{ k: 'code', block: mod.hero }}
            lang="en"
            moduleSlug={mod.slug}
            courseId={LAB_COURSE_ID}
          />
        </div>
      )}

      <div className="lay-folded-bar">
        <p className="lay-folded-count">
          <span className="lay-folded-count-n">{openCount}</span> of {cards.length}{' '}
          {cards.length === 1 ? 'section' : 'sections'} open
        </p>
        <div className="lay-folded-actions">
          <button
            type="button"
            className="lay-folded-act"
            onClick={expandAll}
            disabled={cards.length === 0 || openCount === cards.length}
          >
            Expand all
          </button>
          <button
            type="button"
            className="lay-folded-act"
            onClick={collapseAll}
            disabled={openCount === 0}
          >
            Collapse all
          </button>
        </div>
      </div>

      <div className="lay-folded-stack">
        {cards.map((card, i) => {
          const isOpen = open.has(i);
          const panelId = `lay-folded-panel-${mod.slug}-${i}`;
          const btnId = `lay-folded-toggle-${mod.slug}-${i}`;
          return (
            <section
              key={card.key}
              className={`lay-folded-card${isOpen ? ' lay-folded-is-open' : ''}${
                card.section.advanced ? ' lay-folded-is-advanced' : ''
              }`}
            >
              <div className="lay-folded-head">
                <h2 className="course-h2 lay-folded-h" id={ids[i]}>
                  <button
                    type="button"
                    id={btnId}
                    ref={(el) => {
                      toggles.current[i] = el;
                    }}
                    className="lay-folded-toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                    onKeyDown={(e) => onKey(e, i)}
                  >
                    <HeadingGlyph heading={card.heading} />{' '}
                    {card.heading}
                  </button>
                </h2>

                {card.section.advanced && <span className="lay-folded-pill">Advanced</span>}

                {card.teaser && <span className="lay-folded-teaser">{card.teaser}</span>}

                {card.segments.length > 0 && (
                  <span className="lay-folded-shape" aria-hidden title={card.contents}>
                    {card.segments.map((s, si) => (
                      <span key={si} className={`lay-folded-seg lay-folded-seg--${s}`} />
                    ))}
                    {card.overflow > 0 && <span className="lay-folded-more">+{card.overflow}</span>}
                  </span>
                )}

                <span className="lay-folded-chev" aria-hidden>
                  ▸
                </span>
              </div>

              <div className="lay-folded-panel" id={panelId} role="region" aria-labelledby={btnId}>
                <div className="lay-folded-panel-in">
                  <div className="lay-folded-body">
                    {seen.has(i) && (
                      <LessonSection
                        section={card.section}
                        lang="en"
                        moduleSlug={mod.slug}
                        showHeading={false}
                        courseId={LAB_COURSE_ID}
                      />
                    )}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <div className="lay-folded-proof">
        <p className="lay-folded-proof-label">Proof</p>
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
