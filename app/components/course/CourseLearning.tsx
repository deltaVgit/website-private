'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  clearCompleted,
  completionRatio,
  isComplete,
  readChecklist,
  readCompleted,
  readDesignPrereqOk,
  resumeSlug,
  setComplete,
  writeChecklist,
  writeDesignPrereqOk,
  type CourseProgressId,
} from '@/lib/course-progress';
import { formatCourseText } from '@/app/components/course/formatCourseText';
import { UI_COPY, t, type CourseLang } from '@/app/data/courses/open-harness';
import { localeFromPath } from '@/lib/i18n';

/* ─── Privacy (local-only) ─────────────────────────────── */

export function CoursePrivacyNote({ className = '' }: { className?: string }) {
  const lang = localeFromPath(usePathname() ?? '');
  return (
    <p
      className={`course-t-meta leading-relaxed text-[var(--text-tertiary)] max-w-xl ${className}`}
      role="note"
    >
      <span className="font-mono course-t-meta uppercase tracking-[1.5px] text-[var(--text-muted)]">
        {t(UI_COPY.privacy, lang)}
      </span>
      <br />
      {t(UI_COPY.privacyBody, lang)}
    </p>
  );
}

/* ─── Progress bar ─────────────────────────────────────── */

export function CourseProgressBar({
  courseId,
  orderedSlugs,
  accent = 'orange',
  showPrivacy = false,
}: {
  courseId: CourseProgressId;
  orderedSlugs: string[];
  accent?: 'orange' | 'cyan';
  showPrivacy?: boolean;
}) {
  const [ratio, setRatio] = useState(0);
  useEffect(() => {
    setRatio(completionRatio(courseId, orderedSlugs));
    const onStorage = () => setRatio(completionRatio(courseId, orderedSlugs));
    window.addEventListener('dv-course-progress', onStorage);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('dv-course-progress', onStorage);
      window.removeEventListener('storage', onStorage);
    };
  }, [courseId, orderedSlugs]);

  const pct = Math.round(ratio * 100);
  const done = Math.round(ratio * orderedSlugs.length);
  const color = accent === 'cyan' ? 'var(--accent-cyan)' : 'var(--course-accent)';

  return (
    <div className="course-progress mb-6">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
        <div>
          <div className="font-mono course-t-meta uppercase tracking-[1.5px] text-[var(--text-muted)]">
            On this device
          </div>
          <div className="mt-0.5 course-t-small text-[var(--text-secondary)]">
            <span className="text-[var(--text-primary)] font-medium tabular-nums">
              {done}
            </span>
            <span className="text-[var(--text-muted)]"> / {orderedSlugs.length} proofs</span>
            <span className="text-[var(--text-muted)]"> · {pct}%</span>
          </div>
        </div>
        {done > 0 && (
          <button
            type="button"
            className="course-ghost-btn"
            onClick={() => {
              if (
                typeof window !== 'undefined' &&
                window.confirm('Reset progress for this course on this device only?')
              ) {
                clearCompleted(courseId);
                setRatio(0);
                window.dispatchEvent(new Event('dv-course-progress'));
              }
            }}
          >
            Reset
          </button>
        )}
      </div>
      <div
        className="course-progress-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Course completion on this device"
      >
        <div className="course-progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      {showPrivacy && <CoursePrivacyNote className="mt-3" />}
    </div>
  );
}

/* ─── Mark module complete ─────────────────────────────── */

export function MarkCompleteButton({
  courseId,
  slug,
  accent = 'orange',
  lang = 'en',
}: {
  courseId: CourseProgressId;
  slug: string;
  accent?: 'orange' | 'cyan';
  lang?: CourseLang;
}) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDone(isComplete(courseId, slug));
  }, [courseId, slug]);

  const toggle = () => {
    const next = setComplete(courseId, slug, !done);
    setDone(next.includes(slug));
    window.dispatchEvent(new Event('dv-course-progress'));
  };

  const color = accent === 'cyan' ? 'var(--accent-cyan)' : 'var(--course-accent)';

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={done}
        className={`course-complete-btn ${done ? 'is-done' : ''}`}
        style={
          done
            ? { background: color, borderColor: color, color: 'var(--bg-deep)' }
            : undefined
        }
      >
        {done
          ? lang === 'fr'
            ? '✓ Preuve marquée'
            : '✓ Proof marked complete'
          : lang === 'fr'
            ? 'Marquer la preuve'
            : 'Mark proof complete'}
      </button>
      <p className="mt-2 course-t-meta text-[var(--text-muted)]">
        {lang === 'fr'
          ? 'Stocké sur cet appareil seulement — n’est envoyé nulle part.'
          : 'Stored on this device only — not sent anywhere.'}
      </p>
    </div>
  );
}

/* ─── Resume / continue ────────────────────────────────── */

export function ResumeCourseLink({
  courseId,
  orderedSlugs,
  basePath,
  className = 'button-primary',
  startLabel = 'Start course',
  continueLabel = 'Continue',
}: {
  courseId: CourseProgressId;
  orderedSlugs: string[];
  basePath: string;
  className?: string;
  startLabel?: string;
  continueLabel?: string;
}) {
  const [href, setHref] = useState(`${basePath}${orderedSlugs[0] ?? ''}/`);
  const [label, setLabel] = useState(startLabel);

  useEffect(() => {
    const done = readCompleted(courseId);
    const resume = resumeSlug(courseId, orderedSlugs);
    if (!resume) {
      setHref(basePath);
      setLabel(startLabel);
      return;
    }
    if (done.length === 0) {
      setHref(`${basePath}${orderedSlugs[0]}/`);
      setLabel(startLabel);
    } else if (done.length >= orderedSlugs.length) {
      setHref(`${basePath}${orderedSlugs[orderedSlugs.length - 1]}/`);
      setLabel('Review last module');
    } else {
      setHref(`${basePath}${resume}/`);
      setLabel(`${continueLabel} ${resume}`);
    }
  }, [courseId, orderedSlugs, basePath, startLabel, continueLabel]);

  return (
    <Link href={href} className={className}>
      {label} <span aria-hidden>↗</span>
    </Link>
  );
}

/* ─── Interactive checklist ────────────────────────────── */

/**
 * The persistence half of a checklist, extracted so CourseSteps can share the
 * exact same storage without nesting a copy button inside a toggle <button>
 * (invalid HTML, and the click would be stolen). Behaviour is byte-identical
 * to what lived inline here: positional flags under
 * `dv-check:{courseId}:{moduleSlug}:{sectionKey}`.
 */
export function useChecklistFlags(
  courseId: string,
  moduleSlug: string,
  sectionKey: string,
  length: number,
) {
  const [flags, setFlags] = useState<boolean[]>(() => Array.from({ length }, () => false));

  useEffect(() => {
    const saved = readChecklist(courseId, moduleSlug, sectionKey);
    setFlags(Array.from({ length }, (_, i) => Boolean(saved[i])));
  }, [courseId, moduleSlug, sectionKey, length]);

  // Side effects stay at statement level. Dispatching from inside a setState
  // updater lets React replay them during render, which fires setState on the
  // 'dv-course-progress' listeners (CourseToc, CourseProgressBar) mid-render.
  const toggle = useCallback(
    (index: number) => {
      const next = flags.map((v, i) => (i === index ? !v : Boolean(v)));
      setFlags(next);
      writeChecklist(courseId, moduleSlug, sectionKey, next);
      window.dispatchEvent(new Event('dv-course-progress'));
    },
    [flags, courseId, moduleSlug, sectionKey],
  );

  return { flags, toggle };
}

export function InteractiveChecklist({
  courseId,
  moduleSlug,
  sectionKey,
  items,
  accent = 'orange',
  mode = 'checklist',
  lang = 'en',
}: {
  courseId: string;
  moduleSlug: string;
  sectionKey: string;
  items: string[];
  accent?: 'orange' | 'cyan' | 'green';
  /** checklist = default; steps = numbered; proof = end-of-module claim */
  mode?: 'checklist' | 'steps' | 'proof';
  lang?: CourseLang;
}) {
  const { flags, toggle } = useChecklistFlags(courseId, moduleSlug, sectionKey, items.length);

  const mark =
    accent === 'cyan'
      ? 'var(--accent-cyan)'
      : accent === 'green'
        ? 'var(--accent-green)'
        : 'var(--course-accent)';

  const checked = flags.filter(Boolean).length;
  const label =
    mode === 'steps'
      ? lang === 'fr'
        ? 'Étapes · touchez pour cocher'
        : 'Steps · tap to check'
      : mode === 'proof'
        ? lang === 'fr'
          ? 'Preuve · cet appareil'
          : 'Proof · this device'
        : lang === 'fr'
          ? 'Checklist · cet appareil'
          : 'Checklist · this device';

  return (
    <div className="mt-5 course-measure">
      <div className="mb-2 flex justify-between course-t-meta font-mono uppercase tracking-[1px] text-[var(--text-muted)]">
        <span>{label}</span>
        <span className="tabular-nums">
          {checked}/{items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => {
          const on = flags[i];
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => toggle(i)}
                aria-pressed={on}
                className={`course-check-item ${on ? 'is-on' : ''} ${mode === 'steps' ? 'course-check-item--step' : ''}`}
              >
                <span
                  className="course-check-box shrink-0"
                  style={{
                    borderColor: on ? mark : undefined,
                    color: on ? mark : undefined,
                    background: on
                      ? `color-mix(in srgb, ${mark} 12%, transparent)`
                      : undefined,
                  }}
                  aria-hidden
                >
                  {on ? '✓' : mode === 'steps' ? String(i + 1).padStart(2, '0') : ''}
                </span>
                <span className={on ? 'text-[var(--text-tertiary)]' : 'text-[var(--text-secondary)]'}>
                  {formatCourseText(item, lang)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ─── Retrieval quiz (shuffled equal options) ──────────── */

function shuffleCopy<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function CourseQuizBlock({
  question,
  options,
  correct,
  explain,
  label = 'Check yourself',
  lang = 'en',
}: {
  question: string;
  options: string[];
  correct: string;
  explain: string;
  label?: string;
  lang?: CourseLang;
}) {
  // SSR uses given order; shuffle once after mount (stable key) to avoid hydration mismatch.
  const optionsKey = options.join('\0');
  const [order, setOrder] = useState(options);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    setOrder(shuffleCopy(options));
    setPicked(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reshuffle only when option set changes
  }, [optionsKey]);

  const answered = picked !== null;
  const ok = picked === correct;

  return (
    <div className="course-quiz mt-7">
      {/* Labelled as an exercise up front: readers were scrolling past these
          without registering that they were meant to answer something. */}
      <div className="course-quiz-tag">
        <span className="course-quiz-tag-mark" aria-hidden>
          ?
        </span>
        <span>
          {lang === 'fr' ? 'Exercice' : 'Exercise'} · {label}
        </span>
      </div>
      <p className="course-quiz-question">{question}</p>
      <p className="course-quiz-hint">
        {lang === 'fr'
          ? 'Choisissez une réponse — le résultat s’affiche tout de suite.'
          : 'Pick one — the answer is revealed straight away.'}
      </p>
      <div className="mt-3 space-y-2">
        {order.map((opt) => {
          let cls = 'course-quiz-opt';
          if (answered) {
            if (opt === correct) cls += ' is-correct';
            else if (opt === picked) cls += ' is-wrong';
            else cls += ' is-dim';
          }
          return (
            <button
              key={opt}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => setPicked(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {answered && (
        <p
          className={`mt-3 course-t-small leading-relaxed ${ok ? 'text-[var(--accent-green)]' : 'text-[var(--accent-cyan)]'}`}
        >
          {ok ? (lang === 'fr' ? 'Correct. ' : 'Correct. ') : lang === 'fr' ? 'Pas tout à fait. ' : 'Not quite. '}
          {explain}
        </p>
      )}
    </div>
  );
}

/* ─── Mastery | Labs tabs ──────────────────────────────── */

export function HarnessCourseTabs({ active }: { active: 'mastery' | 'labs' | 'glossary' }) {
  const tabs = [
    { id: 'mastery' as const, href: '/forge/course/my-first-ai-agent/', label: 'Mastery' },
    { id: 'labs' as const, href: '/forge/course/my-first-ai-agent/labs/', label: 'Labs & skills' },
    { id: 'glossary' as const, href: '/forge/course/my-first-ai-agent/glossary/', label: 'Glossary' },
  ];
  return (
    <div className="course-segmented" role="tablist" aria-label="My First AI Agent sections">
      {tabs.map((tab) => {
        const on = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            role="tab"
            aria-selected={on}
            className={`course-segmented-item ${on ? 'is-active' : ''}`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

/* ─── Design prereq soft gate ──────────────────────────── */

export function DesignPrereqGate() {
  const [ok, setOk] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOk(readDesignPrereqOk());
    setReady(true);
  }, []);

  if (!ready || ok) return null;

  return (
    <div className="course-callout course-callout--warn mt-8 course-measure">
      <div className="font-mono course-t-meta tracking-[2px] uppercase text-[var(--accent-amber)]">
        Soft gate · My First AI Agent Part I
      </div>
      <p className="mt-3 course-t-small text-[var(--text-secondary)] leading-relaxed">
        Open Design assumes Hermes Desktop (or CLI) chats, a profile with SOUL.md, and that you can
        list/install a skill. If any of that is false, finish My First AI Agent Part I first — Design will
        not re-teach install.
      </p>
      <p className="mt-2 course-t-meta text-[var(--text-muted)]">
        Confirmation is stored on this device only.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/forge/course/my-first-ai-agent/00/" className="button-primary">
          My First AI Agent Part I ↗
        </Link>
        <button
          type="button"
          className="button-secondary"
          onClick={() => {
            writeDesignPrereqOk(true);
            setOk(true);
          }}
        >
          I already finished Part I
        </button>
      </div>
    </div>
  );
}

/* ─── TOC complete set ─────────────────────────────────── */

export function useCompletedSet(courseId: CourseProgressId): Set<string> {
  const [set, setSet] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const refresh = () => setSet(new Set(readCompleted(courseId)));
    refresh();
    window.addEventListener('dv-course-progress', refresh);
    return () => window.removeEventListener('dv-course-progress', refresh);
  }, [courseId]);
  return set;
}
