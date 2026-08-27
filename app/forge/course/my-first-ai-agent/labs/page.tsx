import type { Metadata } from 'next';
import Link from 'next/link';
import { AihChrome } from '@/app/components/course/aihero/AihChrome';
import { LabsLandingVisual } from '@/app/components/course/CourseVisuals';
import { CoursePrivacyNote } from '@/app/components/course/CourseLearning';
import { HARNESS_LABS, HARNESS_LABS_META } from '@/app/data/courses/harness-labs';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'My First AI Agent — Harness Labs | Delta V',
  description: HARNESS_LABS_META.description,
  openGraph: {
    title: HARNESS_LABS_META.title,
    description: HARNESS_LABS_META.tagline,
    url: `${SITE_URL}/forge/course/my-first-ai-agent/labs/`,
    siteName: 'Delta V',
    type: 'website',
  },
};

const levelLabel = {
  'after-part-i': 'After Part I',
  'after-part-ii': 'After Part II',
  advanced: 'Advanced',
} as const;

export default function HarnessLabsIndexPage() {
  return (
    <AihChrome labs={{}}>
    <article className="course-prose">
      <div className="course-meta">
        <span className="course-meta-num">＋</span>
        <span aria-hidden>·</span>
        <span>After mastery · not a second course</span>
      </div>
      <h1 className="course-h1 mt-4">{HARNESS_LABS_META.title}</h1>
      <CoursePrivacyNote className="mt-4" />
      <p className="mt-6 max-w-2xl text-xl text-[var(--text-secondary)] leading-relaxed">
        {HARNESS_LABS_META.tagline}
      </p>
      <p className="mt-4 max-w-2xl text-[var(--text-secondary)] leading-relaxed">
        {HARNESS_LABS_META.description}
      </p>

      <div className="mt-6 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] p-5 max-w-2xl">
        <div className="font-mono text-[10px] tracking-[2px] uppercase text-[var(--accent-cyan)]">
          Assumes
        </div>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          Hermes is already installed and chatting (My First AI Agent Part I). Course default is{' '}
          <strong className="font-medium text-[var(--text-primary)]">Hermes Desktop</strong> from mastery
          03 — profile + SOUL exist; several drills open the Desktop cockpit. Labs do not re-teach install,
          BotFather from zero, or vault setup. CLI-only is fine if you can map the same proofs. If anything
          is missing, open the mastery modules first.
        </p>
        <Link
          href="/forge/course/my-first-ai-agent/"
          className="mt-3 inline-block text-sm font-medium text-[var(--course-accent)]"
        >
          My First AI Agent course →
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/forge/course/my-first-ai-agent/00/" className="button-primary">
          Start mastery Part I
        </Link>
        <Link href="/forge/course/open-design/" className="button-secondary">
          Open Design
        </Link>
      </div>

      <section className="mt-12" aria-labelledby="labs-glance">
        <h2 id="labs-glance" className="course-h2">
          Mastery vs labs
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Pedagogy lives in My First AI Agent. Labs only drill and produce artifacts.
        </p>
        <LabsLandingVisual />
      </section>

      <div className="mt-14 divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
        {HARNESS_LABS.map((lab) => (
          <Link
            key={lab.slug}
            href={`/forge/course/my-first-ai-agent/labs/${lab.slug}/`}
            className="forge-course-link group grid md:grid-cols-[4rem_minmax(0,1fr)_8rem] gap-4 py-6"
          >
            <span className="font-mono text-xs text-[var(--course-accent)]">{lab.number}</span>
            <span>
              <h2 className="text-lg font-semibold group-hover:text-[var(--course-accent)]">
                {lab.title}
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{lab.subtitle}</p>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">Requires: {lab.requires}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[1px] text-[var(--text-muted)]">
                  {levelLabel[lab.level]}
                </span>
                {lab.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border-default)] px-2 py-0.5 text-[10px] text-[var(--text-tertiary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)] self-center">
              ~{lab.minutes} min
            </span>
          </Link>
        ))}
      </div>
    </article>
    </AihChrome>
  );
}
