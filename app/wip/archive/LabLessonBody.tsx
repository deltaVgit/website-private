'use client';

import { BlockRenderer } from '@/app/components/course/lesson/BlockRenderer';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { InteractiveChecklist, MarkCompleteButton } from '@/app/components/course/CourseLearning';
import {
  OPEN_HARNESS_MODULES,
  OPEN_HARNESS_PARTS,
  t,
  type CourseBlock,
  type CourseModule,
  type CourseSection,
} from '@/app/data/courses/open-harness';
import { AnnotatedShot, CompareSlider, FlipCard, LabIcon, LoopDiagram, ReplayTerminal, StepRail } from './pieces';
import { ICON, MODULE_ICON, sectionIcon, termBrand, type Treatment } from './treatments';

/** The lab keeps its own progress so ticking a mock-up never touches the real course. */
const LAB_COURSE_ID = 'visual-lab';

const isKind = <K extends CourseBlock['k']>(b: CourseBlock, k: K): b is Extract<CourseBlock, { k: K }> =>
  b.k === k;

/**
 * One lesson, rendered through the real engine with a treatment layered on.
 *
 * The content is imported from `open-harness.ts`, never copied. Blocks go
 * through `BlockRenderer` unless the active treatment claims that kind — which
 * is how the lexicon becomes flip cards, or an image becomes an annotated
 * screenshot, without forking the course data.
 */
export function LabLessonBody({ module: mod, treatment }: { module: CourseModule; treatment: Treatment }) {
  const index = OPEN_HARNESS_MODULES.findIndex((m) => m.slug === mod.slug);
  const part = OPEN_HARNESS_PARTS.find((p) => p.id === mod.part);
  const sections: CourseSection[] = mod.sections ?? [];
  const headings = sections.map((s) => t(s.heading, 'en'));

  return (
    <article className={`course-prose vlab-t vlab-t${String(treatment.n).padStart(2, '0')}`}>
      <p className="course-meta">
        {String(index + 1).padStart(2, '0')} / {OPEN_HARNESS_MODULES.length}
        {part ? ` · Open Harness — ${t(part.title, 'en')}` : ''} · {mod.minutes} min
      </p>

      {treatment.heroIcon && (
        <LabIcon name={MODULE_ICON[mod.slug] ?? 'terminal'} className="vlab-hero-ico" />
      )}

      <h1 className="course-h1">{t(mod.title, 'en')}</h1>
      {mod.subtitle && <p className="course-lead">{formatCourseText(t(mod.subtitle, 'en'), 'en')}</p>}

      {treatment.stepRail && headings.length > 1 && (
        <div className="vlab-rail-wrap">
          <StepRail headings={headings} />
        </div>
      )}

      <div className="vlab-sections">
        {sections.map((section, si) => (
          <LabSection key={si} section={section} slug={mod.slug} treatment={treatment} first={si === 0} />
        ))}
      </div>

      <div className="course-proof mt-16">
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

function LabSection({
  section,
  slug,
  treatment,
  first,
}: {
  section: CourseSection;
  slug: string;
  treatment: Treatment;
  first: boolean;
}) {
  const heading = t(section.heading, 'en');
  const blocks = section.blocks ?? [];

  // The icon travels as a custom property so the heading can wear it through
  // CSS ::before — no extra element, and OnThisPage still sees a clean h2.
  const style = treatment.sectionIcons
    ? ({ ['--vlab-ico' as string]: `url("${ICON(sectionIcon(heading))}")` } as React.CSSProperties)
    : undefined;

  return (
    <section className="vlab-sec" style={style}>
      <h2 className="course-h2">{heading}</h2>
      <div className="course-blocks">
        {blocks.map((block, i) => (
          <LabBlock key={i} block={block} slug={slug} treatment={treatment} />
        ))}
        {first && treatment.animatedDiagram && <LoopDiagram />}
      </div>
    </section>
  );
}

function LabBlock({ block, slug, treatment }: { block: CourseBlock; slug: string; treatment: Treatment }) {
  // ── lexicon → flip cards
  if (treatment.flipLexicon && isKind(block, 'lexicon')) {
    return (
      <div className="vlab-flipgrid">
        {block.cards.map((card, i) => {
          const term = t(card.term, 'en');
          return (
            <FlipCard
              key={i}
              term={term}
              brand={termBrand(term)}
              body={formatCourseText(t(card.body, 'en'), 'en')}
              remember={formatCourseText(t(card.remember, 'en'), 'en')}
            />
          );
        })}
      </div>
    );
  }

  // ── lexicon → brand marks on the cards that name a product
  if (treatment.brandChips && !treatment.flipLexicon && isKind(block, 'lexicon')) {
    return (
      <div className="vlab-lexgrid">
        {block.cards.map((card, i) => {
          const term = t(card.term, 'en');
          const brand = termBrand(term);
          return (
            <article key={i} className="vlab-lexcard">
              <h3>
                {brand && <span className="vlab-brand" style={{ ['--vlab-ico' as string]: `url("/courses/visual-lab/brands/${brand}.svg")` }} aria-hidden />}
                {term}
              </h3>
              <p>{formatCourseText(t(card.body, 'en'), 'en')}</p>
              <p className="vlab-lexcard-remember">{formatCourseText(t(card.remember, 'en'), 'en')}</p>
            </article>
          );
        })}
      </div>
    );
  }

  // ── image → annotated screenshot
  if (treatment.annotatedShots && isKind(block, 'image')) {
    const file = block.src.split('/').pop() ?? '';
    return (
      <AnnotatedShot
        file={file}
        alt={t(block.alt, 'en')}
        caption={block.caption ? t(block.caption, 'en') : undefined}
        spots={[
          { x: 22, y: 28, text: 'Ce que vous tapez : la demande, en langage courant.' },
          { x: 62, y: 52, text: "Ce que l'agent propose, avant d'agir. Rien ne part sans votre accord." },
          { x: 38, y: 78, text: 'Le résultat, avec la trace de ce qui a été fait.' },
        ]}
      />
    );
  }

  // ── code → replayable terminal
  if (treatment.terminal && isKind(block, 'code')) {
    const lines = block.block.code.split('\n').flatMap((l) => (l.trim() ? [`$ ${l}`] : []));
    return (
      <ReplayTerminal
        title={block.block.label ? t(block.block.label, 'en') : 'terminal'}
        lines={lines}
      />
    );
  }

  // ── two-column table → draggable comparison
  if (treatment.slider && isKind(block, 'table') && block.headers.length === 2 && block.rows.length > 1) {
    return (
      <CompareSlider
        leftTitle={t(block.headers[0], 'en')}
        rightTitle={t(block.headers[1], 'en')}
        leftItems={block.rows.map((r) => t(r[0], 'en'))}
        rightItems={block.rows.map((r) => t(r[1], 'en'))}
      />
    );
  }

  return <BlockRenderer block={block} lang="en" moduleSlug={slug} courseId={LAB_COURSE_ID} />;
}
