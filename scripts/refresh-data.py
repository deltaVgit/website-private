#!/usr/bin/env python3
"""
refresh-data.py — Fetch live market data and push to gh-pages (no site rebuild).
Hermes no_agent cron every ~15 min. Zero LLM tokens.

Writes (SSOT: gh-pages data/*):
  indices, forex, hf, crypto, gold, us10y, oil, cnn-fg, btc-trend,
  exchange-vol, top-movers, artemis-newsletter, macro-calendar

Also merges indices so partial Yahoo failures never drop SMI/STOXX/DAX.
"""
from __future__ import annotations

import html as html_lib
import json
import os
import re
import shutil
import ssl
import subprocess
import sys
import tempfile
import time
import urllib.request
import xml.etree.ElementTree as ET
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

REPO = os.environ.get("DASHBOARD_DATA_REPO", "https://github.com/deltaVgit/website-private.git")
BRANCH = "gh-pages"
USER_AGENT = "Mozilla/5.0 (compatible; DeltaV-Refresh/1.1)"

# Prefer Hermes workdir → cwd → script-relative website checkout
def _public_dir() -> Path:
    cands = []
    wd = os.environ.get("HERMES_CRON_WORKDIR") or ""
    if wd:
        cands.append(Path(wd) / "public" / "data")
    cands.append(Path.cwd() / "public" / "data")
    cands.append(Path(__file__).resolve().parent.parent / "public" / "data")
    for p in cands:
        if p.parent.parent.exists() or p.parent.exists():
            return p
    return cands[-1]


PUBLIC_DIR = _public_dir()

DATA_FILES = [
    "indices.json",
    "forex.json",
    "hf.json",
    "crypto.json",
    "gold.json",
    "us10y.json",
    "oil.json",
    "cnn-fg.json",
    "btc-trend.json",
    "exchange-vol.json",
    "top-movers.json",
    "artemis-newsletter.json",
    "macro-calendar.json",
]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

INDEX_SYMBOLS = [
    ("%5EGSPC", "spx"),
    ("000001.SS", "csi"),
    ("%5ESSMI", "smi"),
    ("%5ESTOXX50E", "stoxx"),
    ("%5EGDAXI", "dax"),
]

FOREX_PAIRS = [
    ("EURUSD=X", "EUR", True),
    ("USDJPY=X", "JPY", False),
    ("GBPUSD=X", "GBP", True),
    ("USDCHF=X", "CHF", False),
    ("USDCNY=X", "CNY", False),
]

# Liquid large-cap equities for top movers (Yahoo)
EQUITY_UNIVERSE = [
    "NVDA", "AAPL", "MSFT", "AMZN", "GOOGL", "META", "TSLA", "AVGO",
    "AMD", "NFLX", "JPM", "V", "XOM", "UNH", "LLY", "COST", "ORCL", "CRM",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def fetch_json(url: str, timeout: int = 15):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            return json.loads(r.read().decode())
    except Exception as e:
        print(f"  ⚠ {url[:70]}… → {e}", file=sys.stderr)
        return None


def fetch_chart(symbol: str, range_days: str = "5d"):
    """Yahoo chart → {now, prev, closes, timestamps} or None."""
    d = fetch_json(
        f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range={range_days}"
    )
    if not d:
        return None
    res = (d.get("chart", {}).get("result") or [{}])[0]
    meta = res.get("meta") or {}
    q = (res.get("indicators", {}).get("quote") or [{}])[0]
    closes = [c for c in (q.get("close") or []) if c is not None]
    timestamps = res.get("timestamp") or []
    now = closes[-1] if closes else meta.get("regularMarketPrice") or 0
    prev = closes[-2] if len(closes) >= 2 else meta.get("previousClose") or 0
    if not now:
        return None
    return {
        "now": float(now),
        "prev": float(prev) if prev else 0.0,
        "closes": [float(c) for c in closes],
        "timestamps": timestamps,
    }


def find_close(ts: list, closes: list, target_ts: float):
    if not ts or not closes or len(ts) != len(closes):
        return None
    best_i, best_d = 0, abs(ts[0] - target_ts)
    for i in range(1, len(ts)):
        d = abs(ts[i] - target_ts)
        if d < best_d:
            best_i, best_d = i, d
    return closes[best_i]


def pct(now: float, prev: float | None) -> float | None:
    if prev is None or not prev:
        return None
    return (now - prev) / prev * 100


def index_row(c: dict) -> dict:
    now, prev = c["now"], c["prev"]
    return {
        "price": f"{now:.0f}",
        "change": now - prev,
        "changePct": f"{(now - prev) / prev * 100:+.2f}%" if prev else "…",
    }


def commodity_row(c: dict, decimals: int = 2) -> dict:
    now, prev = c["now"], c["prev"]
    return {
        "price": f"{now:.{decimals}f}",
        "change": now - prev,
        "changePct": f"{(now - prev) / prev * 100:+.2f}%" if prev else "…",
        "updated_at": utc_now(),
    }


def build_indices() -> dict:
    fresh: dict = {}
    for sym, key in INDEX_SYMBOLS:
        c = fetch_chart(sym, "5d")
        if c:
            fresh[key] = index_row(c)
            print(f"  ✓ index {key}={fresh[key]['price']}")
        else:
            print(f"  ⚠ index {key} failed", file=sys.stderr)
    fresh["updated_at"] = utc_now()
    return fresh


def build_gold() -> dict | None:
    c = fetch_chart("GC=F", "5d")
    return commodity_row(c, 2) if c else None


def build_oil() -> dict | None:
    c = fetch_chart("CL=F", "5d")
    return commodity_row(c, 2) if c else None


def build_us10y() -> dict | None:
    c = fetch_chart("%5ETNX", "5d")
    if not c:
        return None
    now, prev = c["now"], c["prev"]
    return {
        "price": f"{now:.2f}%",
        "change": now - prev,
        "changePct": f"{(now - prev) / prev * 100:+.2f}%" if prev else "…",
        "updated_at": utc_now(),
    }


def build_forex() -> dict:
    out: dict = {"updated_at": utc_now()}
    now_ts = time.time()
    for symbol, label, usd_left in FOREX_PAIRS:
        # need 10y range for long windows
        c = fetch_chart(symbol, "10y")
        if not c:
            c = fetch_chart(symbol, "5d")
        if not c:
            print(f"  ⚠ forex {label} failed", file=sys.stderr)
            continue
        now = c["now"]
        prev = c["prev"]
        chg = pct(now, prev) if prev else None
        closes, ts = c.get("closes") or [], c.get("timestamps") or []
        m1 = find_close(ts, closes, now_ts - 30 * 86400) if ts else None
        y1 = find_close(ts, closes, now_ts - 365 * 86400) if ts else None
        y10 = find_close(ts, closes, now_ts - 3650 * 86400) if ts else None
        # Display rate as "foreign per USD" style when usd_left is quote (EURUSD = EUR per USD? Actually EURUSD is USD per EUR inverted)
        # Match prior schema: rate is Yahoo last price as-is.
        rate = now
        out[label] = {
            "rate": rate,
            "rateStr": f"{rate:.4f}" if rate < 20 else f"{rate:.2f}",
            "chgPct": f"{chg:+.2f}%" if chg is not None else "…",
            "p1M": pct(now, m1) if m1 else None,
            "p1Y": pct(now, y1) if y1 else None,
            "p10Y": pct(now, y10) if y10 else None,
        }
        print(f"  ✓ forex {label}={out[label]['rateStr']}")
    return out


def _hf_row(repo_id: str, likes=0, downloads=0, extra=None) -> dict:
    rid = repo_id or ""
    row = {
        "name": rid.split("/")[-1] if "/" in rid else rid,
        "author": rid.split("/")[0] if "/" in rid else "",
        "likes": likes or 0,
        "downloads": downloads or 0,
        "url": f"https://huggingface.co/{rid}" if rid else "https://huggingface.co/",
    }
    if extra:
        row.update(extra)
    return row


def build_hf() -> dict:
    """Trending models/spaces — never sort-by-downloads (that surfaces BERT/MiniLM)."""
    skip_pipes = {"feature-extraction", "sentence-similarity", "fill-mask", "token-classification"}
    models, spaces = [], []

    trending = fetch_json("https://huggingface.co/api/trending")
    recent = trending.get("recentlyTrending") if isinstance(trending, dict) else None
    if isinstance(recent, list):
        for entry in recent:
            repo = entry.get("repoData") or {}
            rid = repo.get("id") or ""
            if not rid:
                continue
            rtype = (entry.get("repoType") or "model").lower()
            likes = repo.get("likes") or 0
            downloads = repo.get("downloads") or repo.get("downloadsAllTime") or 0
            pipe = (repo.get("pipeline_tag") or repo.get("pipelineTag") or "").lower()
            if rtype == "space" and len(spaces) < 6:
                spaces.append(_hf_row(rid, likes, extra={"sdk": repo.get("sdk") or ""}))
            elif rtype != "space" and len(models) < 8 and pipe not in skip_pipes:
                models.append(_hf_row(rid, likes, downloads, extra={"pipeline": pipe}))

    if len(models) < 4:
        fallback = fetch_json("https://huggingface.co/api/models?sort=lastModified&direction=-1&limit=16") or []
        seen = {m.get("url") for m in models}
        if isinstance(fallback, list):
            for m in fallback:
                mid = m.get("modelId") or m.get("id") or ""
                pipe = (m.get("pipeline_tag") or "").lower()
                if not mid or pipe in skip_pipes:
                    continue
                row = _hf_row(mid, m.get("likes") or 0, m.get("downloads") or 0, extra={"pipeline": pipe})
                if row["url"] in seen:
                    continue
                models.append(row)
                seen.add(row["url"])
                if len(models) >= 8:
                    break

    if len(spaces) < 3:
        spaces_raw = fetch_json("https://huggingface.co/api/spaces?sort=likes&direction=-1&limit=5") or []
        if isinstance(spaces_raw, list) and not spaces:
            for s in spaces_raw:
                sid = s.get("id") or s.get("name") or ""
                spaces.append(_hf_row(sid, s.get("likes") or 0))

    print(f"  ✓ hf models={len(models)} spaces={len(spaces)} (trending)")
    return {"models": models[:8], "spaces": spaces[:6], "updated": utc_now(), "updated_at": utc_now()}


def build_crypto() -> dict | None:
    cg = fetch_json("https://api.coingecko.com/api/v3/global")
    time.sleep(0.3)
    btc = fetch_chart("BTC-USD", "5d")
    eth = fetch_chart("ETH-USD", "5d")
    out: dict = {"updated_at": utc_now()}
    if cg and isinstance(cg.get("data"), dict):
        d = cg["data"]
        out["total_mcap"] = (d.get("total_market_cap") or {}).get("usd")
        out["total_volume"] = (d.get("total_volume") or {}).get("usd")
        mcp = d.get("market_cap_percentage") or {}
        out["btc_dominance"] = mcp.get("btc")
        out["eth_dominance"] = mcp.get("eth")
        out["mcap_change_24h"] = d.get("market_cap_change_percentage_24h_usd")
        out["active_cryptos"] = d.get("active_cryptocurrencies")
    if btc:
        out["btc_price"] = btc["now"]
        out["btc_change_24h"] = pct(btc["now"], btc["prev"])
    if eth:
        out["eth_price"] = eth["now"]
        out["eth_change_24h"] = pct(eth["now"], eth["prev"])
    if not out.get("btc_price") and not out.get("total_mcap"):
        return None
    print(f"  ✓ crypto btc={out.get('btc_price')}")
    return out


def build_cnn_fg() -> dict | None:
    try:
        req = urllib.request.Request(
            "https://production.dataviz.cnn.io/index/fearandgreed/graphdata",
            headers={"User-Agent": "Mozilla/5.0"},
        )
        with urllib.request.urlopen(req, timeout=10, context=ctx) as r:
            cnn = json.loads(r.read().decode())
        fg = cnn.get("fear_and_greed") if isinstance(cnn, dict) else None
        latest = fg[-1] if isinstance(fg, list) and fg else fg
        if isinstance(latest, dict):
            val = latest.get("y") or latest.get("score") or latest.get("rating")
            # sometimes structure is {score, rating}
            if latest.get("score") is not None:
                return {
                    "value": int(latest.get("score") or 0),
                    "label": latest.get("rating") or "neutral",
                    "updated_at": utc_now(),
                    "source": "cnn",
                }
            if val is not None:
                return {
                    "value": int(val),
                    "label": latest.get("rating") or latest.get("label") or "neutral",
                    "updated_at": utc_now(),
                    "source": "cnn",
                }
    except Exception as e:
        print(f"  ⚠ cnn-fg: {e}", file=sys.stderr)

    # Fallback: feargreedchart.com history last point
    try:
        hist = fetch_json("https://feargreedchart.com/api/?action=history", timeout=12)
        if isinstance(hist, list) and hist:
            latest = hist[-1]
            score = int(latest.get("score") or 0)
            rating = (
                "Extreme Fear" if score <= 20 else
                "Fear" if score <= 40 else
                "Neutral" if score <= 60 else
                "Greed" if score <= 80 else
                "Extreme Greed"
            )
            return {
                "value": score,
                "label": rating,
                "updated_at": utc_now(),
                "source": "feargreedchart",
            }
    except Exception as e:
        print(f"  ⚠ fg fallback: {e}", file=sys.stderr)
    return None


def build_btc_trend() -> list | None:
    d = fetch_json(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365"
    )
    if not d:
        return None
    caps = d.get("market_caps") or []
    if not caps:
        return None
    # downsample ~180 pts
    step = max(1, len(caps) // 180)
    out = [{"t": int(p[0]), "v": p[1]} for p in caps[::step]]
    print(f"  ✓ btc-trend n={len(out)}")
    return out


def build_exchange_vol() -> dict | None:
    btcd = fetch_json(
        "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365"
    )
    time.sleep(0.3)
    ex = fetch_json("https://api.coingecko.com/api/v3/exchanges?per_page=10")
    btc_price = 0.0
    btc_chart = fetch_chart("BTC-USD", "5d")
    if btc_chart:
        btc_price = btc_chart["now"]

    vol_history = []
    if btcd and btcd.get("total_volumes"):
        vols = btcd["total_volumes"]
        # Keep every daily point (days=365): the dashboard needs daily
        # granularity for its 1W/1M/3M/6M/1Y timeframe toggles.
        step = 1
        for p in vols[::step]:
            vol_history.append({"t": int(p[0]), "v": p[1]})

    exchanges = []
    total_btc = 0.0
    if isinstance(ex, list):
        for e in ex:
            vb = float(e.get("trade_volume_24h_btc") or 0)
            total_btc += vb
            exchanges.append({
                "name": e.get("name"),
                "vol_btc": vb,
                "vol_usd": round(vb * btc_price, 2) if btc_price else None,
                "trust_score": e.get("trust_score") or e.get("score"),
            })
    out = {
        "updated_at": utc_now(),
        "vol_history": vol_history,
        "exchanges": exchanges,
        "total_vol_btc_24h": total_btc,
        "total_vol_usd_24h": round(total_btc * btc_price, 2) if btc_price else None,
    }
    print(f"  ✓ exchange-vol n={len(exchanges)}")
    return out


def build_top_movers() -> dict | None:
    equities = []
    for sym in EQUITY_UNIVERSE:
        c = fetch_chart(sym, "5d")
        if not c or not c["prev"]:
            continue
        chg = pct(c["now"], c["prev"])
        if chg is None:
            continue
        equities.append({
            "symbol": sym,
            "name": sym,
            "price": round(c["now"], 2),
            "changePct": round(chg, 2),
        })
        time.sleep(0.05)
    equities.sort(key=lambda r: -abs(r["changePct"]))
    gainers = [r for r in equities if r["changePct"] > 0][:8]
    losers = sorted([r for r in equities if r["changePct"] < 0], key=lambda r: r["changePct"])[:8]

    STABLES = {"USDT", "USDC", "DAI", "USDE", "FDUSD", "TUSD", "BUSD", "USDS", "PYUSD", "USD1"}
    crypto_rows = []
    cg = fetch_json(
        "https://api.coingecko.com/api/v3/coins/markets"
        "?vs_currency=usd&order=market_cap_desc&per_page=80&page=1&sparkline=false&price_change_percentage=24h"
    )
    if isinstance(cg, list):
        for c in cg:
            chg = c.get("price_change_percentage_24h")
            if chg is None:
                continue
            sym = (c.get("symbol") or "").upper()
            name = c.get("name") or sym
            if sym in STABLES or "\u200b" in name:
                continue
            rank = c.get("market_cap_rank") or 99
            if abs(float(chg)) > 40:
                continue
            if rank > 30 and abs(float(chg)) > 15:
                continue
            crypto_rows.append({
                "symbol": sym,
                "name": name,
                "price": c.get("current_price"),
                "change_24h": round(float(chg), 2),
                "changePct": round(float(chg), 2),
                "asset": "crypto",
            })
        crypto_rows.sort(key=lambda r: -abs(r["change_24h"]))
    cg_gain = [r for r in crypto_rows if r["change_24h"] > 0][:5]
    cg_lose = sorted([r for r in crypto_rows if r["change_24h"] < 0], key=lambda r: r["change_24h"])[:5]

    eq_gain = [{**r, "change_24h": r["changePct"], "asset": "equity"} for r in gainers[:5]]
    eq_lose = [{**r, "change_24h": r["changePct"], "asset": "equity"} for r in losers[:5]]

    # UI (MacroDashboard) reads equities.gainers / crypto.gainers
    out = {
        "updated_at": utc_now(),
        "source": "Yahoo · CoinGecko",
        "equities": {"gainers": eq_gain, "losers": eq_lose},
        "crypto": {"gainers": cg_gain, "losers": cg_lose},
        "equity_gainers": eq_gain,
        "equity_losers": eq_lose,
        "crypto_gainers": cg_gain,
        "crypto_losers": cg_lose,
    }
    print(f"  ✓ top-movers eq={len(out['equities'])} cr={len(out['crypto'])}")
    return out


def build_artemis_newsletter() -> dict | None:
    try:
        req = urllib.request.Request(
            "https://research.artemis.ai/feed",
            headers={"User-Agent": USER_AGENT},
        )
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            rss_xml = r.read().decode("utf-8", errors="replace")
        root = ET.fromstring(rss_xml)
        ns = {
            "dc": "http://purl.org/dc/elements/1.1/",
            "content": "http://purl.org/rss/1.0/modules/content/",
        }
        items = []
        for item in root.findall(".//item"):
            title = (item.findtext("title") or "").strip()
            link = (item.findtext("link") or "").strip()
            pub = (item.findtext("pubDate") or "").strip()
            creator = (item.findtext("dc:creator", default="", namespaces=ns) or "").strip()
            desc_raw = item.findtext("description") or ""
            content_raw = item.findtext("content:encoded", default="", namespaces=ns) or ""
            body_html = content_raw or desc_raw
            clean = re.sub(r"<[^>]+>", " ", body_html)
            clean = re.sub(r"\s+", " ", html_lib.unescape(clean)).strip()
            excerpt = clean[:400]
            iso = ""
            try:
                dt = datetime.strptime(pub[:25], "%a, %d %b %Y %H:%M:%S")
                iso = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
            except Exception:
                iso = pub
            items.append({
                "title": title,
                "url": link,
                "published_at": iso,
                "author": creator,
                "excerpt": excerpt,
                "body_html": body_html[:50000] if body_html else "",
            })
        weekly = [i for i in items if "week" in (i.get("title") or "").lower() or "digital finance" in (i.get("title") or "").lower()]
        latest = weekly[0] if weekly else (items[0] if items else None)
        if not latest:
            return None
        out = {
            "fetched_at": utc_now(),
            "latest_weekly": {
                "title": latest["title"],
                "url": latest["url"],
                "date": latest["published_at"],
                "excerpt": latest["excerpt"],
                "body_html": latest.get("body_html") or "",
            },
            "recent_weeklies": [
                {"title": i["title"], "url": i["url"], "date": i["published_at"]}
                for i in (weekly or items)[:8]
            ],
            "research_articles": [
                {"title": i["title"], "url": i["url"], "date": i["published_at"]}
                for i in items[:20]
            ],
            "substack_url": "https://research.artemis.ai/",
            "rss_feed": "https://research.artemis.ai/feed",
        }
        print(f"  ✓ artemis-newsletter: {latest['title'][:50]}")
        return out
    except Exception as e:
        print(f"  ⚠ Artemis RSS: {e}", file=sys.stderr)
        return None


def _nth_weekday(year: int, month: int, weekday: int, n: int) -> date:
    first = date(year, month, 1)
    days_ahead = (weekday - first.weekday()) % 7
    return first + timedelta(days=days_ahead + (n - 1) * 7)


def _last_weekday(year: int, month: int, weekday: int) -> date:
    if month == 12:
        last_day = date(year, 12, 31)
    else:
        last_day = date(year, month + 1, 1) - timedelta(days=1)
    days_back = (last_day.weekday() - weekday) % 7
    return last_day - timedelta(days=days_back)


def _weekday_in_range(start: date, end: date, wd: int) -> list[date]:
    result = []
    d = start
    while d.weekday() != wd:
        d += timedelta(days=1)
        if d > end:
            return result
    while d <= end:
        result.append(d)
        d += timedelta(days=7)
    return result


def build_macro_calendar() -> dict:
    ref = date.today()
    end = ref + timedelta(days=45)
    events: list[dict] = []

    def add(d: date, label: str, ccy: str, impact: str, country: str):
        if ref <= d <= end:
            events.append({
                "date": d.isoformat(),
                "label": label,
                "currency": ccy,
                "impact": impact,
                "country": country,
            })

    current = date(ref.year, ref.month, 1)
    while current <= end:
        y, m = current.year, current.month
        add(_nth_weekday(y, m, 4, 1), "US Non-Farm Payrolls", "USD", "high", "US")
        add(_nth_weekday(y, m, 2, 2), "US CPI (MoM)", "USD", "high", "US")
        add(_nth_weekday(y, m, 2, 2) + timedelta(days=2), "US PPI (MoM)", "USD", "medium", "US")
        retail = date(y, m, 15)
        if retail.weekday() >= 5:
            retail += timedelta(days=(7 - retail.weekday()))
        add(retail, "US Retail Sales (MoM)", "USD", "medium", "US")
        gdp = date(y, m, 27)
        if gdp.weekday() >= 5:
            gdp -= timedelta(days=gdp.weekday() - 4)
        add(gdp, "US GDP (QoQ advance)", "USD", "high", "US")
        add(_nth_weekday(y, m, 1, 4), "US ISM Manufacturing PMI", "USD", "medium", "US")
        add(_nth_weekday(y, m, 3, 3), "US ISM Services PMI", "USD", "medium", "US")
        add(_last_weekday(y, m, 1), "US Consumer Confidence", "USD", "medium", "US")
        add(_nth_weekday(y, m, 4, 3), "US Durable Goods Orders", "USD", "medium", "US")
        add(_nth_weekday(y, m, 3, 4), "US New Home Sales", "USD", "low", "US")
        add(_nth_weekday(y, m, 2, 4), "US Existing Home Sales", "USD", "low", "US")
        for thu in _weekday_in_range(ref, end, 3):
            add(thu, "US Initial Jobless Claims", "USD", "medium", "US")
        for wed in _weekday_in_range(ref, end, 2):
            if wed.day <= 7 or wed.day >= 22:
                add(wed, "US Treasury Auction", "USD", "low", "US")
        if m in (1, 3, 4, 6, 7, 9, 10, 12):
            add(_nth_weekday(y, m, 3, 2), "ECB Rate Decision", "EUR", "high", "EU")
        add(_nth_weekday(y, m, 4, 2), "EU CPI Flash (YoY)", "EUR", "high", "EU")
        add(_nth_weekday(y, m, 3, 3), "EU GDP (QoQ flash)", "EUR", "medium", "EU")
        add(_nth_weekday(y, m, 2, 4), "EU Industrial Production", "EUR", "low", "EU")
        add(_nth_weekday(y, m, 1, 2), "EU ZEW Economic Sentiment", "EUR", "medium", "EU")
        add(_nth_weekday(y, m, 2, 2), "EU Final CPI (YoY)", "EUR", "medium", "EU")
        ecb_speech = date(y, m, 15)
        if ecb_speech.weekday() >= 5:
            ecb_speech += timedelta(days=(7 - ecb_speech.weekday()))
        add(ecb_speech, "ECB Speech", "EUR", "medium", "EU")
        ifo = date(y, m, 25)
        if ifo.weekday() >= 5:
            ifo -= timedelta(days=ifo.weekday() - 4)
        add(ifo, "German Ifo Business Climate", "EUR", "medium", "DE")
        if m in (2, 3, 5, 6, 8, 9, 11, 12):
            add(_nth_weekday(y, m, 3, 3), "BoE Rate Decision", "GBP", "high", "UK")
        add(_nth_weekday(y, m, 2, 3), "UK CPI (YoY)", "GBP", "high", "UK")
        add(_nth_weekday(y, m, 4, 2), "UK GDP (MoM)", "GBP", "medium", "UK")
        add(_nth_weekday(y, m, 1, 3), "UK Unemployment Rate", "GBP", "medium", "UK")
        if m in (1, 3, 4, 6, 7, 9, 10, 12):
            add(_nth_weekday(y, m, 4, 3), "BoJ Rate Decision", "JPY", "high", "JP")
        add(_nth_weekday(y, m, 4, 3), "Japan CPI (YoY)", "JPY", "medium", "JP")
        add(_nth_weekday(y, m, 3, 2), "Japan GDP (QoQ)", "JPY", "medium", "JP")
        if m in (3, 6, 9, 12):
            add(_nth_weekday(y, m, 3, 3), "SNB Rate Decision", "CHF", "high", "CH")
        add(_nth_weekday(y, m, 2, 1), "Swiss CPI (YoY)", "CHF", "medium", "CH")
        add(_nth_weekday(y, m, 3, 1), "Swiss Unemployment Rate", "CHF", "medium", "CH")
        add(_nth_weekday(y, m, 1, 4), "Swiss Trade Balance", "CHF", "low", "CH")
        pboc = date(y, m, 20)
        if pboc.weekday() >= 5:
            pboc += timedelta(days=(7 - pboc.weekday()))
        add(pboc, "PBoC Loan Prime Rate", "CNY", "high", "CN")
        cn_cpi = date(y, m, 9)
        if cn_cpi.weekday() >= 5:
            cn_cpi += timedelta(days=(7 - cn_cpi.weekday()))
        add(cn_cpi, "China CPI (YoY)", "CNY", "medium", "CN")
        add(date(y, m, 15), "China Industrial Production", "CNY", "medium", "CN")
        add(_nth_weekday(y, m, 3, 4), "China Trade Balance", "CNY", "medium", "CN")
        current = date(y + 1, 1, 1) if m == 12 else date(y, m + 1, 1)

    for fomc in [
        date(2026, 1, 28), date(2026, 3, 18), date(2026, 5, 6),
        date(2026, 6, 17), date(2026, 7, 29), date(2026, 9, 16),
        date(2026, 11, 4), date(2026, 12, 16),
    ]:
        if ref <= fomc <= end:
            events.append({
                "date": fomc.isoformat(), "label": "FOMC Rate Decision",
                "currency": "USD", "impact": "high", "country": "US",
            })
            mins = fomc + timedelta(days=21)
            if mins <= end:
                events.append({
                    "date": mins.isoformat(), "label": "FOMC Meeting Minutes",
                    "currency": "USD", "impact": "medium", "country": "US",
                })

    seen = set()
    unique = []
    for e in events:
        k = (e["date"], e["label"])
        if k not in seen:
            seen.add(k)
            unique.append(e)
    unique.sort(key=lambda x: x["date"])
    upcoming = unique[:40]
    return {
        "updated": utc_now(),
        "period": f"{ref.isoformat()} → {end.isoformat()}",
        "events": upcoming,
    }


def merge_indices(prev: dict | None, fresh: dict) -> dict:
    out = {k: v for k, v in (prev or {}).items() if k != "updated_at" and isinstance(v, dict)}
    for k, v in fresh.items():
        if k == "updated_at":
            continue
        if isinstance(v, dict) and v:
            out[k] = v
    out["updated_at"] = fresh.get("updated_at") or utc_now()
    return out


def push_to_gh_pages(payloads: dict[str, str]) -> None:
    tmpdir = tempfile.mkdtemp(prefix="dv-refresh-")
    try:
        subprocess.run(
            ["git", "clone", "--depth", "1", "--branch", BRANCH, REPO, tmpdir],
            check=True,
            capture_output=True,
            timeout=90,
        )
        # Merge indices with tip
        if "indices.json" in payloads:
            tip = Path(tmpdir) / "data" / "indices.json"
            prev = None
            if tip.exists():
                try:
                    prev = json.loads(tip.read_text(encoding="utf-8"))
                except Exception:
                    prev = None
            fresh = json.loads(payloads["indices.json"])
            series = {k: v for k, v in fresh.items() if k != "updated_at"}
            merged = merge_indices(prev if isinstance(prev, dict) else None, {**series, "updated_at": fresh.get("updated_at")})
            payloads["indices.json"] = json.dumps(merged, indent=2)

        changed = []
        for name, content in payloads.items():
            dest = Path(tmpdir) / "data" / name
            dest.parent.mkdir(parents=True, exist_ok=True)
            old = dest.read_text(encoding="utf-8") if dest.exists() else None
            if old != content:
                dest.write_text(content, encoding="utf-8")
                changed.append(name)

        if not changed:
            print("  · no gh-pages changes")
            return

        git_email = os.environ.get("DASHBOARD_GIT_EMAIL", "noreply@deltav.cc")
        git_name = os.environ.get("DASHBOARD_GIT_NAME", "Delta V Bot")
        subprocess.run(["git", "-C", tmpdir, "config", "user.email", git_email], check=True)
        subprocess.run(["git", "-C", tmpdir, "config", "user.name", git_name], check=True)
        subprocess.run(
            ["git", "-C", tmpdir, "add"] + [f"data/{n}" for n in changed],
            check=True,
        )
        msg = f"data refresh: indices+forex+HF {time.strftime('%H:%M')}"
        subprocess.run(["git", "-C", tmpdir, "commit", "-m", msg], check=True)

        for attempt in range(3):
            try:
                subprocess.run(
                    ["git", "-C", tmpdir, "push", "--force-with-lease", "origin", BRANCH],
                    check=True,
                    capture_output=True,
                    timeout=60,
                )
                print(f"✓ pushed: {', '.join(changed)}")
                break
            except subprocess.CalledProcessError:
                if attempt >= 2:
                    print("  ⚠ push failed after retries", file=sys.stderr)
                    break
                subprocess.run(["git", "-C", tmpdir, "fetch", "origin", BRANCH], capture_output=True, timeout=30)
                subprocess.run(["git", "-C", tmpdir, "reset", "--soft", f"origin/{BRANCH}"], capture_output=True)
                for name in changed:
                    (Path(tmpdir) / "data" / name).write_text(payloads[name], encoding="utf-8")
                subprocess.run(["git", "-C", tmpdir, "add"] + [f"data/{n}" for n in changed], check=True)
                subprocess.run(
                    ["git", "-C", tmpdir, "commit", "-m", f"{msg} (retry {attempt+2})"],
                    capture_output=True,
                )

        PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
        for name in changed:
            (PUBLIC_DIR / name).write_text(payloads[name], encoding="utf-8")
    finally:
        shutil.rmtree(tmpdir, ignore_errors=True)


def main() -> int:
    print(f"refresh-data @ {utc_now()}")
    payloads: dict[str, str] = {}

    idx = build_indices()
    if idx:
        payloads["indices.json"] = json.dumps(idx, indent=2)

    gold = build_gold()
    if gold:
        payloads["gold.json"] = json.dumps(gold, indent=2)

    oil = build_oil()
    if oil:
        payloads["oil.json"] = json.dumps(oil, indent=2)

    us10y = build_us10y()
    if us10y:
        payloads["us10y.json"] = json.dumps(us10y, indent=2)

    forex = build_forex()
    if len(forex) > 1:
        payloads["forex.json"] = json.dumps(forex, indent=2)

    hf = build_hf()
    if hf.get("models") or hf.get("spaces"):
        payloads["hf.json"] = json.dumps(hf, indent=2)

    crypto = build_crypto()
    if crypto:
        payloads["crypto.json"] = json.dumps(crypto, indent=2)

    cnn = build_cnn_fg()
    if cnn:
        payloads["cnn-fg.json"] = json.dumps(cnn, indent=2)

    btc_trend = build_btc_trend()
    if btc_trend:
        payloads["btc-trend.json"] = json.dumps(btc_trend, indent=2)

    exvol = build_exchange_vol()
    if exvol:
        payloads["exchange-vol.json"] = json.dumps(exvol, indent=2)

    movers = build_top_movers()
    if movers:
        payloads["top-movers.json"] = json.dumps(movers, indent=2)

    artemis = build_artemis_newsletter()
    if artemis:
        payloads["artemis-newsletter.json"] = json.dumps(artemis, indent=2)

    cal = build_macro_calendar()
    payloads["macro-calendar.json"] = json.dumps(cal, indent=2)

    if not payloads:
        print("  ⚠ nothing fetched", file=sys.stderr)
        return 1

    spx = (json.loads(payloads.get("indices.json", "{}")).get("spx") or {}).get("price", "?")
    csi = (json.loads(payloads.get("indices.json", "{}")).get("csi") or {}).get("price", "?")
    print(
        f"✓ Data refreshed: SPX {spx} CSI {csi} | files={len(payloads)} | "
        f"Gold {bool(gold)} | Forex {len(forex)-1}p | HF {(hf or {}).get('models') and len(hf['models'])} | "
        f"CNN-FG {bool(cnn)} | MacroCal {len(cal.get('events') or [])}ev"
    )

    push_to_gh_pages(payloads)
    return 0


if __name__ == "__main__":
    sys.exit(main())
