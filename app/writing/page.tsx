'use client';
import Link from 'next/link';
import { useState } from 'react';
import BackLink from '@/app/components/BackLink';
import FilterSidebar from '@/app/components/FilterSidebar';
import { blogIndex, tutorialIndex } from '@/app/data/content-index';
import { domainTextClass } from '@/lib/content-accents';
import { formatReadingTime } from '@/lib/content-meta';

/**
 * WRITING — fused pool (IA v1, 2026-09-30).
 * One section for essays and builds: blogIndex ∪ tutorialIndex, newest first.
 * Tutorials carry the cyan type chip; posts stay plain ink (Marc: "plain vs
 * tagged"). Nothing else distinguishes them.
 */
const byDateDesc = (a: { date?: string }, b: { date?: string }) => {
  const ta = Date.parse(a.date || '') || 0;
  const tb = Date.parse(b.date || '') || 0;
  return tb - ta;
};

const pieces = [...blogIndex, ...tutorialIndex].sort(byDateDesc);

const DOMAIN_ORDER = ['AI', 'Web3', 'OpSec', 'DeFi Weekly', 'Hardware'];

export default function WritingPage() {
  const [domains, setDomains] = useState<string[]>([]);
  const [onlyTutorials, setOnlyTutorials] = useState(false);

  const toggleDomain = (v: string) =>
    setDomains((list) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]));

  const filtered = pieces.filter((p) => {
    if (domains.length > 0 && !domains.includes(p.domain)) return false;
    if (onlyTutorials && p.type !== 'tutorial') return false;
    return true;
  });

  const domainOptions = DOMAIN_ORDER.filter((d) => pieces.some((p) => p.domain === d)).map((d) => ({
    value: d,
    label: d,
    count: pieces.filter((p) => p.domain === d).length,
  }));

  return (
    <div className="min-h-screen">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="mb-12">
          <div className="mb-6">
            <BackLink
              fallback="/"
              label="Back to home"
              className="inline-flex items-center gap-1.5 text-[var(--accent-cyan)] text-sm hover:underline group"
            />
          </div>
          <div className="text-[var(--accent-cyan)] text-xs font-semibold tracking-[3px] uppercase mb-3">
            Writing
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-2px] mb-4">
            Ideas and builds from the Delta V desk
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Analysis when we read, tutorials when we build — one pool, newest first. The cyan
            chip marks a hands-on tutorial; everything else is desk writing.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
          <aside className="mb-10 lg:mb-0">
            <FilterSidebar
              groups={[
                { title: 'Domain', options: domainOptions, selected: domains, onToggle: toggleDomain },
                {
                  title: 'Type',
                  options: [
                    {
                      value: 'tutorial',
                      label: 'Tutorials only',
                      count: tutorialIndex.length,
                    },
                  ],
                  selected: onlyTutorials ? ['tutorial'] : [],
                  onToggle: () => setOnlyTutorials((v) => !v),
                },
              ]}
              onClear={() => {
                setDomains([]);
                setOnlyTutorials(false);
              }}
            />
          </aside>

          <div className="min-w-0">
            <div className="mb-6 text-sm text-[var(--text-muted)]">
              {filtered.length} piece{filtered.length !== 1 ? 's' : ''}
              {(domains.length > 0 || onlyTutorials) && <span> · filtered</span>}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <p className="text-lg text-[var(--text-secondary)] mb-2">Nothing matches these filters</p>
                <button
                  onClick={() => {
                    setDomains([]);
                    setOnlyTutorials(false);
                  }}
                  className="text-sm text-[var(--accent-cyan)] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 stagger-children">
                {filtered.map((p) => {
                  const isTutorial = p.type === 'tutorial';
                  return (
                    <div
                      key={p.id}
                      className="listing-card relative group rounded-2xl border border-[var(--border-default)] p-6 md:p-8 transition-all duration-200 hover:border-[var(--accent-cyan)]/25"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                        <span className="text-[var(--text-muted)]">{p.date}</span>
                        <span className="text-[var(--text-disabled)]">·</span>
                        <span className="text-[var(--text-muted)]">
                          {formatReadingTime(p.readingMinutes)?.replace(' read', '') ?? ''}
                        </span>
                        <span className="text-[var(--text-disabled)]">·</span>
                        <span className={`font-medium ${domainTextClass(p.domain)}`}>{p.domain}</span>
                        {isTutorial && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-[1px] uppercase border border-[var(--accent-cyan)]/20 bg-[var(--accent-cyan)]/8 text-[var(--accent-cyan)]">
                            Tutorial
                          </span>
                        )}
                      </div>
                      <Link href={p.href} className="after:absolute after:inset-0">
                        <h2
                          className={`text-lg md:text-xl font-semibold mb-2 leading-snug transition-colors ${
                            isTutorial
                              ? 'group-hover:text-[var(--accent-cyan)]'
                              : 'text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)]'
                          }`}
                        >
                          {p.title}
                        </h2>
                      </Link>
                      <p className="text-[var(--text-tertiary)] text-sm leading-relaxed line-clamp-2">
                        {p.excerpt}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
