#!/usr/bin/env python3
"""
Pre-build script: copies workspace data + fetches external APIs
for static site deployment (GitHub Pages). Falls back gracefully.
"""
import json, os, shutil, re, sys, urllib.request, ssl, subprocess

PUBLIC_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'data')
SIGNALS_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'wiki', 'signals')
WORKSPACE_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'DeltaV-persistent-workspace', 'intel')

os.makedirs(PUBLIC_DIR, exist_ok=True)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_json(url, timeout=15):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'DeltaV-IntelHub/1.0'})
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        print(f"  ⚠ {url[:60]}... → {e}")
        return None

def fetch_yahoo_quote(symbol):
    data = fetch_json(f'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=5d')
    try:
        result = (data.get('chart', {}).get('result', [{}]) or [{}])[0]
        meta = result.get('meta', {})
        quote = (result.get('indicators', {}).get('quote', [{}]) or [{}])[0]
        closes = [value for value in quote.get('close', []) if value is not None]
        now = closes[-1] if closes else meta.get('regularMarketPrice')
        previous = closes[-2] if len(closes) >= 2 else meta.get('previousClose')
        if now is None:
            return None
        return {'price': now, 'change': ((now - previous) / previous * 100) if previous else 0}
    except (AttributeError, IndexError, TypeError, ValueError):
        return None

# --- Copy raw items from workspace ---
raw_dir = os.path.join(WORKSPACE_DIR, 'raw')
if os.path.exists(raw_dir):
    all_items = []
    for fname in sorted(os.listdir(raw_dir)):
        if fname.endswith('.json'):
            try:
                with open(os.path.join(raw_dir, fname), 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        for item in data:
                            if isinstance(item, list) and len(item) >= 3:
                                all_items.append({'title': str(item[0])[:200], 'url': str(item[1])[:500], 'source': str(item[2])[:100], 'published_at': str(item[3]) if len(item) > 3 else '', 'summary': str(item[4])[:300] if len(item) > 4 else ''})
            except: pass
    seen = set()
    unique = []
    for item in all_items:
        url = item.get('url', '')
        if url and url not in seen:
            seen.add(url)
            unique.append(item)
    # Sort by published_at descending (newest first) before taking top 200
    import re as _re
    from datetime import datetime as _dt, timezone as _tz
    def _parse_date(item):
        raw = item.get('published_at', '')
        if not raw: return _dt.min.replace(tzinfo=_tz.utc)
        clean = raw.strip()
        clean = _re.sub(r'\s+(GMT|UTC|EST|EDT|CST|CDT|PST|PDT)$', '', clean, flags=_re.I)
        clean = _re.sub(r'[+-]\d{2}:\d{2}$', '', clean)
        clean = _re.sub(r'Z$', '', clean)
        clean = _re.sub(r'\.(\d{6})\d+', r'.\1', clean)
        for fmt in ['%Y-%m-%dT%H:%M:%S.%f', '%Y-%m-%dT%H:%M:%S', '%Y-%m-%d',
                     '%a, %d %b %Y %H:%M:%S', '%d %b %Y %H:%M:%S']:
            try: return _dt.strptime(clean[:26], fmt).replace(tzinfo=_tz.utc)
            except ValueError: continue
        return _dt.min.replace(tzinfo=_tz.utc)
    unique.sort(key=_parse_date, reverse=True)
    top200 = unique[:200]
    # Only overwrite if file is stale (>30 min) or doesn't exist — trust sync-intel-to-site.py
    out_path = os.path.join(PUBLIC_DIR, 'raw-items.json')
    if os.path.exists(out_path):
        age_min = (os.path.getmtime(__file__) - os.path.getmtime(out_path)) / 60 if os.path.getmtime(out_path) else 999
        # Always write during build — this is the authoritative snapshot
        pass
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(top200, f)
    print(f'✓ {len(top200)} raw items cached (newest first)')
    os.makedirs(SIGNALS_DIR, exist_ok=True)
    shutil.copy(os.path.join(PUBLIC_DIR, 'raw-items.json'), os.path.join(SIGNALS_DIR, 'raw-items.json'))
    print(f'✓ raw-items.json copied to signals/')
    
    # --- Assign tags to raw items via source matching ---
    import re as _r
    SOURCE_TAG_MAP = [
        # (regex pattern, tag)
        (r'(?i)coindesk|decrypt|defiant|santiment|cryptoquant|lookonchain|glassnode|l2beat|defillama|polymarket|theblock|cointelegraph|hypernativelabs|polymutex', 'crypto'),
        (r'(?i)bleepingcomputer|dark.reading|krebs|schneier|threatpost|pcaversaccio|dinosn', 'cybersec'),
        (r'(?i)arxiv\s|hugging\s?face|lesswrong|anthropic|openai|deepmind|lerobothf|elder_plinius|teknium|sama\b|darioamodei|demishassabis|ylecun|karpathy|clementdelangue|arthurmensch|aidangomez|emostaque|drjimfan|xai\b|metaai|mistralai|alibaba_qwen|01ai_yi', 'ai'),
        (r'(?i)mit\s|science\sdaily|ieee|ars\stechnica|nature|researchgate|sciencedaily', 'science'),
        (r'(?i)nvidia|intel|amd|tsmc|samsung\s+(foundry|electronics|semiconductor)|micron\s+technology|asml|qualcomm|broadcom|arm\s+holdings|semiconductor|foundry|lithography', 'hardware'),
        (r'(?i)federal\s?reserve|bloomberg|reuters|wsj\b|financial\stimes|michaeljburry|delphi_digital|hacker\snews', 'macro'),
        (r'(?i)0xngmi|defillama|ki_young_ju|nero_eth|backthebunny|polymutex|santimentdata', 'crypto'),
        (r'(?i)alignment.forum', 'ai'),
    ]
    for item in top200:
        src = (item.get('source') or item.get('feedTitle') or '').strip()
        for pattern, tag in SOURCE_TAG_MAP:
            if _r.search(pattern, src):
                item['tag'] = tag
                break
    # Re-write with tags
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(top200, f)
    # Re-copy to signals
    shutil.copy(os.path.join(PUBLIC_DIR, 'raw-items.json'), os.path.join(SIGNALS_DIR, 'raw-items.json'))
    tagged = sum(1 for it in top200 if it.get('tag'))
    print(f'✓ tags assigned: {tagged}/{len(top200)} items')
    # Slim payload for the homepage strip — see scripts/curated_top20.py
    from curated_top20 import derive as _derive_top20
    _derive_top20(out_path)

# --- Copy picks ---
picks_file = os.path.join(WORKSPACE_DIR, 'picks.json')
if os.path.exists(picks_file):
    shutil.copy(picks_file, os.path.join(PUBLIC_DIR, 'picks.json'))
    print('✓ Picks copied')
else:
    with open(os.path.join(PUBLIC_DIR, 'picks.json'), 'w') as f:
        json.dump({'picks': [], 'updatedAt': ''}, f)
os.makedirs(SIGNALS_DIR, exist_ok=True)
shutil.copy(os.path.join(PUBLIC_DIR, 'picks.json'), os.path.join(SIGNALS_DIR, 'picks.json'))
print('✓ picks.json copied to signals/')

# --- Fetch CISA KEV ---
print('Fetching CISA KEV...')
kev = fetch_json('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json')
if kev:
    cached = {'kev': [], 'updatedAt': kev.get('dateReleased', '')}
    for v in (kev.get('vulnerabilities') or [])[:8]:
        cached['kev'].append({'cve': v.get('cveID'), 'product': v.get('product'), 'vendor': v.get('vendorProject'), 'name': v.get('vulnerabilityName'), 'dateAdded': v.get('dateAdded'), 'dueDate': v.get('dueDate')})
    with open(os.path.join(PUBLIC_DIR, 'infosec.json'), 'w') as f:
        json.dump(cached, f)
    print(f'✓ {len(cached["kev"])} KEVs cached')

# --- Fetch NVD CVEs ---
print('Fetching NVD CVEs...')
nvd = fetch_json('https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=8')
if nvd:
    cves = []
    for v in (nvd.get('vulnerabilities') or []):
        cve = v.get('cve') or {}
        m = (cve.get('metrics') or {}).get('cvssMetricV31') or [{}]
        cvss = m[0].get('cvssData') or {}
        desc = next((d.get('value','') for d in (cve.get('descriptions') or []) if d.get('lang')=='en'), '')
        cves.append({'id': cve.get('id'), 'severity': cvss.get('baseSeverity','N/A'), 'score': cvss.get('baseScore', 0), 'description': desc[:140], 'published': cve.get('published')})
    # Update infosec.json with CVEs
    existing = {}
    if os.path.exists(os.path.join(PUBLIC_DIR, 'infosec.json')):
        with open(os.path.join(PUBLIC_DIR, 'infosec.json')) as f:
            existing = json.load(f)
    existing['cves'] = cves
    with open(os.path.join(PUBLIC_DIR, 'infosec.json'), 'w') as f:
        json.dump(existing, f)
    print(f'✓ {len(cves)} CVEs cached')

# --- Fetch HIBP breaches ---
print('Fetching HIBP breaches...')
hibp = fetch_json('https://haveibeenpwned.com/api/v3/breaches')
if hibp and isinstance(hibp, list):
    breaches = []
    for b in hibp[:8]:
        breaches.append({'name': b.get('Name') or b.get('Title',''), 'domain': b.get('Domain',''), 'date': b.get('BreachDate',''), 'count': b.get('PwnCount',0), 'data': ', '.join((b.get('DataClasses') or [])[:5])})
    existing = {}
    if os.path.exists(os.path.join(PUBLIC_DIR, 'infosec.json')):
        with open(os.path.join(PUBLIC_DIR, 'infosec.json')) as f:
            existing = json.load(f)
    existing['breaches'] = breaches
    with open(os.path.join(PUBLIC_DIR, 'infosec.json'), 'w') as f:
        json.dump(existing, f)
    print(f'✓ {len(breaches)} breaches cached')

# --- Pre-fetch indices (SPX + CSI1000) ---
print('Fetching indices...')
indices = {}
try:
    for sym, key in [('%5EGSPC', 'spx'), ('000001.SS', 'csi')]:
        d = fetch_json(f'https://query1.finance.yahoo.com/v8/finance/chart/{sym}?interval=1d&range=5d')
        if d:
            r = (d.get('chart', {}).get('result', [{}]) or [{}])[0]
            meta = r.get('meta', {})
            q = (r.get('indicators', {}).get('quote', [{}]) or [{}])[0]
            closes = [c for c in q.get('close', []) if c is not None]
            now = closes[-1] if closes else meta.get('regularMarketPrice', 0)
            prev = closes[-2] if len(closes) >= 2 else meta.get('previousClose', 0)
            indices[key] = {
                'price': f'{now:.0f}',
                'change': now - prev,
                'changePct': f'{(now - prev) / prev * 100:+.2f}%' if prev else '...'
            }
    if indices:
        with open(os.path.join(PUBLIC_DIR, 'indices.json'), 'w') as f:
            json.dump(indices, f)
        s = indices.get('spx', {})
        c = indices.get('csi', {})
        print(f'✓ Indices cached: SPX {s.get("price","?")} ({s.get("changePct","?")})  CSI {c.get("price","?")} ({c.get("changePct","?")})')
except Exception as e:
    print(f'⚠ Indices fetch failed: {e}')

# --- Pre-fetch Forex (5 pairs, 10y history for performance) ---
print('Fetching forex...')
forex_data = {}
pairs = [
    ('EURUSD=X', 'EUR', True),
    ('USDJPY=X', 'JPY', False),
    ('GBPUSD=X', 'GBP', True),
    ('USDCHF=X', 'CHF', False),
    ('USDCNY=X', 'CNY', False),
]
try:
    for symbol, label, usdLeft in pairs:
        try:
            r = fetch_json(f'https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=10y')
            if r:
                result = r.get('chart', {}).get('result', [{}]) or [{}]
                meta = result[0].get('meta', {})
                quotes = result[0].get('indicators', {}).get('quote', [{}]) or [{}]
                timestamps = result[0].get('timestamp', [])
                if meta and quotes[0] and timestamps:
                    now = meta.get('regularMarketPrice', 0)
                    closes = [c for c in quotes[0].get('close', []) if c is not None]
                    ts = [timestamps[i] for i, c in enumerate(quotes[0].get('close', [])) if c is not None]
                    prevClose = closes[-2] if len(closes) >= 2 else meta.get('previousClose', 0)
                    chgPct = f'{((now - prevClose) / prevClose * 100):+.2f}%' if prevClose else '···'
                    def find_close(days_back):
                        cutoff = (__import__('time').time()) - (days_back * 86400)
                        for i in range(len(ts) - 1, -1, -1):
                            if ts[i] <= cutoff: return closes[i]
                        return closes[0] if closes else 0
                    m1 = find_close(22)
                    y1 = find_close(252)
                    y10 = closes[0] if closes else 0
                    def pct(prev): return ((now - prev) / prev * 100) if prev else None
                    rate = (1 / now) if usdLeft else now
                    rateStr = f'{rate:.4f}' if usdLeft else f'{rate:.2f}'
                    forex_data[label] = {'rate': rate, 'rateStr': rateStr, 'chgPct': chgPct, 'p1M': pct(m1), 'p1Y': pct(y1), 'p10Y': pct(y10)}
        except: pass
    if forex_data:
        with open(os.path.join(PUBLIC_DIR, 'forex.json'), 'w') as f:
            json.dump(forex_data, f)
        print(f'✓ Forex cached: {len(forex_data)} pairs')
except Exception as e:
    print(f'⚠ Forex fetch failed: {e}')

# --- Pre-fetch HF Trending Models + Spaces (richer metadata for IntelHub filters) ---
def _norm_hf_model(m):
    mid = m.get('modelId') or m.get('id') or ''
    author = m.get('author') or (mid.split('/')[0] if '/' in mid else '')
    tags = list(m.get('tags') or [])
    pipeline = m.get('pipeline_tag') or ''
    if pipeline and pipeline not in tags:
        tags.append(pipeline)
    return {
        'name': mid,
        'author': author,
        'likes': m.get('likes', 0) or 0,
        'downloads': m.get('downloads', 0) or 0,
        'pipeline': pipeline,
        'tags': tags,
        'url': f'https://huggingface.co/{mid}',
    }

print('Fetching HF models (multi-query)...')
try:
    seen = {}
    queries = [
        'https://huggingface.co/api/models?sort=downloads&direction=-1&limit=20',
        'https://huggingface.co/api/models?sort=likes&direction=-1&limit=15',
        'https://huggingface.co/api/models?pipeline_tag=text-generation&sort=downloads&direction=-1&limit=15',
        'https://huggingface.co/api/models?pipeline_tag=text-to-image&sort=likes&direction=-1&limit=12',
        'https://huggingface.co/api/models?pipeline_tag=image-text-to-text&sort=downloads&direction=-1&limit=10',
        'https://huggingface.co/api/models?search=moe&sort=downloads&direction=-1&limit=12',
        'https://huggingface.co/api/models?search=agent&sort=downloads&direction=-1&limit=10',
    ]
    for q in queries:
        batch = fetch_json(q)
        if not batch or not isinstance(batch, list):
            continue
        for m in batch:
            row = _norm_hf_model(m)
            if not row['name']:
                continue
            prev = seen.get(row['name'])
            if not prev or (row['downloads'] or 0) > (prev.get('downloads') or 0):
                # merge tags
                if prev:
                    tags = list(dict.fromkeys((prev.get('tags') or []) + (row.get('tags') or [])))
                    row['tags'] = tags
                    if not row.get('pipeline') and prev.get('pipeline'):
                        row['pipeline'] = prev['pipeline']
                seen[row['name']] = row
    models = sorted(seen.values(), key=lambda x: x.get('downloads') or 0, reverse=True)[:48]
    with open(os.path.join(PUBLIC_DIR, 'hf.json'), 'w') as f:
        json.dump({'models': models, 'updated': __import__('datetime').datetime.utcnow().strftime('%Y-%m-%d')}, f)
    print(f'✓ HF models cached: {len(models)}')
except Exception as e:
    print(f'⚠ HF models fetch failed: {e}')

print('Fetching HF spaces...')
try:
    hs = fetch_json('https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=12')
    if hs and isinstance(hs, list):
        spaces = []
        for s in hs:
            sid = s.get('id', '')
            author = s.get('author') or (sid.split('/')[0] if '/' in sid else '')
            spaces.append({
                'name': sid,
                'author': author,
                'likes': s.get('likes', 0) or 0,
                'pipeline': s.get('sdk') or '',
                'tags': list(s.get('tags') or []),
                'url': f'https://huggingface.co/spaces/{sid}',
            })
        existing = {}
        hf_path = os.path.join(PUBLIC_DIR, 'hf.json')
        if os.path.exists(hf_path):
            with open(hf_path) as f: existing = json.load(f)
        existing['spaces'] = spaces
        with open(hf_path, 'w') as f: json.dump(existing, f)
        print(f'✓ HF spaces cached: {len(spaces)}')
except Exception as e:
    print(f'⚠ HF spaces fetch failed: {e}')

# --- Pre-fetch Crypto Market Cap ---
print('Fetching crypto market cap...')
crypto = {}
try:
    with open(os.path.join(PUBLIC_DIR, 'crypto.json'), 'r', encoding='utf-8') as f:
        crypto = json.load(f)
except (OSError, ValueError, TypeError):
    pass
try:
    cg = fetch_json('https://api.coingecko.com/api/v3/global')
    if cg and cg.get('data'):
        d = cg['data']
        crypto.update({
            'total_mcap': d.get('total_market_cap', {}).get('usd', 0),
            'total_volume': d.get('total_volume', {}).get('usd', 0),
            'btc_dominance': d.get('market_cap_percentage', {}).get('btc', 0),
            'eth_dominance': d.get('market_cap_percentage', {}).get('eth', 0),
            'mcap_change_24h': d.get('market_cap_change_percentage_24h_usd', 0),
            'active_cryptos': d.get('active_cryptocurrencies', 0),
        })
        mcap_t = crypto.get('total_mcap', 0) / 1e12
        print(f'✓ Crypto cached: ${mcap_t:.2f}T mcap')
except Exception as e:
    print(f'⚠ Crypto fetch failed: {e}')

for symbol, prefix in [('BTC-USD', 'btc'), ('ETH-USD', 'eth')]:
    quote = fetch_yahoo_quote(symbol)
    if quote:
        crypto[f'{prefix}_price'] = quote['price']
        crypto[f'{prefix}_change_24h'] = quote['change']
if crypto:
    with open(os.path.join(PUBLIC_DIR, 'crypto.json'), 'w') as f:
        json.dump(crypto, f)

# --- Pre-fetch BTC Market Data (trend + volume history, shared fetch) ---
print('Fetching BTC market data...')
btc_data = fetch_json('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365')

# BTC market cap trend for sparkline
try:
    if btc_data and btc_data.get('market_caps'):
        caps = btc_data['market_caps']
        step = max(1, len(caps) // 150)
        trend = [{'t': caps[i][0], 'v': caps[i][1]} for i in range(0, len(caps), step)]
        if trend[-1]['t'] != caps[-1][0]:
            trend.append({'t': caps[-1][0], 'v': caps[-1][1]})
        with open(os.path.join(PUBLIC_DIR, 'btc-trend.json'), 'w') as f:
            json.dump(trend, f)
        print(f'✓ BTC trend cached: {len(trend)} points')
except Exception as e:
    print(f'⚠ BTC trend failed: {e}')

# Top exchange volumes + volume history from same BTC data
print('Fetching exchange volumes...')
try:
    ex = fetch_json('https://api.coingecko.com/api/v3/exchanges?per_page=10')
    exchanges = []
    total_vol_btc = 0
    if ex and isinstance(ex, list):
        for e in ex[:10]:
            vol_btc = e.get('trade_volume_24h_btc', 0) or 0
            exchanges.append({
                'name': e.get('name', '')[:30],
                'score': e.get('trust_score', 0),
                'vol_btc': vol_btc,
                'year_est': e.get('year_established', '') or '',
                'country': e.get('country', '') or '',
            })
            total_vol_btc += vol_btc
    # Volume history from BTC total_volumes.
    # CoinGecko market_chart total_volumes are already in vs_currency (USD) — do NOT multiply by price.
    vol_history = []
    cap_history = []
    vol_source = 'coingecko-btc'
    # Preferred: LiveCoinWatch all-market volume history (free-tier key).
    # Official API: livecoinwatch.com/tools/api - POST /overview/history.
    # Key lives in env only (DASHBOARD_LCW_KEY or LCW_API_KEY), never in this repo.
    lcw_key = os.environ.get('DASHBOARD_LCW_KEY') or os.environ.get('LCW_API_KEY')
    if lcw_key:
        try:
            # LCW caps each response at ~100 pts, so a year of DAILY bars needs
            # four ~92-day chunks @1d merged by timestamp (~365 bars, one per day).
            _now = int(time.time() * 1000)
            _merged_v = {}
            _merged_c = {}
            for _i in range(4):
                _end_i = _now - _i * 92 * 86400000
                _start_i = _now - (_i + 1) * 92 * 86400000
                _req = urllib.request.Request(
                    'https://api.livecoinwatch.com/overview/history',
                    data=json.dumps({'currency': 'USD', 'start': _start_i, 'end': _end_i, 'granularity': '1d'}).encode(),
                    method='POST',
                    headers={'content-type': 'application/json', 'x-api-key': lcw_key},
                )
                with urllib.request.urlopen(_req, timeout=30) as _r:
                    _lcw = json.loads(_r.read().decode())
                _pts = _lcw if isinstance(_lcw, list) else (_lcw.get('history') or [])
                for _h in _pts:
                    if _h.get('date') is not None:
                        if _h.get('volume') is not None:
                            _merged_v[int(_h['date'])] = float(_h['volume'])
                        if _h.get('cap') is not None:
                            _merged_c[int(_h['date'])] = float(_h['cap'])
            vol_history = [{'t': _t, 'v': _merged_v[_t]} for _t in sorted(_merged_v)]
            cap_history = [{'t': _t, 'v': _merged_c[_t]} for _t in sorted(_merged_c)]
            if vol_history:
                vol_source = 'lcw'
                print(f'[OK] LCW merged volume history: {len(vol_history)} pts')
        except Exception as e:
            vol_history = []
            print(f'[WARN] LCW history failed, falling back to CoinGecko BTC: {e}')
    if not vol_history and btc_data and btc_data.get('total_volumes'):
        vols = btc_data['total_volumes']
        # Keep every daily point (days=365): the dashboard needs daily
        # granularity for its 1W/1M/3M/6M/1Y timeframe toggles.
        step = 1
        for i in range(0, len(vols), step):
            t, v_usd = vols[i]
            vol_history.append({'t': t, 'v': v_usd})
    # Keep the last known chart history when CoinGecko is unavailable or returns
    # no market-chart points during the build. Otherwise a transient API failure
    # silently removes the IntelHub hover chart from the static deployment.
    if not vol_history:
        previous_path = os.path.join(PUBLIC_DIR, 'exchange-vol.json')
        try:
            with open(previous_path, 'r', encoding='utf-8') as f:
                previous = json.load(f)
            vol_history = previous.get('vol_history', []) or []
            cap_history = previous.get('cap_history', []) or []
            vol_source = previous.get('vol_source', 'coingecko-btc')
            if vol_history:
                print(f'⚠ Using cached volume history: {len(vol_history)} points')
        except (OSError, ValueError, TypeError):
            pass
    last_v = vol_history[-1]['v'] if vol_history else 0
    ex_data = {
        'exchanges': exchanges,
        'total_vol_btc_24h': total_vol_btc,
        'total_vol_usd_24h': last_v,
        'vol_history': vol_history,
        'cap_history': cap_history,
        'vol_source': vol_source,
        'vol_unit': 'usd',
    }
    with open(os.path.join(PUBLIC_DIR, 'exchange-vol.json'), 'w') as f:
        json.dump(ex_data, f)
    print(f'✓ Exchange vols: {len(exchanges)} exchanges, {len(vol_history)} vol history pts')
except Exception as e:
    print(f'⚠ Exchange fetch failed: {e}')

# --- Dromos Kitchen net token value flows (for Web3 revenue panel) ---
print('Fetching Dromos net-flows...')
try:
    import re as _re
    html = fetch_text('https://dromos.kitchen/dashboards/net-flows?period=30d') if 'fetch_text' in dir() else None
    if html is None:
        import urllib.request
        html = urllib.request.urlopen('https://dromos.kitchen/dashboards/net-flows?period=30d', timeout=25).read().decode('utf-8', 'replace')
    blobs = []
    for p in _re.findall(r'self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)', html):
        try:
            blobs.append(p.encode('utf-8').decode('unicode_escape'))
        except Exception:
            blobs.append(p)
    big = max(blobs, key=len) if blobs else ''
    i = big.find('"data":[{"token"')
    net_rows = []
    if i >= 0:
        chunk = big[i + 7:]
        depth = 0
        end = None
        for j, ch in enumerate(chunk):
            if ch == '[':
                depth += 1
            elif ch == ']':
                depth -= 1
                if depth == 0:
                    end = j + 1
                    break
        if end:
            try:
                net_rows = json.loads(chunk[:end])
            except Exception as e:
                print(f'⚠ Dromos JSON parse failed: {e}')
    if net_rows:
        slim = []
        for r in net_rows:
            slim.append({
                'token': r.get('token'),
                'cat': r.get('cat'),
                'mcap': r.get('mcap'),
                # 30d fields are the default revenue/emissions/ratio on the payload
                'rev_30d': r.get('revenue'),
                'em_30d': r.get('emissions'),
                'ratio_30d': r.get('ratio_val'),
                'ratio_str_30d': r.get('ratio_str'),
                'rev_90d': r.get('rev_90d'),
                'em_90d': r.get('em_90d'),
                'ratio_90d': r.get('ratio_val_90d'),
                'ratio_str_90d': r.get('ratio_str_90d'),
                'rev_180d': r.get('rev_180d'),
                'em_180d': r.get('em_180d'),
                'ratio_180d': r.get('ratio_val_180d'),
                'ratio_str_180d': r.get('ratio_str_180d'),
            })
        with open(os.path.join(PUBLIC_DIR, 'net-flows.json'), 'w') as f:
            json.dump({
                'source': 'https://dromos.kitchen/dashboards/net-flows',
                'periods': ['30d', '90d', '180d'],
                'updated': __import__('datetime').datetime.utcnow().isoformat() + 'Z',
                'rows': slim,
            }, f)
        print(f'✓ Dromos net-flows cached: {len(slim)} protocols')
    else:
        print('⚠ Dromos net-flows: no rows extracted')
except Exception as e:
    print(f'⚠ Dromos net-flows fetch failed: {e}')

# --- Fetch ETF Flows (BTC + ETH) ---
print('Fetching ETF flows...')
try:
    # Run our dedicated fetcher — uses haturatu/crypto-etf-flow GitHub mirror (Farside data)
    etf_script = os.path.join(os.path.dirname(__file__), 'fetch-etf-flows.py')
    subprocess.run([sys.executable, etf_script], check=True, timeout=30)
except Exception as e:
    print(f'⚠ ETF flows fetch failed: {e}')

print('\nPre-build complete.')
