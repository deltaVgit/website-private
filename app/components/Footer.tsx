'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { REPO_URL } from '@/lib/site';
import { FOOTER_COPY } from '@/app/content/site';
import { hrefFor, localeFromPath } from '@/lib/i18n';
import Logo from './Logo';

export default function Footer() {
  // The footer sits on every page, so it reads the locale off the URL rather
  // than taking a prop each page would have to thread through.
  const lang = localeFromPath(usePathname() ?? '/');
  const t = FOOTER_COPY[lang];
  const to = (path: string) => hrefFor(path, lang);

  return (
    <footer className="border-t border-[var(--border-default)] bg-[var(--bg-deep)] relative overflow-hidden">
      <div className="ambient-glow ambient-glow-cyan -top-40 -right-40" />
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-16 relative">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-6 md:gap-10 mb-12">
          <div className="md:col-span-4 col-span-2">
            <Link href={to('/')} className="inline-flex items-center gap-2.5 text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors mb-4">
              <Logo size={24} className="flex-shrink-0" />
              <span className="text-lg font-semibold tracking-[-0.5px]">Delta V</span>
            </Link>
            <p className="text-[var(--text-tertiary)] text-sm leading-relaxed max-w-[280px]">
              {t.tagline}
            </p>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[2px] mb-4">{t.services}</h2>
            <div className="space-y-2.5">
              <Link href={to('/ai/')} className="block text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors duration-150 text-sm">{t.aiEngineering}</Link>
              <Link href={to('/web3/')} className="block text-[var(--text-tertiary)] hover:text-[var(--accent-orange)] transition-colors duration-150 text-sm">{t.web3}</Link>
              <Link href={to('/opsec/')} className="block text-[var(--text-tertiary)] hover:text-[var(--accent-amber)] transition-colors duration-150 text-sm">{t.opsec}</Link>
              <Link href={to('/forge/')} className="block text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors duration-150 text-sm">{t.skillForge}</Link>
            </div>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[2px] mb-4">{t.resources}</h2>
            <div className="space-y-2.5">
              <Link href="/blog/" className="block text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors duration-150 text-sm">{t.blog}</Link>
              <Link href="/intelhub/" className="block text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors duration-150 text-sm">{t.intelhub}</Link>
              <Link href="/forge/privacy/" className="block text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors duration-150 text-sm">Privacy</Link>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent-primary)] transition-colors duration-150 text-sm">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.85 10.91.57.1.78-.25.78-.55v-2.12c-3.19.69-3.86-1.35-3.86-1.35-.52-1.33-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .96-.31 3.15 1.18a10.94 10.94 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.25 5.69.41.35.78 1.04.78 2.1v3.11c0 .3.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
                GitHub
              </a>
            </div>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[2px] mb-4">{t.connect}</h2>
            <div className="space-y-2.5">
              <a href="mailto:contact@deltav.cc" target="_blank" rel="noopener noreferrer" className="block text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors duration-150 text-sm">contact@deltav.cc</a>
              <div className="text-sm text-[var(--text-tertiary)]">Signal: @DeltaV.01</div>
              <Link href={to('/contact/')} className="block text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors duration-150 text-sm">{t.contact}</Link>
            </div>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-[2px] mb-4">{t.values}</h2>
            <div className="space-y-2.5">
              {t.valueList.map((v) => (
                <div key={v} className="text-sm text-[var(--text-tertiary)]">{v}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-[var(--border-default)] flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {/* Quiet privacy transparency - no trackers, static export only.
                Tertiary, not disabled: at 26% alpha this row sat at 2:1 against
                the deep background, which is below the 4.5:1 floor for text
                this small. Tertiary is the first step on the scale that clears it. */}
            <span className="text-[10px] text-[var(--text-tertiary)] tracking-wide" title={t.noTrackersTitle}>
              {t.noTrackers}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">© 2026 Delta V</span>
            <Link href="/cgu/" className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors">{t.terms}</Link>
            <Link href="/privacy/" className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent-cyan)] transition-colors">{t.privacy}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
