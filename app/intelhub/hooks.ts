/* ================================================================
   IntelHub — Data fetching hooks (5-min auto-refresh)
   ================================================================ */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Item, PatentsData } from './types';

// Data JSON lives on the gh-pages branch (legacy Pages root).
// Mirror order matters: first-success-wins, so a stale-but-valid response
// freezes the whole view. raw.githubusercontent.com always serves git tip
// (~30s propagation, CORS-open); jsDelivr tracks tip within minutes;
// the github.io Pages CDN caches per-PoP up to hours after force-pushes,
// so it goes LAST — it once served Aug-23 snapshots for a full day while
// raw/jsDelivr were already fresh (observed 2026-08-24).
const DATA_MIRRORS = [
  'https://raw.githubusercontent.com/deltavgit/website-private/gh-pages',
  'https://cdn.jsdelivr.net/gh/deltavgit/website-private@gh-pages',
  'https://deltavgit.github.io/website-private',
] as const;
const DATA_BASE = DATA_MIRRORS[0]; // site asset base (HTML still on Pages)
const BASE = DATA_BASE;
/** First successful mirror wins; minute-bucket bust for sticky CDNs. */
const dataUrl = (path: string) => {
  const q = path.includes('?') ? '&' : '?';
  const bust = `${q}v=${Math.floor(Date.now() / 60_000)}`;
  // Used only as label; fetchJsonData tries all mirrors
  return `${DATA_MIRRORS[0]}${path}${bust}`;
};
const dataUrls = (path: string) => {
  const q = path.includes('?') ? '&' : '?';
  const bust = `${q}v=${Math.floor(Date.now() / 60_000)}`;
  return DATA_MIRRORS.map((m) => `${m}${path}${bust}`);
};

/* ---- Helpers ---- */
const CATS: { id: string; label: string; color: string; accent: string; bg: string; kw: string[] }[] = [
  { id: 'ai', label: 'AI/ML', color: 'border-l-blue-400', accent: 'text-blue-400', bg: 'bg-blue-500/5', kw: ['gpt', 'llm', 'transformer', 'neural', 'deep learning', 'machine learning', 'hugging face', 'agent', 'inference', 'embedding', 'prompt engineering', 'fine.tun', 'rag', 'vector database', 'multimodal', 'diffusion model', 'gan', 'lora', 'qlora', 'rlhf', 'ai alignment', 'artificial intelligence', 'openai', 'anthropic', 'claude', 'deepseek', 'mistral', 'gemini', 'cohere', 'copilot', 'chatbot', 'reasoning model', 'sora', 'attention mechanism', 'model card', 'frontier model', 'foundation model', 'large language model', 'mixture of experts', 'moe', 'text-to-image', 'text-to-video', 'image generation', 'speech recognition', 'whisper', 'wav2vec', 'tokenizer', 'quantization', 'gguf', 'onnx', 'safetensors', 'modeltraining', 'neurips', 'icml', 'iclr', 'cvpr'] },
  { id: 'crypto', label: 'Crypto', color: 'border-l-yellow-400', accent: 'text-yellow-400', bg: 'bg-yellow-500/5', kw: ['btc', 'eth', 'ethereum', 'bitcoin', 'defi', 'web3', 'blockchain', 'crypto', 'algorithmic', 'l2', 'rollup', 'zk', 'zero.knowledge', 'evm', 'solidity', 'smart contract', 'dapp', 'nft', 'dao', 'dex', 'liquidity', 'staking', 'yield', 'hashrate', 'consensus', 'proof.of', 'self.custody', 'non.custodial', 'perp', 'orderbook', 'validator', 'solana', 'airdrop', 'lending', 'borrow', 'swap', 'pool', 'farm', 'cex', 'multisig', 'tokenomics', 'tvl', 'mev', 'circulating supply', 'market cap'] },
  { id: 'cybersec', label: 'Cybersec', color: 'border-l-orange-400', accent: 'text-orange-400', bg: 'bg-orange-500/5', kw: ['cve', 'exploit', '0day', 'zero.day', 'patch', 'malware', 'ransomware', 'phishing', 'breach', 'vulnerability', 'opsec', 'privacy', 'encryption', 'backdoor', 'cisa', 'nvd', 'threat intelligence', 'intrusion', 'penetration test', 'red team', 'supply chain attack', 'sandbox', 'hardening', 'firewall', 'infosec', 'hibp', 'pwned', 'soc', 'incident response', 'c2', 'credential stuffing', 'social engineering'] },
  { id: 'macro', label: 'Macro', color: 'border-l-amber-400', accent: 'text-amber-400', bg: 'bg-amber-500/5', kw: ['fomc', 'inflation', 'gdp', 'central bank', 'federal reserve', 'fed', 'monetary policy', 'fiscal policy', 'treasury', 'bond', 'yield curve', 'commodit', 'gold', 'oil', 'forex', 'cpi', 'ppi', 'unemployment', 'econom', 'tariff', 'sanction', 'interest rate', 'recession', 'debt ceiling', 'geopolitic', 'trade war', 'policy', 'regulation', 'sovereign wealth', 'equity', 'stock market', 'dollar', 'yuan', 'euro', 'yen', 'cbdc', 'digital currency', 'war', 'conflict', 'military', 'defense', 'weapon', 'technology war', 'chip war', 'trade dispute', 'supply chain', 'reshoring', 'invention', 'breakthrough', 'discovery', 'innovation', 'r&d', 'patent', 'startup', 'fundraising', 'venture capital', 'ipo', 'merger', 'acquisition', 'big tech', 'apple', 'google', 'microsoft', 'amazon', 'meta', 'nvidia', 'ceo', 'executive', 'leadership', 'board', 'restructuring', 'layoff', 'energy market', 'copper', 'lithium', 'rare earth', 'imf', 'world bank', 'bis', 'ecb', 'pboc', 'bank of japan', 'stimulus', 'quantitative easing', 'balance sheet', 'credit', 'liquidity', 'sovereign debt'] },
  { id: 'hardware', label: 'Hardware', color: 'border-l-green-400', accent: 'text-green-400', bg: 'bg-green-500/5', kw: ['nvidia', 'intel', 'amd', 'tsmc', 'samsung foundry', 'micron', 'asml', 'qualcomm', 'broadcom', 'arm chip', 'gpu', 'cpu', 'npu', 'tpu', 'fpga', 'asic', 'soc', 'h100', 'a100', 'b200', 'gh200', 'mi300', 'semiconductor', 'transistor', 'foundry', 'lithography', 'fabrication', 'wafer', 'finfet', 'gaa', 'nanometer', 'chiplet', 'packaging', 'interposer', 'hbm', 'ddr5', 'pcie gen', 'cxl', 'hpc', 'datacenter', 'supercomputer', 'server farm', 'processor architecture', 'chip design', 'next-gen chip', 'tape-out', 'silicon photonics', 'quantum computing', 'quantum processor', 'qubit', 'photonic chip', 'spintronic', 'neuromorphic', 'computing cluster'] },
  { id: 'science', label: 'Science', color: 'border-l-violet-400', accent: 'text-violet-400', bg: 'bg-violet-500/5', kw: ['arxiv', 'nature', 'science', 'research', 'publication', 'study', 'biotech', 'genomics', 'crispr', 'quantum', 'fusion', 'nuclear', 'battery', 'solar', 'renewable', 'climate', 'protein', 'drug', 'clinical', 'trial', 'vaccine', 'biology', 'chemistry', 'physics', 'material'] },
];

const TC: Record<string, string> = {
  ai: 'bg-blue-500/15 text-blue-400',
  crypto: 'bg-yellow-500/15 text-yellow-400',
  cybersec: 'bg-orange-500/15 text-orange-400',
  macro: 'bg-amber-500/15 text-amber-400',
  hardware: 'bg-green-500/15 text-green-400',
  science: 'bg-violet-500/15 text-violet-400',
};
const BCOL: Record<string, string> = {
  ai: 'border-l-blue-500/40',
  crypto: 'border-l-yellow-500/40',
  cybersec: 'border-l-orange-500/40',
  macro: 'border-l-amber-500/40',
  hardware: 'border-l-green-500/40',
  science: 'border-l-violet-500/40',
};

const SOURCE_HINTS: Record<string, string[]> = {
  // ── Crypto / Web3 ──
  cryptoquant: ['crypto'], lookonchain: ['crypto'], glassnode: ['crypto'], l2beat: ['crypto'],
  defi: ['crypto'], coindesk: ['crypto'], cointelegraph: ['crypto'], theblock: ['crypto'],
  defillama: ['crypto'], santimentdata: ['crypto'], polymutex: ['crypto'],
  ki_young_ju: ['crypto'], nero_eth: ['crypto'], backthebunny: ['crypto'],
  zachxbt: ['crypto'], wublockchain: ['crypto'], messaricrypto: ['crypto'], spencernoon: ['crypto'],
  '0xngmi': ['crypto'], deficrimewatch: ['crypto'], bjnpck: ['crypto'], mzeller: ['crypto'],
  vitalikbuterin: ['crypto'], 'alexis_roussel': ['crypto'], senlummis: ['crypto'],
  // Cypherpunk / EVM core voices (Web3 CypherpunkFeed)
  timbeiko: ['crypto'], sassal0x: ['crypto'], lefterisjp: ['crypto'], hasufl: ['crypto'],
  gakonst: ['crypto'], bantg: ['crypto'], nicksdjohnson: ['crypto'], souptacular: ['crypto'],
  libevm: ['crypto'], peter_szilagyi: ['crypto'], karalabe: ['crypto'], drakefjustin: ['crypto'],
  ethereumjoseph: ['crypto'],
  // Artemis research + official X (not the wrong @artemis__ account)
  artemis: ['crypto', 'macro'], 'the defiant': ['crypto'], decrypt: ['crypto'], bankless: ['crypto'],
  // ── Science / Research ──
  'y combinator': ['science', 'ai'], 'hacker news': ['science', 'ai'], arxiv: ['ai'],
  nature: ['science'], sciencedaily: ['science'], lesswrong: ['ai', 'science'],
  // ── Cybersec ──
  nist: ['cybersec'], cisa: ['cybersec'], haveibeenpwned: ['cybersec'], bleepingcomputer: ['cybersec'],
  krebs: ['cybersec'], threatpost: ['cybersec'], 'dark reading': ['cybersec'],
  dinosn: ['cybersec'], pcaversaccio: ['cybersec'], cvenew: ['cybersec'], hypernativelabs: ['cybersec'],
  // ── Macro ──
  'federal reserve': ['macro'], treasury: ['macro'], imf: ['macro'], 'world bank': ['macro'], bis: ['macro'],
  bloomberg: ['macro'], reuters: ['macro'],
  michaeljburry: ['macro'], delphi_digital: ['crypto', 'macro'],
  marketnews_feed: ['macro'], snowden: ['cybersec', 'macro'],
  // ── Hardware / Chips / Physics ──
  nvidia: ['hardware'], intel: ['hardware'], amd: ['hardware'], tsmc: ['hardware'],
  samsung: ['hardware'], micron: ['hardware'], asml: ['hardware'], qualcomm: ['hardware'],
  broadcom: ['hardware'], 'arm holdings': ['hardware'], semiconductor: ['hardware'],
  // ── AI / ML ──
  'hugging face': ['ai'], huggingface: ['ai'],
  anthropic: ['ai'], anthropicai: ['ai'], openai: ['ai'], deepmind: ['ai'], googledeepmind: ['ai'],
  moonshot: ['ai'], baichuan: ['ai'], teknium: ['ai'], stepfun: ['ai'],
  'google research': ['ai'], googleai: ['ai'], 'meta ai': ['ai'], metaai: ['ai'],
  'stanford hai': ['ai'], 'alignment forum': ['ai'],
  'gwern': ['ai'], 'the batch': ['ai'],
  // X/Twitter — AI leaders & labs (full hedge roster — do not prune for low activity)
  sama: ['ai'], darioamodei: ['ai'], demishassabis: ['ai'], gdb: ['ai'], miramurati: ['ai'],
  ylecun: ['ai'], karpathy: ['ai'], clementdelangue: ['ai'],
  arthurmensch: ['ai'], aidangomez: ['ai'], emostaque: ['ai'],
  drjimfan: ['ai'], jimfan: ['ai'], elder_plinius: ['ai'], teknium1: ['ai'],
  xai: ['ai'], mistralai: ['ai'],
  lerobothf: ['ai'], alibaba_qwen: ['ai'], '01ai_yi': ['ai'],
  swyx: ['ai'], andrewyng: ['ai'], fchollet: ['ai'], jeremyphoward: ['ai'],
  hardmaru: ['ai'], sarahookr: ['ai'], osanseviero: ['ai'], prismml: ['ai'],
  bindureddy: ['ai'], alexandr_wang: ['ai'], ilyasut: ['ai'], nearcyan: ['ai'],
  levelsio: ['ai'], rasbt: ['ai'], nono2357: ['ai'], sciTechera: ['science', 'ai'],
};

// Hardware exclusion — items matching these patterns should never appear in Hardware box
const HW_EXCLUDE = ['anti-fraud', 'fraud detection', 'biology', 'biotech', 'dna sequenc', 'genome',
  'protein fold', 'cell therapy', 'gene therapy', 'neuron', 'brain scan', 'medical device',
  'drug discover', 'clinical trial', 'social media', 'font render', 'text-to-speech', 'tts',
  'language model', 'takeoff', 'deny ai', 'capital spent', 'overlooked corner of ai'];

function cleanTitle(t: string) {
  let cleaned = t.replace(/^RT\s+by\s+@\S+?:\s*/i, '').replace(/^RT\s+@\S+?:\s*/i, '');
  // Aggressively strip HTML tags, entities, and encoded content that leaks from RSS feeds
  cleaned = cleaned
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&[a-z]{2,6};/g, '')
    .replace(/&#?[a-z0-9]+;/gi, '');
  // MarketNews_Feed: strip $MACRO / $CRYPTO ticker hashtags from display
  cleaned = cleaned.replace(/\$[A-Z]{2,}/g, '').replace(/\s{2,}/g, ' ').trim();
  // Fix truncated <p> prefix from RSS feed stripping (e.g. "pPAYPAL:" → "PAYPAL:")
  cleaned = cleaned.replace(/^p([A-Z])/, '$1');
  return cleaned;
}

function cleanSummary(s: string) {
  if (!s) return s;
  // Aggressively strip all HTML/XML tags, entities, and encoded content
  return s
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&[a-z]{2,6};/g, '')
    .replace(/&#?[a-z0-9]+;/gi, '')
    // Fix common RSS truncation artifacts
    .replace(/^p([A-Z])/, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTag(title: string, summary?: string, source?: string): string {
  const txt = (title + ' ' + (summary || '')).toLowerCase();
  const titleLow = title.toLowerCase();
  const scores: Record<string, number> = {};
  for (const c of CATS) {
    let score = 0;
    for (const kw of c.kw) {
      const kwl = kw.toLowerCase().replace(/\./g, '');
      const rx = new RegExp('\\b' + kwl.replace(/\*/g, '\\w*') + '\\b', 'i');
      const matches = txt.match(rx);
      if (matches) {
        score += titleLow.includes(kwl) ? 2 : 1;
      }
    }
    if (score > 0) scores[c.id] = score;
  }
  if (source) {
    const srcLow = source.toLowerCase();
    for (const [hint, cats] of Object.entries(SOURCE_HINTS)) {
      if (srcLow.includes(hint)) {
        for (const cid of cats) {
          scores[cid] = (scores[cid] || 0) + 2;
        }
      }
    }
  }
  const noiseRX = /\b(nba|nfl|mlb|ufc|soccer|football|basketball|grammy|oscar|celebrity|kardashian|rihanna|tiktok|super bowl|olympics)\b/i;
  const noiseMatch = txt.match(noiseRX);
  const penalty = noiseMatch ? -5 : 0;
  let best = '';
  let bestScore = 1;  // lowered from 2 so SOURCE_HINTS-only items (score=2) get tagged
  for (const [cid, score] of Object.entries(scores)) {
    const adjusted = score + penalty;
    if (adjusted >= bestScore && adjusted >= 2) {
      if (best === '' || adjusted > bestScore || (adjusted === bestScore && ['macro', 'crypto', 'cybersec', 'ai'].indexOf(cid) < ['macro', 'crypto', 'cybersec', 'ai'].indexOf(best))) {
        best = cid; bestScore = adjusted;
      }
    }
  }
  return best;
}

const JHN = [/^Ask HN:/i, /^Tell HN:/i, /^Show HN:/i, /Who is hiring/i];
const DEAL_NOISE = /save \$|just \$|for just|combo deal|discount on|gaming build|motherboard review|send their pee|beer drinkers/i;
const XSOURCES = ['x:', 'nitter', 'twitter'];
function rel(it: { title: string; source: string }) {
  // Prediction markets deliberately excluded from IntelHub surfaces for now
  const src = (it.source || '').toLowerCase();
  if (src.includes('polymarket') || src.includes('kalshi') || src.includes('predictit')) return false;
  if (DEAL_NOISE.test(it.title || '')) return false;
  if (src.includes('hacker') || src.includes('y combinator'))
    return !JHN.some(p => p.test(it.title));
  return true;
}
function notTweet(it: { source: string }) { return !XSOURCES.some(s => it.source?.toLowerCase().includes(s)); }

// Proxy chain for cross-origin reads that need a relay (HF API, CISA KEV).
// proxy.hub.deltav.cc (a CF Worker custom domain) went NXDOMAIN on 2026-08-24
// and silently froze every dependent panel — never depend on one host again:
// try direct first (some sources are CORS-open), then the worker if it's
// ever revived, then a public CORS relay as last resort.
const WORKER_PROXY = 'https://proxy.hub.deltav.cc/?url=';
const PUBLIC_RELAY = 'https://corsproxy.io/?url=';
const proxy = (url: string) => `${PUBLIC_RELAY}${encodeURIComponent(url)}`;
const proxiedCandidates = (url: string): string[] => {
  const enc = encodeURIComponent(url);
  return [url, `${WORKER_PROXY}${enc}`, `${PUBLIC_RELAY}${enc}`];
};
/** fetchJson across the direct→worker→relay chain; first success wins. */
const fetchJsonProxied = async (url: string, ms = 8000): Promise<any | null> => {
  for (const u of proxiedCandidates(url)) {
    const d = await fetchJsonOnce(u, ms);
    if (d != null) return d;
  }
  return null;
};

/* ---- HF abliterated models (live fallback, AI tab only) ---- */
const ABLITERATED_SEARCH =
  'https://huggingface.co/api/models?search=abliterated&limit=40&full=true';

/** HF search result → dashboard row. Rank = blend of popularity (log downloads)
 *  and recentness (30-day half-life on lastModified). Keep in sync with
 *  scripts/collect-abliterated.py so snapshot and live fallback rank identically. */
function mapAbliterated(raw: any[]): any[] {
  const now = Date.now();
  const rows = (raw || [])
    .map((m: any) => {
      const id = m.id || m.modelId || m.name || '';
      const [author, ...rest] = String(id).split('/');
      const name = rest.join('/') || id;
      const last = m.lastModified || m.createdAt || null;
      return {
        id,
        name,
        author: author || '',
        likes: m.likes || 0,
        downloads: m.downloads || 0,
        url: `https://huggingface.co/${id}`,
        lastModified: last,
        daysAgo: last ? Math.max(0, Math.floor((now - new Date(last).getTime()) / 86400000)) : null,
      };
    })
    .filter((r) => r.id && r.id.includes('/'));
  if (!rows.length) return [];
  const maxPop = Math.max(1, ...rows.map((r) => Math.log10(r.downloads + 1)));
  return rows
    .map((r) => {
      const pop = Math.log10(r.downloads + 1) / maxPop;
      const rec = r.daysAgo == null ? 0.2 : 1 / (1 + r.daysAgo / 30);
      return { ...r, pop, rec, combo: 0.65 * pop + 0.35 * rec };
    })
    .sort((a, b) => b.combo - a.combo)
    .slice(0, 14);
}

// Fetch JSON with a hard timeout so a hanging host can never stall the dashboard.
// Returns null on any failure (timeout, network, non-2xx, bad JSON).
// One quick retry for transient CDN/network blips.
// For gh-pages data/* paths (any mirror URL), try jsDelivr → Pages → raw.
const fetchJsonOnce = async (url: string, ms: number): Promise<any | null> => {
  const sep = url.includes('?') ? '&' : '?';
  const bucket = Math.floor(Date.now() / 60000);
  const busted = `${url}${sep}_t=${bucket}`;
  try {
    const r = await fetch(busted, { signal: AbortSignal.timeout(ms) });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
};

const extractDataPath = (url: string): string | null => {
  // Normalize mirror URLs back to /data/...
  const markers = [
    '/website-private/data/',
    '@gh-pages/data/',
    '/gh-pages/data/',
    '/data/',
  ];
  for (const m of markers) {
    const i = url.indexOf(m);
    if (i >= 0) {
      const rest = url.slice(i + m.length - '/data/'.length); // keep /data/
      const path = rest.startsWith('/data/') ? rest : `/data/${rest}`;
      return path.split('?')[0];
    }
  }
  if (url.startsWith('/data/')) return url.split('?')[0];
  return null;
};

const fetchJson = async (url: string, ms = 8000): Promise<any | null> => {
  const dataPath = extractDataPath(url);
  const candidates = dataPath ? dataUrls(dataPath) : [url];
  for (const u of candidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const d = await fetchJsonOnce(u, ms);
      if (d != null) return d;
    }
  }
  return null;
};

/** Build VolumeChart weekly series from Llama totalDataChart [[ts, vol], ...]. */
function llamaChartToWeekly(chart: any): { week: string; curated: number; filtered: number; raw: number }[] {
  if (!Array.isArray(chart) || chart.length === 0) return [];
  const byWeek: Record<string, number> = {};
  for (const row of chart) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const ts = Number(row[0]);
    const vol = Number(row[1]) || 0;
    if (!Number.isFinite(ts) || vol <= 0) continue;
    const d = new Date(ts * (ts < 1e12 ? 1000 : 1));
    if (Number.isNaN(d.getTime())) continue;
    // ISO week label YYYY-Www
    const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const day = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const key = `${tmp.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
    byWeek[key] = (byWeek[key] || 0) + vol;
  }
  return Object.keys(byWeek)
    .sort()
    .map((week) => {
      const v = byWeek[week];
      return { week, curated: v, filtered: v, raw: v };
    });
}

/** Per-field load status for empty-slot debugging / stale chips */
export type FieldStatus = 'ok' | 'error' | 'empty';
type MetaMap = Record<string, { status: FieldStatus; at: string; note?: string }>;

const markMeta = (
  merge: (p: any) => void,
  key: string,
  status: FieldStatus,
  note?: string,
) => {
  merge({
    _meta: {
      [key]: { status, at: new Date().toISOString(), ...(note ? { note } : {}) },
    },
  });
};

const fetchText = async (url: string, ms = 10000): Promise<string | null> => {
  try {
    const sep = url.includes('?') ? '&' : '?';
    const bucket = Math.floor(Date.now() / 60000);
    const r = await fetch(`${url}${sep}_t=${bucket}`, { signal: AbortSignal.timeout(ms) });
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
};

/** Parse a minimal RSS 2.0 / Atom item list into IntelHub Item shape. */
function parseRssItems(xml: string, sourceLabel: string, limit = 20): Item[] {
  if (!xml) return [];
  const items: Item[] = [];
  // RSS <item>
  const blocks = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title = (block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1] || '')
      .replace(/<[^>]+>/g, '').trim();
    const link = (block.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1]
      || block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1]
      || '').trim();
    const pub = (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]
      || block.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i)?.[1]
      || '').trim();
    const desc = (block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1] || '')
      .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 280);
    if (!title || !link) continue;
    items.push({
      title,
      url: link,
      source: sourceLabel,
      published_at: pub ? new Date(pub).toISOString() : new Date().toISOString(),
      summary: desc,
      tag: 'ai',
    });
    if (items.length >= limit) break;
  }
  // Atom <entry> fallback
  if (!items.length) {
    const entries = xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
    for (const block of entries) {
      const title = (block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1] || '')
        .replace(/<[^>]+>/g, '').trim();
      const link = (block.match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || '').trim();
      const pub = (block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i)?.[1]
        || block.match(/<published[^>]*>([\s\S]*?)<\/published>/i)?.[1]
        || '').trim();
      const desc = (block.match(/<summary[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/summary>/i)?.[1] || '')
        .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 280);
      if (!title || !link) continue;
      items.push({
        title,
        url: link,
        source: sourceLabel,
        published_at: pub ? new Date(pub).toISOString() : new Date().toISOString(),
        summary: desc,
        tag: 'ai',
      });
      if (items.length >= limit) break;
    }
  }
  return items;
}

function chainNorm(name: string): string {
  return (name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Map common Llama naming variants so TVL / fees / matrix join cleanly. */
function chainAliases(name: string): string[] {
  const n = chainNorm(name);
  const aliases = new Set<string>([n]);
  if (n === 'bsc' || n === 'bnb' || n === 'binance' || n === 'binance smart chain') {
    ['bsc', 'bnb', 'binance', 'binance smart chain'].forEach((a) => aliases.add(a));
  }
  if (n === 'op mainnet' || n === 'optimism' || n === 'op') {
    ['op mainnet', 'optimism', 'op'].forEach((a) => aliases.add(a));
  }
  if (n === 'avalanche' || n === 'avalanche c' || n === 'avax') {
    ['avalanche', 'avalanche c', 'avax'].forEach((a) => aliases.add(a));
  }
  if (n === 'hyperliquid l1' || n === 'hyperliquid') {
    ['hyperliquid l1', 'hyperliquid'].forEach((a) => aliases.add(a));
  }
  if (n === 'ethereum' || n === 'eth') {
    ['ethereum', 'eth'].forEach((a) => aliases.add(a));
  }
  return [...aliases];
}

function feeLookup(feeMap: Record<string, { fees24h: number; feesChange1d?: number | null }>, chainName: string) {
  for (const a of chainAliases(chainName)) {
    if (feeMap[a]) return feeMap[a];
  }
  return null;
}

export function useIntelData(activeTab: string = 'macro') {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [patents, setPatents] = useState<PatentsData | null>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [dd, setDd] = useState<any>({});
  const [dd2, setDd2] = useState<any>(null);
  const [forex, setForex] = useState<any>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [infosecMeta, setInfosecMeta] = useState<{ source: 'live' | 'snapshot' | 'mixed' | 'empty'; updatedAt: string | null }>({
    source: 'empty',
    updatedAt: null,
  });
  const loadAll = useCallback(async () => {
    try {
      await Promise.allSettled([
        fetchJson(dataUrl('/data/raw-items.json')).then((d) => {
          if (Array.isArray(d)) {
            const tagged = d.map((x: any) => ({ ...x, title: cleanTitle(x.title || ''), summary: cleanSummary(x.summary || ''), tag: getTag(x.title || '', x.summary || '', x.source || '') })).filter(rel);
            // Deduplicate: same source + similar normalized title → keep first
            const seen = new Set<string>();
            const deduped = tagged.filter((it: any) => {
              const norm = (it.title || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
              const key = `${(it.source || '').toLowerCase()}|${norm}`;
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            setItems(deduped);
            setLastFetch(new Date());
          }
        }),
        fetchJson(dataUrl('/data/cybersec-watchlist.json')).then((wl) => {
          if (Array.isArray(wl)) {
            // Prefer non-expired; if all expired, still surface items so the panel is useful
            const now = Date.now();
            const active = wl.filter((x: any) => !x.expires || new Date(x.expires).getTime() > now);
            setWatchlist(active.length ? active : wl.slice(0, 8));
          }
        }),
        fetchJson(dataUrl('/data/patents.json')).then((d) => { if (d) setPatents(d); }),
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Tab-scoped static + light live fetches.
   * Macro must NOT pay DeFi Llama / dex / HF tax on first paint.
   */
  const loadLive = useCallback(async (tab: string = 'macro') => {
    // Each task fetches, transforms, and merges its own patch into `dd` the moment
    // it lands. Everything runs in parallel with per-fetch timeouts, so one slow or
    // hanging host can never keep the rest of the dashboard in a skeleton state.
    // Nested `_meta` patches are deep-merged so field statuses accumulate.
    const merge = (patch: any) => {
      if (!patch || Object.keys(patch).length === 0) return;
      setDd((prev: any) => {
        const next = { ...prev, ...patch };
        if (patch._meta && typeof patch._meta === 'object') {
          next._meta = { ...(prev._meta || {}), ...patch._meta };
        }
        return next;
      });
    };

    const loadField = async (key: string, url: string, apply: (d: any) => void, ms = 8000) => {
      const d = await fetchJson(url, ms);
      if (d) {
        apply(d);
        markMeta(merge, key, 'ok');
      } else {
        markMeta(merge, key, 'error', 'fetch failed');
      }
    };

    const staticTasks: Array<Promise<void>> = [];

    // ── Shared light market (Macro default + useful on Web3 banners) ──
    if (tab === 'macro' || tab === 'web3') {
      staticTasks.push(
        loadField('crypto', dataUrl('/data/crypto.json'), (d) => merge({ crypto: d })),
        loadField('btcTrend', dataUrl('/data/btc-trend.json'), (d) => merge({ btcTrend: d })),
      );
    }

    // ── Macro-only static ──
    if (tab === 'macro') {
      staticTasks.push(
        loadField('gold', dataUrl('/data/gold.json'), (d) => merge({ gold: d })),
        loadField('oil', dataUrl('/data/oil.json'), (d) => merge({ oil: d })),
        loadField('us10y', dataUrl('/data/us10y.json'), (d) => merge({ us10y: d })),
        (async () => {
          // Prefer the fullest payload among mirrors (Pages often sticks on SPX+CSI).
          const need = ['spx', 'csi', 'smi', 'stoxx', 'dax'] as const;
          let best: any = null;
          let bestScore = -1;
          await Promise.all(
            dataUrls('/data/indices.json').map(async (u) => {
              const d = await fetchJsonOnce(u, 8000);
              if (!d || typeof d !== 'object') return;
              const score = need.reduce((s, k) => s + (d[k] ? 1 : 0), 0);
              if (score > bestScore) {
                bestScore = score;
                best = d;
              }
            }),
          );
          if (best && bestScore > 0) {
            merge({ indices: best });
            const missing = need.filter((k) => !best[k]);
            if (missing.length) {
              markMeta(merge, 'indices', 'error', `partial — missing ${missing.join(',')}`);
            } else {
              markMeta(merge, 'indices', 'ok');
            }
          } else {
            markMeta(merge, 'indices', 'error', 'fetch failed');
          }
        })(),
        loadField('topMovers', dataUrl('/data/top-movers.json'), (d) => merge({ topMovers: d })),
        loadField('forex', dataUrl('/data/forex.json'), (d) => setForex((prev: any) => prev || d)),
        // TradFi F&G snapshot fallback when live feargreedchart fails
        loadField('cnnFg', dataUrl('/data/cnn-fg.json'), (d) => {
          if (d && typeof d.value === 'number') {
            merge({
              fearGreed: {
                score: d.value,
                rating: d.label || d.rating || '',
                date: d.updated_at || d.timestamp || '',
                source: d.source || 'snapshot',
              },
            });
            markMeta(merge, 'fearGreed', 'ok', 'snapshot');
          }
        }),
        loadField('macroCalendar', dataUrl('/data/macro-calendar.json'), (d) => merge({ macroCalendar: d })),
      );
    }

    // ── Web3-only static (snapshot-first; live Llama enhances in loadWeb3Live) ──
    if (tab === 'web3') {
      staticTasks.push(
        loadField('etfFlows', dataUrl('/data/etf-flows.json'), (d) => merge({ etfFlows: d })),
        loadField('netFlows', dataUrl('/data/net-flows.json'), (d) => merge({ netFlows: d })),
        loadField('boldYields', dataUrl('/data/bold-yields.json'), (d) => merge({ boldYields: d })),
        loadField('exchangeVol', dataUrl('/data/exchange-vol.json'), (d) => merge({ exchangeVol: d })),
        loadField('artemisNewsletter', dataUrl('/data/artemis-newsletter.json'), (d) => merge({ artemisNewsletter: d })),
        loadField('dexMatrix', dataUrl('/data/dex-matrix.json'), (d) => merge({ dexMatrix: d })),
        loadField('dexMetrics', dataUrl('/data/dex-metrics.json'), (d) => merge({ dexMetrics: d })),
        loadField('chainMovers', dataUrl('/data/chain-movers.json'), (d) => merge({ chainMovers: d })),
        // Snapshot-first so stables/TVL paint before Llama live
        loadField('stables', dataUrl('/data/stables.json'), (d) => {
          merge({
            stablecoins: d.stablecoins || d.stables || [],
            stablecoinChains: d.stablecoinChains || d.chains || [],
            stablesUpdatedAt: d.updated_at || null,
          });
        }),
        loadField('tvlTop', dataUrl('/data/tvl-top.json'), (d) => {
          const chains = d.chains || d.tvl || [];
          if (Array.isArray(chains) && chains.length) {
            merge({
              tvl: chains.map((c: any) => ({
                name: c.name,
                tvl: c.tvl,
                change_1d: c.change_1d ?? 0,
                fees24h: c.fees24h,
              })),
              tvlUpdatedAt: d.updated_at || null,
              dominance: chains.slice(0, 5).map((c: any) => {
                const total = chains.reduce((s: number, x: any) => s + (x.tvl || 0), 0) || 1;
                return { name: c.name, pct: `${((c.tvl / total) * 100).toFixed(1)}%`, tvl: c.tvl };
              }),
            });
          }
        }),
      );
    }

    // ── AI-only static ──
    if (tab === 'ai') {
      staticTasks.push(
        fetchJson(dataUrl('/data/hf.json')).then((d) => {
          if (d) {
            merge({
              ...(d.models ? { hfModels: d.models } : {}),
              ...(d.spaces ? { hfSpaces: d.spaces } : {}),
              hfUpdated: d.updated || null,
            });
          }
        }),
        fetchJson(dataUrl('/data/arena-leaderboard.json')).then((d) => {
          if (!d) return;
          const models = Array.isArray(d) ? d : (Array.isArray(d.models) ? d.models : []);
          merge({ arenaLB: models, arenaUpdated: d.updated || null });
        }),
        // HF abliterated models — 6h cron snapshot first (collect-abliterated.py),
        // live HF search as fallback so the panel never sits empty.
        (async () => {
          const snap = await fetchJson(dataUrl('/data/hf-abliterated.json'));
          const list = snap?.trending || snap?.models;
          if (snap && Array.isArray(list) && list.length > 0) {
            merge({
              abliterated: list,
              abliteratedByUse: snap.by_use || null,
              abliteratedAt: snap.updated || null,
            });
            return;
          }
          const live = await fetchJsonProxied(ABLITERATED_SEARCH);
          if (Array.isArray(live)) {
            merge({ abliterated: mapAbliterated(live), abliteratedAt: new Date().toISOString() });
          }
        })(),
        fetchJson(dataUrl('/data/ai-labs.json')).then((d) => {
          if (d && Array.isArray(d.items) && d.items.length) {
            merge({ aiLabsSnap: d.items, aiLabsUpdatedAt: d.updated || null });
          }
        }),
        fetchJson(dataUrl('/data/ai-personas.json')).then((d) => {
          if (d && Array.isArray(d.items) && d.items.length) {
            merge({ aiPersonasSnap: d.items, aiPersonasUpdatedAt: d.updated || null });
          }
        }),
      );
    }

    // ── Infosec snapshot for fast first paint (live refresh still on Infosec tab) ──
    if (tab === 'infosec') {
      staticTasks.push(
        fetchJson(dataUrl('/data/infosec.json')).then((d) => {
          if (!d) return;
          setDd2((prev: any) => {
            if (prev && (prev.kev?.length || prev.cves?.length || prev.breaches?.length)) return prev;
            return { kev: d.kev || [], cves: d.cves || [], breaches: d.breaches || [] };
          });
          setInfosecMeta((m) => m.source === 'live' || m.source === 'mixed' ? m : { source: 'snapshot', updatedAt: d.updatedAt || null });
        }),
      );
    }

    // ── Light live APIs only for tabs that display them ──
    const coreLive: Array<Promise<void>> = [];
    if (tab === 'macro') {
      coreLive.push(
        fetchJson('https://feargreedchart.com/api/?action=history').then((history) => {
          if (Array.isArray(history) && history.length > 0) {
            const latest = history[history.length - 1];
            const score = latest.score || 0;
            const rating = score <= 20 ? 'Extreme Fear' : score <= 40 ? 'Fear' : score <= 60 ? 'Neutral' : score <= 80 ? 'Greed' : 'Extreme Greed';
            merge({ fearGreed: { score, rating, date: latest.date, source: 'live' } });
            markMeta(merge, 'fearGreed', 'ok', 'live');
          } else {
            // Keep snapshot fearGreed if already merged — only mark meta
            markMeta(merge, 'fearGreed', 'error', 'live failed — using snapshot if any');
          }
        }),
      );
    }
    if (tab === 'web3' || tab === 'macro') {
      coreLive.push(
        fetchJson('https://api.alternative.me/fng/?limit=1').then((d) => {
          if (d) {
            merge({ cryptoFG: d });
            markMeta(merge, 'cryptoFG', 'ok');
          } else markMeta(merge, 'cryptoFG', 'error');
        }),
      );
    }
    // Llama TVL chain fan-out lives only in loadWeb3Live (Web3 tab) — not on Macro land.

    await Promise.allSettled([...staticTasks, ...coreLive]);
  }, []);

  /**
   * Heavy DeFi Llama suite — Web3 tab only (never Macro land).
   * Chain fees are fetched per-chain (global fees chart is protocol-level — that was a mismatch).
   * DEX×chain matrix is rebuilt live so static snapshots cannot go stale silently.
   */
  const loadWeb3Live = useCallback(async () => {
    const merge = (patch: any) => {
      if (!patch || Object.keys(patch).length === 0) return;
      setDd((prev: any) => {
        const next = { ...prev, ...patch };
        if (patch._meta && typeof patch._meta === 'object') {
          next._meta = { ...(prev._meta || {}), ...patch._meta };
        }
        return next;
      });
    };

    // 1) TVL + per-chain fees (joined)
    // Note: /v2/chains no longer exposes change_1d — derive from historicalChainTvl.
    // Snapshot tvl-top already painted; live overwrites on success only.
    const chains = await fetchJson('https://api.llama.fi/v2/chains', 12000);
    if (Array.isArray(chains)) {
      const sorted = chains.filter((c: any) => c.tvl > 0).sort((a: any, b: any) => b.tvl - a.tvl);
      const top = sorted.slice(0, 12);
      const total = sorted.reduce((s: number, c: any) => s + c.tvl, 0) || 1;

      // Per-chain fees — correct source (not protocol breakdown)
      const feeRows = await Promise.all(
        top.map(async (c: any) => {
          const d = await fetchJson(
            `https://api.llama.fi/overview/fees/${encodeURIComponent(c.name)}?dataType=dailyFees`,
            10000,
          );
          return {
            name: c.name,
            fees24h: Number(d?.total24h) || 0,
            feesChange1d: typeof d?.change_1d === 'number' ? d.change_1d : null,
          };
        }),
      );
      const feeMap: Record<string, { fees24h: number; feesChange1d?: number | null }> = {};
      for (const f of feeRows) {
        for (const a of chainAliases(f.name)) feeMap[a] = f;
      }

      // 1d TVL % from historical series (parallel)
      const changeByName: Record<string, number> = {};
      await Promise.all(
        top.map(async (c: any) => {
          if (typeof c.change_1d === 'number') {
            changeByName[c.name] = c.change_1d;
            return;
          }
          const hist = await fetchJson(
            `https://api.llama.fi/v2/historicalChainTvl/${encodeURIComponent(c.name)}`,
            10000,
          );
          if (Array.isArray(hist) && hist.length >= 2) {
            const prev = hist[hist.length - 2]?.tvl;
            const last = hist[hist.length - 1]?.tvl;
            if (prev > 0 && typeof last === 'number') {
              changeByName[c.name] = ((last - prev) / prev) * 100;
            }
          }
        }),
      );

      const tvl = top.map((c: any) => {
        const fee = feeLookup(feeMap, c.name);
        return {
          name: c.name,
          tvl: c.tvl,
          change_1d: changeByName[c.name] ?? c.change_1d ?? 0,
          change_7d: c.change_7d || 0,
          fees24h: fee?.fees24h || 0,
          feesChange1d: fee?.feesChange1d ?? null,
        };
      });

      merge({
        tvl,
        fees: feeRows.filter((f) => f.fees24h > 0).sort((a, b) => b.fees24h - a.fees24h),
        dominance: top.slice(0, 8).map((c: any) => ({
          name: c.name,
          pct: ((c.tvl / total) * 100).toFixed(1) + '%',
          tvl: c.tvl,
          fees24h: feeLookup(feeMap, c.name)?.fees24h || 0,
        })),
        tvlUpdatedAt: new Date().toISOString(),
      });
      markMeta(merge, 'tvl', 'ok', 'live');

      // 2) Live DEX × chain matrix from top chains by TVL (refresh every loadWeb3Live)
      const matrixChains = top.slice(0, 7).map((c: any) => c.name);
      const chainDex = await Promise.all(
        matrixChains.map(async (chain: string) => {
          const d = await fetchJson(
            `https://api.llama.fi/overview/dexs/${encodeURIComponent(chain)}?dataType=dailyVolume`,
            12000,
          );
          const protocols = ((d?.protocols || []) as any[])
            .map((p: any) => ({
              name: p.displayName || p.name || '?',
              volume24h: Number(p.total24h) || 0,
            }))
            .filter((p: any) => p.volume24h > 0)
            .sort((a: any, b: any) => b.volume24h - a.volume24h)
            .slice(0, 6);
          return {
            chain,
            total24h: Number(d?.total24h) || 0,
            change_1d: typeof d?.change_1d === 'number' ? d.change_1d : 0,
            protocols,
          };
        }),
      );

      const allProtocols: Record<string, { total_vol: number; chains: Record<string, number> }> = {};
      for (const cd of chainDex) {
        for (const p of cd.protocols) {
          if (!allProtocols[p.name]) allProtocols[p.name] = { total_vol: 0, chains: {} };
          allProtocols[p.name].chains[cd.chain] = p.volume24h;
          allProtocols[p.name].total_vol += p.volume24h;
        }
      }
      const matrix = Object.entries(allProtocols)
        .sort((a, b) => b[1].total_vol - a[1].total_vol)
        .slice(0, 12)
        .map(([protocol, data]) => {
          const row: any = { protocol, total_vol: data.total_vol };
          for (const chain of matrixChains) row[chain] = data.chains[chain] || 0;
          return row;
        });

      // Prefer live matrix when we got real volume; keep snapshot otherwise
      const liveVol = chainDex.reduce((s, c) => s + (c.total24h || 0), 0);
      if (matrix.length && liveVol > 0) {
        merge({
          dexMatrix: {
            updated_at: new Date().toISOString(),
            source: 'DeFiLlama (live per-chain DEX)',
            chains: chainDex.map((c) => ({
              chain: c.chain,
              total24h: c.total24h,
              change_1d: c.change_1d,
            })),
            matrix,
            live: true,
          },
        });
      }
    } else {
      // Keep tvl-top snapshot if present
      markMeta(merge, 'tvl', 'error', 'live Llama failed — snapshot retained if any');
    }

    // 3) Global DEX volume + stables (parallel)
    await Promise.allSettled([
      fetchJson('https://api.llama.fi/overview/dexs?dataType=dailyVolume').then((d) => {
        if (!d) return;
        const chartBd = d.totalDataChartBreakdown;
        const last = Array.isArray(chartBd) && chartBd.length > 0 ? chartBd[chartBd.length - 1] : null;
        // Prefer chain totals from allChains × last breakdown only if keys look like chains
        const bd = (last && last[1]) || d.breakdown24h || {};
        let volume = (d.allChains || []).slice(0, 10).map((n: string) => ({
          name: n,
          volume24h: typeof bd[n] === 'number' ? bd[n] : 0,
        })).filter((x: any) => x.volume24h > 0).sort((a: any, b: any) => b.volume24h - a.volume24h);
        // If breakdown is protocol-level (common), fall back to total24h only
        if (volume.length === 0 && d.total24h) {
          volume = (d.allChains || []).slice(0, 5).map((n: string) => ({ name: n, volume24h: 0 }));
        }

        // Fill VolumeChart + ChainVolumeBar when snapshot missing/stale
        const weekly = llamaChartToWeekly(d.totalDataChart);
        const chainBars = volume
          .filter((x: any) => x.volume24h > 0)
          .map((x: any) => ({
            chain: x.name,
            volume_24h: x.volume24h,
            delta_pct: 0,
          }));
        // Also try protocols top as chains if allChains empty
        if (!chainBars.length && Array.isArray(d.protocols)) {
          for (const p of d.protocols.slice(0, 12)) {
            const v = p.total24h || p.totalVolume24h || 0;
            if (v > 0) {
              chainBars.push({
                chain: p.displayName || p.name || '?',
                volume_24h: v,
                delta_pct: typeof p.change_1d === 'number' ? p.change_1d : 0,
              });
            }
          }
        }

        merge({
          totalVolume24h: d.total24h || 0,
          volume,
          dexDominance: volume,
          dexsUpdatedAt: new Date().toISOString(),
          ...(weekly.length
            ? {
                dexMetrics: {
                  updated_at: new Date().toISOString(),
                  source: 'DeFiLlama overview/dexs (live)',
                  weekly,
                  chains: chainBars,
                  live: true,
                },
              }
            : chainBars.length
              ? {
                  dexMetrics: {
                    updated_at: new Date().toISOString(),
                    source: 'DeFiLlama overview/dexs (live)',
                    weekly: [],
                    chains: chainBars,
                    live: true,
                  },
                }
              : {}),
        });
        if (weekly.length || chainBars.length) markMeta(merge, 'dexMetrics', 'ok', 'live');
      }),
      fetchJson('https://stablecoins.llama.fi/stablecoins?includePrices=false', 15000).then((d) => {
        if (!d) return;
        const peggedAssets = d.peggedAssets || [];
        const circOf = (s: any): number => {
          // Llama shapes vary: circulating.peggedUSD | circulating.current.peggedUSD | mcap
          const c = s?.circulating;
          if (typeof c === 'number') return c;
          if (c && typeof c.peggedUSD === 'number') return c.peggedUSD;
          if (c?.current && typeof c.current.peggedUSD === 'number') return c.current.peggedUSD;
          if (typeof s?.mcap === 'number') return s.mcap;
          return 0;
        };
        const chainMap: Record<string, number> = {};
        for (const s of peggedAssets) {
          const cc = s.chainCirculating || {};
          for (const [chain, data] of Object.entries(cc)) {
            const cd = data as any;
            const circ =
              cd?.circulating?.peggedUSD ??
              cd?.current?.circulating?.peggedUSD ??
              cd?.circulating?.current?.peggedUSD ??
              0;
            if (circ > 0) chainMap[chain] = (chainMap[chain] || 0) + circ;
          }
        }
        const stablecoinChains = Object.entries(chainMap)
          .map(([chain, circulating]) => ({ chain, circulating }))
          .filter((x: any) => x.circulating > 0)
          .sort((a: any, b: any) => b.circulating - a.circulating);
        const stablecoins = peggedAssets
          .map((s: any) => ({
            name: s.name || s.symbol,
            symbol: s.symbol,
            circulating: circOf(s),
          }))
          .filter((s: any) => s.circulating > 0)
          .sort((a: any, b: any) => b.circulating - a.circulating)
          .slice(0, 8);
        merge({
          stablecoins,
          stablecoinChains,
          stablesUpdatedAt: new Date().toISOString(),
        });
        markMeta(merge, 'stables', 'ok', 'live');
      }),
      // BOLD Stability Pool APYs — small chart endpoints (avoid full 11MB pools dump in browser)
      // Mirrors Liquity Dune board: https://dune.com/liquity/bold-yields
      (async () => {
        const SP: { id: string; collateral: string }[] = [
          { id: 'dac71f4f-7b97-463a-b19f-9796c56c21f1', collateral: 'wstETH' },
          { id: '326739f2-4650-4992-a8eb-a400e7790499', collateral: 'rETH' },
          { id: 'a635df9a-4cfc-4d17-86d0-934ea441e79f', collateral: 'WETH' },
        ];
        const EXTRA: { id: string; symbol: string; project: string }[] = [
          { id: '4c29f645-12db-461f-a1d7-16900d624271', symbol: 'YBOLD', project: 'yearn-finance' },
          { id: '755529b5-fcf4-4ef0-a7c7-e4f49376706f', symbol: 'BOLD-USDC', project: 'curve-dex' },
        ];
        const fetchLatest = async (poolId: string) => {
          const d = await fetchJson(`https://yields.llama.fi/chart/${poolId}`, 10000);
          const series = d?.data;
          if (!Array.isArray(series) || !series.length) return null;
          const last = series[series.length - 1];
          return {
            apy: typeof last.apy === 'number' ? last.apy : null,
            tvlUsd: typeof last.tvlUsd === 'number' ? last.tvlUsd : null,
          };
        };
        const spRows = await Promise.all(
          SP.map(async (s) => {
            const live = await fetchLatest(s.id);
            if (!live) return null;
            return {
              poolId: s.id,
              project: 'liquity-v2',
              symbol: 'BOLD',
              chain: 'Ethereum',
              collateral: s.collateral,
              kind: 'stability_pool',
              apy: live.apy,
              tvlUsd: live.tvlUsd,
              meta: `BOLD deposited in the ${s.collateral} Stability Pool`,
              url: `https://defillama.com/yields/pool/${s.id}`,
            };
          }),
        );
        const stability_pools = spRows.filter(Boolean) as any[];
        const venueRows = await Promise.all(
          EXTRA.map(async (s) => {
            const live = await fetchLatest(s.id);
            if (!live || !(live.apy && live.apy > 0)) return null;
            return {
              poolId: s.id,
              project: s.project,
              symbol: s.symbol,
              chain: 'Ethereum',
              kind: 'venue',
              apy: live.apy,
              tvlUsd: live.tvlUsd,
              url: `https://defillama.com/yields/pool/${s.id}`,
            };
          }),
        );
        const venues = venueRows.filter(Boolean) as any[];
        if (!stability_pools.length) return;
        const sp_tvl = stability_pools.reduce((s, r) => s + (r.tvlUsd || 0), 0);
        const weighted =
          sp_tvl > 0
            ? stability_pools.reduce((s, r) => s + (r.apy || 0) * (r.tvlUsd || 0), 0) / sp_tvl
            : null;
        merge({
          boldYields: {
            updated_at: new Date().toISOString(),
            source: 'DefiLlama Yields (Liquity V2 BOLD)',
            dune_dashboard: 'https://dune.com/liquity/bold-yields',
            docs: 'https://docs.liquity.org/v2-faq/bold-and-earn',
            headline: {
              weighted_stability_apy: weighted,
              stability_tvl_usd: sp_tvl,
              pool_count: stability_pools.length,
            },
            stability_pools,
            venues,
            live: true,
          },
        });
      })(),
    ]);
  }, []);

  /** External lab/research + blog RSS to fill AI social/research boxes. */
  const loadAIFeeds = useCallback(async () => {
    const merge = (patch: any) => {
      if (patch && Object.keys(patch).length > 0) setDd((prev: any) => ({ ...prev, ...patch }));
    };
    const feeds: { url: string; source: string; cap?: number }[] = [
      { url: 'https://rss.arxiv.org/rss/cs.AI', source: 'arXiv cs.AI', cap: 4 },
      { url: 'https://rss.arxiv.org/rss/cs.LG', source: 'arXiv cs.LG', cap: 3 },
      { url: 'https://huggingface.co/blog/feed.xml', source: 'Hugging Face Blog', cap: 4 },
      { url: 'https://openai.com/news/rss.xml', source: 'OpenAI', cap: 4 },
      { url: 'https://www.deepmind.com/blog/rss.xml', source: 'Google DeepMind', cap: 4 },
      { url: 'https://blog.google/technology/ai/rss/', source: 'Google AI Blog', cap: 3 },
      { url: 'https://blogs.nvidia.com/blog/category/deep-learning/feed/', source: 'NVIDIA AI', cap: 3 },
      { url: 'https://qwenlm.github.io/blog/index.xml', source: 'Qwen', cap: 4 },
      { url: 'https://blog.eleuther.ai/index.xml', source: 'EleutherAI', cap: 3 },
      { url: 'https://www.lesswrong.com/feed.xml?view=curated-rss', source: 'LessWrong', cap: 3 },
      { url: 'https://simonwillison.net/atom/everything/', source: 'Simon Willison', cap: 3 },
      { url: 'https://interconnects.ai/feed/', source: 'Interconnects', cap: 3 },
    ];
    const results = await Promise.allSettled(
      feeds.map(async (f) => {
        // Direct first (CORS-open sources), then worker, then public relay
        let xml = await fetchText(f.url, 10000);
        if (!xml) {
          for (const u of proxiedCandidates(f.url).slice(1)) {
            xml = await fetchText(u, 12000);
            if (xml) break;
          }
        }
        if (!xml) return [] as Item[];
        return parseRssItems(xml, f.source, f.cap || 4);
      }),
    );
    const labFeed: Item[] = [];
    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value)) labFeed.push(...r.value);
    }
    // Dedupe by title
    const seen = new Set<string>();
    const deduped = labFeed.filter((it) => {
      const k = (it.title || '').toLowerCase().slice(0, 80);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    }).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    if (deduped.length) merge({ aiLabFeed: deduped.slice(0, 40), aiFeedsUpdatedAt: new Date().toISOString() });
  }, []);

  const loadInfosec = useCallback(async () => {
    const result: any = { kev: [], cves: [], breaches: [] };
    let liveHits = 0;
    await Promise.allSettled([
      fetchJsonProxied('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json').then((d) => {
        if (d) {
          // Prefer recently added KEV; keep 12 for filtering in UI
          const sorted = [...(d.vulnerabilities || [])].sort((a: any, b: any) =>
            String(b.dateAdded || '').localeCompare(String(a.dateAdded || ''))
          );
          result.kev = sorted.slice(0, 12).map((v: any) => ({
            cve: v.cveID,
            product: v.product,
            vendor: v.vendorProject,
            name: v.vulnerabilityName,
            dateAdded: v.dateAdded,
            dueDate: v.dueDate,
            knownRansomware: v.knownRansomwareCampaignUse || '',
          }));
          if (result.kev.length) liveHits += 1;
        }
      }),
      fetchJsonProxied('https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=12').then((d) => {
        if (d) {
          result.cves = (d.vulnerabilities || []).map((v: any) => {
            const cve = v.cve || {};
            const m = cve.metrics?.cvssMetricV31?.[0]?.cvssData || cve.metrics?.cvssMetricV30?.[0]?.cvssData || {};
            const desc = (cve.descriptions || []).find((x: any) => x.lang === 'en');
            return { id: cve.id, severity: m.baseSeverity || 'N/A', score: m.baseScore || 0, description: (desc?.value || '').slice(0, 140), published: cve.published };
          });
          if (result.cves.length) liveHits += 1;
        }
      }),
      fetchJsonProxied('https://haveibeenpwned.com/api/v3/breaches').then((d) => {
        if (d) {
          const list = (Array.isArray(d) ? d : [])
            .slice()
            .sort((a: any, b: any) => String(b.BreachDate || '').localeCompare(String(a.BreachDate || '')))
            .slice(0, 12)
            .map((b: any) => ({
              name: b.Name || b.Title, domain: b.Domain, date: b.BreachDate, count: b.PwnCount, data: (b.DataClasses || []).slice(0, 5).join(', '),
            }));
          result.breaches = list;
          if (result.breaches.length) liveHits += 1;
        }
      }),
    ]);
    let snapUpdated: string | null = null;
    if (!result.kev.length || !result.cves.length || !result.breaches.length) {
      const c = await fetchJson(dataUrl('/data/infosec.json'));
      if (c) {
        snapUpdated = c.updatedAt || null;
        if (!result.kev.length) result.kev = c.kev || [];
        if (!result.cves.length) result.cves = c.cves || [];
        if (!result.breaches.length) result.breaches = c.breaches || [];
      }
    }
    setDd2(result);
    const source =
      liveHits === 3 ? 'live' :
      liveHits === 0 ? (result.kev.length || result.cves.length || result.breaches.length ? 'snapshot' : 'empty') :
      'mixed';
    setInfosecMeta({ source, updatedAt: snapUpdated || new Date().toISOString() });
  }, []);

  /** Live Yahoo forex — Macro tab only. Prefer static forex.json; use 1y range (not 10y) for p1M/p1Y. */
  const loadForex = useCallback(async () => {
    const pairs = [
      { symbol: 'EURUSD=X', label: 'EUR', usdLeft: true },
      { symbol: 'USDJPY=X', label: 'JPY' },
      { symbol: 'GBPUSD=X', label: 'GBP', usdLeft: true },
      { symbol: 'USDCHF=X', label: 'CHF' },
      { symbol: 'USDCNY=X', label: 'CNY' },
    ];
    try {
      const results: any = {};
      await Promise.allSettled(pairs.map(async (p) => {
        {
          // 1y daily ≪ 10y payload; enough for 1M + 1Y columns. p10Y stays from static if present.
          const d = await fetchJson(`https://query1.finance.yahoo.com/v8/finance/chart/${p.symbol}?interval=1d&range=1y`);
          if (d) {
            const meta = d?.chart?.result?.[0]?.meta;
            const quotes = d?.chart?.result?.[0]?.indicators?.quote?.[0];
            const timestamps = d?.chart?.result?.[0]?.timestamp;
            if (meta && quotes && timestamps) {
              const now = meta.regularMarketPrice;
              const closes = quotes.close.filter((c: any) => c !== null);
              const ts = timestamps.filter((_: any, i: number) => quotes.close[i] !== null);
              const findClose = (daysBack: number) => {
                const cutoff = (Date.now() / 1000) - (daysBack * 86400);
                for (let i = ts.length - 1; i >= 0; i--) {
                  if (ts[i] <= cutoff) return closes[i];
                }
                return closes[0];
              };
              const m1 = findClose(22);
              const y1 = findClose(252);
              const pct = (prev: number) => prev ? ((now - prev) / prev * 100) : null;
              results[p.label] = {
                rate: p.usdLeft ? (1 / now) : now,
                rateStr: p.usdLeft ? (1 / now).toFixed(4) : now.toFixed(2),
                chg: meta.regularMarketPrice - meta.previousClose,
                chgPct: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2) + '%',
                p1M: pct(m1), p1Y: pct(y1), p10Y: null as number | null,
              };
            }
          }
        }
      }));
      if (Object.keys(results).length > 0) {
        // Merge over static so p10Y from forex.json is preserved when live omits it
        setForex((prev: any) => {
          if (!prev || typeof prev !== 'object') return results;
          const out: any = { ...prev };
          for (const k of Object.keys(results)) {
            out[k] = { ...(prev[k] || {}), ...results[k], p10Y: results[k].p10Y ?? prev[k]?.p10Y ?? null };
          }
          return out;
        });
      }
    } catch { /* */ }
  }, []);

  // Shared feed always; tab-scoped snapshots + only the active tab's heavy path every 5 min
  useEffect(() => {
    const refresh = () => {
      loadAll();
      loadLive(activeTab);
      if (activeTab === 'macro') loadForex();
      // Refresh heavy path only for the tab that is currently open (not "once visited")
      if (activeTab === 'web3') loadWeb3Live();
      if (activeTab === 'infosec') loadInfosec();
      if (activeTab === 'ai') loadAIFeeds();
    };
    const refreshIfVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    refresh();
    const i = window.setInterval(refreshIfVisible, 5 * 60_000);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => { window.clearInterval(i); document.removeEventListener('visibilitychange', refreshIfVisible); };
  }, [activeTab, loadAll, loadLive, loadForex, loadWeb3Live, loadInfosec, loadAIFeeds]);

  /* ---- Derived ---- */
  // Category → tags that don't belong (e.g. macro box shouldn't show crypto-tagged items)
  const CAT_TAG_BLOCK: Record<string, string[]> = {
    macro: ['crypto', 'cybersec'],
    science: ['crypto', 'cybersec'],
    ai: ['crypto', 'cybersec'],
    hardware: ['crypto', 'cybersec', 'macro', 'science', 'ai'],
    crypto: ['cybersec', 'science'],
    cybersec: ['crypto', 'macro', 'science', 'hardware'],
  };
  // Word-boundary keyword matcher — prevents "asic" matching "basic"
  const kwMatch = (text: string, kw: string): boolean => {
    const kl = kw.toLowerCase().replace(/\./g, '');
    return new RegExp('\\b' + kl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(text);
  };
  // ── 7-day window ────────────────────────────────────────────────
  // News items must only surface the last 7 days. Dates arrive in mixed
  // formats (RFC-2822 "Tue, 14 Jul 2026 …" and ISO with a spaced offset
  // "2026-07-14T14:31:44 +0000"), so parse defensively.
  const RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
  const parseItemDate = (i: any): number => {
    const s = i.published_at || i.pubDate || i.date;
    if (!s) return 0;
    let t = new Date(s).getTime();
    if (!isNaN(t)) return t;
    t = new Date(String(s).replace(/ ([+-]\d{4})$/, '$1')).getTime();
    return isNaN(t) ? 0 : t;
  };
  const recentItems = items.filter((i: any) => {
    const t = parseItemDate(i);
    return t > 0 && Date.now() - t <= RECENT_WINDOW_MS;
  });

  const catBoxes = CATS.map(cat => ({
    ...cat,
    items: recentItems.filter(i => {
      const blockTags = CAT_TAG_BLOCK[cat.id] || [];
      if (i.tag && blockTags.includes(i.tag)) return false;
      // Hardware-specific exclusion: block items matching noise patterns
      if (cat.id === 'hardware') {
        const txt = (i.title + ' ' + (i.summary || '')).toLowerCase();
        if (HW_EXCLUDE.some(k => txt.includes(k))) return false;
      }
      // Exclude MarketNews_Feed from macro box — has its own dedicated ticker
      if (cat.id === 'macro') {
        const src = (i.source || '').toLowerCase();
        if (src.includes('marketnews_feed')) return false;
      }
      const txt = (i.title + ' ' + (i.summary || '')).toLowerCase();
      // Include if tagged as this category (catches AI leader tweets etc.)
      if (i.tag === cat.id) return true;
      // Include if content matches category keywords (word-boundary)
      return cat.kw.some(k => kwMatch(txt, k));
    }).slice(0, 15),
    count: 0,
  }));
  catBoxes.forEach(c => { c.count = c.items.length; });

  // TradFi F&G: {score, rating, date}
  const fgVal = (typeof dd?.fearGreed?.score === 'number') ? dd.fearGreed.score : 0;
  const fgLabel = dd?.fearGreed?.rating || '';
  // Crypto F&G: alternative.me format
  const cryptoFG = dd?.cryptoFG || {};
  const totalVol = dd?.totalVolume24h || 0;

  const macroCats = catBoxes.filter(c => ['macro', 'science'].includes(c.id));
  const infosecCats = catBoxes.filter(c => ['cybersec'].includes(c.id));
  const web3Cats = catBoxes.filter(c => ['crypto'].includes(c.id));
  const aiCats = catBoxes.filter(c => ['ai', 'hardware'].includes(c.id));

  const tabLabel = (t: string) => t === 'macro' ? 'Macro' : t === 'infosec' ? 'Infosec' : t === 'web3' ? 'Web3' : 'AI';
  const tabAccent = (t: string) => t === 'macro' ? 'text-amber-400' : t === 'infosec' ? 'text-orange-400' : t === 'web3' ? 'text-purple-400' : 'text-blue-400';
  const SOCMED_SOURCES = ['x: @dinosn', 'x: @pcaversaccio', 'x: @hypernativelabs'];

  const ts = (iso: string) => {
    try { return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };
  const ago = (iso: string) => {
    try {
      const m = (Date.now() - new Date(iso).getTime()) / 60000;
      return m < 1 ? 'now' : m < 60 ? `${Math.round(m)}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
    } catch { return ''; }
  };
  const isNew = (iso: string) => {
    try { return Date.now() - new Date(iso).getTime() < 3_600_000; } catch { return false; }
  };
  const fmt = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
    return `$${n.toFixed(2)}`;
  };
  const fmtN = (n: number) => {
    if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    return `${n}`;
  };

  return {
    items: recentItems, loading, patents, dd, dd2, forex, watchlist,
    catBoxes, macroCats, infosecCats, web3Cats, aiCats, fgVal, fgLabel, totalVol,
    tabAccent, tabLabel, ts, ago, isNew, fmt, fmtN, TC, BCOL, SOCMED_SOURCES, lastFetch,
    infosecMeta,
  };
}

export { CATS, TC, BCOL };
