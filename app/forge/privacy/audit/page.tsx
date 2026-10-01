'use client';
import Link from 'next/link';
import { useState } from 'react';
import { PageHero, PageContainer } from '@/app/components/PageShell';

/**
 * FREE EXPOSURE SELF-CHECK — hosted app v2 (unified form, 2026-09-30).
 * One form → one deterministic client-side script → verdict + ordered
 * actions + funnel close. No server round-trip, no storage, no LLM in the
 * loop (nothing for a prompt injection to attach to).
 *
 * Injection/output-safety rules baked in:
 *  - inputs are regex-validated, length-capped and count-capped before use;
 *  - every user string renders as a React text node (auto-escaped) — no
 *    dangerouslySetInnerHTML anywhere in this file;
 *  - the only URLs built from user input are quoted-search links to a fixed
 *    host (google.com/search) with encodeURIComponent on the whole query;
 *  - identifiers typed here NEVER leave the browser: the result email to
 *    engage@deltav.cc carries counts and labels only.
 *
 * Data flows (disclosed in the on-page notice):
 *  - emails → api.xposedornot.com (keyless corpus check; the address itself
 *    reaches that third party — this is how it can answer);
 *  - passwords → hashed locally (WebCrypto SHA-1), only the 5-char prefix of
 *    the hash goes to api.pwnedpasswords.com (k-anonymity);
 *  - phones / pseudonyms never leave the page — they only generate manual
 *    quoted-search links and the human-audit guidance.
 */

const inputCls =
  'w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)] px-3 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none';
const labelCls =
  'block text-[10px] font-semibold uppercase tracking-[1.5px] text-[var(--text-tertiary)] mb-1.5';

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
    { label: 'APD/GBA opt-outs & complaints', url: 'https://www.dataprotectionauthority.be/' },
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
type PwResult = { suffix: string; prefix: string; count: number };

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9][0-9 ()\-.]{5,18}$/;
const HANDLE_RE = /^[A-Za-z0-9_.@-]{2,40}$/;

const parseList = (raw: string, max: number, re: RegExp, cap: number): string[] => {
  const seen = new Set<string>();
  for (const item of raw.split(/[\s,;]+/)) {
    const v = item.trim();
    if (v.length === 0 || v.length > cap || !re.test(v)) continue;
    seen.add(v.toLowerCase());
    if (seen.size >= max) break;
  }
  return Array.from(seen);
};

const sha1Hex = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
};

async function checkEmail(email: string): Promise<EmailResult> {
  const base: EmailResult = { email, found: false, breaches: [] };
  try {
    const res = await fetch(`https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`);
    if (!res.ok) return base; // non-200 = not present in the corpus
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
          out.easyPasswords = details.filter((d: any) => /easy|plain/i.test(String(d?.password_strength || ''))).length;
        }
      }
    } catch {
      /* analytics is optional; the breach list alone stands */
    }
    return out;
  } catch {
    return { ...base, error: 'Breach-corpus API unreachable. Try again, or request the human audit.' };
  }
}

async function checkPassword(password: string): Promise<PwResult> {
  const hash = await sha1Hex(password);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`);
  if (!res.ok) throw new Error('range API failed');
  let count = 0;
  for (const line of (await res.text()).split('\n')) {
    const [suffix, num] = line.trim().split(':');
    if (suffix === hash.slice(5)) {
      count = parseInt(num, 10) || 0;
      break;
    }
  }
  return { suffix: hash.slice(5), prefix: hash.slice(0, 5), count };
}

const verdictOf = (emails: EmailResult[], pwnedPw: number) => {
  const criticalEmail = emails.some((e) => (e.riskScore ?? 0) >= 85 || (e.easyPasswords ?? 0) > 0);
  const score = Math.max(0, ...emails.map((e) => e.riskScore ?? 0));
  if (criticalEmail || pwnedPw > 0) return { label: 'Critical', text: 'Act today.', tone: 'var(--accent-red)' };
  if (score >= 50) return { label: 'High', text: 'Act this week.', tone: 'var(--accent-amber)' };
  if (score >= 25) return { label: 'Moderate', text: 'Tighten up this month.', tone: 'var(--accent-amber)' };
  return { label: 'Low', text: 'No public-corpus exposure found. Keep the habits.', tone: 'var(--accent-green)' };
};

const RiskBadge = ({ label, tone }: { label: string; tone: string }) => (
  <span
    className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[1.5px]"
    style={{
      background: `color-mix(in srgb, ${tone} 15%, transparent)`,
      border: `1px solid color-mix(in srgb, ${tone} 40%, transparent)`,
      color: tone,
    }}
  >
    {label}
  </span>
);

const searchUrl = (value: string) =>
  `https://www.google.com/search?q=${encodeURIComponent(`"${value}"`)}`;

export default function PrivacyAuditApp() {
  const [emailsRaw, setEmailsRaw] = useState('');
  const [phonesRaw, setPhonesRaw] = useState('');
  const [handlesRaw, setHandlesRaw] = useState('');
  const [pwRaw, setPwRaw] = useState('');
  const [country, setCountry] = useState('Switzerland');
  const [busy, setBusy] = useState(false);
  const [ran, setRan] = useState(false);
  const [emailResults, setEmailResults] = useState<EmailResult[]>([]);
  const [pwResults, setPwResults] = useState<PwResult[]>([]);
  const [pwErrors, setPwErrors] = useState(0);
  const [foundManual, setFoundManual] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const emails = parseList(emailsRaw, 3, EMAIL_RE, 254);
  const phones = parseList(phonesRaw, 3, PHONE_RE, 20);
  const handles = parseList(handlesRaw, 3, HANDLE_RE, 40);
  const pws = pwRaw.split('\n').map((p) => p.trim()).filter((p) => p.length >= 4 && p.length <= 128).slice(0, 3);

  const toggleFound = (id: string) =>
    setFoundManual((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const runCheck = async () => {
    if (busy || (emails.length === 0 && pws.length === 0)) return;
    setBusy(true);
    setRan(false);
    setPwErrors(0);
    const emailOut: EmailResult[] = [];
    for (const email of emails) emailOut.push(await checkEmail(email));
    const pwOut: PwResult[] = [];
    let errors = 0;
    for (const pw of pws) {
      try {
        pwOut.push(await checkPassword(pw));
      } catch {
        errors += 1;
      }
    }
    setEmailResults(emailOut);
    setPwResults(pwOut);
    setPwErrors(errors);
    setRan(true);
    setBusy(false);
  };

  const pwnedPwCount = pwResults.filter((r) => r.count > 0).length;
  const hasAny = emailResults.length > 0 || pwResults.length > 0;
  const verdict = ran && hasAny ? verdictOf(emailResults, pwnedPwCount) : null;
  const exposedServices = emailResults
    .flatMap((r) => r.breaches)
    .filter((n, i, arr) => arr.indexOf(n) === i)
    .slice(0, 10);

  const resultSummary = [
    'Free exposure self-check — result (no identifiers included)',
    `Risk: ${verdict ? `${verdict.label} — ${verdict.text}` : 'not run'}`,
    `Emails checked: ${emailResults.length} · found in public corpora: ${emailResults.filter((e) => e.found).length}`,
    `Exposed records (approx): ${emailResults.reduce((s, e) => s + (e.records ?? 0), 0) || '—'}`,
    `Passwords tested: ${pwResults.length + pwErrors} · pwned: ${pwnedPwCount}${pwErrors ? ` · ${pwErrors} API errors` : ''}`,
    `Phones / handles swept manually: ${phones.length + handles.length} · leak signs ticked: ${foundManual.length}`,
    `Country: ${country}`,
    '',
    'I want the human-supervised audit / the USD 19 scrub / the watch (delete as appropriate).',
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

  let step = 0;
  const nextStep = () => ++step;

  return (
    <div className="relative z-10">
      <PageHero
        label="Forge · Privacy · Free tier"
        title="Exposure self-check"
        description="Fill the form once — the script checks your emails against public breach corpora and your passwords against dumped-password lists, right in your browser. You get a verdict, the moves that matter in order, and the rungs for going further with us."
        accent="purple"
        backFallback="/forge/privacy/"
        backLabel="Back to Privacy"
      />

      <PageContainer className="pb-10 space-y-5" as="section">
        <div className="rounded-2xl border border-[var(--accent-purple)]/30 bg-[var(--accent-purple)]/[0.04] p-5 text-[13px] leading-relaxed text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">How this stays private.</strong> One form,
          one script, zero servers on our side. Passwords are hashed in your browser — only a
          5-character slice of the hash reaches the Have I Been Pwned range API, never the
          password. Emails are checked against a third-party public corpus (XposedOrNot, keyless):
          the address itself reaches that service — that is how it can answer — never us. Phones
          and pseudonyms never leave this page; they only build the manual search links below.
          This tool is deterministic — no AI in the loop — and indicative: public corpora are not
          exhaustive; the human audit goes wider.
        </div>

        {/* ---- unified intake form ---- */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-mono text-sm font-bold text-[var(--accent-purple)] tabular-nums">01</span>
            <h2 className="text-lg md:text-xl font-semibold tracking-tight">The form</h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
            Everything is optional except one email or one password. Nothing is submitted to
            Delta V — pressing <em>Run the check</em> works entirely on this page.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="audit-emails" className={labelCls}>
                Email addresses — up to 3, comma-separated
              </label>
              <input
                id="audit-emails"
                type="text"
                value={emailsRaw}
                onChange={(e) => setEmailsRaw(e.target.value)}
                placeholder="you@example.com, old@example.com"
                className={inputCls}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="audit-phones" className={labelCls}>
                Phone numbers — up to 3 (never leave this page)
              </label>
              <input
                id="audit-phones"
                type="text"
                value={phonesRaw}
                onChange={(e) => setPhonesRaw(e.target.value)}
                placeholder="+41 79 000 00 00"
                className={inputCls}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="audit-handles" className={labelCls}>
                Public pseudonyms / handles — up to 3 (never leave this page)
              </label>
              <input
                id="audit-handles"
                type="text"
                value={handlesRaw}
                onChange={(e) => setHandlesRaw(e.target.value)}
                placeholder="the usernames you use publicly"
                className={inputCls}
                autoComplete="off"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="audit-pws" className={labelCls}>
                Passwords to test — up to 3, one per line (hashed locally; never sent, never stored)
              </label>
              <textarea
                id="audit-pws"
                rows={2}
                value={pwRaw}
                onChange={(e) => setPwRaw(e.target.value)}
                placeholder={'one per line\nanother-one'}
                className={inputCls}
                autoComplete="off"
              />
            </div>
            <div>
              <label htmlFor="audit-country" className={labelCls}>Country (for the free mechanisms)</label>
              <select id="audit-country" value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls}>
                {Object.keys(FREE_MECHANISMS).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={runCheck}
                disabled={busy || (emails.length === 0 && pws.length === 0)}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-primary-bright)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {busy ? 'Running…' : 'Run the check'}
              </button>
            </div>
          </div>
          {(emailsRaw && emails.length === 0) || (phonesRaw && phones.length === 0) || (handlesRaw && handles.length === 0) ? (
            <p className="text-xs text-[var(--accent-amber)] mt-3">
              Some entries were skipped — they don&apos;t look like valid emails / phones / handles.
            </p>
          ) : null}
        </div>

        {/* ---- results ---- */}
        {ran && (
          <>
            {emailResults.length > 0 && (
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-sm font-bold text-[var(--accent-purple)] tabular-nums">02</span>
                  <h2 className="text-lg md:text-xl font-semibold tracking-tight">Email exposure</h2>
                </div>
                <div className="space-y-3">
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
                              <> · <strong className="text-[var(--accent-red)]">{r.easyPasswords} stored passwords badly (crackable)</strong></>
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
              </div>
            )}

            {pwResults.length > 0 && (
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-sm font-bold text-[var(--accent-purple)] tabular-nums">03</span>
                  <h2 className="text-lg md:text-xl font-semibold tracking-tight">Password exposure</h2>
                </div>
                <div className="space-y-2">
                  {pwResults.map((r) => (
                    <div key={r.prefix + r.suffix} className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border-default)] px-4 py-3">
                      <RiskBadge
                        label={r.count > 0 ? `Pwned ×${new Intl.NumberFormat('en').format(r.count)}` : 'Clean'}
                        tone={r.count > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}
                      />
                      {r.count > 0 ? (
                        <span className="text-[13px] text-[var(--text-secondary)]">
                          Seen in real dumps — stop using it everywhere, today.
                        </span>
                      ) : (
                        <span className="text-[13px] text-[var(--text-secondary)]">
                          Not in any dumped-password list we can reach.
                        </span>
                      )}
                    </div>
                  ))}
                  {pwErrors > 0 && (
                    <p className="text-xs text-[var(--accent-amber)]">
                      {pwErrors} check(s) could not reach the API — rerun them in a moment.
                    </p>
                  )}
                </div>
              </div>
            )}

            {(phones.length > 0 || handles.length > 0) && (
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-mono text-sm font-bold text-[var(--accent-purple)] tabular-nums">04</span>
                  <h2 className="text-lg md:text-xl font-semibold tracking-tight">Manual sweep — phones &amp; pseudonyms</h2>
                </div>
                <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed mb-4">
                  These stay on your device. Each link opens a quoted search — if you find
                  yourself, tick it so it feeds the summary (and the human audit, if you send it).
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[...phones, ...handles].map((v) => (
                    <a
                      key={v}
                      href={searchUrl(v)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-[var(--border-default)] px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                    >
                      Search “{v}” ↗
                    </a>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5 max-w-3xl">
                  {[
                    { id: 'email-google', label: 'An email appears in Google results (quoted search)' },
                    { id: 'phone-google', label: 'A phone number appears in results or directories' },
                    { id: 'handle-google', label: 'A pseudonym is indexed and links to your real name' },
                    { id: 'docs-indexed', label: 'Documents with your name/address are publicly indexed' },
                  ].map((c) => (
                    <label key={c.id} className="cursor-pointer">
                      <input type="checkbox" className="peer sr-only" checked={foundManual.includes(c.id)} onChange={() => toggleFound(c.id)} />
                      <span className="block rounded-xl border border-[var(--border-default)] px-4 py-3 text-[13px] text-[var(--text-secondary)] transition-colors peer-checked:border-[var(--accent-primary)] peer-checked:bg-[var(--accent-primary)]/10 peer-checked:text-[var(--text-primary)]">
                        {c.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {verdict && (
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 md:p-8">
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="font-mono text-sm font-bold text-[var(--accent-purple)] tabular-nums">✓</span>
                  <h2 className="text-lg md:text-xl font-semibold tracking-tight">Verdict: {verdict.label} — {verdict.text}</h2>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <RiskBadge label={verdict.label} tone={verdict.tone} />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {pwnedPwCount > 0 ? `${pwnedPwCount} pwned password(s). ` : ''}
                    {emailResults.some((e) => e.found)
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
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--accent-red)]/10 text-[var(--accent-red)] text-xs font-semibold flex items-center justify-center">{nextStep()}</span>
                      <span><strong>Rotate every tested password that came back pwned — everywhere you reused it.</strong> Reuse is how one leak becomes five account takeovers.</span>
                    </li>
                  )}
                  {exposedServices.length > 0 && (
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] text-xs font-semibold flex items-center justify-center">{nextStep()}</span>
                      <span>
                        <strong>Change credentials on the breached services first:</strong>{' '}
                        <span className="text-[var(--text-secondary)]">{exposedServices.join(', ')} — then any account where you reused those passwords. Turn on 2FA while you are in there.</span>
                      </span>
                    </li>
                  )}
                  {foundManual.length > 0 && (
                    <li className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--accent-purple)]/10 text-[var(--accent-purple)] text-xs font-semibold flex items-center justify-center">{nextStep()}</span>
                      <span>
                        <strong>Start the removals for what your manual sweep found:</strong>{' '}
                        <span className="text-[var(--text-secondary)]">Google&apos;s “Results about you” tool covers search leakage; broker and directory listings are what the human audit files for you.</span>
                      </span>
                    </li>
                  )}
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-semibold flex items-center justify-center">{nextStep()}</span>
                    <span><strong>Get a password manager</strong> and stop reusing anything. One strong unique password per service beats every breach-corpus list.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-semibold flex items-center justify-center">{nextStep()}</span>
                    <span>
                      <strong>Use your country&apos;s free mechanisms:</strong>{' '}
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

                {/* funnel close */}
                <div className="rounded-xl border border-[var(--border-default)] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[2px] text-[var(--accent-purple)] mb-3">
                    Then get protected
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-semibold mb-1">Human audit — free</div>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">
                        Send this result (counts only, no identifiers), get the full scoped audit:
                        brokers, directories, leakage — first scrub included.
                      </p>
                      <button type="button" onClick={sendResult} className="w-full inline-flex justify-center items-center rounded-xl bg-[var(--accent-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-primary-bright)]">
                        Send my result
                      </button>
                      <button type="button" onClick={copyResult} className="mt-2 w-full inline-flex justify-center items-center rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-[13px] font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-hover)] hover:bg-[var(--bg-hover)]">
                        {copied ? 'Copied ✓' : 'Copy result (no identifiers)'}
                      </button>
                    </div>
                    <div className="relative pl-4">
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--accent-purple)]" />
                      <div className="text-sm font-semibold mb-1">The watch — USD 100/mo or USD 500 / 6 mo</div>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">
                        Continuous re-scan &amp; alert, <strong>guided mentoring sessions</strong> for
                        durable habits, <strong>data-poisoning canaries (beta, consent-gated)</strong>.
                      </p>
                      <Link href="/forge/privacy/#protection" className="inline-flex items-center rounded-xl border border-[var(--accent-purple)]/50 px-4 py-2.5 text-sm font-semibold text-[var(--accent-purple)] transition-colors hover:bg-[var(--accent-purple)]/10">
                        See the watch
                      </Link>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-1">The scrub — USD 19</div>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed mb-3">
                        The bounded one-shot: up to 3 filing rounds, 30-day re-verification, then
                        the file closes. No subscription.
                      </p>
                      <Link href="/forge/privacy/#deep-scrub" className="inline-flex items-center rounded-xl border border-[var(--border-default)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]">
                        See the scrub
                      </Link>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-5">
                  The result email contains only counts, risk labels and your country — never the
                  identifiers you typed. If you proceed to a case: encrypted EU storage, full purge
                  on request. CGU/CGV v0.4 apply. Indicative tool on public corpora (XposedOrNot,
                  Have I Been Pwned range API) — coverage is not exhaustive.
                </p>
              </div>
            )}
          </>
        )}
      </PageContainer>

      <PageContainer as="section" className="pb-24">
        <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-3xl">
          Delta V SRL, Bucharest (RO) · contact@deltav.cc · Terms: CGU/CGV v0.4 draft · AI-Act
          transparency notice in review
        </p>
      </PageContainer>
    </div>
  );
}
