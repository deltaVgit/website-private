#!/usr/bin/env python3
"""
audit-dashboard-data.py — Scorecard for Macro / AI / Web3 data points (no Infosec).

Checks gh-pages SSOT used by IntelHub hooks. Exit 1 if any Class A/B FAIL.

  python3 scripts/audit-dashboard-data.py
  python3 scripts/audit-dashboard-data.py --json
"""
from __future__ import annotations

import argparse
import json
import ssl
import sys
import urllib.request
from datetime import datetime, timezone, date
from typing import Any

BASE = "https://deltavgit.github.io/website-private/data"
UA = "DeltaV-DashboardAudit/1.0"
ctx = ssl.create_default_context()

# field, file, class, required structure
CHECKS = [
    # Macro / shared
    ("indices", "indices.json", "A", {"keys": ["spx", "csi", "smi", "stoxx", "dax"]}),
    ("gold", "gold.json", "A", {"has": ["price"]}),
    ("oil", "oil.json", "A", {"has": ["price"]}),
    ("us10y", "us10y.json", "A", {"has": ["price"]}),
    ("crypto", "crypto.json", "A", {"has": ["btc_price"]}),
    ("forex", "forex.json", "A", {"keys": ["EUR", "JPY", "GBP"]}),
    ("cnn-fg", "cnn-fg.json", "A", {"has": ["value"]}),
    ("top-movers", "top-movers.json", "A", {"min_list": [("equities.gainers", 2), ("crypto.gainers", 2)]}),
    ("macro-calendar", "macro-calendar.json", "E", {"min_list": [("events", 5)]}),
    ("btc-trend", "btc-trend.json", "B", {"min_array": 30}),
    # Web3
    ("etf-flows", "etf-flows.json", "B", {"has": ["btc"]}),
    ("stables", "stables.json", "A", {"min_list": [("stablecoins", 3)]}),
    ("tvl-top", "tvl-top.json", "A", {"min_list": [("chains", 5)]}),
    ("chain-movers", "chain-movers.json", "A", {"min_list": [("gainers", 1)]}),
    ("exchange-vol", "exchange-vol.json", "B", {"has": ["exchanges"]}),
    ("dex-metrics", "dex-metrics.json", "B", {"has": ["weekly"]}),
    ("dex-matrix", "dex-matrix.json", "C", {"has": ["matrix"]}),
    ("bold-yields", "bold-yields.json", "C", {"has": ["headline"], "max_age_h": 72}),
    ("net-flows", "net-flows.json", "C", {"min_list": [("rows", 3)], "max_age_h": 96}),
    ("artemis-newsletter", "artemis-newsletter.json", "C", {"has": ["latest_weekly"], "max_age_h": 240}),
    # AI
    ("hf", "hf.json", "B", {"min_list": [("models", 1)]}),
    ("arena", "arena-leaderboard.json", "C", {"min_list": [("models", 5)], "max_age_h": 168}),
    ("raw-items", "raw-items.json", "D", {"min_array": 20}),
    # Feeds
    ("artemis-research", "artemis-research.json", "C", {"min_array": 5, "max_age_h": 240}),
]

DEFAULT_MAX_AGE = {"A": 36, "B": 36, "C": 168, "D": 36, "E": 72}


def fetch(name: str):
    req = urllib.request.Request(f"{BASE}/{name}", headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20, context=ctx) as r:
            raw = r.read()
            return json.loads(raw), len(raw), None
    except Exception as e:
        return None, 0, str(e)


def extract_stamp(d: Any) -> str | None:
    if isinstance(d, list):
        return None
    if not isinstance(d, dict):
        return None
    for k in ("updated_at", "updatedAt", "updated", "fetched_at", "asOf", "timestamp"):
        if d.get(k):
            return str(d[k])
    # nested
    for k in ("btc", "latest_weekly", "headline"):
        v = d.get(k)
        if isinstance(v, dict):
            for kk in ("updated_at", "date", "latest_date"):
                if v.get(kk):
                    return str(v[kk])
    return None


def parse_stamp(s: str | None) -> datetime | None:
    if not s:
        return None
    s = s.strip()
    for fmt in (
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%d",
    ):
        try:
            if fmt.endswith("%z") and s.endswith("Z"):
                s2 = s[:-1] + "+0000"
                return datetime.strptime(s2[:19] + "+0000", "%Y-%m-%dT%H:%M:%S%z")
            dt = datetime.strptime(s[:26].replace("Z", ""), fmt.replace("Z", "").replace("%z", ""))
            return dt.replace(tzinfo=timezone.utc)
        except Exception:
            continue
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


def age_hours(stamp: str | None) -> float | None:
    dt = parse_stamp(stamp)
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return (datetime.now(timezone.utc) - dt).total_seconds() / 3600


def grade_one(field: str, fname: str, cls: str, rules: dict) -> dict:
    data, nbytes, err = fetch(fname)
    row = {
        "field": field,
        "file": fname,
        "class": cls,
        "bytes": nbytes,
        "stamp": None,
        "age_h": None,
        "grade": "FAIL",
        "notes": "",
    }
    if err or data is None:
        row["notes"] = err or "empty"
        if "404" in (err or ""):
            row["grade"] = "404"
        return row

    stamp = extract_stamp(data)
    row["stamp"] = stamp
    row["age_h"] = age_hours(stamp)
    notes = []
    ok = True

    if "keys" in rules:
        for k in rules["keys"]:
            if not (isinstance(data, dict) and data.get(k)):
                ok = False
                notes.append(f"missing:{k}")
    if "has" in rules and isinstance(data, dict):
        for k in rules["has"]:
            if data.get(k) in (None, "", [], {}):
                ok = False
                notes.append(f"empty:{k}")
    if "min_list" in rules and isinstance(data, dict):
        for key, n in rules["min_list"]:
            # dotted paths (e.g. "equities.gainers") walk nested dicts
            walk = data
            for part in key.split("."):
                walk = walk.get(part) if isinstance(walk, dict) else None
                if walk is None:
                    break
            arr = walk or []
            if not isinstance(arr, list) or len(arr) < n:
                ok = False
                notes.append(f"{key}<{n}")
    if "min_array" in rules:
        if not isinstance(data, list) or len(data) < rules["min_array"]:
            ok = False
            notes.append(f"array<{rules['min_array']}")

    max_h = rules.get("max_age_h", DEFAULT_MAX_AGE.get(cls, 48))
    # Class D feed: check item dates for today-ish
    if cls == "D" and isinstance(data, list):
        today = date.today().isoformat()
        yest = (date.today().toordinal() - 1)
        # rough: any published string containing today's ISO or weekday chunk
        recent = 0
        for it in data[:200]:
            if not isinstance(it, dict):
                continue
            pub = str(it.get("published_at") or it.get("date") or "")
            if today in pub or pub.startswith(today[:8]):  # weak
                recent += 1
            elif "2026" in pub and today[5:] in pub:  # MM-DD
                recent += 1
        # also RFC like "Wed, 05 Au"
        day_num = f"{date.today().day:02d}"
        for it in data[:200]:
            if not isinstance(it, dict):
                continue
            pub = str(it.get("published_at") or "")
            if day_num in pub[:16] and ("Aug" in pub or "2026-08" in pub or today in pub):
                recent += 1
        if recent < 5:
            ok = False
            notes.append(f"feed_todayish={recent}")
        else:
            notes.append(f"feed_hits≈{recent}")
    elif cls != "E" and row["age_h"] is not None and row["age_h"] > max_h:
        ok = False
        notes.append(f"stale>{max_h}h")
    elif cls in ("A", "B") and row["age_h"] is None and stamp is None:
        # values present but no stamp — WARN not hard fail if structure ok
        if ok:
            notes.append("no_stamp")
            row["grade"] = "WARN"
            row["notes"] = "; ".join(notes)
            return row

    if ok:
        row["grade"] = "PASS"
    else:
        row["grade"] = "STALE" if any("stale" in n for n in notes) else "FAIL"
    row["notes"] = "; ".join(notes)
    return row


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    rows = [grade_one(*c) for c in CHECKS]
    fails = [r for r in rows if r["grade"] in ("FAIL", "404", "STALE")]
    warns = [r for r in rows if r["grade"] == "WARN"]

    if args.json:
        print(json.dumps({"rows": rows, "fail": len(fails), "warn": len(warns)}, indent=2))
    else:
        print(f"{'FIELD':22} {'CLS':3} {'GRADE':5} {'AGE_H':7} {'STAMP':28} NOTES")
        for r in rows:
            age = f"{r['age_h']:.1f}" if r["age_h"] is not None else "—"
            stamp = (r["stamp"] or "—")[:28]
            print(f"{r['field']:22} {r['class']:3} {r['grade']:5} {age:7} {stamp:28} {r['notes']}")
        print(f"\nPASS={sum(1 for r in rows if r['grade']=='PASS')} WARN={len(warns)} FAIL={len(fails)}")

    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
