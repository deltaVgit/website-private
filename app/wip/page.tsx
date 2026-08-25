import type { Metadata } from 'next';
import Link from 'next/link';
import { WipChrome } from './WipChrome';
import { WIP_COURSE_NAME, WIP_SURFACES } from './constants';

export const metadata: Metadata = {
  title: `WIP — ${WIP_COURSE_NAME} | Delta V`,
  description:
    'Sandbox: three copies of the My First AI Agent course, isolated from production.',
  robots: { index: false, follow: false },
};

/**
 * The same three surfaces the navbar lists, in the same order, under the same
 * names. Only the hrefs and the ordering are shared with `WIP_SURFACES`; the
 * wording here is French because this page is, but every title follows the one
 * shape the menu uses: the course, then which copy of it this is.
 */
const ENTRIES = [
  {
    href: WIP_SURFACES[0].href,
    n: '01',
    title: `${WIP_COURSE_NAME} · proposed fixes`,
    body:
      'The live course with the corrections under review: one right edge instead of four, one inset scale for every panel, a readable numbered rail, an opaque glossary popover, section headings that carry their own number. Eleven content corrections are listed at the foot of each lesson they touch, and every screenshot is annotated.',
    state: 'all 13 lessons · 12 layout proposals · 11 content corrections',
  },
  {
    href: WIP_SURFACES[1].href,
    n: '02',
    title: `${WIP_COURSE_NAME} · ten layouts`,
    body:
      'The same content served by ten reading models: media gutter, full-height panels, guided walkthrough, pilot screenshot, vertical spine, folded cards, terminal frame, magazine, reference mode. One click switches, and the choice follows you from lesson to lesson.',
    state: 'all 13 lessons × 10 layouts',
  },
  {
    href: WIP_SURFACES[2].href,
    n: '03',
    title: `${WIP_COURSE_NAME} · first attempt`,
    body:
      'Kept for honest comparison: ten “treatments” that were decoration laid over one and the same layout. Precisely what not to do. It used to live under /forge/, which split the work in progress across two parts of the site; it sits here now.',
    state: 'archived · for reference',
  },
];

export default function WipIndexPage() {
  return (
    <WipChrome>
      <h1 className="course-h1">Work in progress on {WIP_COURSE_NAME}</h1>
      <p className="course-lead">
        Three copies of the same course, side by side. Everything here is a proposal: nothing reaches
        the live course until you say so, and nothing here touches a file an open branch shares.
      </p>
      <div className="wip-index-grid">
        {ENTRIES.map((e) => (
          <Link key={e.href} href={e.href} className="wip-card">
            <span className="wip-card-num">{e.n}</span>
            <h2>{e.title}</h2>
            <p>{e.body}</p>
            <span className="wip-state">{e.state}</span>
          </Link>
        ))}
      </div>
    </WipChrome>
  );
}
