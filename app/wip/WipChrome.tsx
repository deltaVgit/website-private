'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { CourseToc } from '@/app/components/course/CourseShell';
import { OnThisPage } from '@/app/components/course/OnThisPage';

import { WIP_BASE, WIP_COURSE_BASE, WIP_COURSE_ID } from './constants';

/**
 * WIP chrome — the course shell, on a surface nothing in production reads.
 *
 * It carries `aih-surface` so the lesson looks exactly like the live course,
 * plus `wip-surface`, which is where every proposal in `wip.css` hangs. That
 * pairing is the whole point: same baseline, changes isolated, so a proposal
 * can be judged side by side without a single line moving in
 * `app/forge/course/course.css`.
 */
export function WipChrome({
  children,
  activeSlug,
  crumb,
  banner,
}: {
  children: ReactNode;
  activeSlug?: string;
  crumb?: string;
  banner?: ReactNode;
}) {
  return (
    <div className="aih-surface wip-surface min-h-screen">
      <div className="page-container pt-8 md:pt-10 pb-24">
        <nav className="course-crumbs" aria-label="Breadcrumb">
          <Link href={WIP_BASE}>WIP</Link>
          {crumb && (
            <>
              <span aria-hidden>/</span>
              <span className="course-crumbs-here">{crumb}</span>
            </>
          )}
        </nav>

        {banner ?? (
          <p className="wip-banner">
            <b>Work in progress</b>
            <span>
              Proposals only. Nothing here ships until you say so, and nothing here touches the live
              course or an open branch.
            </span>
          </p>
        )}

        {activeSlug ? (
          <div className="course-layout">
            <aside className="course-layout-nav">
              <CourseToc
                activeSlug={activeSlug}
                lang="en"
                basePath={WIP_COURSE_BASE}
                courseId={WIP_COURSE_ID}
              />
            </aside>
            <div className="course-reading">{children}</div>
            <aside className="course-layout-rail">
              <OnThisPage />
            </aside>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
