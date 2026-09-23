import BlogFigure from './BlogFigure';

/* Harmonized palette (site tokens):
   cyan   = weight / measured  (30% pillars)
   lilac  = secondary weight   (20% pillars, partial coverage)
   green  = pass / covered
   amber  = partial / at risk
   red    = exposed
*/
const C = {
  cyan: 'var(--accent-cyan)',
  lilac: 'var(--accent-orange)',
  green: 'var(--accent-positive)',
  amber: 'var(--accent-effect, var(--accent-orange))',
  red: 'var(--accent-negative)',
  text: 'var(--text-primary)',
  sub: 'var(--text-secondary)',
  muted: 'var(--text-muted)',
  base: 'var(--bg-base)',
};

export function RealPillarsFigure() {
  const track = 720, w30 = 432, w20 = 288;
  const row = (y: number, name: string, sub: string, w: number, color: string, pct: string, inBar: boolean) => (
    <g key={name}>
      <text x="2" y={y} fill={C.text} fontSize="14" fontWeight="600">{name}</text>
      <rect x="0" y={y + 9} width={track} height="30" rx="7" fill={color} opacity="0.12" />
      <rect x="0" y={y + 9} width={w} height="30" rx="7" fill={color} opacity={pct === '30%' ? 1 : 0.75} />
      <text x={w - 12} y={y + 30} fontSize="13.5" fontWeight="700" textAnchor="end" fill={pct === '30%' ? C.base : C.text}>{pct}</text>
      <text x="8" y={y + 30} fontSize="11" fill={C.base} opacity="0.85">{sub}</text>
      {!inBar && null}
    </g>
  );
  return (
    <BlogFigure caption="Fig. 1 — The REAL ranking: longer bar = more weight. Reserves and Execution carry 60% between them; Activity and Liquidity share the rest. Unmeasurable pillars don't score zero — their weight shifts to what was measured. Sources: DefiLlama Research (Sep 22, 2026), defillama.com/exchanges/rank.">
      <svg viewBox="0 0 780 268" role="img" aria-label="REAL ranking pillars and weights" style={{ width: '100%', height: 'auto' }}>
        {row(16, 'Reserves', 'proof of held assets, on-chain or filed', w30, C.cyan, '30%', true)}
        {row(88, 'Execution', 'tick-level fills, all-in cost of a $10k order', w30, C.cyan, '30%', true)}
        {row(160, 'Activity', 'volume + open interest its own snapshots support', w20, C.lilac, '20%', true)}
        {row(232, 'Liquidity', 'resting order-book depth it observed — also 20%', 0, C.lilac, '', false)}
      </svg>
    </BlogFigure>
  );
}

export function TierMapFigure() {
  const scale = (v: number) => (v / 100) * 780;
  return (
    <BlogFigure caption="Fig. 2 — The 0–100 REAL score, September 2026 snapshot: one venue in S (Binance), one DEX in A (Hyperliquid). Everyone else clustered far left. Source: defillama.com/exchanges/rank (Sep 16, 2026 snapshot), via DefiLlama Research.">
      <svg viewBox="0 0 780 178" role="img" aria-label="REAL score scale with tiers" style={{ width: '100%', height: 'auto' }}>
        <rect x={scale(55)} y="24" width={scale(100) - scale(55)} height="66" rx="8" fill={C.cyan} opacity="0.06" />
        <rect x={scale(70)} y="24" width={scale(100) - scale(70)} height="66" rx="8" fill={C.lilac} opacity="0.18" />
        <rect x={scale(85)} y="24" width={scale(100) - scale(85)} height="66" rx="8" fill={C.cyan} opacity="0.2" />
        <text x={scale(56)} y="44" fontSize="12" fontWeight="600" fill={C.muted}>B · 55–69 — most of the pack</text>
        <text x={scale(71)} y="44" fontSize="12" fontWeight="600" fill={C.lilac}>A · 70+</text>
        <text x={scale(71)} y="60" fontSize="10.5" fill={C.sub}>Hyperliquid (only DEX)</text>
        <text x={scale(85.5)} y="44" fontSize="12" fontWeight="600" fill={C.cyan}>S · 85+</text>
        <text x={scale(86)} y="60" fontSize="10.5" fill={C.sub}>Binance (only)</text>
        <circle cx={scale(86)} cy="70" r="7" fill={C.cyan} />
        <text x={scale(86)} y="74" fontSize="9" fontWeight="800" textAnchor="middle" fill={C.base}>B</text>
        <circle cx={scale(72)} cy="70" r="7" fill={C.lilac} />
        <text x={scale(72)} y="74" fontSize="9" fontWeight="800" textAnchor="middle" fill={C.base}>H</text>
        <line x1="0" y1="102" x2="780" y2="102" stroke={C.sub} strokeWidth="1.5" opacity="0.4" />
        {[0, 25, 50, 70, 85, 100].map((v) => (
          <text key={v} x={scale(v)} y="120" fontSize="10.5" fill={C.muted} textAnchor={v === 0 ? 'start' : v === 100 ? 'end' : 'middle'} fontFamily="var(--font-mono)">{v}</text>
        ))}
        <text x="0" y="152" fontSize="11" fill={C.muted}>Every venue gets one dot on the scale; the colored zones are the tiers.</text>
        <text x="0" y="170" fontSize="11" fill={C.muted} opacity="0.7">87 vacancies in the top two tiers is the finding.</text>
      </svg>
    </BlogFigure>
  );
}

export function UtrFigure() {
  return (
    <BlogFigure caption="Fig. 3 — UTR multiplies Disclosure × Performance (each 0–10): perfect paperwork with a broken market scores like deep liquidity with missing disclosures. Grades AAA–CCC recalculate as liquidity, unlocks and market-maker conduct change on-chain. Sources: defillama.com/universal-token-rating · DefiLlama Research × Forgd (Aug 26, 2026).">
      <svg viewBox="0 0 780 150" role="img" aria-label="UTR score is the product of Disclosure and Performance" style={{ width: '100%', height: 'auto' }}>
        <g fontSize="13" fontWeight="600" fill={C.text}>
          <text x="0" y="30">Disclosure (D)</text>
          <text x="0" y="102">Performance (P)</text>
        </g>
        <g fontSize="11" fill={C.sub}>
          <text x="118" y="26">team, tokenomics, vesting, market makers, auditors</text>
          <text x="130" y="98">liquidity depth, spreads, MM adherence, on-chain delivery</text>
        </g>
        <rect x="96" y="36" width="216" height="12" rx="6" fill={C.cyan} opacity="0.75" />
        <rect x="96" y="106" width="216" height="12" rx="6" fill={C.cyan} opacity="0.75" />
        <text x="340" y="72" fontSize="26" fontFamily="var(--font-mono)" fill={C.text}>×</text>
        <rect x="380" y="42" width="130" height="44" rx="10" fill={C.lilac} opacity="0.18" stroke={C.lilac} strokeOpacity="0.4" />
        <text x="445" y="60" fontSize="11" fill={C.sub} textAnchor="middle">UTR = D × P</text>
        <text x="445" y="78" fontSize="13" fontWeight="700" fill={C.cyan} textAnchor="middle">0 – 100 · AAA→CCC</text>
        <text x="540" y="58" fontSize="11.5" fill={C.sub}>recalculates continuously —</text>
        <text x="540" y="76" fontSize="11.5" fill={C.sub}>unlocks, listings and market-maker</text>
        <text x="540" y="94" fontSize="11.5" fill={C.sub}>conduct feed in with no human in the loop</text>
      </svg>
    </BlogFigure>
  );
}

export function PrivacyLadderFigure() {
  const rows: Array<[string, string, string, string]> = [
    ['1 · Public observer', 'anyone reading the chain', 'link private', C.green],
    ['2 · Chain analyst', 'zachxbt-grade forensics', 'link private', C.green],
    ['3 · Network observer', 'IP-level watcher', 'link at risk', C.amber],
    ['4 · Privileged insider', 'RPC or wallet operator', 'link private', C.green],
    ['5 · Future adversary', 'someone who cracks the maths later', 'link at risk', C.amber],
  ];
  return (
    <BlogFigure caption="Fig. 4 — L2BEAT grades every privacy protocol against five adversaries, one row each: green = the deposit–withdrawal link stays hidden from that observer, amber = at risk. Tornado Cash shows the classic shape — strong on-chain, weaker on network metadata. Sources: l2beat.com/privacy/summary · Onchain privacy best practice (May 25, 2026).">
      <svg viewBox="0 0 780 250" role="img" aria-label="Privacy ladder, Tornado Cash example" style={{ width: '100%', height: 'auto' }}>
        <text x="2" y="20" fontSize="15" fontWeight="600" fill={C.text}>Tornado Cash (mixer pools)</text>
        {rows.map(([n, d, v, c], i) => (
          <g key={n}>
            <rect x="0" y={36 + i * 34} width="780" height="28" rx="6" fill={c} opacity={v.includes('private') ? 0.08 : 0.14} />
            <text x="8" y={54 + i * 34} fontSize="12.5" fill={C.text}>{n} <tspan fontSize="10.5" fill={C.muted}>— {d}</tspan></text>
            <text x="772" y={54 + i * 34} fontSize="12.5" fontWeight="700" fill={c} textAnchor="end">{v}</text>
          </g>
        ))}
        <text x="0" y="238" fontSize="11" fill={C.muted}>Railgun, Zama, Privacy Pools, Umbra and Fluidkey each get the same five-row grade card.</text>
      </svg>
    </BlogFigure>
  );
}

export function FeedMatrixFigure() {
  const feeds = ['DeFiScan', 'BlockAnalitica', 'Credora', 'Pharos', 'CuratorWatch', 'DeFiPunk\u2019d', 'LlamaRisk'];
  const protos = ['Aave', 'Lido', 'Uniswap', 'Spark', 'Morpho'];
  // 1 = covered, 0.5 = partial, 0 = none (sample rows for illustration)
  const cov = [
    [1, 1, 1, 0.5, 0.5, 1, 0.5],
    [1, 0.5, 0.5, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0.5, 1, 0, 0, 0],
    [0.5, 1, 1, 0.5, 1, 0.5, 0.5],
  ];
  const cell = (v: number) => (v === 1 ? C.green : v === 0.5 ? C.amber : 'rgba(237,237,237,0.07)');
  const op = (v: number) => (v === 1 ? 0.3 : v === 0.5 ? 0.25 : 1);
  return (
    <BlogFigure caption="Fig. 4 — Defi DNA, the tool the Ethereum Foundation commissioned cp0x to build: protocols down the side, risk feeds across the top, each cell showing that feed's own verdict — gaps shown as loudly as coverage. The app may render feeds verbatim but is forbidden from scoring them itself. Live feeds today: DeFiScan, Risklayer, Philidor. Sources: github.com/cp0x-org/defi-dna · defi-dna.xyz (Sep 21–22, 2026).">
      <svg viewBox="0 0 780 252" role="img" aria-label="Protocol-by-feed coverage matrix" style={{ width: '100%', height: 'auto' }}>
        <text x="2" y="16" fontSize="11.5" fontWeight="600" fill={C.sub}>20 top protocols × 8+ risk feeds — every cell shows the feed's verdict, verbatim (sample rows)</text>
        {feeds.map((f, i) => (
          <text key={f} x={178 + i * 88} y="40" fontSize="9.5" fontFamily="var(--font-mono)" fill={C.muted} textAnchor="middle">{f}</text>
        ))}
        {protos.map((p, r) => (
          <g key={p}>
            <text x="8" y={66 + r * 30} fontSize="12" fill={C.text}>{p}</text>
            {cov[r].map((v, i) => (
              <rect key={i} x={138 + i * 80} y={52 + r * 30} width="80" height="22" rx="5" fill={cell(v)} opacity={op(v)} />
            ))}
          </g>
        ))}
        <g fontSize="10.5">
          <rect x="138" y="212" width="10" height="10" rx="3" fill={C.green} opacity="0.35" />
          <text x="154" y="221" fill={C.sub}>covered</text>
          <rect x="216" y="212" width="10" height="10" rx="3" fill={C.amber} opacity="0.3" />
          <text x="232" y="221" fill={C.sub}>partial</text>
          <rect x="286" y="212" width="10" height="10" rx="3" fill="rgba(237,237,237,0.12)" />
          <text x="302" y="221" fill={C.sub}>not yet</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
