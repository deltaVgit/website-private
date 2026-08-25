import type { Metadata } from 'next';
import Link from 'next/link';
import { OPEN_HARNESS_MODULES, t } from '@/app/data/courses/open-harness';
import { WipChrome } from '../WipChrome';
import { WIP_COURSE_BASE } from '../constants';

export const metadata: Metadata = {
  title: 'Proposed fixes — My First AI Agent | Delta V',
  robots: { index: false, follow: false },
};

export default function WipCourseIndex() {
  return (
    <WipChrome crumb="Proposed fixes">
      <h1 className="course-h1">My First AI Agent — proposed fixes</h1>
      <p className="course-lead">
        The same content as the live course, rendered by the same components, with the layout
        corrections under review. Lesson 03 is the one to open first: it carries ten screenshots,
        which is where the misalignment showed most.
      </p>
      <ol className="mt-8">
        {OPEN_HARNESS_MODULES.map((m, i) => (
          <li key={m.slug}>
            <Link href={`${WIP_COURSE_BASE}${m.slug}/`} className="aih-toc-row">
              <span className="aih-toc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="aih-toc-title">
                {t(m.title, 'en')}
                {m.subtitle && <span className="aih-toc-sub">{t(m.subtitle, 'en')}</span>}
              </span>
              <span className="aih-toc-min">{m.minutes} min</span>
            </Link>
          </li>
        ))}
      </ol>
    </WipChrome>
  );
}
