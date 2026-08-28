/* IntelHub — Web3 Dashboard v5
   CEX removed. Prediction markets removed. CryptoLeaders removed.
   DEX Dominance %, REV, Stablecoins by chain, ETF flows */
'use client';

import { useMemo, useState } from 'react';
import { CategoryBox, SkeletonBlock, fmtCurrency, fmtCompact, PanelMeta, FieldStatusChip } from './Shared';
import CryptoFrontierSignals from './CryptoFrontierSignals';
import { useChartHover, formatDate, formatValue, fmtAxisVal, fmtAxisDate, sanitizeUsdVolumeHistory, ChartPoint } from './ChartHover';
import AnimatedValue from './AnimatedValue';
import VolumeChart from './VolumeChart';
import ChainVolumeBar from './ChainVolumeBar';
import NetFlowsPanel from './NetFlowsPanel';
import BoldYieldsPanel from './BoldYieldsPanel';
import { defillamaChainUrl, defillamaProtocolUrl, web3EntityLink } from '@/lib/entity-links';
import CypherpunkFeed from './CypherpunkFeed';
import ThreatIntelFeed from './ThreatIntelFeed';
import { blogIndex } from '@/app/data/content-index';

function fmtBig(n: number): string { return fmtCurrency(n); }

/* Volume chart timeframe toggle — windowed client-side, no extra fetches. */
const VOL_RANGE_DAYS = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365 } as const;
type VolRange = keyof typeof VOL_RANGE_DAYS;

/* Reusable daily-bar market chart card — owns its range toggle + hover.
   Used for both total volume (yellow) and total market cap (purple). */
function sliceRange(series: ChartPoint[], range: VolRange): ChartPoint[] {
  if (!series.length) return [];
  const lastT = typeof series[series.length - 1].t === 'number'
    ? (series[series.length - 1].t as number)
    : Date.parse(String(series[series.length - 1].t));
  const cutoff = lastT - VOL_RANGE_DAYS[range] * 86400000;
  return series.filter((q) =>
    (typeof q.t === 'number' ? q.t : Date.parse(String(q.t))) >= cutoff
  );
}

/* Single daily-bar card: volume bars + optional market-cap curve overlay
   (dual axis: left = bars, right = curve). Owns its range toggle + hover. */
function DailyBarsCard({
  title, chip, pts, accent, sourceNote, overlayPts, overlayAccent, overlayLabel,
}: {
  title: string;
  chip: React.ReactNode;
  pts: ChartPoint[];
  accent: string;
  sourceNote: string;
  overlayPts?: ChartPoint[];
  overlayAccent?: string;
  overlayLabel?: string;
}) {
  const [range, setRange] = useState<VolRange>('1Y');
  const windowed = useMemo(() => sliceRange(pts, range), [pts, range]);
  const overlayWindow = useMemo(
    () => (overlayPts && overlayPts.length ? sliceRange(overlayPts, range) : []),
    [overlayPts, range],
  );
  const hover = useChartHover(windowed);
  const [hoverW, setHoverW] = useState(400);
  const handleMove = (e: React.MouseEvent) => {
    if (e.currentTarget) setHoverW(e.currentTarget.getBoundingClientRect().width);
    hover.onMove(e);
  };
  if (windowed.length < 2) return null;
  const max = Math.max(...windowed.map((d) => d.v));
  const min = Math.min(...windowed.map((d) => d.v));
  const rng = max - min || 1;
  const ovMax = overlayWindow.length ? Math.max(...overlayWindow.map((d) => d.v)) : 0;
  const ovMin = overlayWindow.length ? Math.min(...overlayWindow.map((d) => d.v)) : 0;
  const ovRng = ovMax - ovMin || 1;
  const fracs = [1, 0.75, 0.5, 0.25, 0];
  const HEIGHT = 104;
  const Y = (v: number) => 4 + (1 - (v - min) / rng) * (HEIGHT - 8);
  const Yov = (v: number) => 4 + (1 - (v - ovMin) / ovRng) * (HEIGHT - 8);
  const ovLine = overlayWindow.length
    ? overlayWindow.map((d, i) => `${i},${Yov(d.v)}`).join(' ')
    : null;
  return (
    <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1px]">
            {title} (USD · {range})
            {chip != null && (
              <span className="text-[var(--text-secondary)] font-medium normal-case tracking-normal ml-2">{chip}</span>
            )}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
            {windowed.length} pts · {sourceNote}
            <span className="ml-2 inline-flex items-center gap-1"><span className="w-2 h-2 inline-block rounded-[2px]" style={{ background: accent }} />vol</span>
            {overlayWindow.length > 0 && overlayAccent && (
              <span className="ml-2 inline-flex items-center gap-1"><span className="w-3 inline-block border-t-2" style={{ borderColor: overlayAccent }} />{overlayLabel ?? 'cap'}</span>
            )}
          </div>
        </div>
        <div className="flex gap-0.5 bg-[var(--bg-deep)] rounded-lg p-0.5 border border-[var(--border-default)] shrink-0">
          {(['1M', '3M', '6M', '1Y'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setRange(k)}
              className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                range === k ? 'bg-[var(--overlay-strong)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <div className="flex">
        <div className="flex flex-col justify-between w-11 pr-1.5 text-right shrink-0 text-[9px] text-[var(--text-tertiary)] tabular-nums" style={{ height: HEIGHT }}>
          {fracs.map((f) => (
            <span key={f} className="leading-none">{fmtAxisVal(min + f * rng)}</span>
          ))}
        </div>
        <div className="relative flex-1 sparkline-container" onMouseMove={handleMove} onMouseLeave={hover.onLeave}>
          <svg className="w-full" style={{ height: HEIGHT }} viewBox={`0 0 ${windowed.length} ${HEIGHT}`} preserveAspectRatio="none">
            {fracs.map((f) => (
              <line key={f} x1="0" x2={windowed.length} y1={Y(min + f * rng)} y2={Y(min + f * rng)}
                stroke="var(--border-subtle)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            {windowed.map((d, i) => (
              <rect key={i} x={i} y={Y(d.v)} width={0.82} height={Math.max(1, HEIGHT - 4 - Y(d.v))} fill={accent} opacity={0.82} />
            ))}
            {ovLine && overlayAccent && (
              <polyline points={ovLine} fill="none" stroke={overlayAccent} strokeWidth="1.75" vectorEffect="non-scaling-stroke" />
            )}
          </svg>
          {hover.hover && (
            <div className="absolute pointer-events-none bg-[var(--bg-elevated)] border border-[var(--border-hover)] rounded-lg px-2.5 py-1.5 text-[10px] shadow-lg z-10"
              style={{
                left: hover.hover.x + 14 + 170 < hoverW ? hover.hover.x + 14 : Math.max(4, hover.hover.x - 170 - 14),
                top: Math.max(0, hover.hover.y - 40),
              }}>
              <div className="text-[var(--text-primary)] font-semibold">{formatValue(hover.hover.point.v)} <span className="text-[var(--text-muted)] font-normal">vol</span></div>
              {(() => {
                const tv = typeof hover.hover.point.t === 'number' ? hover.hover.point.t : Date.parse(String(hover.hover.point.t));
                let nearest: number | null = null;
                let best = Infinity;
                for (const q of overlayWindow) {
                  const qt = typeof q.t === 'number' ? q.t : Date.parse(String(q.t));
                  const diff = Math.abs(qt - tv);
                  if (diff < best) { best = diff; nearest = q.v; }
                }
                return nearest != null ? (
                  <div className="text-[var(--text-primary)] font-semibold">{formatValue(nearest)} <span className="text-[var(--text-muted)] font-normal">{overlayLabel ?? 'cap'}</span></div>
                ) : null;
              })()}
              <div className="text-[var(--text-muted)]">{formatDate(hover.hover.point.t)}</div>
            </div>
          )}
        </div>
        {overlayWindow.length > 0 && (
          <div className="flex flex-col justify-between w-11 pl-1.5 text-left shrink-0 text-[9px] text-[var(--text-tertiary)] tabular-nums" style={{ height: HEIGHT }}>
            {fracs.map((f) => (
              <span key={f} className="leading-none">{fmtAxisVal(ovMin + f * ovRng)}</span>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-between pl-11 pr-1 text-[9px] text-[var(--text-tertiary)] tabular-nums mt-1">
        <span>{fmtAxisDate(windowed[0].t)}</span>
        <span>{fmtAxisDate(windowed[Math.floor(windowed.length / 2)].t)}</span>
        <span>{fmtAxisDate(windowed[windowed.length - 1].t)}</span>
      </div>
    </div>
  );
}

/* -- DeFi Weekly Card -- */
function ArtemisWeeklyCard({ dd }: { dd: any }) {
  // Latest Delta V-published brief from the site's content index (SSOT).
  // This is what keeps the dashboard in sync with the blog: when we publish
  // a new Weekly Delta Financial Brief, the content-index PR makes it appear
  // here automatically. Delta V owns this card — no third-party (Artemis)
  // links surface to the visitor.
  const deltaBrief = blogIndex.find(
    (e) => e.domain === 'Weekly Delta Financial Brief'
  );
  if (!deltaBrief) return null;

  const title = deltaBrief.title;
  const excerpt = (deltaBrief.excerpt || '').slice(0, 160);
  const href = deltaBrief.href;
  const date = deltaBrief.date
    ? new Date(deltaBrief.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--border-default)] flex items-center justify-between bg-gradient-to-r from-[var(--accent-gold)]/[0.06] to-transparent">
        <div className="flex items-center gap-2.5">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[var(--accent-gold)]">
            <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="13" cy="11" r="2" fill="var(--accent-gold)" opacity="0.3"/>
          </svg>
          <span className="text-xs text-[var(--accent-gold)] uppercase tracking-[1.5px] font-bold">DeFi Weekly</span>
          {date && <span className="text-[10px] text-[var(--text-muted)]">· {date}</span>}
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-gold)]/15 text-[var(--accent-gold)]">Delta V Brief</span>
        </div>
      </div>
      <div className="p-5">
        <a href={href}
          className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors leading-snug block mb-2">
          {title}
        </a>
        <p className="text-sm text-[var(--text-tertiary)] leading-relaxed mb-3 line-clamp-3">
          {excerpt}
        </p>
        <div className="flex items-center justify-between">
          <a href={href}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--accent-gold)] hover:underline">
            Read the brief
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6M5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>
    </div>
  );
}

/* -- ETF asset column with hoverable sparkline data points -- */
function ETFAssetColumn({
  label, accentDot, accentSpark, data,
}: {
  label: string; accentDot: string; accentSpark: string; data: any;
}) {
  const fmtFlow = (val: number | null | undefined, digits = 1) => {
    if (val == null || Number.isNaN(Number(val))) return '—';
    const n = Number(val);
    return `${n >= 0 ? '+' : ''}${n.toFixed(digits)}M`;
  };
  const fmtDate = (iso?: string) =>
    iso ? new Date(iso + (iso.includes('T') ? '' : 'T12:00:00')).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';

  const points = useMemo(
    () => (data?.sparkline || []).map((p: { d: string; v: number }) => ({ t: p.d, v: p.v })),
    [data?.sparkline],
  );
  const { hover, onMove, onLeave } = useChartHover(points);

  const dayNet = data?.latest_total;
  const dayColor = dayNet == null ? 'text-[var(--text-disabled)]' : dayNet >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]';
  const ytd = data?.ytd_flows;
  const ytdColor = ytd == null ? 'text-[var(--text-disabled)]' : ytd >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]';
  const vsPrior = data?.change;

  const sparkSvg = () => {
    if (points.length < 2) return null;
    const vals = points.map((p: { v: number }) => p.v);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const range = max - min || 1;
    const w = 200;
    const h = 48;
    const zeroY = max <= 0 ? 2 : min >= 0 ? h - 2 : h - ((0 - min) / range) * (h - 8) - 4;
    const pathPoints = points
      .map((p: { v: number }, i: number) => `${(i / (points.length - 1)) * w},${h - 4 - ((p.v - min) / range) * (h - 10)}`)
      .join(' ');
    const first = points[0]?.t;
    const last = points[points.length - 1]?.t;
    // Sample every ~5th point for visible markers + always last
    const markerIdx = points
      .map((_: unknown, i: number) => i)
      .filter((i: number) => i === 0 || i === points.length - 1 || i % Math.max(1, Math.floor(points.length / 6)) === 0);

    return (
      <div className="w-full min-w-0">
        <div className="relative" onMouseMove={onMove} onMouseLeave={onLeave}>
          <svg className="w-full h-12" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <line x1="0" y1={zeroY} x2={w} y2={zeroY} stroke="white" strokeOpacity="0.12" strokeWidth="1" />
            <polyline points={pathPoints} fill="none" stroke={accentSpark} strokeWidth="1.75" vectorEffect="non-scaling-stroke" />
            {markerIdx.map((i: number) => {
              const p = points[i];
              const cx = (i / (points.length - 1)) * w;
              const cy = h - 4 - ((p.v - min) / range) * (h - 10);
              return <circle key={i} cx={cx} cy={cy} r="2.2" fill={accentSpark} opacity={0.9} />;
            })}
          </svg>
          {hover && (
            <div
              className="absolute pointer-events-none bg-[var(--bg-elevated)] border border-[var(--border-hover)] rounded-lg px-2.5 py-1.5 text-[10px] shadow-lg z-10"
              style={{ left: Math.min(hover.x + 8, 220), top: Math.max(0, hover.y - 36) }}
            >
              <div className={`font-semibold tabular-nums ${hover.point.v >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                {fmtFlow(hover.point.v)}
              </div>
              <div className="text-[var(--text-muted)]">{fmtDate(String(hover.point.t))}</div>
            </div>
          )}
        </div>
        <div className="flex justify-between text-[9px] text-[var(--text-disabled)] mt-0.5 tabular-nums">
          <span>{first ? fmtDate(String(first)) : ''}</span>
          <span>daily net · {points.length} sessions · hover for point</span>
          <span>{last ? fmtDate(String(last)) : ''}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 flex flex-col gap-3 min-h-[200px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${accentDot}`} />
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{label}</span>
        </div>
        <span className="text-[10px] text-[var(--text-muted)] tabular-nums">as of {fmtDate(data?.latest_date)}</span>
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-[1px] text-[var(--text-muted)] mb-0.5">1-day net flow</div>
        <div className={`text-2xl md:text-3xl font-bold tabular-nums leading-none ${dayColor}`}>
          {fmtFlow(dayNet)}
        </div>
        <div className="text-[10px] text-[var(--text-disabled)] mt-1">USD millions · spot ETF complex</div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-[var(--overlay-soft)] border border-[var(--border-subtle)] px-3 py-2">
          <div className="text-[9px] uppercase tracking-[1px] text-[var(--text-muted)] mb-0.5">vs prior session</div>
          <div className={`font-semibold tabular-nums ${vsPrior == null ? 'text-[var(--text-disabled)]' : vsPrior >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
            {vsPrior == null ? '—' : fmtFlow(vsPrior)}
          </div>
          <div className="text-[9px] text-[var(--text-disabled)]">Δ day-over-day</div>
        </div>
        <div className="rounded-xl bg-[var(--overlay-soft)] border border-[var(--border-subtle)] px-3 py-2">
          <div className="text-[9px] uppercase tracking-[1px] text-[var(--text-muted)] mb-0.5">YTD cumulative</div>
          <div className={`font-semibold tabular-nums ${ytdColor}`}>
            {ytd == null ? '—' : fmtFlow(ytd, 0)}
          </div>
          <div className="text-[9px] text-[var(--text-disabled)]">calendar year sum</div>
        </div>
      </div>

      <div className="mt-auto pt-1">
        <div className="text-[9px] uppercase tracking-[1px] text-[var(--text-muted)] mb-1">30-session path</div>
        {sparkSvg()}
      </div>
    </div>
  );
}

/* -- ETF Flows Card (BTC + ETH spot ETF daily net flows) -- */
function ETFFlowsCard({ etf, meta }: { etf: any; meta?: any }) {
  // Never unmount: empty shell when snapshot missing (tab-scope / fetch miss)
  const btc = etf?.btc;
  const eth = etf?.eth;
  const hasData = btc?.latest_total != null || eth?.latest_total != null;
  if (!hasData) {
    return (
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border-default)] flex items-center justify-between bg-gradient-to-r from-[var(--accent-gold)]/[0.06] to-transparent">
          <span className="text-xs text-[var(--accent-gold)] uppercase tracking-[1.5px] font-bold">ETF Net Flows</span>
          <FieldStatusChip meta={meta} field="etfFlows" />
        </div>
        <div className="p-8 text-center text-xs text-[var(--text-disabled)]">
          Spot BTC/ETH flows unavailable · waiting for <code className="text-[var(--text-muted)]">etf-flows.json</code>
          {' · '}
          <a href="https://defillama.com/etfs" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-gold)] hover:underline">
            DeFi Llama ETFs ↗
          </a>
        </div>
      </div>
    );
  }

  const fmtDate = (iso?: string) =>
    iso ? new Date(iso + (iso.includes('T') ? '' : 'T12:00:00')).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';

  const asOf =
    btc?.latest_date || eth?.latest_date
      ? fmtDate(btc?.latest_date || eth?.latest_date)
      : etf.updated_at
        ? new Date(etf.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : null;

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="px-5 py-3 border-b border-[var(--border-default)] flex items-center justify-between flex-wrap gap-2 bg-gradient-to-r from-[var(--accent-gold)]/[0.06] to-transparent">
        <div className="flex items-center gap-2.5 min-w-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[var(--accent-gold)] shrink-0">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div className="min-w-0">
            <div className="text-xs text-[var(--accent-gold)] uppercase tracking-[1.5px] font-bold">ETF Net Flows</div>
            <div className="text-[10px] text-[var(--text-muted)]">
              Spot BTC / ETH · <span className="text-[var(--text-secondary)]">daily net</span> (USD M) ·{' '}
              <a href="https://farside.co.uk/btc/" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-gold)] underline-offset-2 hover:underline">
                Farside
              </a>
              {' · '}
              <a href="https://defillama.com/etfs" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-gold)] underline-offset-2 hover:underline">
                DeFi Llama ETFs
              </a>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          {asOf && <div className="text-[10px] text-[var(--text-secondary)] tabular-nums">Latest session: {asOf}</div>}
          {etf.updated_at && (
            <div className="text-[9px] text-[var(--text-disabled)]">
              Snapshot {new Date(etf.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border-default)]">
        <ETFAssetColumn label="BTC Spot ETF" accentDot="bg-[var(--accent-amber)]" accentSpark="var(--accent-amber)" data={btc} />
        <ETFAssetColumn label="ETH Spot ETF" accentDot="bg-[var(--accent-cyan)]" accentSpark="var(--accent-cyan)" data={eth} />
      </div>
    </div>
  );
}

/* -- Stablecoins block (DeFi Llama) — nested under TVL for layout harmony -- */
function StablecoinsBlock({
  stables,
  stableChains,
  updatedAt,
}: {
  stables: any[];
  stableChains: any[];
  updatedAt?: string | null;
}) {
  const total = (stables || []).reduce((s: number, sc: any) => s + (sc.circulating || 0), 0);
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="mt-5 pt-4 border-t border-[var(--border-default)]">
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <div className="text-xs text-[var(--accent-amber)] uppercase tracking-[1.5px] font-bold">Stablecoin supply</div>
        <PanelMeta source="DeFi Llama" updated={updatedLabel} note="live on Web3 load" />
      </div>
      <div className="text-lg font-bold tabular-nums text-[var(--text-primary)] mb-2">
        {total > 0 ? fmtCurrency(total) : <span className="text-[var(--text-disabled)] text-sm font-normal">Loading…</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
        {(stables || []).slice(0, 6).map((sc: any, i: number) => {
          const link = web3EntityLink(sc.name || sc.symbol || '', 'stablecoin', sc.symbol);
          return (
            <div key={i} className="flex justify-between text-xs gap-2 py-0.5">
              <a href={link.href} target="_blank" rel="noopener noreferrer"
                title={`${sc.name} · ${link.label}`}
                className="text-[var(--text-tertiary)] truncate hover:text-[var(--accent-amber)] transition-colors underline-offset-2 hover:underline">
                {sc.name}
              </a>
              <span className="text-[var(--text-secondary)] tabular-nums shrink-0">{fmtCurrency(sc.circulating)}</span>
            </div>
          );
        })}
      </div>
      {stableChains?.length > 0 && (
        <>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1px] mt-3 mb-1.5">By chain</div>
          <div className="space-y-1">
            {stableChains.slice(0, 5).map((sc: any, i: number) => {
              const chain = sc.chain || sc.name || '';
              return (
                <div key={i} className="flex justify-between text-xs gap-2">
                  <a href={defillamaChainUrl(chain)} target="_blank" rel="noopener noreferrer"
                    className="text-[var(--text-tertiary)] truncate hover:text-[var(--accent-amber)] transition-colors underline-offset-2 hover:underline"
                    title={`${chain} · DeFi Llama`}>{chain}</a>
                  <span className="text-[var(--text-secondary)] tabular-nums shrink-0">{fmtCurrency(sc.circulating)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function Web3Dashboard({
  dd, catBoxes, TC, ago, fmt, fmtN, items, ts,
}: {
  dd: any; catBoxes: any[]; TC: Record<string, string>;
  ago: (iso: string) => string; fmt: (n: number) => string; fmtN: (n: number) => string;
  items: any[]; ts: (iso: string) => string;
}) {
  const cFG = dd?.cryptoFG?.data?.[0];
  const fgVal = cFG ? Number(cFG.value) || 0 : 0;
  const fgLabel = cFG?.value_classification || '';
  const web3Cats = catBoxes.filter((c: any) => ['crypto'].includes(c.id));
  const cmc = dd?.crypto || {};
  const mcap = cmc.total_mcap || 0;
  const mcapChg = cmc.mcap_change_24h || 0;
  const exVol = dd?.exchangeVol || {};
  // Prefer global crypto 24h volume (CoinGecko global), not CEX/BTC-only
  const volAnchor =
    exVol.vol_source === 'lcw'
      ? (exVol.total_vol_usd_24h || cmc.total_volume || null)
      : (cmc.total_volume || exVol.total_vol_usd_24h || null);
  const volHistory = useMemo(
    () => sanitizeUsdVolumeHistory(exVol.vol_history || [], volAnchor),
    [exVol.vol_history, volAnchor],
  );
  const [chainView, setChainView] = useState<'tvl' | 'dominance' | 'fees'>('tvl');
  // Total market cap daily series (same LCW chunked fetch as volume)
  const capHistory = useMemo(
    () => sanitizeUsdVolumeHistory(exVol.cap_history || [], null),
    [exVol.cap_history],
  );
  const capNow = capHistory.length ? capHistory[capHistory.length - 1].v : null;

  const totalVol = dd?.totalVolume24h || 0;
  const tvlRows = (dd?.tvl || []) as any[];
  const maxTvl = tvlRows[0]?.tvl || 1;
  const maxFees = Math.max(0, ...tvlRows.map((c: any) => c.fees24h || 0)) || 1;

  // Stablecoin chain breakdown from raw data
  const stableChains = dd?.stablecoinChains || [];

  const fgColor = fgVal > 60 ? 'text-[var(--accent-green)]' : fgVal < 35 ? 'text-[var(--accent-red)]' : 'text-[var(--accent-amber)]';

  const etf = dd?.etfFlows;
  const etfBtc = etf?.btc?.latest_total;
  const etfEth = etf?.eth?.latest_total;
  const etfCombined =
    typeof etfBtc === 'number' || typeof etfEth === 'number'
      ? (typeof etfBtc === 'number' ? etfBtc : 0) + (typeof etfEth === 'number' ? etfEth : 0)
      : null;

  const movers = dd?.chainMovers;
  const moverGainers = movers?.gainers || [];
  const moverLosers = movers?.losers || [];

  return (
    <div className="space-y-5">
      <CryptoFrontierSignals items={items} ts={ts} />

      {/* -- Hero KPIs (same surface language, scannable desk strip) -- */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border-default)] flex items-center justify-between bg-gradient-to-r from-[var(--accent-purple)]/[0.05] to-transparent">
          <span className="text-xs text-[var(--accent-purple)] uppercase tracking-[1.5px] font-bold">Desk snapshot</span>
          <PanelMeta source="CMC · alt.me · Farside" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y divide-[var(--border-subtle)]">
          <div className="data-tile p-3.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1px] mb-1">Market cap</div>
            <div className="text-sm font-bold tabular-nums text-[var(--text-primary)]">
              {mcap ? fmtBig(mcap) : '···'}
            </div>
            {!!mcapChg && (
              <div className={`text-[10px] font-semibold ${mcapChg >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                {mcapChg >= 0 ? '+' : ''}{mcapChg.toFixed(1)}% 24h
              </div>
            )}
          </div>
          <div className="data-tile p-3.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1px] mb-1">24h volume</div>
            <div className="text-sm font-bold tabular-nums text-[var(--text-primary)]">
              {cmc.total_volume ? fmtBig(cmc.total_volume) : '···'}
            </div>
          </div>
          <div className="data-tile p-3.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1px] mb-1">BTC.D</div>
            <div className="text-sm font-bold tabular-nums text-[var(--text-primary)]">
              {cmc.btc_dominance != null ? `${cmc.btc_dominance.toFixed(1)}%` : '···'}
            </div>
            <div className="text-[10px] text-[var(--text-muted)]">
              ETH {cmc.eth_dominance != null ? `${cmc.eth_dominance.toFixed(1)}%` : '—'}
            </div>
          </div>
          <div className="data-tile p-3.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1px] mb-1">Fear & Greed</div>
            <div className={`text-sm font-bold tabular-nums ${fgColor}`}>{fgVal || '···'}</div>
            <div className={`text-[10px] ${fgColor}/70`}>{fgLabel || '—'}</div>
          </div>
          <div className="data-tile p-3.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1px] mb-1">ETF net · 1d</div>
            <div className={`text-sm font-bold tabular-nums ${
              etfCombined == null ? 'text-[var(--text-disabled)]' :
              etfCombined >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'
            }`}>
              {etfCombined == null ? '···' : `${etfCombined >= 0 ? '+' : ''}${etfCombined.toFixed(1)}M`}
            </div>
            <div className="text-[9px] text-[var(--text-disabled)]">
              {etf?.btc?.latest_date || etf?.eth?.latest_date
                ? new Date((etf?.btc?.latest_date || etf?.eth?.latest_date) + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'BTC+ETH'}
            </div>
          </div>
          <div className="data-tile p-3.5">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1px] mb-1">DEX 24h</div>
            <div className="text-sm font-bold tabular-nums text-[var(--text-primary)]">
              {totalVol ? fmtBig(totalVol) : '···'}
            </div>
          </div>
        </div>
      </div>

      {/* -- Artemis Weekly Newsletter -- */}
      <ArtemisWeeklyCard dd={dd} />

      {/* -- Market Cap Banner -- */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 bg-gradient-to-r from-[var(--accent-purple)]/[0.04] via-[var(--accent-cyan)]/[0.04] to-transparent">
        {mcap ? (
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1.5px] mb-1">Total Crypto Market Cap</div>
              <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums"><AnimatedValue value={mcap} format={fmtBig} className="tabular-nums" /></div>
              <div className={`text-xs font-semibold mt-1 ${mcapChg >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                {mcapChg ? `${mcapChg >= 0 ? '+' : ''}${mcapChg.toFixed(1)}%` : ''} <span className="text-[var(--text-muted)] font-normal">24h</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <div className="text-[10px] text-[var(--text-muted)] uppercase">Fear & Greed</div>
                  <div className={`text-lg font-bold tabular-nums ${fgColor}`}>{fgVal || '--'}</div>
                  <div className={`text-[10px] ${fgColor}/60`}>{fgLabel || '···'}</div>
                </div>
                <div className="relative w-3 h-16 bg-gradient-to-t from-red-500/40 via-amber-500/40 to-emerald-500/40 rounded-full overflow-hidden">
                  <div className="absolute left-0 right-0 h-[3px] bg-[var(--text-primary)] rounded-full transition-all duration-500"
                    style={{ bottom: `${Math.max(3, Math.min(97, fgVal))}%` }} />
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-xs text-[var(--text-tertiary)]">BTC Dom{' '}
                  <span className="text-[var(--text-secondary)] tabular-nums">
                    {cmc.btc_dominance != null ? `${cmc.btc_dominance.toFixed(1)}%` : <SkeletonBlock className="h-3 w-10 inline-block align-middle" />}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">ETH Dom{' '}
                  <span className="text-[var(--text-secondary)] tabular-nums">
                    {cmc.eth_dominance != null ? `${cmc.eth_dominance.toFixed(1)}%` : <SkeletonBlock className="h-3 w-10 inline-block align-middle" />}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-tertiary)]">24h Vol{' '}
                  <span className="text-[var(--text-secondary)] tabular-nums">
                    {cmc.total_volume ? fmtBig(cmc.total_volume) : <SkeletonBlock className="h-3 w-14 inline-block align-middle" />}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <div className="skeleton-shimmer h-3 w-40 rounded" />
            <div className="skeleton-shimmer h-8 w-48 rounded" />
            <div className="skeleton-shimmer h-3 w-24 rounded" />
          </div>
        )}
        <DailyBarsCard
          title="Total crypto market"
          chip={
            volAnchor != null || capNow != null ? (
              <>
                {volAnchor != null ? `24h vol ${fmtBig(volAnchor)}` : '24h vol ···'}
                {capNow != null ? ` · cap ${fmtBig(capNow)}` : ''}
              </>
            ) : null
          }
          pts={volHistory}
          accent="#eab308"
          sourceNote={exVol.vol_source === 'lcw' ? 'LCW all-market' : 'BTC proxy'}
          overlayPts={capHistory}
          overlayAccent="var(--accent-purple)"
          overlayLabel="cap"
        />
      </div>

      {/* -- ETF Flows (BTC + ETH) -- always mounted -- */}
      <ETFFlowsCard etf={dd?.etfFlows} meta={dd?._meta} />

      {/* -- TVL + fees (joined) + DEX volume -- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* TVL by Chain — includes 24h fees (was separate Chain fees box) */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <div className="text-xs text-[var(--accent-purple)] uppercase tracking-[1.5px] font-bold">
                {chainView === 'tvl' ? 'TVL by Chain' : chainView === 'fees' ? 'Fees by Chain (24h)' : 'Chain Dominance'}
              </div>
              {dd?.tvlUpdatedAt && (
                <div className="mt-0.5">
                  <PanelMeta
                    source="DeFi Llama"
                    updated={new Date(dd.tvlUpdatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    note="fees joined per-chain"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-0.5 bg-[var(--bg-deep)] rounded-lg p-0.5 border border-[var(--border-default)]">
              {([
                { k: 'tvl', label: 'TVL' },
                { k: 'fees', label: 'Fees' },
                { k: 'dominance', label: 'Dom' },
              ] as const).map((t) => (
                <button
                  key={t.k}
                  type="button"
                  onClick={() => setChainView(t.k)}
                  className={`text-[10px] px-2 py-1 rounded-md transition-colors ${
                    chainView === t.k ? 'bg-[var(--overlay-strong)] text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {tvlRows.length > 0 ? (
              chainView === 'dominance' ? (
                (dd.dominance || tvlRows).slice(0, 10).map((d: any, i: number) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs">
                    <a href={defillamaChainUrl(d.name)} target="_blank" rel="noopener noreferrer"
                      className="w-24 text-[var(--text-tertiary)] truncate flex-shrink-0 hover:text-[var(--accent-purple)] transition-colors" title={`${d.name} · DeFi Llama`}>{d.name}</a>
                    <div className="flex-1 h-2 rounded-full bg-[var(--overlay-soft)] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-purple)]/40 to-[var(--accent-cyan)]/40"
                        style={{ width: `${Math.min(100, parseFloat(String(d.pct || ((d.tvl / maxTvl) * 100))) || 0)}%` }} />
                    </div>
                    <span className="w-12 text-right tabular-nums text-[var(--text-tertiary)] flex-shrink-0">
                      {d.pct || `${((d.tvl / maxTvl) * 100).toFixed(1)}%`}
                    </span>
                  </div>
                ))
              ) : chainView === 'fees' ? (
                [...tvlRows].sort((a, b) => (b.fees24h || 0) - (a.fees24h || 0)).slice(0, 10).map((c: any, i: number) => {
                  const fees = c.fees24h || 0;
                  const pct = ((fees / maxFees) * 100).toFixed(0);
                  const fchg = c.feesChange1d;
                  return (
                    <div key={i} className="flex items-center gap-2.5 text-xs group">
                      <a href={defillamaChainUrl(c.name)} target="_blank" rel="noopener noreferrer"
                        className="w-24 text-[var(--text-tertiary)] truncate flex-shrink-0 hover:text-[var(--accent-amber)] transition-colors" title={`${c.name} · DeFi Llama`}>
                        {c.name}
                      </a>
                      <div className="flex-1 h-2.5 rounded-full bg-[var(--overlay-soft)] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-amber)]/70 to-[var(--accent-orange)]/40 transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-16 text-right tabular-nums text-[var(--text-secondary)] font-medium">
                        {fees ? fmtCurrency(fees) : '—'}
                      </span>
                      <span className={`w-10 text-right tabular-nums text-[10px] ${
                        fchg == null ? 'text-[var(--text-disabled)]' : fchg >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'
                      }`}>
                        {fchg == null ? '' : `${fchg >= 0 ? '+' : ''}${fchg.toFixed(1)}%`}
                      </span>
                    </div>
                  );
                })
              ) : (
                tvlRows.slice(0, 10).map((c: any, i: number) => {
                  const pct = ((c.tvl / maxTvl) * 100).toFixed(0);
                  const chg = c.change_1d || 0;
                  const fees = c.fees24h || 0;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs group">
                      <a href={defillamaChainUrl(c.name)} target="_blank" rel="noopener noreferrer"
                        className="w-20 text-[var(--text-tertiary)] truncate flex-shrink-0 hover:text-[var(--accent-purple)] transition-colors" title={`${c.name} · DeFi Llama`}>
                        {c.name}
                      </a>
                      <div className="flex-1 h-2.5 rounded-full bg-[var(--overlay-soft)] overflow-hidden min-w-[48px]">
                        <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent-purple)]/70 to-[var(--accent-cyan)]/60 transition-all duration-700"
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-14 text-right tabular-nums text-[var(--text-secondary)] shrink-0">
                        {fmtCurrency(c.tvl)}
                      </span>
                      <span className={`w-10 text-right tabular-nums flex-shrink-0 text-[10px] font-medium ${chg >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                        {chg !== 0 ? `${chg >= 0 ? '+' : ''}${chg.toFixed(1)}%` : ''}
                      </span>
                      <span className="w-14 text-right tabular-nums text-[10px] text-[var(--accent-amber)] shrink-0" title="24h fees">
                        {fees ? fmtCurrency(fees) : '—'}
                      </span>
                    </div>
                  );
                })
              )
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <svg className="w-6 h-6 text-[var(--accent-purple)]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
                <span className="text-[var(--text-disabled)] text-xs">TVL + fees loading from DeFi Llama...</span>
              </div>
            )}
          </div>
          {chainView === 'tvl' && tvlRows.length > 0 && (
            <div className="mt-2 flex justify-end gap-3 text-[9px] text-[var(--text-disabled)]">
              <span>TVL</span>
              <span>1d%</span>
              <span className="text-[var(--accent-amber)]">fees 24h</span>
            </div>
          )}
          <div className="mt-2 text-[9px] text-[var(--text-disabled)] text-right">via DeFi Llama · per-chain fees API</div>

          {/* Stables nested under TVL — above BOLD / NTV on the page flow */}
          <StablecoinsBlock
            stables={dd?.stablecoins || []}
            stableChains={stableChains}
            updatedAt={dd?.stablesUpdatedAt || null}
          />
          {dd?._meta?.stables?.status === 'error' && !(dd?.stablecoins || []).length && (
            <div className="mt-2 text-[10px] text-[var(--accent-amber)]">
              Stables snapshot/live failed · check Hermes <code>refresh-dashboard-snapshots.py</code>
            </div>
          )}
        </div>

        {/* DEX Volume — Dune charts + chain movers */}
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs text-[var(--accent-cyan)] uppercase tracking-[1.5px] font-bold">DEX Volume</div>
            <a
              href="https://defillama.com/dexs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-cyan)] underline-offset-2 hover:underline"
              title="DeFi Llama DEX volumes"
            >
              via Dune · 26 weeks · Llama ↗
            </a>
          </div>
          <VolumeChart data={dd?.dexMetrics?.weekly || []} loading={!dd?.dexMetrics} />
          <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
            <div className="flex items-center justify-between mb-2 gap-2">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1px]">24h Chain Volume</div>
              <div className="flex items-center gap-2 text-[10px]">
                <a href="https://defillama.com/dexs/chains" target="_blank" rel="noopener noreferrer"
                  className="text-[var(--accent-cyan)] hover:underline" title="Best match for multi-chain DEX volume">DeFi Llama</a>
                <span className="text-[var(--text-disabled)]">·</span>
                <a href="https://l2beat.com/scaling/activity" target="_blank" rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:underline" title="L2 activity (not pure $ volume)">L2Beat</a>
                <span className="text-[var(--text-disabled)]">·</span>
                <a href="https://www.growthepie.xyz/fundamentals/total-value-secured" target="_blank" rel="noopener noreferrer"
                  className="text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:underline" title="L2 fundamentals">growthepie</a>
              </div>
            </div>
            <ChainVolumeBar data={dd?.dexMetrics?.chains || []} loading={!dd?.dexMetrics} />
          </div>
          {(moverGainers.length > 0 || moverLosers.length > 0) && (
            <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-[1px] mb-2">Chain TVL movers · 1d</div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-[var(--accent-green)] uppercase tracking-[1px] mb-1.5 font-semibold">▲ Gainers</div>
                  {moverGainers.slice(0, 4).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)] last:border-0 gap-2">
                      <a href={defillamaChainUrl(c.name)} target="_blank" rel="noopener noreferrer"
                        className="text-[var(--text-secondary)] truncate max-w-[80px] hover:text-[var(--accent-green)] transition-colors underline-offset-2 hover:underline"
                        title={`${c.name} · DeFi Llama`}>{c.name}</a>
                      <span className="text-[var(--accent-green)] tabular-nums font-medium shrink-0">
                        {c.change_1d != null ? `${c.change_1d > 0 ? '+' : ''}${Number(c.change_1d).toFixed(1)}%` : ''}
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[10px] text-[var(--accent-red)] uppercase tracking-[1px] mb-1.5 font-semibold">▼ Losers</div>
                  {moverLosers.slice(0, 4).map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-[var(--border-subtle)] last:border-0 gap-2">
                      <a href={defillamaChainUrl(c.name)} target="_blank" rel="noopener noreferrer"
                        className="text-[var(--text-secondary)] truncate max-w-[80px] hover:text-[var(--accent-red)] transition-colors underline-offset-2 hover:underline"
                        title={`${c.name} · DeFi Llama`}>{c.name}</a>
                      <span className="text-[var(--accent-red)] tabular-nums font-medium shrink-0">
                        {c.change_1d != null ? `${Number(c.change_1d).toFixed(1)}%` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* -- BOLD yields + Dromos NTV (after TVL/stables) -- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <BoldYieldsPanel data={dd?.boldYields} loading={!dd?.boldYields} />
        <NetFlowsPanel
          rows={dd?.netFlows?.rows || dd?.netFlows || []}
          loading={!dd?.netFlows}
          updated={dd?.netFlows?.updated || null}
        />
      </div>

      {/* -- DEX × Chain Matrix (live-refreshed when Web3 loads) -- */}
      {dd?.dexMatrix?.matrix?.length > 0 && (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
          <div className="px-5 py-3 border-b border-[var(--border-default)] flex items-center justify-between flex-wrap gap-2 bg-gradient-to-r from-[var(--accent-cyan)]/[0.06] to-transparent">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-xs text-[var(--accent-cyan)] uppercase tracking-[1.5px] font-bold">DEX × Chain Matrix</span>
              <PanelMeta
                source={dd.dexMatrix.live ? 'DeFiLlama live' : 'DeFiLlama snapshot'}
                updated={dd.dexMatrix.updated_at
                  ? new Date(dd.dexMatrix.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                  : null}
                note={dd.dexMatrix.live ? 'refreshed on tab load' : 'static until live load'}
              />
            </div>
            <span className="text-[10px] text-[var(--text-muted)]">
              {(dd.dexMatrix.matrix || []).length} protocols × {(dd.dexMatrix.chains || []).length} chains
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border-default)] bg-[var(--overlay-weak)]">
                  <th className="text-left px-4 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[10px]">Protocol</th>
                  {((dd.dexMatrix.chains || []) as any[]).slice(0, 7).map((c: any) => (
                    <th key={c.chain} className="text-right px-3 py-2.5 text-[var(--text-muted)] font-medium uppercase tracking-wider text-[10px]">
                      <a href={defillamaChainUrl(c.chain)} target="_blank" rel="noopener noreferrer"
                        className="hover:text-[var(--accent-cyan)] transition-colors" title={`${c.chain} · DeFi Llama`}>{c.chain}</a>
                      <span className={`block text-[9px] font-normal ${c.change_1d >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                        {typeof c.change_1d === 'number' ? `${c.change_1d >= 0 ? '+' : ''}${c.change_1d.toFixed(1)}%` : ''}
                      </span>
                      <span className="block text-[9px] font-normal text-[var(--text-disabled)] normal-case">
                        {c.total24h ? fmtCurrency(c.total24h) : ''}
                      </span>
                    </th>
                  ))}
                  <th className="text-right px-3 py-2.5 text-[var(--accent-cyan)] font-medium uppercase tracking-wider text-[10px]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {((dd.dexMatrix.matrix || []) as any[]).slice(0, 12).map((row: any, i: number) => (
                  <tr key={i} className={`hover:bg-[var(--overlay-weak)] transition-colors ${i % 2 === 0 ? 'bg-[var(--overlay-weak)]' : ''}`}>
                    <td className="px-4 py-2.5 text-[var(--text-secondary)] font-medium truncate max-w-[160px]">
                      <a href={defillamaProtocolUrl(row.protocol)} target="_blank" rel="noopener noreferrer"
                        className="hover:text-[var(--accent-cyan)] transition-colors underline-offset-2 hover:underline"
                        title={`${row.protocol} · DeFi Llama`}>{row.protocol}</a>
                    </td>
                    {((dd.dexMatrix.chains || []) as any[]).slice(0, 7).map((c: any) => {
                      // Support both live chain names and legacy lowercase keys
                      const val = row[c.chain] ?? row[String(c.chain).toLowerCase()] ?? row[String(c.chain).replace(/\s+/g, '_').toLowerCase()] ?? 0;
                      const maxInRow = Math.max(
                        ...((dd.dexMatrix.chains || []) as any[]).slice(0, 7).map((ch: any) =>
                          row[ch.chain] ?? row[String(ch.chain).toLowerCase()] ?? 0
                        ),
                        1,
                      );
                      const pct = val / maxInRow;
                      const isMax = val > 0 && val >= maxInRow * 0.9;
                      return (
                        <td key={c.chain} className="px-3 py-2.5 text-right">
                          <span className={`tabular-nums text-[11px] ${isMax ? 'text-[var(--accent-cyan)] font-semibold' : 'text-[var(--text-tertiary)]'}`}>
                            {val > 1e6 ? `$${(val/1e6).toFixed(1)}M` : val > 1e3 ? `$${(val/1e3).toFixed(0)}K` : val > 0 ? `$${val.toFixed(0)}` : '·'}
                          </span>
                          {val > 0 && <div className="h-0.5 mt-0.5 rounded-full bg-[var(--overlay-soft)]"><div className="h-full rounded-full bg-[var(--accent-cyan)]/30" style={{width: `${Math.max(pct*100, 2)}%`}} /></div>}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-right">
                      <span className="tabular-nums text-[11px] text-[var(--accent-cyan)] font-semibold">
                        {row.total_vol > 1e6 ? `$${(row.total_vol/1e6).toFixed(1)}M` : row.total_vol > 1e3 ? `$${(row.total_vol/1e3).toFixed(0)}K` : `$${row.total_vol.toFixed(0)}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-[var(--border-default)] text-[9px] text-[var(--text-disabled)] text-right">
            Updated: {dd.dexMatrix?.updated_at ? new Date(dd.dexMatrix.updated_at).toLocaleString() : '...'}
          </div>
        </div>
      )}

      {/* -- Live threat intel (severity-tagged web3 + supply-chain) -- */}
            <ThreatIntelFeed
              title="Web3 Threat Intel"
              accent="var(--accent-purple)"
              categories={['web3-security', 'supply-chain', 'operational-security']}
            />

            {/* -- Cypherpunk / EVM voices (X) — prioritised over generic crypto RSS -- */}
            <CypherpunkFeed items={items} ago={ago} />

      {/* Secondary: remaining crypto category signals (news RSS, non-cypherpunk) */}
      {web3Cats[0] && (() => {
        const deskItems = (web3Cats[0].items || []).filter((it: any) => {
          const s = (it.source || '').toLowerCase();
          // News/RSS only — pure X is covered by CypherpunkFeed above
          if (s.startsWith('x:') || s.includes('nitter') || s.includes('twitter')) return false;
          return true;
        }).slice(0, 12);
        if (!deskItems.length) return null;
        return (
          <CategoryBox
            cat={{ ...web3Cats[0], label: 'Crypto desk', items: deskItems, count: deskItems.length }}
            ago={ago}
            TC={TC}
          />
        );
      })()}
    </div>
  );
}
