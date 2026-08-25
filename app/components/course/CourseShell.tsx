'use client';

import Link from 'next/link';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  OPEN_HARNESS_MODULES,
  OPEN_HARNESS_PARTS,
  UI_COPY,
  courseBase,
  type CourseLang,
  type CourseModule,
  type CoursePartId,
  t,
} from '@/app/data/courses/open-harness';
import { useCompletedSet } from '@/app/components/course/CourseLearning';
import type { CourseProgressId } from '@/lib/course-progress';
import { OnThisPage } from '@/app/components/course/OnThisPage';

/** EN-only until a full FR translate pass exists (toggle removed to avoid half-FR UI). */
const LangContext = createContext<{
  lang: CourseLang;
  setLang: (lang: CourseLang) => void;
}>({ lang: 'en', setLang: () => {} });

export function useOpenHarnessLang(): CourseLang {
  return useContext(LangContext).lang;
}

export function CourseLangProvider({
  children,
  defaultLang = 'en',
}: {
  children: ReactNode;
  defaultLang?: CourseLang;
}) {
  const value = useMemo(
    () => ({ lang: defaultLang, setLang: () => {} }),
    [defaultLang],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

function modulesForPart(partId: CoursePartId) {
  return OPEN_HARNESS_MODULES.filter((m) => m.part === partId);
}

export function CourseToc({
  activeSlug,
  lang,
  compact = false,
  basePath = '/forge/course/my-first-ai-agent/',
  courseId = 'open-harness',
}: {
  activeSlug?: string;
  lang: CourseLang;
  compact?: boolean;
  /** Route prefix — lets the OH2 edition reuse this nav on its own routes. */
  basePath?: string;
  /**
   * Which progress store the ticks come from. Defaults to the live course,
   * so every existing caller is unchanged. A sandbox that writes its own
   * progress has to pass its id here too, or the rail reports the real
   * course's completions against the sandbox's lessons.
   */
  courseId?: CourseProgressId;
}) {
  const done = useCompletedSet(courseId);
  const pct = Math.round((done.size / OPEN_HARNESS_MODULES.length) * 100);
  return (
    <nav
      aria-label={t(UI_COPY.modules, lang)}
      className={
        compact
          ? 'course-nav'
          : 'course-nav course-toc--scroll sticky top-24 max-h-[calc(100vh-6.5rem)] overflow-y-auto overscroll-y-contain'
      }
    >
      {/* Progress lives here, as one quiet line — it used to be a labelled
          block under the breadcrumb competing with the lesson title. */}
      <div className="course-nav-progress">
        <div className="course-progress-track">
          <div
            className="course-progress-fill"
            style={{ width: `${pct}%`, background: 'var(--course-accent)' }}
          />
        </div>
        <span className="course-nav-progress-label">
          {done.size} / {OPEN_HARNESS_MODULES.length}
        </span>
      </div>

      {OPEN_HARNESS_PARTS.map((part) => (
        <div key={part.id} className="course-nav-group">
          <div className="course-nav-group-label">{t(part.title, lang)}</div>
          <ol>
            {modulesForPart(part.id).map((mod) => {
              const active = activeSlug === mod.slug;
              return (
                <li key={mod.slug}>
                  <Link
                    href={`${basePath}${mod.slug}/`}
                    aria-current={active ? 'page' : undefined}
                    className={`course-nav-item ${active ? 'is-active' : ''} ${
                      done.has(mod.slug) ? 'is-done' : ''
                    }`}
                  >
                    <span className="course-nav-num" aria-hidden>
                      {mod.number}
                    </span>
                    <span>{t(mod.title, lang)}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}

      <div className="course-nav-group">
        <div className="course-nav-group-label">{t(UI_COPY.reference, lang)}</div>
        <ol>
          <li>
            <Link href={`${courseBase(lang)}glossary/`} className="course-nav-item">
              <span className="course-nav-num" aria-hidden>
                ·
              </span>
              <span>{t(UI_COPY.glossary, lang)}</span>
            </Link>
          </li>
          <li>
            <Link href="/forge/course/my-first-ai-agent/labs/" className="course-nav-item">
              <span className="course-nav-num" aria-hidden>
                ·
              </span>
              <span>Harness Labs</span>
            </Link>
          </li>
        </ol>
      </div>
    </nav>
  );
}

export function ModuleNav({
  module,
  lang,
  basePath = '/forge/course/my-first-ai-agent/',
}: {
  module: CourseModule;
  lang: CourseLang;
  /** Route prefix — lets the OH2 edition reuse prev/next on its own routes. */
  basePath?: string;
}) {
  const idx = OPEN_HARNESS_MODULES.findIndex((m) => m.slug === module.slug);
  const prev = idx > 0 ? OPEN_HARNESS_MODULES[idx - 1] : null;
  const next = idx < OPEN_HARNESS_MODULES.length - 1 ? OPEN_HARNESS_MODULES[idx + 1] : null;
  const crossingToPart2 = module.slug === '06' && next?.slug === '07';
  const crossingFromPart1 = module.slug === '07' && prev?.slug === '06';

  return (
    <div className="mt-14 space-y-4 border-t border-[var(--border-default)] pt-8">
      {crossingToPart2 && (
        <p className="course-t-small text-[var(--text-secondary)] leading-relaxed course-measure">
          <span className="font-mono course-t-meta text-[var(--accent-cyan)] tracking-[1px] uppercase">
            {t(UI_COPY.endOfPartI, lang)}
          </span>
          <br />
          {t(UI_COPY.endOfPartIBody, lang)}
        </p>
      )}
      {crossingFromPart1 && (
        <p className="course-t-small text-[var(--text-secondary)] leading-relaxed course-measure">
          <span className="font-mono course-t-meta text-[var(--accent-cyan)] tracking-[1px] uppercase">
            {t(UI_COPY.partIIBegins, lang)}
          </span>
          <br />
          {t(UI_COPY.partIIBeginsBody, lang)}
        </p>
      )}
      {/* Real targets, not 14px text links at 72% opacity. "Next" carries the
          accent so forward motion is the visually dominant action. */}
      <div className="course-nav-cards">
        {prev ? (
          <Link href={`${basePath}${prev.slug}/`} className="course-nav-card">
            <span className="course-nav-card-dir">← {t(UI_COPY.prev, lang)}</span>
            <span className="course-nav-card-title">{t(prev.title, lang)}</span>
          </Link>
        ) : (
          <Link href={basePath} className="course-nav-card">
            <span className="course-nav-card-dir">←</span>
            <span className="course-nav-card-title">{t(UI_COPY.backCourse, lang)}</span>
          </Link>
        )}
        {next ? (
          <Link
            href={`${basePath}${next.slug}/`}
            className="course-nav-card course-nav-card--next"
          >
            <span className="course-nav-card-dir">{t(UI_COPY.next, lang)} →</span>
            <span className="course-nav-card-title">{t(next.title, lang)}</span>
          </Link>
        ) : (
          <Link
            href={lang === 'fr' ? '/fr/contact/?topic=open-harness' : '/contact/?topic=open-harness'}
            className="course-nav-card course-nav-card--next"
          >
            <span className="course-nav-card-dir">{t(UI_COPY.contactNext, lang)}</span>
            <span className="course-nav-card-title">{t(UI_COPY.contactDv, lang)}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

export function CoursePageChrome({
  children,
  activeSlug,
}: {
  children: ReactNode;
  activeSlug?: string;
}) {
  return (
    <CourseLangProvider>
      <CoursePageChromeInner activeSlug={activeSlug}>{children}</CoursePageChromeInner>
    </CourseLangProvider>
  );
}

function CoursePageChromeInner({
  children,
  activeSlug,
}: {
  children: ReactNode;
  activeSlug?: string;
}) {
  const lang = useOpenHarnessLang();
  const activeMod = activeSlug ? OPEN_HARNESS_MODULES.find((m) => m.slug === activeSlug) : null;
  const activePart = activeMod
    ? OPEN_HARNESS_PARTS.find((p) => p.id === activeMod.part)
    : null;

  return (
    <div className="course-surface min-h-screen">
      <div className="page-container pt-8 md:pt-10 pb-24">
        {/* One quiet line of chrome. The privacy chip and the segmented tabs
            used to sit here in two different shapes and two different sizes,
            pulling the eye away from the lesson title; both now live in the
            left rail, where navigation belongs. */}
        <nav className="course-crumbs" aria-label="Breadcrumb">
          <Link href="/forge/">{t(UI_COPY.backForge, lang)}</Link>
          <span aria-hidden>/</span>
          {activeSlug ? (
            <>
              <Link href="/forge/course/my-first-ai-agent/">{t(UI_COPY.backCourse, lang)}</Link>
              <span aria-hidden>/</span>
              <span className="course-crumbs-here">
                {activePart ? `${t(UI_COPY.part, lang)} ${activePart.code} · ` : ''}
                {activeSlug}
              </span>
            </>
          ) : (
            <span className="course-crumbs-here">{t(UI_COPY.backCourse, lang)}</span>
          )}
        </nav>

        <div className="course-layout">
          <aside className="course-layout-nav">
            <CourseToc activeSlug={activeSlug} lang={lang} />
          </aside>
          <div className="course-reading">{children}</div>
          <aside className="course-layout-rail">
            <OnThisPage />
          </aside>
        </div>

        <div className="course-mobile-toc-wrap lg:hidden">
          <details className="course-disclose">
            <summary className="course-disclose-summary">
              <span className="course-advanced-chevron" aria-hidden>
                ▸
              </span>
              <span>All lessons</span>
            </summary>
            <div className="course-disclose-body max-h-[50vh] overflow-y-auto overscroll-y-contain">
              <CourseToc activeSlug={activeSlug} lang={lang} compact />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
