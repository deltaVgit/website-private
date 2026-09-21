#!/usr/bin/env python3
"""
Generate RSS 2.0 feeds + OPML from the intel pipeline's raw-items.json and picks.json.
Feeds: master, picks, ai, crypto, cybersec, macro, hardware, science

Improved categorization: sharper keywords, title-weighting, source hints, noise filters.
"""
import json, re, os, sys, xml.etree.ElementTree as ET
from pathlib import Path
from xml.sax.saxutils import escape
from datetime import datetime, timezone
from collections import Counter

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _site_config import site_url

PUBLIC_DIR = "public"
DATA_DIR = os.path.join(PUBLIC_DIR, "data")
FEED_DIR = os.path.join(PUBLIC_DIR, "intelhub", "feed")

SITE_URL = site_url() or "https://deltavgit.github.io/website-private"

# Source-based category hints — if the source matches, boost that category
SOURCE_HINTS = {
    r"(?i)cryptoquant|lookonchain|glassnode|l2beat|defi|polymarket|coindesk|cointelegraph|theblock": "crypto",
    r"(?i)y combinator|hacker.?news|arxiv|researchgate|nature|sciencedaily": "science",
    r"(?i)nist|cisa|haveibeenpwned|bleepingcomputer|krebs|threatpost": "cybersec",
    r"(?i)federal.re?serve|treasury|imf|world.bank|bis|bloomberg|reuters|wsj|ft\\b|marketnews": "macro",
    r"(?i)nvidia|intel|amd|tsmc|semiconductor|hugging.?face": "hardware",
    r"(?i)anthropic|openai|deepmind|moonshot|baichuan|teknium|stepfun": "ai",
}

# Stopwords / noise filters — if title or summary contains these, heavily penalize
NOISE_PATTERNS = [
    r"(?i)\b(NBA|NFL|MLB|UFC|soccer|football|basketball|baseball|hockey|tennis|championship|playoff|super.?bowl)\b",
    r"(?i)\b(grammy|oscar|emmy|celebrity|kardashian|rihanna|beyonce|taylor.?swift)\b",
    r"(?i)\b(tiktok|instagram reel|youtube short)\b",
]

CATEGORIES = {
    "ai": {
        "keywords": [
            r"\bGPT\b", r"\bLLM\b", r"\btransformer\b", r"\bneural\b",
            r"\bdeep learning\b", r"\bmachine learning\b", r"\bHugging Face\b",
            r"\bagent\b", r"\binference\b", r"\bembedding\b",
            r"\btoken\b(?:izer)?", r"\bprompt\b", r"\bfine[ -]?tun\w+\b",
            r"\bRAG\b", r"\bvector database\b", r"\bmultimodal\b",
            r"\bdiffusion\b", r"\bGAN\b", r"\blora\b|\bqlora\b",
            r"\brlhf\b", r"\balignment\b", r"\bAI\b(?:[-\s]?safety)?",
            r"\bartificial intelligence\b", r"\bopenai\b", r"\banthropic\b",
            r"\bclaude\b", r"\bdeepseek\b", r"\bmistral\b", r"\bgemini\b",
            r"\bcohere\b", r"\bcopilot\b", r"\bchatbot\b",
            r"\breasoning\b", r"\bsora\b", r"\btransformer architecture\b",
            r"\battention mechanism\b", r"\bmodel card\b",
            r"\bfrontier model\b", r"\bfoundation model\b",
        ],
        "label": "AI",
    },
    "crypto": {
        "keywords": [
            r"\bBTC\b", r"\bETH\b", r"\bEthereum\b", r"\bBitcoin\b",
            r"\bDeFi\b", r"\bWeb3\b", r"\bblockchain\b", r"\bcrypto\b",
            r"\balgorithmic\b", r"\bL2\b", r"\brollup\b", r"\bZK\b",
            r"\bzero[ -]?knowledge\b", r"\bEVM\b", r"\bsolidity\b",
            r"\bsmart contract\b", r"\bdApp\b", r"\bNFT\b", r"\bDAO\b",
            r"\bDEX\b", r"\bliquidity\b", r"\bstaking\b", r"\byield\b",
            r"\bhashrate\b", r"\bconsensus\b", r"\bproof[ -]?of[ -]?\w+\b",
            r"\blayer[ .]?[12]\b", r"\bself[ -]?custody\b",
            r"\bnon[ -]?custodial\b", r"\bpolymarket\b", r"\bperp\b",
            r"\borderbook\b", r"\bvalidator\b", r"\bsolana\b",
            r"\bairdrop\b", r"\blending\b", r"\bborrow\b", r"\bswap\b",
            r"\bpool\b", r"\bfarm\b", r"\bCEX\b", r"\bmultisig\b",
            r"\btokenomics\b", r"\bTVL\b", r"\bMEV\b",
            r"\bcirculating supply\b", r"\bmarket cap\b",
        ],
        "label": "Crypto",
    },
    "cybersec": {
        "keywords": [
            r"\bCVE[- ]", r"\bexploit\b", r"\b0day\b", r"\bzero.day\b",
            r"\bpatch\b", r"\bmalware\b", r"\bransomware\b",
            r"\bphishing\b", r"\bbreach\b", r"\bvulnerability\b",
            r"\bOPSEC\b", r"\bopsec\b", r"\bprivacy\b",
            r"\bencryption\b", r"\bbackdoor\b",
            r"\bCISA\b", r"\bNVD\b", r"\bthreat intelligence\b",
            r"\bintrusion\b", r"\bpenetration test\b",
            r"\bred team\b", r"\bsupply chain attack\b",
            r"\bsandbox\b", r"\bhardening\b", r"\bfirewall\b",
            r"\binfosec\b", r"\bHIBP\b", r"\bpwned\b",
            r"\bSOC\b", r"\bincident response\b", r"\bC2\b",
            r"\bcredential stuffing\b", r"\bsocial engineering\b",
        ],
        "label": "Cybersec",
    },
    "macro": {
        "keywords": [
            r"\bFOMC\b", r"\binflation\b", r"\bGDP\b",
            r"\bcentral bank\b", r"\bFederal Reserve\b", r"\bFed\b",
            r"\bmonetary policy\b", r"\bfiscal policy\b",
            r"\bTreasury\b", r"\bbond\b", r"\byield curve\b",
            r"\bcommodit\w*\b", r"\bgold\b", r"\boil\b",
            r"\bforex\b", r"\bCPI\b", r"\bPPI\b",
            r"\bunemployment\b", r"\beconom\w*\b", r"\btariff\b",
            r"\bsanction\b", r"\binterest rate\b",
            r"\brecession\b", r"\bdebt ceiling\b",
            r"\bgeopolitic\w*\b", r"\btrade war\b",
        ],
        "label": "Macro",
    },
    "hardware": {
        "keywords": [
            r"\bGPU\b", r"\bCPU\b", r"\bchip\b",
            r"\bsemiconductor\b", r"\bTSMC\b",
            r"\bNVIDIA\b", r"\bAMD\b", r"\bIntel\b",
            r"\bASIC\b", r"\bfabrication\b", r"\bHBM\b",
            r"\bquantum\b", r"\bfoundry\b", r"\bwafer\b",
            r"\bnanometer\b", r"\bprocessor\b",
            r"\bDGX\b", r"\bdata center\b",
        ],
        "label": "Hardware",
    },
    "science": {
        "keywords": [
            r"\bnature\b", r"\bscience\b",
            r"\bresearch\b", r"\bstudy\b", r"\bexperiment\b",
            r"\bpeer[ -]?review\b", r"\bfusion\b",
            r"\bnuclear\b", r"\bphysics\b",
            r"\bbiotech\b", r"\bgene\b", r"\bprotein\b",
            r"\bDNA\b", r"\bclimate\b", r"\bICNIRP\b",
            r"\bbrain[ -]?computer\b", r"\bquantum\b",
            r"\bneuroscience\b", r"\bCRISPR\b",
            r"\bclinical trial\b", r"\bspace\b",
        ],
        "label": "Science",
    },
}

COMPILED = {}
for cat, rules in CATEGORIES.items():
    COMPILED[cat] = {
        "patterns": [re.compile(kw, re.IGNORECASE) for kw in rules["keywords"]],
        "label": rules["label"],
    }

SOURCE_COMPILED = {re.compile(src): cat for src, cat in SOURCE_HINTS.items()}
NOISE_COMPILED = [re.compile(p) for p in NOISE_PATTERNS]


def categorize_item(item, for_feed=True):
    """
    Score-based categorization with title-weighting and noise penalization.
    Returns list of category IDs (e.g., ['ai', 'crypto']).
    """
    title = (item.get("title", "") or "").strip()
    summary = (item.get("summary", "") or "").strip()
    source = (item.get("source", "") or "").strip()

    # Noise check — penalize heavily
    noise_penalty = 0
    combined_text_for_noise = f"{title} {summary}"
    for np in NOISE_COMPILED:
        if np.search(combined_text_for_noise):
            noise_penalty -= 5  # heavy penalty

    text = f"{title} {summary}"
    title_lower = title.lower()
    scores = {}

    for cat, rules in COMPILED.items():
        score = 0
        for p in rules["patterns"]:
            matches = list(p.finditer(text))
            if matches:
                # Count matches in title as double
                title_matches = sum(1 for m in matches if m.group() in title_lower or m.group().lower() in title_lower)
                summary_matches = len(matches) - title_matches
                score += (title_matches * 2) + summary_matches
        if score > 0:
            scores[cat] = score

    # Source-based boost
    for source_re, cat in SOURCE_COMPILED.items():
        if source_re.search(source):
            if cat in scores:
                scores[cat] += 2  # boost existing
            else:
                scores[cat] = 1  # minimal score to appear

    # Apply noise penalty
    if noise_penalty < 0:
        for cat in scores:
            scores[cat] += noise_penalty

    # Filter: must have at least 2 points (or 1 if source-boosted) and no negative scores
    min_threshold = 2
    result = [c for c, s in scores.items() if s >= min_threshold]

    # If no cat hit but we have a source hint, use it
    if not result:
        for source_re, cat in SOURCE_COMPILED.items():
            if source_re.search(source):
                return [cat]

    return result


def build_rss(items, title, desc, link):
    rss = ET.Element("rss", version="2.0", attrib={
        "xmlns:atom": "http://www.w3.org/2005/Atom",
        "xmlns:content": "http://purl.org/rss/1.0/modules/content/",
    })
    ch = ET.SubElement(rss, "channel")
    ET.SubElement(ch, "title").text = title
    ET.SubElement(ch, "link").text = link
    ET.SubElement(ch, "description").text = desc
    ET.SubElement(ch, "language").text = "en"
    ET.SubElement(ch, "lastBuildDate").text = datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
    atom_link = ET.SubElement(ch, "atom:link")
    atom_link.set("href", link)
    atom_link.set("rel", "self")
    atom_link.set("type", "application/rss+xml")

    for item in items[:30]:
        i = ET.SubElement(ch, "item")
        ET.SubElement(i, "title").text = item.get("title", "")[:200]
        pub = item.get("published_at", "")
        if not pub:
            pub = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        ET.SubElement(i, "pubDate").text = pub
        ET.SubElement(i, "link").text = item.get("url", link)[:500]
        ET.SubElement(i, "guid", isPermaLink="true").text = item.get("url", link)[:500]
        ET.SubElement(i, "source").text = item.get("source", "Delta V IntelHub")[:100]
        desc_text = item.get("summary", "")[:500].strip()
        if desc_text:
            ET.SubElement(i, "description").text = escape(desc_text[:500])
        cats = categorize_item(item)
        for cat in cats:
            cat_name = COMPILED[cat]["label"]
            ET.SubElement(i, "category").text = cat_name
    return ET.tostring(rss, encoding="unicode", xml_declaration=True)


def main():
    os.makedirs(FEED_DIR, exist_ok=True)

    # Load raw items
    raw_path = os.path.join(DATA_DIR, "raw-items.json")
    with open(raw_path) as f:
        raw = json.load(f)
    data = raw if isinstance(raw, list) else raw.get("items", [])

    # Load picks
    picks_path = os.path.join(DATA_DIR, "picks.json")
    picks_data = []
    if os.path.exists(picks_path):
        try:
            with open(picks_path) as f:
                picks_raw = json.load(f)
            picks_data = picks_raw if isinstance(picks_raw, list) else picks_raw.get("picks", [])
        except Exception:
            pass

    # Build category index
    cat_map = {}
    for item in data:
        cats = categorize_item(item)
        for c in cats:
            cat_map.setdefault(c, []).append(item)

    feed_configs = [
        ("rss.xml", "Delta V IntelHub — All Signals", "Curated intelligence feed from Delta V", data),
        ("picks.xml", "Delta V — Curated Picks", "Editor-selected intelligence picks", picks_data if picks_data else data[:10]),
    ]
    for cat_key in ["ai", "crypto", "cybersec", "macro", "hardware", "science"]:
        feed_name = f"{cat_key}.xml"
        items = cat_map.get(cat_key, [])
        title = f"Delta V IntelHub — {CATEGORIES[cat_key]['label']}"
        desc = f"{CATEGORIES[cat_key]['label']}-specific intelligence feed"
        feed_configs.append((feed_name, title, desc, items))

    for filename, title, desc, items in feed_configs:
        path = os.path.join(FEED_DIR, filename)
        xml = build_rss(items, title, desc, f"{SITE_URL}/intelhub/feed/{filename}")
        with open(path, "w", encoding="utf-8") as f:
            f.write(xml)
        print(f"  ✓ {filename}: {len(items)} items")

    # Build OPML
    opml = ET.Element("opml", version="2.0")
    head = ET.SubElement(opml, "head")
    ET.SubElement(head, "title").text = "Delta V IntelHub Feeds"
    body = ET.SubElement(opml, "body")
    for filename, title, _, _ in feed_configs:
        outline = ET.SubElement(body, "outline", attrib={
            "type": "rss",
            "text": title,
            "title": title,
            "xmlUrl": f"{SITE_URL}/intelhub/feed/{filename}",
        })
    opml_path = os.path.join(FEED_DIR, "feeds.opml")
    with open(opml_path, "w", encoding="utf-8") as f:
        f.write(ET.tostring(opml, encoding="unicode", xml_declaration=True))
    print(f"  ✓ feeds.opml ({len(feed_configs)} feeds)")


if __name__ == "__main__":
    main()
