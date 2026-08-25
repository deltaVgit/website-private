import type { Metadata } from 'next';
import Link from 'next/link';
import { OPEN_HARNESS_MODULES, t } from '@/app/data/courses/open-harness';
import { WipChrome } from '../WipChrome';
import { LabPicker } from './LabPicker';
import { WIP_LAB_BASE as LAB_BASE } from '../constants';
import './lab.css';

export const metadata: Metadata = {
  title: 'Ten layouts — My First AI Agent | Delta V',
  robots: { index: false, follow: false },
};

export default function LabIndex() {
  return (
    <WipChrome crumb="Ten layouts">
      <h1 className="course-h1">Ten ways to read the same course</h1>
      <p className="course-lead">
        The words never change: they come from the live course. What changes is the reading model.
        Pick one, then read the thirteen lessons — it follows you.
      </p>
      <LabPicker />
      <ol className="mt-8">
        {OPEN_HARNESS_MODULES.map((m, i) => (
          <li key={m.slug}>
            <Link href={`${LAB_BASE}${m.slug}/`} className="aih-toc-row">
              <span className="aih-toc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="aih-toc-title">{t(m.title, 'en')}</span>
              <span className="aih-toc-min">{m.minutes} min</span>
            </Link>
          </li>
        ))}
      </ol>
    </WipChrome>
  );
}
