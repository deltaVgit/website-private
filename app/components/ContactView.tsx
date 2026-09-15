'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { withBasePath } from '@/lib/site';
import type { Locale } from '@/lib/i18n';
import { CONTACT_COPY } from '@/app/content/contact';
import BookingCalendar from './BookingCalendar';

const CONTACT_COPY_EMAIL = 'engage@deltav.cc';
const CONTACT_FALLBACK_HREF = 'mailto:engage@deltav.cc';

/** Which "I need" bucket a ?topic= belongs to. Locale-independent. */
const TOPIC_NEED: Record<string, 'web3' | 'ai' | 'upskilling'> = {
  agents: 'ai',
  inference: 'ai',
  retainer: 'ai',
  'open-harness': 'upskilling',
  'web3-advisory': 'web3',
  osint: 'web3',
  growth: 'web3',
};

function ContactContent({ lang }: { lang: Locale }) {
  const copy = CONTACT_COPY[lang];
  const params = useSearchParams();
  const topicKey = params.get('topic') || '';
  const needKey = TOPIC_NEED[topicKey];
  const prompt = copy.topicPrompts[topicKey];

  const needLabels = [copy.needs.web3, copy.needs.ai, copy.needs.upskilling];
  const selectedNeed = needKey ? copy.needs[needKey] : undefined;

  const mailtoHref = selectedNeed
    ? 'mailto:engage@deltav.cc?subject=' +
      encodeURIComponent(copy.enquirySubject(selectedNeed)) +
      '&body=' +
      encodeURIComponent(prompt || '')
    : 'mailto:engage@deltav.cc';

  const [copied, setCopied] = useState(false);
  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_COPY_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = CONTACT_FALLBACK_HREF;
    }
  };

  // Native compose: build subject + body client-side and open the visitor's
  // mail app via a mailto: GET tap. Form POST to mailto: silently fails on
  // most mobile browsers (iOS Safari opens an empty compose); a real link
  // tap works everywhere and needs no backend.
  const compose = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('name') || '').trim();
    const need = String(data.get('need') || '').trim();
    const description = String(data.get('description') || '').trim();
    const subject = need
      ? `[${need}] ${name || copy.title} - ${topicKey || 'enquiry'}`
      : `Delta V enquiry - ${name || topicKey || 'website'}`;
    const bodyText = [name && `Name: ${name}`, need && `Need: ${need}`, description]
      .filter(Boolean)
      .join('\n\n');
    window.location.href =
      'mailto:engage@deltav.cc?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(bodyText);
  };

  return (
    <div className="min-h-screen relative z-10">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 pt-16 pb-24 flex flex-col">
        <div className="max-w-2xl mb-12">
          <div className="text-[var(--accent-orange)] text-xs font-semibold tracking-[3px] uppercase mb-3">
            {copy.eyebrow}
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-2px] mb-4">{copy.title}</h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">{copy.intro}</p>
        </div>

        <div className="order-1 w-full max-w-5xl mx-auto grid md:grid-cols-2 gap-5 mb-16">
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8 flex flex-col">
            <div className="mb-6 pb-6 border-b border-[var(--border-default)]">
              <div className="text-[var(--accent-orange)] text-[10px] font-semibold tracking-[2px] uppercase mb-2">
                {copy.emailLabel}
              </div>
              <a
                href={mailtoHref}
                className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors"
              >
                engage@deltav.cc
              </a>
            </div>
            <div className="flex flex-col flex-1">
              <div>
                <div className="text-[var(--accent-cyan)] text-[10px] font-semibold tracking-[2px] uppercase mb-2">
                  {copy.signalLabel}
                </div>
                <p className="text-sm text-[var(--text-tertiary)] leading-relaxed max-w-[240px] mb-6">
                  {copy.signalBlurb}
                </p>
              </div>
              <div className="flex flex-col items-end mt-auto">
                <div className="text-xl md:text-2xl font-semibold tracking-tight text-[var(--text-primary)] mb-3">
                  @DeltaV.01
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={withBasePath('/images/signal-qr.webp')}
                  alt="Signal QR Code — @DeltaV.01"
                  className="w-28 h-28 rounded-xl border border-[var(--border-default)]"
                  width={112}
                  height={112}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8">
            <div className="text-[var(--accent-orange)] text-[10px] font-semibold tracking-[2px] uppercase mb-2">
              {copy.formLabel}
            </div>
            <p className="text-sm text-[var(--text-tertiary)] mb-6">{copy.formBlurb}</p>
            <form
              key={topicKey || 'default'}
              onSubmit={compose}
              className="space-y-3"
            >
              <input
                type="text"
                name="name"
                placeholder={copy.namePlaceholder}
                className="w-full bg-[var(--bg-deep)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-disabled)] focus:outline-none focus:border-[var(--accent-cyan)]/40 focus:shadow-[var(--glow-cyan)] transition-all"
              />
              <div>
                <div className="text-[10px] text-[var(--text-muted)] mb-2 tracking-[1px] uppercase">
                  {copy.needLabel}
                </div>
                <div className="flex gap-2">
                  {needLabels.map((opt) => (
                    <label key={opt} className="flex-1">
                      <input
                        type="radio"
                        name="need"
                        value={opt}
                        defaultChecked={selectedNeed === opt}
                        className="sr-only peer"
                      />
                      <span className="block px-2 py-2.5 text-xs font-medium rounded-xl border border-[var(--border-default)] bg-[var(--bg-deep)] text-[var(--text-tertiary)] peer-checked:text-[var(--accent-cyan)] peer-checked:border-[var(--accent-cyan)]/40 peer-checked:bg-[var(--accent-cyan)]/5 hover:text-[var(--text-secondary)] transition-all text-center cursor-pointer">
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <textarea
                name="description"
                rows={3}
                placeholder={copy.descriptionPlaceholder}
                defaultValue={prompt || ''}
                className="w-full bg-[var(--bg-deep)] border border-[var(--border-default)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-disabled)] focus:outline-none focus:border-[var(--accent-cyan)]/40 focus:shadow-[var(--glow-cyan)] transition-all resize-none"
              />
              <button
                type="submit"
                className="w-full py-3 bg-[var(--accent-cyan)] text-[var(--on-accent)] rounded-xl text-sm font-semibold hover:bg-[var(--accent-primary-bright)] transition-colors"
              >
                {copy.send}
              </button>
              <button
                type="button"
                onClick={copyEmail}
                className="w-full py-2.5 rounded-xl text-xs font-medium border border-[var(--border-default)] bg-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-hover)] transition-colors"
              >
                {copied ? 'Copied engage@deltav.cc ✓' : 'Or copy engage@deltav.cc to paste anywhere'}
              </button>
            </form>
          </div>
        </div>

        <section className="contact-booking order-2 relative w-full mb-16 rounded-3xl border border-[var(--border-default)] bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)] to-[var(--accent-cyan)]/[0.03] overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-cyan)]/40 to-transparent"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -top-32 right-0 w-72 h-72 rounded-full bg-[var(--accent-cyan)]/5 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative grid lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] gap-0">
            <div className="flex flex-col justify-center px-6 md:px-12 py-10 md:py-14">
              <span className="inline-flex items-center gap-2 self-start px-3 py-1 mb-5 rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] text-[10px] font-bold uppercase tracking-[1.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                {copy.bookingBadge}
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-[-1.5px] mb-4">
                {copy.bookingTitle}
              </h2>
              <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-md mb-6">
                {copy.bookingBlurb}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-[var(--text-tertiary)]">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-deep)] border border-[var(--border-default)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />{' '}
                  {copy.bookingChips.duration}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-deep)] border border-[var(--border-default)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />{' '}
                  {copy.bookingChips.video}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-deep)] border border-[var(--border-default)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent-purple)]" />{' '}
                  {copy.bookingChips.encrypted}
                </span>
              </div>
            </div>
            <div className="border-t lg:border-t-0 lg:border-l border-[var(--border-default)] bg-[var(--bg-deep)]/30 min-w-0 p-4 md:p-6">
              {/* Mobile: the iframe-in-scroll is hostile on phones — open Cal.com
                  full-screen instead. Desktop keeps the inline embed. */}
              <div className="lg:hidden flex flex-col items-stretch gap-3">
                <a
                  href="https://cal.com/delta-v/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button-primary text-center py-3.5"
                >
                  Book a 30-minute call <span aria-hidden="true">↗</span>
                </a>
                <p className="text-[11px] text-[var(--text-muted)] text-center">
                  Opens the full calendar in a new tab — easiest on a phone.
                </p>
              </div>
              <div className="hidden lg:block">
                <BookingCalendar />
              </div>
            </div>
          </div>
        </section>

        <section
          className="order-3 w-full max-w-5xl mx-auto rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8 relative overflow-hidden mb-16"
          aria-labelledby="why-us-heading"
        >
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-purple)] to-transparent"
            aria-hidden="true"
          />
          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:items-end">
            <div>
              <div className="text-[var(--accent-cyan)] text-[10px] font-semibold tracking-[2px] uppercase mb-3">
                {copy.whyEyebrow}
              </div>
              <h2
                id="why-us-heading"
                className="text-3xl md:text-4xl font-semibold tracking-[-1.5px] leading-[1.05]"
              >
                {copy.whyTitleLead}
                <span className="text-[var(--accent-cyan)]">{copy.whyTitleAccent}</span>
              </h2>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-xl">{copy.whyBody}</p>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--border-default)] md:grid-cols-2">
            {copy.whyCards.map((item, i) => {
              const accent = i === 0 ? 'var(--accent-cyan)' : 'var(--accent-purple)';
              return (
                <article key={item.number} className="bg-[var(--bg-deep)] p-5 md:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs tracking-[2px]" style={{ color: accent }}>
                      {item.number}
                    </span>
                    <span
                      className="h-px w-10"
                      style={{ backgroundColor: accent, opacity: 0.45 }}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-7 text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.body}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <div className="order-4 w-full max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {copy.badges.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4"
              >
                <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1.5px] mb-1">
                  {item.label}
                </div>
                <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                  {item.value}
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactView({ lang }: { lang: Locale }) {
  return (
    <Suspense fallback={null}>
      <ContactContent lang={lang} />
    </Suspense>
  );
}
