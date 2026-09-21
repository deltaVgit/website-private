#!/usr/bin/env python3
"""
Fetch spot-ETF daily net flows from the Farside GitHub mirror
(haturatu/crypto-etf-flow).  Writes public/data/etf-flows.json for the
IntelHub Web3Dashboard.

Source: Farside Investors (same data that powers defillama.com/etfs)
Mirror: https://github.com/haturatu/crypto-etf-flow

Scope (per Marc 2026-09-21): BTC + ETH aggregates ONLY — no SOL, no
per-issuer breakdown. Robustness rules:
- If an asset's CSV fetch fails or is empty, carry that asset forward from the
  previous local JSON (never overwrite good data with nulls).
- If ALL assets are empty, keep the previous file untouched and exit 0.
- gh-pages push only when the flow payload actually changed (updated_at excluded),
  so the script is safe to run hourly.
"""
import csv, io, json, os, sys, urllib.request, ssl
from datetime import datetime

BTC_CSV_URL = 'https://raw.githubusercontent.com/haturatu/crypto-etf-flow/main/etf_btc.csv'
ETH_CSV_URL = 'https://raw.githubusercontent.com/haturatu/crypto-etf-flow/main/etf_eth.csv'

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
OUT_PATH = os.path.join(PUBLIC_DIR, 'etf-flows.json')

os.makedirs(PUBLIC_DIR, exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_csv(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'DeltaV-IntelHub/1.0'})
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            return r.read().decode('utf-8')
    except Exception as e:
        print(f'  ⚠ ETF fetch failed ({url.rsplit("/", 1)[-1]}): {e}', file=sys.stderr)
        return None

def parse_rows(text):
    """Parse CSV into rows of {date, total} from the 'Total' column."""
    rows = []
    if not text:
        return rows
    reader = csv.DictReader(io.StringIO(text))
    for row in reader:
        date_str = (row.get('Date') or '').strip()
        total_str = (row.get('Total') or '').strip()
        if not date_str or total_str == '':
            continue
        try:
            dt = datetime.strptime(date_str, '%d %b %Y')
        except ValueError:
            continue
        try:
            total = float(total_str)
        except ValueError:
            continue
        rows.append({'date': dt.strftime('%Y-%m-%d'), 'total': total})
    rows.sort(key=lambda r: r['date'])
    return rows

def asset_payload(rows):
    """Build the per-asset dict from nonzero-total rows (weekends/unreported dropped)."""
    nz = [r for r in rows if r['total'] != 0]
    if not nz:
        return None
    latest, prev = nz[-1], (nz[-2] if len(nz) >= 2 else None)
    year = datetime.utcnow().year
    ytd = sum(r['total'] for r in nz if r['date'].startswith(str(year)))
    return {
        'latest_total': latest['total'],
        'latest_date': latest['date'],
        'prev_total': prev['total'] if prev else None,
        'change': (latest['total'] - prev['total']) if prev else None,
        'ytd_flows': ytd,
        'sparkline': [{'d': r['date'], 'v': r['total']} for r in nz[-30:]],
    }

def strip_ts(payload):
    """Copy of payload without updated_at (for change detection)."""
    return {k: v for k, v in payload.items() if k != 'updated_at'}

def main():
    sources = {'btc': BTC_CSV_URL, 'eth': ETH_CSV_URL}

    prev = {}
    if os.path.exists(OUT_PATH):
        try:
            with open(OUT_PATH, encoding='utf-8') as f:
                prev = json.load(f)
        except Exception:
            prev = {}

    output = {'updated_at': datetime.utcnow().isoformat() + 'Z',
              'source': 'Farside Investors via haturatu/crypto-etf-flow'}
    fresh_count = 0
    for asset, url in sources.items():
        rows = parse_rows(fetch_csv(url))
        payload = asset_payload(rows)
        if payload:
            output[asset] = payload
            fresh_count += 1
        elif asset in prev:
            output[asset] = prev[asset]  # carry forward last good data
        else:
            output[asset] = {'latest_total': None, 'latest_date': None,
                             'prev_total': None, 'change': None,
                             'ytd_flows': 0, 'sparkline': []}

    if fresh_count == 0:
        print('⚠ ETF: all source CSVs empty — keeping previous file, no push')
        return 0

    changed = strip_ts(output) != strip_ts(prev)
    with open(OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)

    for a in ('btc', 'eth'):
        d = output[a]
        if d.get('latest_total') is None:
            continue
        print(f"✓ {a.upper()}: ${d['latest_total']:+.1f}M ({d['latest_date']})"
              f"  YTD ${d['ytd_flows']:+,.1f}M")

    if not changed:
        print('  · flows unchanged since last run — no push')
        return 0

    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from _gh_pages_push import push_data_files
        pushed = push_data_files({'etf-flows.json': json.dumps(output, indent=2)},
                                 commit_prefix='data: etf-flows')
        print(f'  gh-pages push: {", ".join(pushed) if pushed else "no changes"}')
    except Exception as e:
        print(f'  ⚠ gh-pages push skipped: {e}', file=sys.stderr)
    return 0

if __name__ == '__main__':
    sys.exit(main())
