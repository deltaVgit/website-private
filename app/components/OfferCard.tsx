'use client';

import React from 'react';
import Link from 'next/link';
import AnimatedBackground from './AnimatedBackground';
 import { DEFAULT_LOCALE, localePath, type Locale } from '@/lib/i18n';

 const LABELS: Record<Locale, { get: string; how: string; forWho: string }> = {
   en: { get: 'What you get', how: 'How it works', forWho: 'For:' },
   fr: { get: 'Ce que vous obtenez', how: 'Comment ça se passe', forWho: 'Pour :' },
 };

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-0.5 flex-shrink-0 text-[var(--accent-primary)]"><path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
);

/** Shared detailed offer card for the AI and Web3 pillar pages. */
export default function OfferCard({
  id, title, pitch, deliverables, process, audience, ctaLabel, ctaTopic, secondary, secondaryTone,
  showcase,
  lang = DEFAULT_LOCALE,
}: {
  id?: string;
  lang?: Locale;
  title: string;
  pitch: React.ReactNode;
  deliverables: string[];
  process: { step: string; desc: string }[];
  audience: string;
  ctaLabel: string;
  ctaTopic: string;
  secondary?: { label: string; href: string };
  secondaryTone?: 'forge';
  /** Optional proof panel (e.g. a shipped system) rendered above the CTAs. */
  showcase?: React.ReactNode;
}) {
  return (
    <article id={id} className="scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 md:p-10 relative overflow-hidden transition-colors duration-300 hover:border-[var(--accent-primary)]/25">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--accent-primary)] to-transparent" aria-hidden="true" />
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">{title}</h2>
      <p className="text-[var(--text-secondary)] mb-8 max-w-3xl leading-relaxed">{pitch}</p>

      <AnimatedBackground><div className="grid md:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="text-[10px] font-semibold tracking-[2px] uppercase text-[var(--accent-primary)] mb-3">{LABELS[lang].get}</div>
          <ul className="space-y-2.5 text-sm text-[var(--text-secondary)]">
            {deliverables.map((d) => <li key={d} className="flex gap-2.5"><Check /> {d}</li>)}
          </ul>
        </div>
        <div>
          <div className="text-[10px] font-semibold tracking-[2px] uppercase text-[var(--accent-primary)] mb-3">{LABELS[lang].how}</div>
          <ol className="space-y-3 text-sm">
            {process.map((p, i) => (
              <li key={p.step} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-semibold flex items-center justify-center">{i + 1}</span>
                <div><span className="font-medium text-[var(--text-primary)]">{p.step}</span><span className="text-[var(--text-tertiary)]"> — {p.desc}</span></div>
              </li>
            ))}
          </ol>
        </div>
      </div></AnimatedBackground>

            {showcase && <div className="mb-8">{showcase}</div>}

            <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-[var(--border-default)]">
        <div className="text-sm text-[var(--text-secondary)] mr-auto max-w-sm leading-relaxed"><span className="font-semibold text-[var(--text-primary)]">{LABELS[lang].forWho}</span> {audience}</div>
        {secondary && <Link href={secondary.href} className={`inline-flex items-center gap-2 px-5 py-2.5 border rounded-xl text-sm font-medium hover:bg-[var(--bg-hover)] transition-all ${secondaryTone === 'forge' ? 'border-[var(--accent-purple)]/40 text-[var(--accent-purple)] hover:border-[var(--accent-purple)]' : 'border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--border-hover)]'}`}>{secondary.label}</Link>}
        <Link href={`${localePath('/contact/', lang)}?topic=${ctaTopic}`} className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-primary)] text-[var(--on-accent)] rounded-xl text-sm font-semibold hover:bg-[var(--accent-primary-bright)] transition-colors">{ctaLabel} <ArrowRight /></Link>
      </div>
    </article>
  );
}
