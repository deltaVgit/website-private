'use client';

import { BlockRenderer } from '@/app/components/course/lesson/BlockRenderer';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import { t, type CourseBlock } from '@/app/data/courses/open-harness';
import { LAB_COURSE_ID, type LayoutProps, lessonSections } from '../types';
import { AdvancedTail } from '../AdvancedTail';
import { ProviderStrip, HeadingGlyph } from '../kit/Glyph';
import './02-media-gutter.css';

/**
 * 02 — Text and media facing each other.
 *
 * Reading model: the prose keeps one narrow column on the left and nothing
 * ever interrupts it. Everything that is *looked at* rather than *read* —
 * screenshots, diagrams, tables, commands, notes, sources — is lifted out of
 * the flow into a right-hand gutter, on the same grid row as the section it
 * belongs to, and pinned there while that section scrolls past.
 *
 * The bet: a paragraph and the screenshot it describes should be side by side,
 * not one after the other. The cost is honest and visible — a section with six
 * screenshots and two paragraphs leaves white space in the text column, which
 * is exactly the imbalance the linear column hides by stacking.
 *
 * Below 60rem the gutter collapses under its own section, keeping the order
 * (section text, then its visuals) rather than folding back into the prose.
 */

/** Kinds that leave the flow. Everything else stays in the reading column. */
type MediaKind = 'image' | 'figure' | 'table' | 'code' | 'tweet' | 'callout' | 'refs';
type MediaBlock = Extract<CourseBlock, { k: MediaKind }>;

const MEDIA_KINDS: readonly string[] = [
  'image',
  'figure',
  'table',
  'code',
  'tweet',
  'callout',
  'refs',
];
/** Only the *visual* ones get a number and an entry in the header index. */
const NUMBERED_KINDS: readonly string[] = ['image', 'figure', 'table', 'code', 'tweet'];

const isMedia = (b: CourseBlock): b is MediaBlock => MEDIA_KINDS.includes(b.k);

function kindLabel(b: MediaBlock): string {
  switch (b.k) {
    case 'image':
      return 'Screenshot';
    case 'figure':
      return 'Diagram';
    case 'table':
      return 'Table';
    case 'code':
      return 'Command';
    case 'tweet':
      return 'Post';
    case 'refs':
      return 'Sources';
    case 'callout':
      return b.variant === 'warning' ? 'Warning' : b.variant === 'quote' ? 'Quote' : 'Note';
  }
}

/**
 * A label for the index, taken from the course data and never invented — the
 * image's own caption or alt text, the table's first header, the command's own
 * label. When the block carries no words of its own the index shows the kind
 * alone, rather than a slug no author ever wrote.
 */
function mediaTitle(b: MediaBlock): string {
  switch (b.k) {
    case 'image':
      return t(b.caption ?? b.alt, 'en');
    case 'table':
      return b.headers.length > 0 ? t(b.headers[0], 'en') : '';
    case 'code':
      return b.block.label ? t(b.block.label, 'en') : (b.block.lang ?? '');
    case 'tweet':
      return b.author;
    default:
      return '';
  }
}

type Item = { block: MediaBlock; n: number | null; id?: string };

export default function MediaGutterLayout({ module: mod, index, total, partTitle }: LayoutProps) {
  const { main: sections, advanced } = lessonSections(mod);

  // One pass, so the numbering runs across the whole lesson and the header
  // index can point at an item that lives several sections down.
  let counter = 0;
  const rows = sections.map((section) => {
    const blocks = section.blocks ?? [];
    const items: Item[] = [];
    for (const block of blocks) {
      if (!isMedia(block)) continue;
      if (NUMBERED_KINDS.includes(block.k)) {
        counter += 1;
        items.push({ block, n: counter, id: `lay-gutter-v${counter}` });
      } else {
        items.push({ block, n: null });
      }
    }
    return { section, prose: blocks.filter((b) => !isMedia(b)), items };
  });

  const numbered = rows.flatMap((r) => r.items).filter((it) => it.n !== null);
  const showIndex = numbered.length >= 3;

  return (
    <article className="course-prose lay-gutter">
      <div className="lay-gutter-row lay-gutter-row--head">
        <div className="lay-gutter-text">
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
          {/* Only the providers the lesson names; silent when it names none.
              It sits in the text column, so it obeys the same measure as the
              prose rather than drifting into the media gutter. */}
          <ProviderStrip module={mod} />
        </div>

        <div className="lay-gutter-side">
          <div className="lay-gutter-sticky">
            {mod.hero && (
              <div className="lay-gutter-item">
                <ItemHead label="Run this" />
                <BlockRenderer
                  block={{ k: 'code', block: mod.hero }}
                  lang="en"
                  moduleSlug={mod.slug}
                  courseId={LAB_COURSE_ID}
                />
              </div>
            )}

            {showIndex && (
              <nav className="lay-gutter-index" aria-label="Visuals in this lesson">
                <p className="lay-gutter-index-title">
                  Visuals <span className="lay-gutter-index-count">{numbered.length}</span>
                </p>
                <ul className="lay-gutter-index-list">
                  {numbered.map((it) => {
                    const title = mediaTitle(it.block);
                    return (
                      <li key={it.id}>
                        <a className="lay-gutter-idx" href={`#${it.id}`}>
                          <span className="lay-gutter-idx-num">{String(it.n).padStart(2, '0')}</span>
                          <span className="lay-gutter-idx-body">
                            <span className="lay-gutter-idx-kind">{kindLabel(it.block)}</span>
                            {title && (
                              <span className="lay-gutter-idx-label">
                                {formatCourseText(title, 'en')}
                              </span>
                            )}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      {rows.map(({ section, prose, items }, i) => (
        <section className="lay-gutter-row" key={i}>
          <div className="lay-gutter-text">
            <h2 className="course-h2">
              <HeadingGlyph heading={t(section.heading, 'en')} />{' '}
              {t(section.heading, 'en')}
            </h2>
            {prose.length > 0 && (
              <div className="course-blocks">
                {prose.map((block, bi) => (
                  <BlockRenderer
                    key={bi}
                    block={block}
                    lang="en"
                    moduleSlug={mod.slug}
                    courseId={LAB_COURSE_ID}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lay-gutter-side">
            <div className="lay-gutter-sticky">
              <p className="lay-gutter-tag" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </p>
              {items.map((it, ii) => (
                <div className="lay-gutter-item" key={ii} id={it.id}>
                  <ItemHead label={kindLabel(it.block)} n={it.n} />
                  <BlockRenderer
                    block={it.block}
                    lang="en"
                    moduleSlug={mod.slug}
                    courseId={LAB_COURSE_ID}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Advanced sections are published content: the live lesson folds them
          into a details tail rather than hiding them. Dropping them made this
          layout look shorter than its peers for reasons that were not about
          the layout at all. */}
      <AdvancedTail sections={advanced} moduleSlug={mod.slug} />

      <div className="lay-gutter-row lay-gutter-row--proof">
        <div className="lay-gutter-text">
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
        </div>
        <div className="lay-gutter-side">
          <div className="lay-gutter-sticky">
            <MarkCompleteButton
              courseId={LAB_COURSE_ID}
              slug={mod.slug}
              accent="orange"
              lang="en"
            />
          </div>
        </div>
      </div>
    </article>
  );
}

/** The hairline that ties one gutter item to the row it belongs to. */
function ItemHead({ label, n }: { label: string; n?: number | null }) {
  return (
    <p className="lay-gutter-item-head">
      {n != null && <span className="lay-gutter-item-num">{String(n).padStart(2, '0')}</span>}
      <span>{label}</span>
      <span className="lay-gutter-item-rule" aria-hidden />
    </p>
  );
}
