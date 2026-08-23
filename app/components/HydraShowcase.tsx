'use client';

import { HYDRA_SHOWCASE, HYDRA_URL, HYDRA_VIDEO_URL } from '@/app/content/hydra';
import type { Locale } from '@/lib/i18n';

const ArrowUpRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path d="M4 10 10 4M5 4h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Hydra — a multi-agent system we shipped — as the proof panel inside the
 * "Tailored Multi-Agent Systems" offer card on the AI pillar page.
 *
 * Readers meet a real system we built before they read what we offer to
 * build. The primary CTA is the demo video once one is published
 * (HYDRA_VIDEO_URL); until then it is the live demo, styled as a real button.
 */
export default function HydraShowcase({ lang }: { lang: Locale }) {
  const copy = HYDRA_SHOWCASE[lang];
  const hasVideo = HYDRA_VIDEO_URL.length > 0;
  const ctaHref = hasVideo ? HYDRA_VIDEO_URL : HYDRA_URL;
  const ctaLabel = hasVideo ? copy.videoLabel : copy.demoLabel;

  return (
    <section
      aria-labelledby="hydra-heading"
      className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 md:p-6"
    >
      <div className="eyebrow mb-2">{copy.label}</div>
      <h3 id="hydra-heading" className="mb-2 text-lg font-semibold leading-snug tracking-tight md:text-xl">
        {copy.title}
      </h3>
      <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">{copy.lead}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a
          href={ctaHref}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-primary-bright)]"
        >
          {ctaLabel} <ArrowUpRight />
        </a>

        {hasVideo && (
          <a
            href={HYDRA_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]"
          >
            {copy.demoLabel}
          </a>
        )}

        <ul className="flex flex-wrap gap-x-3 gap-y-1.5 font-mono text-[11px] text-[var(--text-tertiary)]">
          {copy.chips.map((chip) => (
            <li key={chip} className="before:mr-1.5 before:text-[var(--accent-primary)] before:content-['·']">
              {chip}
            </li>
          ))}
        </ul>

        <span className="text-xs text-[var(--text-muted)] md:ml-auto">{copy.bridge}</span>
      </div>
    </section>
  );
}