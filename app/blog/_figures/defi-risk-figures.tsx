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
    <BlogFigure caption="Fig. 1 — The REAL ranking: longer bar = more weight in the score. Source: DefiLlama Research, Sep 22 2026 · defillama.com/exchanges/rank">
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
  // Real scores: defillama.com/exchanges/rank, computed 2026-09-21 (61 venues scored).
  // Twig plot: every venue in S/A/B (22) + the C-band leaders, CEX=circle, DEX=diamond.
  return (
    <BlogFigure caption="Fig. 2 — 61 exchanges scored, Sep 21 2026. Every venue in S/A/B shown as a dot; the remaining 35 score 53 or less. Source: defillama.com/exchanges/rank">
      <svg viewBox="0 0 780 302" role="img" aria-label="REAL scores of the top 26 exchanges, September 2026" style={{ width: '100%', height: 'auto' }}>
        <rect x="312.0" y="33.0" width="117.0" height="205" rx="0" fill={C.muted} opacity="0.05" />
        <rect x="429.0" y="33.0" width="117.0" height="205" rx="0" fill={C.cyan} opacity="0.06" />
        <rect x="546.0" y="33.0" width="117.0" height="205" rx="0" fill={C.lilac} opacity="0.14" />
        <rect x="663.0" y="33.0" width="117.0" height="205" rx="0" fill={C.cyan} opacity="0.15" />
        <text x="319.8" y="25.0" fontSize="10.5" fill={C.muted}>C · 40–55</text>
        <text x="436.8" y="25.0" fontSize="10.5" fill={C.muted}>B · 55–69</text>
        <text x="553.8" y="25.0" fontSize="10.5" fill={C.lilac}>A · 70–84</text>
        <text x="670.8" y="25.0" fontSize="10.5" fontWeight="700" fill={C.cyan}>S · 85+</text>
        <text x="312.0" y="286" fontSize="9.5" fill={C.muted} textAnchor="middle" fontFamily="var(--font-mono)">40</text>
        <text x="429.0" y="286" fontSize="9.5" fill={C.muted} textAnchor="middle" fontFamily="var(--font-mono)">55</text>
        <text x="546.0" y="286" fontSize="9.5" fill={C.muted} textAnchor="middle" fontFamily="var(--font-mono)">70</text>
        <text x="663.0" y="286" fontSize="9.5" fill={C.muted} textAnchor="middle" fontFamily="var(--font-mono)">85</text>
        <text x="776.0" y="286" fontSize="9.5" fill={C.muted} textAnchor="end" fontFamily="var(--font-mono)">100</text>
        <text x="0" y="299" fontSize="9.5" fill={C.muted}>circle = CEX · diamond = DEX · left-to-right = rank order, height = REAL score</text>
      </svg>
    </BlogFigure>
  );
}

export function UtrFigure() {
  return (
    <BlogFigure caption="Fig. 3 — UTR is the product of two axes; grades AAA→CCC recalculate as the market moves. Source: defillama.com/universal-token-rating">
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
        <text x="540" y="70" fontSize="11.5" fill={C.sub}>recalculates with the market</text>
        <text x="540" y="88" fontSize="11.5" fill={C.sub}>— no human in the loop</text>
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
    <BlogFigure caption="Fig. 4 — Every privacy protocol is graded against five adversaries. Source: l2beat.com/privacy/summary">
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
  const feeds = ['DeFiScan', 'Philidor', 'Risklayer'];
  const protos = ['Aave', 'Lido', 'Uniswap', 'Spark', 'Morpho'];
  // 1 = covered, 0.5 = partial, 0 = none (sample rows for illustration)
  const cov = [
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, 1],
  ];
  const cell = (v: number) => (v === 1 ? C.green : v === 0.5 ? C.amber : 'rgba(237,237,237,0.07)');
  const op = (v: number) => (v === 1 ? 0.3 : v === 0.5 ? 0.25 : 1);
  return (
    <BlogFigure caption="Fig. 5 — Defi DNA: each cell shows what that feed says, untouched. Source: github.com/cp0x-org/defi-dna">
      <svg viewBox="0 0 780 246" role="img" aria-label="Protocol-by-feed coverage matrix" style={{ width: '100%', height: 'auto' }}>
        <text x="2" y="16" fontSize="11.5" fontWeight="600" fill={C.sub}>26 protocol versions × 3 live feeds — each cell shows that feed's data, verbatim (sample rows)</text>
        {feeds.map((f, i) => (
          <text key={f} x={268 + i * 160} y="40" fontSize="10" fontFamily="var(--font-mono)" fill={C.muted} textAnchor="middle">{f}</text>
        ))}
        {protos.map((p, r) => (
          <g key={p}>
            <text x="8" y={66 + r * 30} fontSize="12" fill={C.text}>{p}</text>
            {cov[r].map((v, i) => (
              <rect key={i} x={208 + i * 160} y={52 + r * 30} width="120" height="22" rx="5" fill={cell(v)} opacity={op(v)} />
            ))}
          </g>
        ))}
        <g fontSize="10.5">
          <rect x="208" y="226" width="9" height="9" rx="2.5" fill={C.green} opacity="0.35" />
          <text x="222" y="234" fill={C.sub}>covered</text>
          <rect x="276" y="226" width="9" height="9" rx="2.5" fill={C.amber} opacity="0.3" />
          <text x="290" y="234" fill={C.sub}>partial</text>
          <rect x="346" y="226" width="9" height="9" rx="2.5" fill="rgba(237,237,237,0.12)" />
          <text x="360" y="234" fill={C.sub}>not yet</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
