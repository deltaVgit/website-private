'use client';
/* Chart hover tooltip hooks and formatters */
import { useCallback, useState } from 'react';

export interface ChartPoint {
  t: string | number; // ISO timestamp or unix ms
  v: number; // value (USD for volume)
}

export function useChartHover(points: ChartPoint[]) {
  const [hover, setHover] = useState<{ point: ChartPoint; x: number; y: number; changeFromStart?: number } | null>(null);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!points || points.length === 0) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    const idx = Math.floor(ratio * (points.length - 1));
    const point = points[Math.min(idx, points.length - 1)];
    const firstVal = points[0]?.v;
    const changeFromStart = firstVal && firstVal !== 0 ? ((point.v - firstVal) / firstVal) * 100 : undefined;
    setHover({ point, x: e.clientX - rect.left, y: e.clientY - rect.top, changeFromStart });
  }, [points]);

  const onLeave = useCallback(() => setHover(null), []);

  return { hover, onMove, onLeave };
}

export function formatValue(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`;
  return `$${v.toFixed(2)}`;
}

export function formatDate(iso: string | number): string {
  try {
    const d = typeof iso === 'number' ? new Date(iso) : new Date(iso);
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return String(iso); }
}

/** Compact USD label for chart axes — 1-2 significant digits + unit. */
export function fmtAxisVal(v: number): string {
  if (!Number.isFinite(v)) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(v >= 1e13 ? 0 : 1)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(v >= 1e10 ? 0 : 1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${Math.round(v).toLocaleString()}`;
}

/** Short date label for chart abscissa — "Jul 24" style. */
export function fmtAxisDate(t: string | number): string {
  try {
    const d = typeof t === 'number' ? new Date(t) : new Date(t);
    if (isNaN(d.getTime())) return String(t);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return String(t); }
}

/**
 * CoinGecko total_volumes are USD. Older snapshots wrongly multiplied by BTC price
 * (values ~1e15+). Detect and divide by a typical BTC price scale using the last
 * point vs a known USD anchor when available.
 */
export function sanitizeUsdVolumeHistory(
  raw: { t: string | number; v: number }[] | undefined | null,
  usdAnchor?: number | null,
): ChartPoint[] {
  if (!raw || !raw.length) return [];
  const pts = raw
    .map((p) => ({ t: p.t, v: Number(p.v) }))
    .filter((p) => Number.isFinite(p.v) && p.v >= 0);
  if (!pts.length) return [];

  const maxV = Math.max(...pts.map((p) => p.v));
  const lastV = pts[pts.length - 1].v;

  // Healthy global crypto volume is typically 1e10–1e12 USD. Values >> 1e13 are bad.
  if (maxV < 1e13) return pts;

  let scale = 1;
  if (usdAnchor && usdAnchor > 0 && lastV > 0) {
    // Scale so last point ≈ anchor (total_vol_usd_24h or crypto.total_volume)
    scale = lastV / usdAnchor;
  } else if (maxV > 1e14) {
    // Fallback: historical bug multiplied by BTC price (~5e4–1e5)
    scale = 70000;
  }
  if (!Number.isFinite(scale) || scale < 10) return pts;
  return pts.map((p) => ({ t: p.t, v: p.v / scale }));
}
