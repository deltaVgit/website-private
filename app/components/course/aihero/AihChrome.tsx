'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import {
  CourseLangProvider,
  CourseToc,
  useOpenHarnessLang,
} from '@/app/components/course/CourseShell';
import { OnThisPage } from '@/app/components/course/OnThisPage';
import {
  OPEN_HARNESS_MODULES,
  OPEN_HARNESS_PARTS,
  UI_COPY,
  courseBase,
  t,
} from '@/app/data/courses/open-harness';
import { localeFromPath } from '@/lib/i18n';

export const OH2_BASE = '/forge/course/my-first-ai-agent/';

/**
 * My First AI Agent chrome — the aihero.dev shell: flat opaque surface,
 * 273/699/232 columns, quiet breadcrumb, shared left nav and right rail.
 * Reuses CourseToc/OnThisPage; only the surface class and basePath differ.
 */
export function AihChrome({
  children,
  activeSlug,
  labs,
}: {
  children: ReactNode;
  activeSlug?: string;
  /** Lab pages: crumb is Labs / 05, and the TOC highlights Harness Labs. */
  labs?: { number?: string };
}) {
  const pathname = usePathname() ?? '';
  const lang = localeFromPath(pathname);
  return (
    <CourseLangProvider defaultLang={lang}>
      <AihChromeInner activeSlug={activeSlug} labs={labs}>
        {children}
      </AihChromeInner>
    </CourseLangProvider>
  );
}

function AihChromeInner({
  children,
  activeSlug,
  labs,
}: {
  children: ReactNode;
  activeSlug?: string;
  labs?: { number?: string };
}) {
  const lang = useOpenHarnessLang();
  const base = courseBase(lang);
  const forgeHref = lang === 'fr' ? '/fr/forge/' : '/forge/';
  const activeMod = activeSlug ? OPEN_HARNESS_MODULES.find((m) => m.slug === activeSlug) : null;
  const activePart = activeMod ? OPEN_HARNESS_PARTS.find((p) => p.id === activeMod.part) : null;
  const labsHref = `${base}labs/`;

  return (
    <div className="aih-surface min-h-screen">
      <div className="page-container pt-8 md:pt-10 pb-24">
        <nav className="course-crumbs" aria-label="Breadcrumb">
          <Link href={forgeHref}>{t(UI_COPY.backForge, lang)}</Link>
          <span aria-hidden>/</span>
          {labs ? (
            <>
              <Link href={base}>{t(UI_COPY.backCourse, lang)}</Link>
              <span aria-hidden>/</span>
              {labs.number ? (
                <>
                  <Link href={labsHref}>{t(UI_COPY.labs, lang)}</Link>
                  <span aria-hidden>/</span>
                  <span className="course-crumbs-here">{labs.number}</span>
                </>
              ) : (
                <span className="course-crumbs-here">{t(UI_COPY.labs, lang)}</span>
              )}
            </>
          ) : activeSlug ? (
            <>
              <Link href={base}>{t(UI_COPY.backCourse, lang)}</Link>
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
            <CourseToc
              activeSlug={activeSlug}
              lang={lang}
              basePath={base}
              labsActive={!!labs}
            />
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
              <span>{t(UI_COPY.syllabus, lang)}</span>
            </summary>
            <div className="course-disclose-body max-h-[50vh] overflow-y-auto overscroll-y-contain">
              <CourseToc
                activeSlug={activeSlug}
                lang={lang}
                compact
                basePath={base}
                labsActive={!!labs}
              />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
