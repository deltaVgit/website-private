'use client';

import { useEffect, useState } from 'react';
import { headingIcon, iconSrc } from './lab/kit/assets';

/**
 * Section headings: a number, an icon, or both.
 *
 * Three treatments, switchable, because there is a real argument on each side
 * and it is easier to settle by looking than by describing:
 *
 *   - the number is a coordinate. The right-hand rail lists the same headings,
 *     so a number lets a reader say "I am at 3 of 8" and find it again. An icon
 *     cannot do that — nobody says "I am at the puzzle piece".
 *   - the icon is a signal. It tells you what a section is about before you
 *     read it, which is what makes a long lesson scannable.
 *
 * The number is a CSS counter, so it stays correct when a section is added or
 * moved and never has to be typed into the heading. The icon has to come from
 * script because it depends on the heading's own words, so this component walks
 * the rendered headings once and inserts it — the same route `PinLayer` takes,
 * and for the same reason: nothing shared is edited to make a proposal visible.
 */
export type HeadingStyle = 'both' | 'number' | 'icon';

const STORE = 'dv-wip-h2';
const LABELS: Record<HeadingStyle, string> = {
  both: 'Number + icon',
  number: 'Number only',
  icon: 'Icon only',
};

export function HeadingMarks() {
  const [style, setStyle] = useState<HeadingStyle>('both');

  // Read the stored choice after mount so the server and the client's first
  // paint agree; the swap is one tick later and changes only an attribute.
  useEffect(() => {
    const saved = window.localStorage.getItem(STORE) as HeadingStyle | null;
    if (saved && saved in LABELS) setStyle(saved);
  }, []);

  useEffect(() => {
    const surface = document.querySelector<HTMLElement>('.wip-surface');
    if (surface) surface.dataset.h2 = style;
  }, [style]);

  // Insert the icon once. It is keyed on the heading text, which CSS cannot
  // read, so it cannot be done in the stylesheet like the counter.
  useEffect(() => {
    const made: HTMLElement[] = [];
    document.querySelectorAll<HTMLElement>('.course-prose section > h2').forEach((h) => {
      if (h.dataset.marked === 'yes') return;
      const name = headingIcon(h.textContent || '');
      if (!name) return;
      const glyph = document.createElement('span');
      glyph.className = 'wip-h2-icon';
      glyph.style.maskImage = `url("${iconSrc(name)}")`;
      glyph.style.webkitMaskImage = `url("${iconSrc(name)}")`;
      glyph.setAttribute('aria-hidden', 'true');
      h.prepend(glyph);
      h.dataset.marked = 'yes';
      made.push(glyph);
    });
    return () => {
      made.forEach((g) => {
        const h = g.parentElement;
        g.remove();
        if (h) delete h.dataset.marked;
      });
    };
  }, []);

  const choose = (next: HeadingStyle) => {
    setStyle(next);
    window.localStorage.setItem(STORE, next);
  };

  return (
    <div className="wip-h2-picker" role="group" aria-label="Section heading style">
      <span className="wip-h2-picker-label">Headings</span>
      {(Object.keys(LABELS) as HeadingStyle[]).map((k) => (
        <button
          key={k}
          type="button"
          className={`wip-h2-opt${style === k ? ' is-active' : ''}`}
          aria-pressed={style === k}
          onClick={() => choose(k)}
        >
          {LABELS[k]}
        </button>
      ))}
    </div>
  );
}
