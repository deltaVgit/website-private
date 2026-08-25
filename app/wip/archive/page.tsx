import type { Metadata } from 'next';
import { LabShell } from './LabShell';
import './visual-lab.css';

/**
 * Internal design lab. Ten visual systems, each applied to the whole course,
 * so a treatment can be judged on thirteen real lessons instead of one mock.
 * Not indexed and linked from nowhere while we choose.
 */
export const metadata: Metadata = {
  title: 'Laboratoire visuel — dix traitements | Delta V',
  description: 'Dix systèmes visuels appliqués au cours entier, comparables au même endroit.',
  robots: { index: false, follow: false },
};

export default function VisualLabIndexPage() {
  return <LabShell />;
}
