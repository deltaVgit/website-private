'use client';
import { useRef, useState } from 'react';
import { PageHero, PageContainer } from '@/app/components/PageShell';
import OfferCard from '@/app/components/OfferCard';

/**
 * FORGE · PRIVACY — Digital Footprint & OpSec (IA v1, 2026-09-30).
 * Service-page grammar (same shape as the AI/Web3 pillar pages): PageHero +
 * one OfferCard per tier + intake form + guardrails footer. Copy source of
 * truth: CGU/CGV v0.4 drafts (notes/03-deliver/web3/opsec/legal/).
 * Intake composes a prefilled email client-side (mailto GET — form-post
 * mailto silently fails on mobile) with a clipboard fallback; a Worker
 * endpoint + processor DPA is the later upgrade per the Phase-5 card.
 */

const SCAN_TYPES = [
  { id: 'brokers', label: 'Data brokers & people-directory listings', checked: true },
  { id: 'breach', label: 'Public breach corpora (k-anonymity — email & phone, never sent whole)', checked: true },
  { id: 'search', label: 'Search-engine leakage (indexed docs, indexed handles)', checked: false },
  { id: 'full', label: 'Everything — full sweep', checked: false },
];

const NEVER = [
  'We never contact ID-gated bureaus for you',
  'We never hold scans of your ID documents',
  'We never log into your accounts',
  'We never promise a removal outcome',
];

export default function ForgePrivacyPage() {
  const [scans, setScans] = useState<string[]>(SCAN_TYPES.filter((s) => s.checked).map((s) => s.id));
  const [consent, setConsent] = useState(false);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const toggleScan = (id: string) =>
    setScans((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  const requestText = (data: FormData) => {
    const val = (k: string) => String(data.get(k) || '—');
    const scanLabels = scans
      .map((id) => SCAN_TYPES.find((s) => s.id === id)?.label || id)
      .join('; ');
    return [
      `Subject identifiers: ${val('subject_names')}`,
      `Emails: ${val('subject_emails')}`,
      `Phones: ${val('subject_phones')}`,
      `Pseudonyms: ${val('subject_pseudonyms')}`,
      `Residence: ${val('city')}, ${val('country')}`,
      `Scan scope: ${scanLabels || '—'}`,
      `Consent to scan own identifiers: recorded via this request (CGU §3.3)`,
    ].join('\n');
  };

  const submitRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = requestText(new FormData(e.currentTarget));
    window.location.href =
      'mailto:engage@deltav.cc?subject=' +
      encodeURIComponent('Free exposure audit — intake request') +
      '&body=' +
      encodeURIComponent(text);
  };

  const copyRequest = () => {
    if (!formRef.current) return;
    const text = requestText(new FormData(formRef.current));
    navigator.clipboard
      .writeText(text + '\n\n→ engage@deltav.cc')
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const inputCls =
    'w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none';
  const labelCls =
    'block text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-1.5';

  return (
    <div className="relative z-10">
      <PageHero
        label="Forge · Privacy"
        title="Know what the internet has on you. Then get it gone."
        description="Your public footprint — data brokers, directory listings, breach corpora — scanned free by machine, then scrubbed by people once you pay. You keep your papers; we never hold your identity. Technical service, not legal advice — no removal is guaranteed; we report honestly what was filed, refused, or reappeared."
        accent="purple"
        backFallback="/forge/"
        backLabel="Back to Forge"
      />

      <PageContainer className="pb-16 space-y-5" as="section">
        <div className="text-xs font-semibold tracking-[3px] uppercase text-[var(--accent-purple)]">
          Check · Clean · New skin
        </div>
        <OfferCard
          id="free-audit"
          kicker="01 · Free — automated"
          title="The free check"
          pitch="No human, no cost: the machine scan of what the public web shows about you, in your browser, in three minutes. The honest part — most of what it finds, you can scrub yourself for free; we tell you how."
          deliverables={[
            'Machine scan across your name forms, emails, phone numbers and public pseudonyms: data-broker and directory listings, public breach corpora (k-anonymity — the identifying string, email or phone, is never sent whole), search-engine leakage.',
            'A verdict with the moves that matter in order — credential rotation first.',
            'The free path: national mechanisms (Robinson list, Bloctel, Stop Pub, Google&apos;s &quot;Results about you&quot;) laid out per country — most people can cover themselves at zero cost.',
          ]}
          process={[
            { step: 'Run it', desc: 'the hosted self-check app — nothing is sent to Delta V' },
            { step: 'Decide', desc: 'the verdict tells you if a machine scan was enough' },
            { step: 'Optional next', desc: 'rung 2 when you want human hands on the filings' },
          ]}
          audience="Anyone. This run is software — it costs us nothing and you nothing."
          ctaLabel="Run the free check"
          price="Free"
          ctaTopic="free-audit"
          ctaHref="/forge/privacy/audit/"
        />

        <OfferCard
          id="deep-scrub"
          kicker="02 · Paid — one human round"
          title="The scrub"
          pitch={
            <>
              A person files your opt-outs and erasures for you: brokers, directories, indexed
              leaks — one filing round on no-ID targets, re-verified at 30 days, then the file
              closes.{' '}
              <strong className="text-[var(--text-primary)]">USD 19, one-shot. No subscription.</strong>
            </>
          }
          deliverables={[
            'One filing round on no-ID targets, 30-day re-verification included — then the file closes. No renewal, nothing recurring.',
            'A receipts ledger: per target — filed, refused, no exposure, reappeared.',
            'The ID-gated checklist: the sources only you can approach (SCHUFA, Experian, CRIF…), prepared for your own verified requests.',
          ]}
          process={[
            { step: 'Scope', desc: 'one bounded job, agreed at intake' },
            { step: 'File', desc: 'one round on no-ID targets, by a person' },
            { step: 'Close', desc: 're-verification, final ledger — then the file closes' },
          ]}
          audience="Exposure you&apos;ve confirmed and want handled — once, properly."
          ctaLabel="Order the scrub"
          price="USD 19"
          ctaTopic="deep-scrub"
          secondary={{ label: 'Or keep it clean', href: '#protection' }}
        />

        <OfferCard
          id="protection"
          kicker="03 · Paid — kept running"
          title="The watch"
          pitch={
            <>
              Everything rung 2 does, kept running: automated regular checks and re-scrubs when
              listings come back, data-poisoning canaries (beta, consent-gated) seeded into your
              own submissions, and guided mentoring sessions that end with a new digital skin —
              fresh habits and a reduced, hardened footprint instead of the one leaks keep
              finding.{' '}
              <strong className="text-[var(--text-primary)]">USD 100/month, cancel anytime — or commit six months for USD 500.</strong>
            </>
          }
          deliverables={[
            'Automated & regular: periodic re-scans, diff against your receipts ledger, alert + re-filing when a removed listing reappears (CGU §6.3).',
            'Data-poisoning canaries (beta, your consent only) — seeded only into submissions concerning your own profile; no result is promised, effectiveness not warranted.',
            'New digital skin: guided privacy-habit mentoring — your hands on the keyboard, we guide step by step and hold nothing.',
          ]}
          process={[
            { step: 'Baseline', desc: 'your audit or scrub report becomes day zero' },
            { step: 'Watch & re-scrub', desc: 'a quiet period means nothing reappeared — we do not pad reports to look active' },
            { step: 'Re-skin', desc: 'mentoring sessions harden the habits that caused the exposure' },
          ]}
          audience="Clean now — and decided to stay that way."
          ctaLabel="Get protected"
          price="USD 100/mo · 500/6mo"
          ctaTopic="protection"
          secondary={{ label: 'Start with the free check', href: '#free-audit' }}
        />
      </PageContainer>

      <PageContainer as="section" className="pb-16">
        <p className="text-[11px] text-[var(--text-muted)] max-w-3xl leading-relaxed">
          A quiet period means nothing reappeared — we don&apos;t pad reports to look active.
          14-day EU statutory withdrawal applies to both paid formats (model form on request). Pay
          in USD, EUR, CHF or RON — rate shown at checkout.
        </p>
      </PageContainer>

      <PageContainer as="section" className="pb-16">
        <div id="start-audit" className="scroll-mt-24 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Order the human work</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-3xl leading-relaxed">
            This form starts the paid path — the USD 19 scrub or the watch. You&apos;ll see the
            price before anything is filed. Social networks and ID-gated bureaus are never
            contacted by us — the report lists them for your own verified request. Prefer a
            free answer first?{' '}
            <a href="/forge/privacy/audit/" className="text-[var(--accent-cyan)] hover:underline">
              Run the free self-check →
            </a>
          </p>
          <form ref={formRef} onSubmit={submitRequest} className="mt-6 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className={labelCls}>Full name + variants</span>
                <input type="text" name="subject_names" required placeholder="As listings would show it" className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>Email address(es)</span>
                <input type="text" name="subject_emails" required placeholder="yours, and old ones too" className={inputCls} />
              </label>
              <label className="block">
                <span className={labelCls}>Phone number(s)</span>
                <input type="tel" name="subject_phones" placeholder="+40 … / +33 … / +41 …" className={inputCls} autoComplete="off" />
              </label>
              <label className="block">
                <span className={labelCls}>Public pseudonyms / handles</span>
                <input type="text" name="subject_pseudonyms" placeholder="usernames you use publicly" className={inputCls} autoComplete="off" />
              </label>
              <label className="block">
                <span className={labelCls}>Country of residence</span>
                <select name="country" className={inputCls} defaultValue="Switzerland">
                  <option>Romania</option>
                  <option>France</option>
                  <option>Belgium</option>
                  <option>Switzerland</option>
                  <option>EU (other)</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="block">
                <span className={labelCls}>City / commune</span>
                <input type="text" name="city" placeholder="e.g. Bucharest" className={inputCls} autoComplete="off" />
              </label>
            </div>

            <fieldset>
              <legend className={labelCls}>Where should we look?</legend>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {SCAN_TYPES.map((s) => (
                  <label key={s.id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={scans.includes(s.id)}
                      onChange={() => toggleScan(s.id)}
                    />
                    <span className="block rounded-xl border border-[var(--border-default)] px-4 py-3 text-[13px] text-[var(--text-secondary)] transition-colors peer-checked:border-[var(--accent-primary)] peer-checked:bg-[var(--accent-primary)]/10 peer-checked:text-[var(--text-primary)]">
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="flex items-start gap-2.5 text-xs text-[var(--text-tertiary)] cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={() => setConsent((v) => !v)}
                className="mt-0.5 accent-[var(--accent-primary)]"
              />
              <span>
                I consent to a scan of my own identifiers for this audit — recorded, scoped,
                revocable at any time. Consent is logged; revocation triggers deletion of working
                files.
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={!consent}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-primary-bright)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Request the free audit
              </button>
              <button
                type="button"
                onClick={copyRequest}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] px-6 py-3 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]"
              >
                {copied ? 'Copied ✓ — send to engage@deltav.cc' : 'Copy request details'}
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Stored on encrypted EU infrastructure, single-operator access · working files
              auto-delete 90 days after the case closes · receipts stay pseudonymised (hashed
              subject id, no name) · full purge on request, confirmed in writing within 30 days.
            </p>
          </form>
        </div>
      </PageContainer>

      <PageContainer as="section" className="pb-16">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-7">
          <div className="text-[var(--text-tertiary)] text-xs font-semibold tracking-[2px] uppercase mb-4">
            What we never do
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {NEVER.map((n) => (
              <div key={n} className="flex gap-2.5 text-[13px] text-[var(--text-tertiary)]">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="mt-1 shrink-0">
                  <path d="M2.5 10.5l8-8M2.5 2.5l8 8" stroke="var(--accent-red)" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {n}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border-default)] flex flex-wrap justify-between gap-3 text-xs text-[var(--text-muted)]">
          <span>Delta V SRL, Bucharest (RO) · contact@deltav.cc</span>
          <span>Terms: CGU/CGV v0.4 draft · AI-Act transparency notice in review</span>
        </div>
      </PageContainer>
    </div>
  );
}
