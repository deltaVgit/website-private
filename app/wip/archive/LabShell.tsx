'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CourseToc } from '@/app/components/course/CourseShell';
import { OnThisPage } from '@/app/components/course/OnThisPage';
import { OPEN_HARNESS_MODULES, t, type CourseModule } from '@/app/data/courses/open-harness';
import { LabLessonBody } from './LabLessonBody';
import { byId, DEFAULT_TREATMENT, TREATMENTS } from './treatments';

export const LAB_BASE = '/wip/archive/';
const STORE = 'dv-visual-lab-treatment';

/**
 * The lab shell: the real course chrome, plus a picker that swaps the whole
 * visual system. The choice is remembered, so moving between the thirteen
 * modules keeps the treatment — each one is a complete course you can read
 * end to end, not a single mocked-up page.
 */
export function LabShell({ module: mod }: { module?: CourseModule }) {
  const [id, setId] = useState<string>(DEFAULT_TREATMENT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('v');
    const stored = window.localStorage.getItem(STORE);
    const pick = byId(fromUrl ?? stored).id;
    setId(pick);
    window.localStorage.setItem(STORE, pick);
    setReady(true);
  }, []);

  const choose = (next: string) => {
    setId(next);
    window.localStorage.setItem(STORE, next);
    const url = new URL(window.location.href);
    url.searchParams.set('v', next);
    window.history.replaceState(null, '', url);
  };

  const treatment = byId(id);

  return (
    <div className="aih-surface min-h-screen">
      <div className="page-container pt-8 md:pt-10 pb-24">
        <nav className="course-crumbs" aria-label="Fil d’Ariane">
          <Link href="/forge/">Forge</Link>
          <span aria-hidden>/</span>
          <Link href={LAB_BASE}>First attempt</Link>
          {mod && (
            <>
              <span aria-hidden>/</span>
              <span className="course-crumbs-here">{mod.slug}</span>
            </>
          )}
        </nav>

        <div className="vlab-picker" role="tablist" aria-label="Traitements visuels">
          {TREATMENTS.map((tr) => (
            <button
              key={tr.id}
              type="button"
              role="tab"
              aria-selected={tr.id === treatment.id}
              className={`vlab-tab ${tr.id === treatment.id ? 'is-active' : ''}`}
              onClick={() => choose(tr.id)}
            >
              <span className="vlab-tab-num">{String(tr.n).padStart(2, '0')}</span>
              {tr.name}
            </button>
          ))}
        </div>

        <p className="vlab-blurb">
          <b>{treatment.name}</b> · <span className="vlab-tech">{treatment.tech}</span> — {treatment.blurb}
        </p>

        {!ready ? null : mod ? (
          <div className="course-layout vlab-layout">
            <aside className="course-layout-nav">
              <CourseToc activeSlug={mod.slug} lang="en" basePath={LAB_BASE} />
            </aside>
            <div className="course-reading">
              <LabLessonBody module={mod} treatment={treatment} />
            </div>
            <aside className="course-layout-rail">
              <OnThisPage />
            </aside>
          </div>
        ) : (
          <LabIndex />
        )}
      </div>
    </div>
  );
}

function LabIndex() {
  return (
    <div className="vlab-index">
      <h1 className="course-h1">Dix traitements, le cours entier</h1>
      <p className="course-lead">
        Choisissez un traitement ci-dessus, puis parcourez les treize leçons : il vous suit d’un module à
        l’autre. Le texte ne change jamais, seule la mise en forme visuelle varie.
      </p>
      <ol className="vlab-modlist">
        {OPEN_HARNESS_MODULES.map((m, i) => (
          <li key={m.slug}>
            <Link href={`${LAB_BASE}${m.slug}/`}>
              <span className="vlab-modnum">{String(i + 1).padStart(2, '0')}</span>
              <span className="vlab-modtitle">{t(m.title, 'en')}</span>
              <span className="vlab-modmin">{m.minutes} min</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
