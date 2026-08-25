'use client';

import { useEffect, useState } from 'react';
import { CourseToc } from '@/app/components/course/CourseShell';
import { OnThisPage } from '@/app/components/course/OnThisPage';
import { OPEN_HARNESS_MODULES, OPEN_HARNESS_PARTS, t, type CourseModule } from '@/app/data/courses/open-harness';
import { LAYOUTS, byId, DEFAULT_LAYOUT } from './layouts';

import { WIP_LAB_BASE as LAB_BASE } from '../constants';
const STORE = 'dv-wip-layout';

/**
 * Picks one of the ten reading models and keeps it while you move between the
 * thirteen lessons — so each one is a course you can read end to end, not a
 * single mocked-up page. The choice is also in the URL (`?l=`) so a specific
 * layout can be linked to directly.
 */
export function LabPicker({ module: mod }: { module?: CourseModule }) {
  const [id, setId] = useState(DEFAULT_LAYOUT);

  useEffect(() => {
    // Only a value that actually names a layout counts. `??` lets '' through,
    // and byId falls back to the first layout, so `?l=` or a typo silently
    // overwrote a stored preference with the default.
    const fromUrl = new URLSearchParams(window.location.search).get('l');
    const known = (v: string | null) => (v && LAYOUTS.some((l) => l.id === v) ? v : null);
    const pick = byId(known(fromUrl) ?? window.localStorage.getItem(STORE)).id;
    setId(pick);
    window.localStorage.setItem(STORE, pick);
  }, []);

  const choose = (next: string) => {
    setId(next);
    window.localStorage.setItem(STORE, next);
    const url = new URL(window.location.href);
    url.searchParams.set('l', next);
    window.history.replaceState(null, '', url);
  };

  const layout = byId(id);
  const index = mod ? OPEN_HARNESS_MODULES.findIndex((m) => m.slug === mod.slug) : -1;
  const part = mod ? OPEN_HARNESS_PARTS.find((p) => p.id === mod.part) : undefined;

  return (
    <>
      {/* Toggle buttons, not tabs. role="tablist" promises arrow-key movement,
          aria-controls and a tabpanel, none of which exist here, and the promise
          is worse than no role at all. */}
      <div className="lab-picker" role="group" aria-label="Layouts">
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            type="button"
            aria-pressed={l.id === layout.id}
            className={`lab-tab ${l.id === layout.id ? 'is-active' : ''}`}
            onClick={() => choose(l.id)}
          >
            <span className="lab-tab-num">{String(l.n).padStart(2, '0')}</span>
            {l.name}
          </button>
        ))}
      </div>
      <p className="lab-blurb" aria-live="polite">
        {layout.blurb}
      </p>

      {!mod ? null : layout.chrome === 'full' ? (
        <div className="course-layout">
          <aside className="course-layout-nav">
            <CourseToc activeSlug={mod.slug} lang="en" basePath={LAB_BASE} />
          </aside>
          <div className="course-reading">
            <layout.Component
              module={mod}
              index={index}
              total={OPEN_HARNESS_MODULES.length}
              partTitle={part ? `Open Harness — ${t(part.title, 'en')}` : undefined}
            />
          </div>
          <aside className="course-layout-rail">
            {/* Re-scanned per layout. OnThisPage indexes .course-prose once with []
                  deps and stamps ids onto the nodes it finds; without a key it keeps
                  the first layout's list while pointing at elements that no longer
                  exist, so every rail link becomes a dead anchor. */}
              <OnThisPage key={layout.id} />
          </aside>
        </div>
      ) : (
        <div className="lab-wide">
          <layout.Component
            module={mod}
            index={index}
            total={OPEN_HARNESS_MODULES.length}
            partTitle={part ? `Open Harness — ${t(part.title, 'en')}` : undefined}
          />
        </div>
      )}
    </>
  );
}
