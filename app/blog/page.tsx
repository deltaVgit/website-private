'use client';
import Link from 'next/link';
import { useState } from 'react';
import BackLink from '@/app/components/BackLink';
import FilterSidebar from '@/app/components/FilterSidebar';
import { contentIndex } from '@/app/data/content-index';
import {
  DOMAIN_ACCENT,
  categoryCardStyle,
  categoryPairLabel,
  categoryTitleStyle,
  domainTextClass,
  formatChipClass,
  resolveCategoryPair,
} from '@/lib/content-accents';
import { formatReadingTime } from '@/lib/content-meta';

/**
 * BLOG — the fused pool (IA v1, 2026-09-30): blog ∪ tutorials in one feed.
 * Keeps the original card anatomy — per-domain accent borders, format chips,
 * dual-domain pair labels, gold "Latest weekly brief" card. Tutorials flow
 * through the same content-accents mapping (format 'Tutorial' already renders
 * the right chip), so nothing visual is lost in the fuse. The old /tutorials/
 * section route redirects here; the 4 tutorial articles stay at /tutorials/<slug>/.
 */
const posts = contentIndex.map((entry) => {
  const pair = resolveCategoryPair(entry.domain, entry.tags || []);
  return {
    title: entry.title,
    date: entry.date || '',
    category: entry.domain,
    tags: entry.tags || [],
    type: entry.format || 'Deep Dive',
    isTutorial: entry.type === 'tutorial',
    href: entry.href,
    excerpt: entry.excerpt,
    slug: entry.id,
    domains: pair.domains,
    accents: pair.accents,
    readingTime:
      formatReadingTime(entry.readingMinutes) ||
      formatReadingTime(
        entry.format === 'Dashboard'
          ? 10
          : entry.format === 'Deep Dive'
            ? 7
            : entry.format === 'Tutorial'
              ? 8
              : entry.format === 'Tool'
                ? 5
                : 4
      )!,
  };
});

const CATEGORY_ORDER = ['AI', 'Web3', 'OpSec', 'Hardware', 'Weekly Delta Financial Brief'];

const monthOf = (d: string) => {
  const m = d.match(/([A-Za-z]+)\s+\d+,\s+(\d{4})/);
  if (m) return `${m[1]} ${m[2]}`;
  const sentinel = d.match(/([A-Za-z]+)\s+(\d{4})$/); // "July 2026" tutorial dates
  return sentinel ? `${sentinel[1]} ${sentinel[2]}` : d;
};

export default function Blog() {
  const [cats, setCats] = useState<string[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [tutorialsOnly, setTutorialsOnly] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const filteredPosts = posts
    .filter(
      (p) =>
        (cats.length === 0 || cats.includes(p.category) || p.domains.some((d) => cats.includes(d))) &&
        (months.length === 0 || months.includes(monthOf(p.date))) &&
        (!tutorialsOnly || p.isTutorial)
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const categoryOptions = CATEGORY_ORDER.filter((c) =>
    posts.some((p) => p.category === c || p.domains.includes(c))
  ).map((c) => ({
    value: c,
    label: c,
    count: posts.filter((p) => p.category === c || p.domains.includes(c)).length,
    accent: DOMAIN_ACCENT[c],
  }));
  const monthOptions = Array.from(new Set(posts.map((p) => monthOf(p.date))))
    .sort((a, b) => new Date(`1 ${b}`).getTime() - new Date(`1 ${a}`).getTime())
    .map((m) => ({ value: m, label: m, count: posts.filter((p) => monthOf(p.date) === m).length }));

  const latestWeekly = posts.find(
    (p) => p.category === 'Weekly Delta Financial Brief' || p.category === 'DeFi Weekly'
  );
  const showLatest = latestWeekly && filteredPosts.includes(latestWeekly);
  const gridPosts = showLatest
    ? filteredPosts.filter((p) => p.slug !== latestWeekly!.slug)
    : filteredPosts;

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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-2px] mb-4">Blog</h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-xl leading-relaxed">
            Desk writing and hands-on tutorials in one feed — AI, Web3, OpSec, hardware, and the
            Weekly Delta Financial Brief. The cyan chip marks a tutorial.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
          <aside className="mb-10 lg:mb-0">
            <FilterSidebar
              groups={[
                {
                  title: 'Theme',
                  options: categoryOptions,
                  selected: cats,
                  onToggle: (v) => toggle(cats, setCats, v),
                },
                {
                  title: 'Period',
                  options: monthOptions,
                  selected: months,
                  onToggle: (v) => toggle(months, setMonths, v),
                },
              ]}
              onClear={() => {
                setCats([]);
                setMonths([]);
                setTutorialsOnly(false);
              }}
              extraToggle={{
                label: 'Tutorials only',
                checked: tutorialsOnly,
                onToggle: () => setTutorialsOnly((v) => !v),
              }}
            />
          </aside>

          <div className="min-w-0">
            <div className="mb-6 text-sm text-[var(--text-muted)]">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
              {(cats.length > 0 || months.length > 0) && <span> · filtered</span>}
            </div>

            {showLatest && (
              <Link
                href={`/blog/${latestWeekly!.slug}/`}
                className="listing-card-featured group relative block mb-10 overflow-hidden rounded-2xl border border-[var(--accent-gold)]/35 p-6 md:p-8 transition-all duration-300 hover:border-[var(--accent-gold)]/60 hover:shadow-[0_0_44px_rgba(251,191,36,0.12)]"
              >
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-gold)]" />
                <span className="pointer-events-none absolute -top-16 -right-10 w-56 h-56 rounded-full bg-[var(--accent-gold)]/10 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/30 text-[var(--accent-gold)] text-[10px] font-bold uppercase tracking-[1.5px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] animate-pulse" />
                      Latest weekly brief
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">{latestWeekly!.date}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-semibold text-[var(--accent-gold)] group-hover:opacity-90 transition-opacity mb-3 tracking-[-0.5px] max-w-3xl">
                    {latestWeekly!.title}
                  </h2>
                  <p className="text-sm md:text-base text-[var(--text-tertiary)] leading-relaxed mb-5 max-w-2xl line-clamp-2">
                    {latestWeekly!.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-gold)] group-hover:gap-2.5 transition-all">
                    Read this week&apos;s roundup
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 7h8M7 3l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            )}

            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <p className="text-lg text-[var(--text-secondary)] mb-2">No articles match these filters</p>
                <button
                  onClick={() => {
                    setCats([]);
                    setMonths([]);
                    setTutorialsOnly(false);
                  }}
                  className="text-sm text-[var(--accent-cyan)] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 stagger-children">
                {gridPosts.map((post) => {
                  const dual = post.domains.length >= 2;
                  const pairLabel = categoryPairLabel(post.domains);
                  return (
                    <div
                      key={post.slug}
                      className="listing-card listing-card-accent relative group rounded-2xl border p-6 md:p-8 transition-all duration-200 pl-7"
                      style={categoryCardStyle(post.accents)}
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                        <span className="text-[var(--text-primary)]">{post.date}</span>
                        <span className="text-[var(--text-disabled)]">·</span>
                        <span className="text-[var(--text-muted)]">
                          {post.readingTime.replace(' read', '')}
                        </span>
                        <span className="text-[var(--text-disabled)]">·</span>
                        {dual ? (
                          <span
                            className="relative z-10 font-semibold tracking-wide"
                            style={categoryTitleStyle(post.accents)}
                            title={pairLabel}
                          >
                            {pairLabel}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggle(cats, setCats, post.category)}
                            className={`relative z-10 font-medium hover:underline ${domainTextClass(post.category)}`}
                            title={`Filter by ${post.category}`}
                          >
                            {post.category}
                          </button>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-[1px] uppercase border ${
                            post.isTutorial
                              ? 'bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]/40 text-[var(--accent-cyan)]'
                              : formatChipClass(post.type)
                          }`}
                        >
                          {post.type}
                        </span>
                      </div>
                      <Link href={post.href} className="after:absolute after:inset-0">
                        <h3
                          className="text-lg md:text-xl font-semibold mb-2 leading-snug transition-opacity group-hover:opacity-85"
                          style={categoryTitleStyle(post.accents)}
                        >
                          {post.title}
                        </h3>
                      </Link>
                      <p className="text-[var(--text-tertiary)] text-sm leading-relaxed mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div
                        className="inline-flex items-center gap-1 text-xs font-medium group-hover:gap-1.5 transition-all"
                        style={{ color: post.accents[0] || 'var(--accent-cyan)' }}
                      >
                        Read full article
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 6h8M6 2l4 4-4 4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-16 text-center text-sm text-[var(--text-muted)]">
              More articles generated through the IntelHub pipeline.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
