'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { OPEN_HARNESS_GLOSSARY, UI_COPY, courseBase, type CourseLang, t } from '@/app/data/courses/open-harness';

export function TermChip({ termId, lang = 'en' }: { termId: string; lang: CourseLang }) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      left: rect.left,
    });
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const glossaryTerm = OPEN_HARNESS_GLOSSARY.find((g) => g.id === termId);
  if (!glossaryTerm) {
    console.warn(`TermChip: glossary term "${termId}" not found`);
    return null;
  }

  const termName = t(glossaryTerm.term, lang);
  const termDef = t(glossaryTerm.def, lang);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="course-term-chip"
        title={`${termName} definition`}
        aria-label={`Show definition of ${termName}`}
      >
        <span aria-hidden>i</span>
      </button>

      {open && position && (
        <div
          ref={popoverRef}
          className="course-term-pop fixed z-50 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg shadow-lg p-4 max-w-xs"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className="font-mono text-[11px] tracking-[1.5px] uppercase text-[var(--course-accent)] font-semibold">
            {termName}
          </div>
          <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{termDef}</p>
          {/* The glossary page sets id={term.id} on every entry, so this anchor
              always resolves. Lesson 01's lexicon cards use their own slugs. */}
          <Link
            href={`${courseBase(lang)}glossary/#${termId}`}
            className="mt-3 inline-flex items-center gap-1 text-xs text-[var(--accent-cyan)] hover:underline"
          >
            📖 {t(UI_COPY.seeGlossary, lang)}
          </Link>
        </div>
      )}
    </>
  );
}