// Deliberately a server component: this file holds no state, no effect and no
// handler, and marking it 'use client' shipped the whole HOME_PAGE dictionary
// — both locales, ~23 KB — into every visitor's JavaScript bundle for nothing.
// The interactive pieces below (InkGarden, CuratedIntel) carry their own
// 'use client' and still work when rendered from here.
import Link from 'next/link';
import CuratedIntel from './CuratedIntel';
import InkGarden from './InkGarden';
import CapabilityCard from './CapabilityCard';
import { HOME_PAGE } from '@/app/content/site';
import { hrefFor, type Locale } from '@/lib/i18n';

const Arrow = () => <span aria-hidden="true">↗</span>;

/**
 * Routing and styling for the three pillar cards. Kept apart from the copy in
 * `app/content/site.ts` so translators never touch an href or an accent token.
 * The bullet hrefs line up index-for-index with `capabilities[n].bullets`.
 */
const CAPABILITY_STRUCTURE = [
  {
    href: '/ai/',
    index: '01',
    bulletHrefs: ['/ai/#agents', '/ai/#inference', '/ai/#retainer'],
    accent: 'var(--accent-cyan)',
    titleTint: 'text-[var(--accent-cyan)]/90',
  },
  {
    href: '/web3/',
    index: '02',
    bulletHrefs: ['/web3/#architecture', '/web3/#intelligence', '/web3/#growth'],
    accent: 'var(--accent-orange)',
    titleTint: 'text-[var(--accent-orange)]/90',
  },
  {
    href: '/forge/',
    index: '03',
    // Forge's two doors (IA v1): AI (courses live on /forge/) · Privacy.
    bulletHrefs: ['/forge/', '/forge/privacy/'],
    accent: 'var(--accent-purple)',
    titleTint: 'text-[var(--accent-purple)]/90',
  },
] as const;

/** Index-for-index with `offerings` in the locale dictionary. */
const OFFERING_STRUCTURE = [
  { href: '/forge/', index: '01', ctaColor: 'text-[var(--accent-purple)]' },
  { href: '/ai/', index: '02', ctaColor: 'text-[var(--accent-cyan)]' },
  { href: '/web3/', index: '03', ctaColor: 'text-[var(--accent-orange)]' },
] as const;

export default function HomeView({ lang }: { lang: Locale }) {
  const copy = HOME_PAGE[lang];
  const to = (path: string) => hrefFor(path, lang);

  return <main className="relative isolate">
    <div className="home-page-shade" aria-hidden="true" />
    <div className="relative z-10">
    <section className="relative overflow-hidden border-b border-[var(--border-default)]" aria-labelledby="hero-heading">
      <div className="ambient-glow ambient-glow-cyan -top-24 left-1/3 w-[520px] h-[520px]" aria-hidden="true" />
      <div className="home-hero-shade" aria-hidden="true" />
      <div className="page-container relative z-10 grid lg:grid-cols-[1.1fr_.9fr] gap-10 lg:gap-16 items-center pt-20 md:pt-28 pb-16 md:pb-24">
        <div>
          {/* No fade on the h1: it is the Largest Contentful Paint element, and
              LCP is stamped when the element reaches its final paint. Starting
              it at opacity 0 for 300ms added those 300ms to the score for free.
              The blurb and the buttons below still fade in. */}
          <h1 id="hero-heading" className="max-w-4xl text-[clamp(1.5rem,7.5vw,3.4rem)] sm:text-[3.5rem] lg:text-[3.4rem] xl:text-7xl font-semibold tracking-[-.07em] leading-[.94]"><span className="block whitespace-nowrap">{copy.heroLine1}</span><span className="block whitespace-nowrap"><span className="text-[var(--text-secondary)]">{copy.heroLine2Lead}</span><span className="gradient-text">{copy.heroLine2Accent}</span></span></h1>
          <p className="mt-8 max-w-xl text-lg md:text-xl text-[var(--text-secondary)] leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>{copy.heroBlurb}</p>
          <div className="mt-10 flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <Link href={to('/forge/')} className="button-primary">{copy.ctaUpskill} <Arrow /></Link>
            <Link href={to('/ai/')} className="button-secondary button-secondary-purple">{copy.ctaServices} <Arrow /></Link>
            <Link href={to('/contact/')} className="button-secondary">{copy.ctaContact} <Arrow /></Link>
          </div>
          <div className="mt-12 grid grid-cols-3 max-w-lg border-y border-[var(--border-default)] py-4 text-[10px] uppercase tracking-[.14em] text-[var(--text-muted)]">
            {copy.stats.map((s) => <span key={s.label}><b className="block text-[var(--text-primary)] text-sm mb-1">{s.label}</b>{s.sub}</span>)}
          </div>
        </div>
      </div>
    </section>

    <section id="pillars" className="page-container py-20 md:py-28" aria-labelledby="pillars-heading">
      <div className="grid md:grid-cols-[.7fr_1.3fr] gap-10 mb-12"><div><div className="eyebrow">{copy.pillarsEyebrow}</div><h2 id="pillars-heading" className="section-title">{copy.pillarsTitle}</h2></div><p className="max-w-md self-end text-[var(--text-secondary)] leading-relaxed"><strong className="font-semibold text-[var(--text-primary)]">{copy.pillarsBlurbStrong}</strong>{copy.pillarsBlurbRest}</p></div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-px border border-[var(--border-default)] stagger-children">
        {CAPABILITY_STRUCTURE.map((s, i) => {
          const c = copy.capabilities[i];
          return <CapabilityCard
            key={s.href}
            href={to(s.href)}
            index={s.index}
            title={c.title}
            cta={c.cta}
            bullets={c.bullets.map((label, b) => ({ label, href: to(s.bulletHrefs[b]) }))}
            accent={s.accent}
            titleTint={s.titleTint}
          />;
        })}
      </div>
    </section>

    <section id="offerings" className="border-y border-[var(--border-default)] bg-[var(--bg-surface)]" aria-labelledby="offerings-heading"><div className="page-container py-20 md:py-28"><div className="text-center"><div className="eyebrow text-[var(--accent-orange)]">{copy.offeringsEyebrow}</div><h2 id="offerings-heading" className="section-title mx-auto mt-3 max-w-3xl text-center text-4xl md:text-6xl lg:text-7xl">{copy.offeringsTitle}</h2></div><div className="mt-14 divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">{OFFERING_STRUCTURE.map((s, i) => { const o = copy.offerings[i]; return <Link key={s.index} href={to(s.href)} className="forge-course-link group grid md:grid-cols-[5rem_minmax(0,1fr)_12rem] gap-5 items-start py-7"><span className="font-mono text-xs text-[var(--accent-cyan)]">{s.index}</span><span><h3 className="flex flex-wrap items-center gap-2.5 text-xl font-semibold">{o.title}{o.badge && <span className="rounded-full border border-[var(--accent-green)]/30 bg-[var(--accent-green)]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[1px] text-[var(--accent-green)]">{o.badge}</span>}</h3><p className="mt-2 max-w-xl text-sm text-[var(--text-secondary)]">{o.text}</p></span><span className={`text-sm justify-self-start ${s.ctaColor}`}>{o.cta} <Arrow /></span></Link>; })}</div></div></section>

    <section className="border-y border-[var(--border-default)] bg-[var(--bg-surface)] pb-24" aria-labelledby="cta-heading"><div className="page-container pt-8 md:pt-14"><div className="relative w-full overflow-hidden"><div className="relative z-10"><div className="relative overflow-hidden border border-[var(--border-default)] bg-[var(--bg-deep)]">
              {/* Eyebrow, title and blurb used to be absolutely positioned in a
                  fixed-height box, so a longer blurb ran straight through the
                  title. They flow normally now and the banner grows with them;
                  the ink garden and its scrim stay behind as the background. */}
              <div className="relative min-h-48 md:min-h-56 overflow-hidden">
                <div className="absolute inset-0" aria-hidden="true"><InkGarden compact /></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-deep)]/95 via-[var(--bg-deep)]/80 to-[var(--bg-deep)]/30 md:to-transparent" aria-hidden="true" />
                <div className="relative z-10 flex max-w-2xl flex-col gap-3 p-8 md:p-10">
                  <div className="eyebrow text-[var(--accent-cyan)]">{copy.loopEyebrow}</div>
                  <h2 id="cta-heading" className="section-title">{copy.loopTitle}</h2>
                  <p className="max-w-xl text-[var(--text-secondary)] leading-relaxed">{copy.loopBlurb}</p>
                </div>
              </div>
            </div><div className="mt-10"><CuratedIntel /></div><div className="mt-6 flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap gap-3"><Link href="/blog/" className="button-secondary">{copy.blog} <Arrow /></Link></div><Link href={to('/contact/')} className="button-secondary">{copy.getInTouch} <Arrow /></Link></div></div></div></div></section>
    </div>
  </main>;
}
