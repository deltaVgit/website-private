'use client';
import { useRef, useState } from 'react';
import BackLink from '@/app/components/BackLink';

/**
 * FORGE · PRIVACY — Digital Footprint & OpSec (IA v1, shipped 2026-09-30).
 * Consumer product door: free audit + first scrub, Protection subscription,
 * Deep Scrub one-shot. Copy source of truth: CGU/CGV v0.4 drafts
 * (notes/03-deliver/web3/opsec/legal/). Intake composes a prefilled email
 * client-side (mailto GET — form-post mailto silently fails on mobile) with
 * a clipboard fallback; a Worker endpoint + processor DPA is the later
 * upgrade per the Phase-5 card.
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

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="mt-1 shrink-0">
    <circle cx="7" cy="7" r="6" stroke="var(--accent-green)" strokeWidth="1.4" />
    <path d="M4.5 7.2l1.7 1.7L9.5 5.5" stroke="var(--accent-green)" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const Cross = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true" className="mt-1 shrink-0">
    <path d="M2.5 10.5l8-8M2.5 2.5l8 8" stroke="var(--accent-red)" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

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
    const text = requestText(new FormData(formRef.current!));
    navigator.clipboard
      .writeText(text + '\n\n→ engage@deltav.cc')
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[900px] mx-auto px-6 md:px-8 py-16 md:py-20">
        <div className="mb-6">
          <BackLink
            fallback="/forge/"
            label="Back to Forge"
            className="inline-flex items-center gap-1.5 text-[var(--accent-cyan)] text-sm hover:underline group"
          />
        </div>

        <div className="text-[var(--accent-cyan)] text-xs font-semibold tracking-[3px] uppercase mb-3">
          Forge · Privacy
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-[-2px] mb-4">
          Find where you&apos;re exposed. Then get you off them.
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          A human-supervised audit and scrub of your public digital footprint — data brokers,
          directory listings, public breach corpora. You keep your papers; we never hold your
          identity.
        </p>
        <p className="text-xs text-[var(--text-tertiary)] mt-3">
          Technical service, not legal advice · No removal is guaranteed — we report honestly what
          was filed, refused, or reappeared.
        </p>

        {/* ---- free tier ---- */}
        <div className="mt-12">
          <div className="text-[var(--text-secondary)] text-xs font-semibold tracking-[2px] uppercase mb-4">
            The free tier — what you actually get
          </div>
          <div className="space-y-3">
            {[
              {
                t: 'Exposure audit',
                d: 'Your public traces scanned across your name forms, emails, phone numbers and public pseudonyms: data-broker and directory listings, public breach corpora (k-anonymity — the identifying string, email or phone, is never sent whole), search-engine leakage. Delivered as a written report, source by source.',
              },
              {
                t: 'First scrub',
                d: 'One initial round of opt-out and erasure filings on no-ID targets, on your recorded instruction. You receive a receipts ledger: per target — filed, refused, no exposure, reappeared.',
              },
              {
                t: 'The plain answer',
                d: 'If free national mechanisms (Robinson list, Bloctel, Stop Pub) or a cheap self-service tool already cover you, we tell you before you pay anything.',
              },
            ].map((s, i) => (
              <div key={s.t} className="listing-card relative group rounded-2xl border border-[var(--border-default)] p-5 md:p-6 flex gap-4">
                <span className="font-mono text-sm font-bold text-[var(--accent-cyan)] tabular-nums pt-0.5">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <div className="font-semibold text-[var(--text-primary)] text-sm mb-1">{s.t}</div>
                  <p className="text-[13px] text-[var(--text-tertiary)] leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-3">
            Free tier runs within published capacity limits. No obligation to continue.
          </p>
        </div>

        {/* ---- intake form ---- */}
        <div className="mt-12 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Start your audit</h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Only what the first real run needs. Social networks and ID-gated bureaus are never
            contacted by us — the report lists them for your own verified request.
          </p>
          <form
            ref={formRef}
            onSubmit={submitRequest}
            className="mt-5 space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-1.5">
                  Full name + variants
                </span>
                <input
                  type="text"
                  name="subject_names"
                  required
                  placeholder="As listings would show it"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-cyan)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-1.5">
                  Email address(es)
                </span>
                <input
                  type="text"
                  name="subject_emails"
                  required
                  placeholder="yours, and old ones too"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-cyan)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-1.5">
                  Phone number(s)
                </span>
                <input
                  type="text"
                  name="subject_phones"
                  placeholder="+40 … / +33 … / +41 …"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-cyan)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-1.5">
                  Public pseudonyms / handles
                </span>
                <input
                  type="text"
                  name="subject_pseudonyms"
                  placeholder="usernames you use publicly"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-cyan)] focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-1.5">
                  Country of residence
                </span>
                <select
                  name="country"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] focus:border-[var(--accent-cyan)] focus:outline-none"
                >
                  <option>Romania</option>
                  <option>France</option>
                  <option>Belgium</option>
                  <option>Switzerland</option>
                  <option>EU (other)</option>
                  <option>Other</option>
                </select>
              </label>
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-1.5">
                  City / commune
                </span>
                <input
                  type="text"
                  name="city"
                  placeholder="e.g. Bucharest"
                  className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-cyan)] focus:outline-none"
                />
              </label>
            </div>

            <div>
              <span className="block text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-2">
                Where should we look?
              </span>
              <div className="space-y-2">
                {SCAN_TYPES.map((s) => (
                  <label key={s.id} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scans.includes(s.id)}
                      onChange={() => toggleScan(s.id)}
                      className="mt-0.5 accent-[var(--accent-cyan)]"
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
              <input type="hidden" name="scan_types" value={scans.join(', ')} />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-[var(--text-tertiary)] cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={() => setConsent((v) => !v)}
                className="mt-0.5 accent-[var(--accent-cyan)]"
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
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-primary-bright)]"
              >
                Request the free audit
              </button>
              <button
                type="button"
                onClick={copyRequest}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]"
              >
                {copied ? 'Copied ✓ — send to engage@deltav.cc' : 'Copy request details'}
              </button>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Stored on encrypted EU infrastructure, single-operator access · working files
              auto-delete 90 days after the case closes · receipts stay pseudonymised (hashed
              subject id, no name) · full purge on request, confirmed in writing within 30 days.
            </p>
          </form>
        </div>

        {/* ---- pricing ---- */}
        <div className="mt-12">
          <div className="text-[var(--text-secondary)] text-xs font-semibold tracking-[2px] uppercase mb-4">
            What the report recommends next
          </div>
          <div className="space-y-4">
            <div className="listing-card relative overflow-hidden rounded-2xl border p-6 md:p-7"
              style={{ borderColor: 'color-mix(in srgb, var(--accent-cyan) 40%, var(--border-default))' }}>
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-cyan)]" />
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-lg font-semibold text-[var(--text-primary)]">Protection</span>
                <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">$30/mo</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[1px] bg-[var(--accent-cyan)] text-[var(--on-accent)]">
                  subscription · cancel anytime
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--text-secondary)]">
                <li className="flex gap-2.5"><Check />Continuous monitoring: periodic re-scans, diff against your receipts ledger, alert when a removed listing reappears.</li>
                <li className="flex gap-2.5"><Check />Data-poisoning canaries <em className="text-[var(--text-tertiary)]">(beta, your consent only)</em> — seeded only into submissions concerning your own profile; no result is promised, effectiveness not warranted.</li>
                <li className="flex gap-2.5"><Check />Guided privacy-habit sessions: your hands on the keyboard, we guide step by step and hold nothing.</li>
              </ul>
            </div>

            <div className="listing-card relative rounded-2xl border border-[var(--border-default)] p-6 md:p-7">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-lg font-semibold text-[var(--text-primary)]">Deep Scrub</span>
                <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">$99</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-[1px] border border-[var(--accent-gold)]/40 text-[var(--accent-gold)]">
                  one-shot · no subscription
                </span>
              </div>
              <ul className="mt-3 space-y-2 text-[13px] text-[var(--text-secondary)]">
                <li className="flex gap-2.5"><Check />Bounded job: up to 3 filing rounds on no-ID targets, 30-day re-verification included — then the file closes. No renewal, nothing recurring.</li>
                <li className="flex gap-2.5"><Check />The ID-gated checklist: the sources only you can approach (SCHUFA, Experian, CRIF…), prepared for your own verified requests.</li>
                <li className="flex gap-2.5"><Check />Ordered when monitoring shows fresh reappearance — or once at intake.</li>
              </ul>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              A quiet period means nothing reappeared — we don&apos;t pad reports to look active.
              14-day EU statutory withdrawal applies to both paid formats (model form on request).
              Pay in USD, EUR, CHF or RON — rate shown at checkout.
            </p>
          </div>
        </div>

        {/* ---- never list ---- */}
        <div className="mt-12 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-7">
          <div className="text-[var(--text-tertiary)] text-xs font-semibold tracking-[2px] uppercase mb-4">
            What we never do
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {NEVER.map((n) => (
              <div key={n} className="flex gap-2.5 text-[13px] text-[var(--text-tertiary)]">
                <Cross />{n}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border-default)] flex flex-wrap justify-between gap-3 text-xs text-[var(--text-muted)]">
          <span>Delta V SRL, Bucharest (RO) · contact@deltav.cc</span>
          <span>Terms: CGU/CGV v0.4 draft · AI-Act transparency notice in review</span>
        </div>
      </div>
    </div>
  );
}
