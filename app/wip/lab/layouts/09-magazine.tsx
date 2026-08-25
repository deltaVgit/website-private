'use client';

import { BlockRenderer } from '@/app/components/course/lesson/BlockRenderer';
import { CourseCode } from '@/app/components/course/lesson/CourseCode';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import { t, type CourseBlock, type CourseSection } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID, type LayoutProps, lessonSections } from '../types';
import { AdvancedTail } from '../AdvancedTail';
import { ProviderStrip, HeadingGlyph } from '../kit/Glyph';
import './09-magazine.css';

/**
 * 09 — Magazine.
 *
 * Reading model: an asymmetric editorial grid. A wide main column carries the
 * prose; a narrow marginal column carries the apparatus — the folio, the
 * contents, the section numerals, and the callouts, which stop being boxes in
 * the flow and become pull-quotes set in Georgia, larger than the body, beside
 * the text they gloss. Visuals refuse the grid entirely: every image and
 * diagram breaks out full-bleed across both columns, numbered as a plate.
 *
 * The bet: long-form reading deserves a magazine page. Three things are on
 * screen at once instead of one — where you are (margin), what you are reading
 * (main), and what the editor wants to shout (the quote) — and the order the
 * eye takes them in is no longer the order of the source array.
 *
 * The words are untouched: everything below reads from the course data through
 * `t(x, 'en')` and the real BlockRenderer.
 */

type Callout = Extract<CourseBlock, { k: 'callout' }>;
type Plate = Extract<CourseBlock, { k: 'image' | 'figure' }>;

/** A band of the page: either the two-column row, or a visual that breaks out. */
type Piece =
  | { kind: 'row'; quotes: Callout[]; flow: CourseBlock[] }
  | { kind: 'plate'; block: Plate; n: number };

const pad = (n: number) => String(n).padStart(2, '0');

const isPlate = (b: CourseBlock): b is Plate => b.k === 'image' || b.k === 'figure';

/**
 * Turn one section's flat block list into bands.
 *
 * A callout opens a new band and is hung in the margin of the text that
 * follows it, which is what a pull-quote does on a printed page. A visual
 * closes the current band and takes the full width on its own.
 */
function planSection(blocks: CourseBlock[], nextPlate: () => number): Piece[] {
  const pieces: Piece[] = [];
  let quotes: Callout[] = [];
  let flow: CourseBlock[] = [];

  const flush = () => {
    if (quotes.length || flow.length) pieces.push({ kind: 'row', quotes, flow });
    quotes = [];
    flow = [];
  };

  for (const block of blocks) {
    if (isPlate(block)) {
      flush();
      pieces.push({ kind: 'plate', block, n: nextPlate() });
      continue;
    }
    if (block.k === 'callout') {
      // Consecutive callouts stack in the same margin; one that arrives after
      // prose starts a fresh band so it sits beside what comes next.
      if (flow.length) flush();
      quotes.push(block);
      continue;
    }
    flow.push(block);
  }
  flush();
  return pieces;
}

/** The lesson's opening paragraph, if it starts with a letter a drop cap can eat. */
function findDropCap(sections: CourseSection[]): CourseBlock | null {
  for (const section of sections) {
    for (const block of section.blocks ?? []) {
      if (block.k === 'p') return /^[A-Za-z]/.test(t(block.text, 'en')) ? block : null;
    }
  }
  return null;
}

/** Callouts, reset as marginalia. Short ones shout; long ones step down a size. */
function PullQuote({ block }: { block: Callout }) {
  const text = t(block.text, 'en');
  const size = text.length <= 150 ? 'lg' : text.length <= 290 ? 'md' : 'sm';
  const tone =
    block.variant === 'warning'
      ? ' lay-mag-quote--warn'
      : block.variant === 'quote'
        ? ' lay-mag-quote--said'
        : '';
  return (
    <aside className={`lay-mag-quote lay-mag-quote--${size}${tone}`}>
      <p className="lay-mag-quote-text">{formatCourseText(text, 'en')}</p>
    </aside>
  );
}

export default function MagazineLayout({ module: mod, index, total, partTitle }: LayoutProps) {
  const { main: sections, advanced } = lessonSections(mod);
  const dropCap = findDropCap(sections);

  let plates = 0;
  const planned = sections.map((s) => planSection(s.blocks ?? [], () => (plates += 1)));

  const headingId = (i: number) => `lay-mag-${mod.slug}-${i}`;

  return (
    <article className="course-prose lay-mag">
      <div className="lay-mag-rule" />

      <header className="lay-mag-row lay-mag-head">
        <div className="lay-mag-margin">
          <p className="lay-mag-folio">
            <span className="lay-mag-folio-num">
              {pad(index + 1)} / {pad(total)}
            </span>
            {partTitle && <span>{partTitle}</span>}
            <span>{mod.minutes} min read</span>
          </p>

          {sections.length > 0 && (
            <nav className="lay-mag-contents" aria-label="In this lesson">
              <p className="lay-mag-contents-title">In this lesson</p>
              <ol role="list">
                {sections.map((section, i) => (
                  <li key={i}>
                    <a href={`#${headingId(i)}`}>
                      <span className="lay-mag-contents-label">
                        <HeadingGlyph heading={t(section.heading, 'en')} />{' '}
                        {t(section.heading, 'en')}
                      </span>
                      <span className="lay-mag-contents-num" aria-hidden>
                        {pad(i + 1)}
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </div>

        <div className="lay-mag-main">
          <h1 className="lay-mag-title">{t(mod.title, 'en')}</h1>
          {mod.subtitle && (
            <p className="lay-mag-deck">{formatCourseText(t(mod.subtitle, 'en'), 'en')}</p>
          )}
          {/* Only the providers this lesson genuinely names. */}
          <ProviderStrip module={mod} />

          {/* The runnable command the live lesson prints under the deck. This
              was the one layout that ignored it. */}
          {mod.hero && (
            <div className="lay-mag-hero">
              <CourseCode block={mod.hero} lang="en" />
            </div>
          )}

        </div>
      </header>

      {sections.map((section, si) => (
        <section key={si} className="lay-mag-sec" aria-labelledby={headingId(si)}>
          <div className="lay-mag-rule" />

          <div className="lay-mag-row lay-mag-sechead">
            <div className="lay-mag-margin">
              <p className="lay-mag-secnum" aria-hidden>
                {pad(si + 1)}
              </p>
            </div>
            <div className="lay-mag-main">
              <h2 className="lay-mag-h2" id={headingId(si)}>
                {t(section.heading, 'en')}
              </h2>
            </div>
          </div>

          {planned[si].map((piece, pi) =>
            piece.kind === 'plate' ? (
              <div key={pi} className="lay-mag-plate">
                <p className="lay-mag-plate-label">Fig. {pad(piece.n)}</p>
                <BlockRenderer
                  block={piece.block}
                  lang="en"
                  moduleSlug={mod.slug}
                  courseId={LAB_COURSE_ID}
                />
              </div>
            ) : (
              <div key={pi} className="lay-mag-row">
                <div className="lay-mag-margin">
                  {piece.quotes.map((q, qi) => (
                    <PullQuote key={qi} block={q} />
                  ))}
                </div>
                <div className="lay-mag-main">
                  {piece.flow.map((block, bi) =>
                    block === dropCap ? (
                      <div key={bi} className="lay-mag-dropcap">
                        <BlockRenderer
                          block={block}
                          lang="en"
                          moduleSlug={mod.slug}
                          courseId={LAB_COURSE_ID}
                        />
                      </div>
                    ) : (
                      <BlockRenderer
                        key={bi}
                        block={block}
                        lang="en"
                        moduleSlug={mod.slug}
                        courseId={LAB_COURSE_ID}
                      />
                    ),
                  )}
                </div>
              </div>
            ),
          )}
        </section>
      ))}

      <div className="lay-mag-row lay-mag-end">
        <div className="lay-mag-margin" />
        <div className="lay-mag-main">
          <span className="lay-mag-endmark" aria-hidden />
        </div>
      </div>

      {/* Advanced sections are published content: the live lesson folds them
          into a details tail rather than hiding them. Dropping them made this
          layout look shorter than its peers for reasons that were not about
          the layout at all. */}
      <AdvancedTail sections={advanced} moduleSlug={mod.slug} />

      <div className="lay-mag-row lay-mag-proof">
        <div className="lay-mag-margin">
          <p className="lay-mag-proof-label">Proof</p>
        </div>
        <div className="lay-mag-main">
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
    </article>
  );
}
