'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PageHero, PageContainer } from '@/app/components/PageShell';

/**
 * FREE EXPOSURE SELF-CHECK — hosted app (IA v1, 2026-09-30).
 * Runs 100% in the visitor's browser against keyless, CORS-open public
 * breach-corpus APIs. Nothing is stored or transmitted to Delta V.
 *  - Email step: XposedOrNot (api.xposedornot.com) — DISCLOSED to the visitor:
 *    the address itself is queried against that third-party corpus.
 *  - Password step: HIBP k-anonymity range API — only a 5-char SHA-1 prefix
 *    leaves the browser (WebCrypto, no library).
 * Results feed a verdict + immediate actions (credential rotation first) and
 * close into the funnel: send the anonymised result to us, Protection
 * (monitoring + mentoring + canaries beta), Deep Scrub.
 * Copy source of truth: CGU/CGV v0.4 drafts; honesty rules: no outcome
 * promised, third-party query disclosed, indicative-not-exhaustive stated.
 */

const inputCls =
  'w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none';

const FREE_MECHANISMS: Record<string, { label: string; url: string }[]> = {
  Romania: [
    { label: 'ANPD consumer complaints', url: 'https://www.dataprotection.ro/' },
    { label: 'Google — Results about you', url: 'https://support.google.com/websearch/answer/12719076' },
  ],
  France: [
    { label: 'Bloctel (cold calls)', url: 'https://www.bloctel.gouv.fr/' },
    { label: 'Stop Pub (ads)', url: 'https://www.stoppub.ademe.fr/' },
    { label: 'Google — Results about you', url: 'https://support.google.com/websearch/answer/12719076' },
  ],
  Belgium: [
    { label: 'YourData whistleblowing & opt-outs (APD/GBA)', url: 'https://www.dataprotectionauthority.be/' },
    { label: 'Google — Results about you', url: 'https://support.google.com/websearch/answer/12719076' },
  ],
  Switzerland: [
    { label: 'Robinson list (ADV)', url: 'https://www.robinsonliste.ch/' },
    { label: 'Google — Results about you', url: 'https://support.google.com/websearch/answer/12719076' },
  ],
  'EU (other)': [{ label: 'Google — Results about you', url: 'https://support.google.com/websearch/answer/12719076' }],
  Other: [{ label: 'Google — Results about you', url: 'https://support.google.com/websearch/answer/12719076' }],
};

type EmailResult = {
  email: string;
  found: boolean;
  breaches: string[];
  riskLabel?: string;
  riskScore?: number;
  records?: number;
  easyPasswords?: number;
  error?: string;
};

type PwResult = { prefix: string; suffix: string; count: number };

const sha1Prefix = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-1', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

async function checkEmail(email: string): Promise<EmailResult> {
  const base: EmailResult = { email, found: false, breaches: [] };
  try {
    const res = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`);
    if (!res.ok) return base; // 404 = not found in corpus
    const data = await res.json();
    const names: string[] = Array.isArray(data?.breaches?.[0]) ? data.breaches[0] : [];
    if (names.length === 0) return { ...base, found: false };
    const out: EmailResult = { ...base, found: true, breaches: names };
    try {
      const analytics = await fetch(
        `https://api.xposedornot.com/v1/breach-analytics?email=${encodeURIComponent(email)}`
      );
      if (analytics.ok) {
        const a = await analytics.json();
        const risk = a?.BreachMetrics?.risk?.[0];
        out.riskLabel = risk?.risk_label;
        out.riskScore = typeof risk?.risk_score === 'number' ? risk.risk_score : undefined;
        const details = a?.ExposedBreaches?.breaches_details;
        if (Array.isArray(details)) {
          out.records = details.reduce((sum: number, d: any) => sum + (Number(d?.xposed_records) || 0), 0);
          out.easyPasswords = details.filter((d: any) =>
            /easy|plain/i.test(String(d?.password_strength || ''))
          ).length;
        }
      }
    } catch {
      /* analytics optional — the breach list alone stands */
    }
    return out;
  } catch {
    return { ...base, error: 'The breach-corpus API could not be reached. Try again, or request the human audit.' };
  }
}

async function checkPassword(password: string): Promise<PwResult> {
  const hash = await sha1Prefix(password);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`);
  if (!res.ok) throw new Error('range API failed');
  const body = await res.text();
  let count = 0;
  for (const line of body.split('\n')) {
    const [suffix, num] = line.trim().split(':');
    if (suffix === hash.slice(5)) {
      count = parseInt(num, 10) || 0;
      break;
    }
  }
  return { prefix: hash.slice(0, 5), suffix: hash.slice(5), count };
}

const verdictOf = (emails: EmailResult[], pwnedPw: number) => {
  const criticalEmail = emails.some(
    (e) => (e.riskScore ?? 0) >= 85 || (e.easyPasswords ?? 0) > 0
  );
  const score = Math.max(0, ...emails.map((e) => e.riskScore ?? 0));
  if (criticalEmail || pwnedPw > 0) return { label: 'Critical', text: 'Act today.', tone: 'var(--accent-red)' };
  if (score >= 50) return { label: 'High', text: 'Act this week.', tone: 'var(--accent-orange, var(--accent-gold))' };
  if (score >= 25) return { label: 'Moderate', text: 'Tighten up this month.', tone: 'var(--accent-amber)' };
  return { label: 'Low', text: 'No public-corpus exposure found. Keep the habits.', tone: 'var(--accent-green)' };
};

const RiskBadge = ({ label, tone }: { label: string; tone: string }) => (
  <span
    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[1.5px]"
    style={{ background: `color-mix(in srgb, ${tone} 15%, transparent)`, border: `1px solid color-mix(in srgb, ${tone} 40%, transparent)`, color: tone }}
  >
    {label}
  </span>
);

const Step = ({ n, title, children }: { n: string; title: string; children: React.ReactNode }) => (
  <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8">
    <div className="flex items-baseline gap-3 mb-4">
      <span className="font-mono text-sm font-bold text-[var(--accent-purple)] tabular-nums">{n}</span>
      <h2 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h2>
    </div>
    {children}
  </div>
);

export default function PrivacyAuditApp() {
  const [emailsRaw, setEmailsRaw] = useState('');
  const [emailResults, setEmailResults] = useState<EmailResult[] | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);
  const [pw, setPw] = useState('');
  const [pwResults, setPwResults] = useState<PwResult[] | null>(null);
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState('');
  const [country, setCountry] = useState('Switzerland');
  const [checks, setChecks] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const toggleCheck = (id: string) =>
    setChecks((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const runEmailCheck = async () => {
    const list = emailsRaw
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter((e) => /.+@.+\..+/.test(e))
      .slice(0, 3);
    if (list.length === 0 || emailBusy) return;
    setEmailBusy(true);
    setEmailResults(null);
    const results: EmailResult[] = [];
    for (const email of list) results.push(await checkEmail(email));
    setEmailResults(results);
    setEmailBusy(false);
  };

  const runPwCheck = async () => {
    if (!pw || pwBusy) return;
    setPwBusy(true);
    setPwError('');
    try {
      const r = await checkPassword(pw);
      setPwResults((prev) => {
        const list = (prev ?? []).filter((x) => x.suffix !== r.suffix);
        return [...list, r];
      });
      setPw('');
    } catch {
      setPwError('The k-anonymity API could not be reached. Try again in a moment.');
    }
    setPwBusy(false);
  };

  const pwnedPwCount = (pwResults ?? []).filter((r) => r.count > 0).length;
  const hasAny = Boolean(emailResults?.length || pwResults?.length);
  const verdict = hasAny ? verdictOf(emailResults ?? [], pwnedPwCount) : null;

  const exposedServices = (emailResults ?? [])
    .flatMap((r) => r.breaches)
    .filter((n, i, arr) => arr.indexOf(n) === i)
    .slice(0, 10);

  const resultSummary = [
    'Free exposure self-check — result (no identifiers included)',
    `Risk: ${verdict ? `${verdict.label} — ${verdict.text}` : 'not run'}`,
    `Emails checked: ${emailResults?.length ?? 0} · found in public corpora: ${(emailResults ?? []).filter((e) => e.found).length}`,
    `Exposed records (approx): ${(emailResults ?? []).reduce((s, e) => s + (e.records ?? 0), 0) || '—'}`,
    `Passwords tested: ${pwResults?.length ?? 0} · pwned: ${pwnedPwCount}`,
    `Self-search items flagged: ${checks.length}`,
    `Country: ${country}`,
    '',
    'I want the human-supervised audit / Protection / Deep Scrub (delete as appropriate).',
  ].join('\n');

  const sendResult = () => {
    window.location.href =
      'mailto:engage@deltav.cc?subject=' +
      encodeURIComponent('Free audit — self-check result') +
      '&body=' +
      encodeURIComponent(resultSummary);
  };

  const copyResult = () => {
    navigator.clipboard
      .writeText(resultSummary + '\n\n→ engage@deltav.cc')
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  return (
    <div className="relative z-10">
      <PageHero
        label="Forge · Privacy · Free tier"
        title="Exposure self-check"
        description="A three-minute instant scan of your email addresses and passwords against public breach corpora — then the exact moves that matter, and the rungs for going further with us. Runs entirely in your browser: Delta V receives nothing unless you send the result yourself."
        accent="purple"
        backFallback="/forge/privacy/"
        backLabel="Back to Privacy"
      />

      <PageContainer className="pb-10 space-y-5" as="section">
        <div className="rounded-2xl border border-[var(--accent-purple)]/30 bg-[var(--accent-purple)]/[0.04] p-5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">How this stays private.</strong> Passwords
          are hashed in your browser and only a 5-character slice of the hash is sent to the
          Have I Been Pwned range API — your password never leaves this page. Email addresses are
          queried against a third-party public corpus (XposedOrNot, keyless): the address itself
          reaches that service, not us. Delta V stores nothing, sets no cookies, and logs nothing.
          This check is indicative — public corpora are not exhaustive; the human audit goes
          wider.
        </div>

        <Step n="01" title="Email exposure">
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl leading-relaxed">
            Up to 3 addresses. We check each against public breach dumps and rank the damage:
            which services leaked, how many records, whether the passwords were stored badly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              type="text"
              value={emailsRaw}
              onChange={(e) => setEmailsRaw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runEmailCheck()}
              placeholder="you@example.com, old@example.com"
              className={inputCls}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={runEmailCheck}
              disabled={emailBusy}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-primary-bright)] disabled:opacity-40"
            >
              {emailBusy ? 'Checking…' : 'Check emails'}
            </button>
          </div>
          {emailResults && (
            <div className="mt-5 space-y-3">
              {emailResults.map((r) => (
                <div key={r.email} className="rounded-xl border border-[var(--border-default)] p-4">
                  <div className="flex flex-wrap items-center gap-2.5 mb-2">
                    <RiskBadge
                      label={r.error ? 'Error' : r.found ? r.riskLabel || 'Exposed' : 'Not found'}
                      tone={r.error ? 'var(--accent-amber)' : r.found ? 'var(--accent-red)' : 'var(--accent-green)'}
                    />
                    <span className="text-sm font-medium">{r.email}</span>
                  </div>
                  {r.error ? (
                    <p className="text-[13px] text-[var(--text-tertiary)]">{r.error}</p>
                  ) : r.found ? (
                    <>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                        Appears in <strong>{r.breaches.length}</strong> public breaches
                        {r.records ? <> · ≈{new Intl.NumberFormat('en').format(r.records)} records leaked</> : null}
                        {r.easyPasswords ? (
                          <> · <strong className="text-[var(--accent-red)]">{r.easyPasswords} of them stored passwords badly (crackable)</strong></>
                        ) : null}
                        .
                      </p>
                      <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed">
                        {r.breaches.slice(0, 12).join(' · ')}
                        {r.breaches.length > 12 ? ` · +${r.breaches.length - 12} more` : ''}
                      </p>
                    </>
                  ) : (
                    <p className="text-[13px] text-[var(--text-secondary)]">
                      Not in the public corpora we can reach. Good sign — not a guarantee.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Step>

        <Step n="02" title="Password exposure (k-anonymity)">
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl leading-relaxed">
            Test the passwords you actually use. The check is hashed locally — only a 5-character
            slice of the SHA-1 is sent; your password never leaves this page. Nothing is stored.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runPwCheck()}
              placeholder="Type a password to test — it stays in your browser"
              className={inputCls}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={runPwCheck}
              disabled={pwBusy || !pw}
              className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[var(--border-default)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-all hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)] disabled:opacity-40"
            >
              {pwBusy ? 'Checking…' : 'Check password'}
            </button>
          </div>
          {pwError && <p className="text-[13px] text-[var(--accent-amber)] mt-3">{pwError}</p>}
          {pwResults && pwResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {pwResults.map((r) => (
                <div key={r.suffix} className="flex items-center gap-3 rounded-xl border border-[var(--border-default)] px-4 py-3">
                  <RiskBadge
                    label={r.count > 0 ? `Pwned ×${new Intl.NumberFormat('en').format(r.count)}` : 'Clean'}
                    tone={r.count > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}
                  />
                  <span className="text-xs font-mono text-[var(--text-muted)]">
                    SHA-1 slice {r.prefix}•••••
                  </span>
                  {r.count > 0 && (
                    <span className="text-[13px] text-[var(--text-secondary)]">
                      seen in real dumps — stop using it everywhere, today.
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Step>

        <Step n="03" title="Search-engine leakage — one manual sweep">
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl leading-relaxed">
            Two minutes of honest searching. Tick what you find — it feeds the summary and the
            human audit if you send it.
          </p>
          <div className="grid sm:grid-cols-2 gap-2.5 max-w-3xl">
            {[
              { id: 'email-google', label: 'Your email appears in Google results (quoted search)' },
              { id: 'phone-google', label: 'Your phone number appears in results or directories' },
              { id: 'handle-google', label: 'Your pseudonyms are indexed and link to your real name' },
              { id: 'docs-indexed', label: 'Documents with your name/address are publicly indexed' },
            ].map((c) => (
              <label key={c.id} className="cursor-pointer">
                <input type="checkbox" className="peer sr-only" checked={checks.includes(c.id)} onChange={() => toggleCheck(c.id)} />
                <span className="block rounded-xl border border-[var(--border-default)] px-4 py-3 text-[13px] text-[var(--text-secondary)] transition-colors peer-checked:border-[var(--accent-primary)] peer-checked:bg-[var(--accent-primary)]/10 peer-checked:text-[var(--text-primary)]">
                  {c.label}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <a href="https://www.google.com/search?q=%22your+email%22" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-[var(--text-secondary)] hover:border-[var(--border-hover)]">Open quoted-search template ↗</a>
            <a href="https://support.google.com/websearch/answer/12719076" target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-[var(--text-secondary)] hover:border-[var(--border-hover)]">Google “Results about you” ↗</a>
          </div>
        </Step>

        {verdict && (
          <Step n="✓" title={`Verdict: ${verdict.label} — ${verdict.text}`}>
            <div className="flex items-center gap-3 mb-5">
              <RiskBadge label={verdict.label} tone={verdict.tone} />
              <span className="text-sm text-[var(--text-secondary)]">
                {pwnedPwCount > 0 ? `${pwnedPwCount} pwned password(s). ` : ''}
                {(emailResults ?? []).some((e) => e.found)
                  ? 'Public-corpus exposure confirmed.'
                  : 'No public-corpus exposure found.'}
              </span>
            </div>
            <div className="text-xs font-semibold uppercase tracking-[2px] text-[var(--accent-purple)] mb-3">
              Do these now — in this order
            </div>
            <ol className="space-y-3 text-sm mb-6">
              {pwnedPwCount > 0 && (
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--accent-red)]/10 text-[var(--accent-red)] text-xs font-semibold flex items-center justify-center">1</span>
                  <span><strong>Rotate every tested password that came back pwned — everywhere you reused it.</strong> Reuse is how one leak becomes five account takeovers.</span>
                </li>
              )}
              {exposedServices.length > 0 && (
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] text-xs font-semibold flex items-center justify-center">{pwnedPwCount > 0 ? 2 : 1}</span>
                  <span>
                    <strong>Change credentials on the breached services first:</strong>{' '}
                    <span className="text-[var(--text-secondary)]">{exposedServices.join(', ')} — then any account where you reused those passwords. Turn on 2FA while you are in there.</span>
                  </span>
                </li>
              )}
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] text-xs font-semibold flex items-center justify-center">{pwnedPwCount > 0 || exposedServices.length > 0 ? (pwnedPwCount > 0 ? 3 : 2) : 1}</span>
                <span>
                  <strong>Get a password manager</strong> and stop reusing anything. One strong
                  unique password per service beats every breach-corpus list.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-semibold flex items-center justify-center">{pwnedPwCount > 0 || exposedServices.length > 0 ? (pwnedPwCount > 0 ? 4 : 3) : 2}</span>
                <span>
                  <strong>Use your country's free mechanisms:</strong>{' '}
                  <span className="text-[var(--text-secondary)]">
                    {(FREE_MECHANISMS[country] ?? FREE_MECHANISMS['Other']).map((m, i) => (
                      <span key={m.url}>
                        {i > 0 && ' · '}
                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-cyan)] hover:underline">{m.label} ↗</a>
                      </span>
                    ))}
                  </span>
                </span>
              </li>
            </ol>
            <div className="rounded-xl border border-[var(--border-default)] p-4 text-[13px] text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">Country:</strong>{' '}
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="ml-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] px-2 py-1 text-sm text-[var(--text-primary)]">
                {Object.keys(FREE_MECHANISMS).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </Step>
        )}
      </PageContainer>

      <PageContainer as="section" className="pb-24">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8">
          <div className="text-xs font-semibold tracking-[3px] uppercase mb-3 text-[var(--accent-purple)]">
            Then get protected
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            The self-check stops here. We go where it can't.
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-3xl leading-relaxed mb-8">
            Directory listings, data brokers, ID-gated bureaus, reappearing records — that is the
            human-supervised audit, and the rungs below are how it scales with your exposure.
            No result is ever promised; you get the receipts either way.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-[var(--border-default)] p-5">
              <div className="text-sm font-semibold mb-1">Human audit — free</div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
                Send this result, get the full scoped audit: brokers, directories, leakage — with
                a first scrub round and a receipts ledger.
              </p>
              <button type="button" onClick={sendResult} className="w-full inline-flex justify-center items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-primary-bright)]">
                Send my result
              </button>
              <button type="button" onClick={copyResult} className="mt-2 w-full inline-flex justify-center items-center rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-[13px] font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]">
                {copied ? 'Copied ✓' : 'Copy result (no identifiers)'}
              </button>
            </div>
            <div className="rounded-xl border border-[var(--accent-purple)]/40 p-5 relative overflow-hidden">
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-purple)]" />
              <div className="text-sm font-semibold mb-1">Protection — USD 30/mo</div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
                Continuous re-scan &amp; alert, plus <strong>guided mentoring sessions</strong> for
                durable habits — and <strong>data-poisoning canaries (beta, consent-gated)</strong>{' '}
                seeded only into your own submissions.
              </p>
              <Link href="/forge/privacy/#protection" className="w-full inline-flex justify-center items-center rounded-xl border border-[var(--accent-purple)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--accent-purple)] transition-colors hover:bg-[var(--accent-purple)]/10">
                See Protection
              </Link>
            </div>
            <div className="rounded-xl border border-[var(--border-default)] p-5">
              <div className="text-sm font-semibold mb-1">Deep Scrub — USD 99</div>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-4">
                The bounded one-shot for heavy exposure: up to 3 filing rounds, 30-day
                re-verification, then the file closes. No subscription.
              </p>
              <Link href="/forge/privacy/#deep-scrub" className="w-full inline-flex justify-center items-center rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]">
                See Deep Scrub
              </Link>
            </div>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            The result email contains only counts, risk labels and your country — never the
            identifiers you typed. Stored on encrypted EU infrastructure if you proceed to a case;
            full purge on request. CGU/CGV v0.4 apply. This tool is indicative and runs on public
            corpora (XposedOrNot, Have I Been Pwned range API) — coverage is not exhaustive.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
