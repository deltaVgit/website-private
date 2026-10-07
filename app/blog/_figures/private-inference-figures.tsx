import BlogFigure from './BlogFigure';

/* Private-inference figure set — palette follows the DeFi post convention:
   green = clears the bar / covered      amber = partial / conditional
   cyan  = measured / structural         red = exposed / do-not-buy
   All coordinates hand-set; overlap-audited. */

const C = {
  green: 'var(--accent-positive)',
  cyan: 'var(--accent-cyan)',
  amber: 'var(--accent-effect, var(--accent-orange))',
  red: 'var(--accent-negative)',
  text: 'var(--text-primary)',
  sub: 'var(--text-secondary)',
  muted: 'var(--text-muted)',
  base: 'var(--bg-base)',
};

/* FIG 1 - The tower: three rungs, arrows stack upward. */
export function PrivacyTowerFigure() {
  const rungs = [
    { y: 150, color: C.green, name: 'zkAPI - payment', sub: 'unlinkable bill (Oct 1, 2026)', score: 'identity 5' },
    { y: 96, color: C.amber, name: 'TEE-attested cloud', sub: 'content sealed, identity known', score: 'content 4' },
    { y: 42, color: C.cyan, name: 'Local inference', sub: 'nothing leaves the machine', score: 'all 5' },
  ];
  return (
    <BlogFigure caption="Fig. 1 - Stack from the bottom for full coverage: local first, zkAPI for frontier calls. Sources: EF blog Oct 1 2026, venice.ai, brave.com/blog/browser-ai-tee">
      <svg viewBox="0 0 780 240" width="100%" role="img" aria-label="Three-layer privacy tower">
        <text x="4" y="30" fill={C.muted} fontSize="11">who reads</text>
        <text x="4" y="46" fill={C.muted} fontSize="11">the prompt?</text>
        <text x="4" y="100" fill={C.muted} fontSize="11">who knows</text>
        <text x="4" y="116" fill={C.muted} fontSize="11">it was you?</text>
        <text x="4" y="170" fill={C.muted} fontSize="11">who bills</text>
        <text x="4" y="186" fill={C.muted} fontSize="11">you?</text>

        {rungs.map((r) => (
          <g key={r.name}>
            <rect x="120" y={r.y} width="620" height="44" rx="9" fill={r.color} opacity="0.14" />
            <rect x="120" y={r.y} width="6" height="44" rx="3" fill={r.color} />
            <text x="138" y={r.y + 19} fill={C.text} fontSize="14.5" fontWeight="700">{r.name}</text>
            <text x="138" y={r.y + 36} fill={C.sub} fontSize="11.5">{r.sub}</text>
            <text x="730" y={r.y + 28} fill={r.color} fontSize="12.5" fontWeight="700" textAnchor="end">{r.score}</text>
          </g>
        ))}
        <path d="M 762 196 L 762 60" stroke={C.muted} strokeWidth="1.4" fill="none" />
        <path d="M 756 68 L 762 56 L 768 68 z" fill={C.muted} />
        <text x="756" y="216" fill={C.muted} fontSize="10.5" textAnchor="end">stack up</text>
      </svg>
    </BlogFigure>
  );
}

/* FIG 2 - The scorecard: five approaches x five checks. */
export function PrivacyScorecardFigure() {
  const cols = ['Identity', 'Content', 'Network', 'Trust needed', 'Verifiable'];
  const rows: { name: string; cells: (number | string)[]; color: string }[] = [
    { name: 'Local', cells: [5, 5, 5, 'none', 5], color: C.green },
    { name: 'zkAPI', cells: [5, 1, 1, 'low', 5], color: C.green },
    { name: 'TEE-attested', cells: [2, 4, 1, 'moderate', 3], color: C.amber },
    { name: 'PCC / Confid. Inf.', cells: [2, 4, 2, 'high', 2], color: C.amber },
    { name: 'Policy-privacy', cells: [1, 1, 1, 'total', 1], color: C.red },
  ];
  const cellW = 96, rowH = 40, left = 200;
  return (
    <BlogFigure caption="Fig. 2 - Five checks, five approaches: 5 = no trust needed / fully verifiable by you. Green clears our bar; amber conditional; red is a posture.">
      <svg viewBox="0 0 780 300" width="100%" role="img" aria-label="Privacy scorecard matrix">
        {cols.map((c, i) => (
          <text key={c} x={left + i * cellW + (cellW - 8) / 2} y="26" fill={C.sub} fontSize="11.5" fontWeight="600" textAnchor="middle">{c}</text>
        ))}
        {rows.map((r, ri) => (
          <g key={r.name}>
            <text x="4" y={38 + ri * rowH + 24} fill={C.text} fontSize="13" fontWeight="600">{r.name}</text>
            {r.cells.map((v, ci) => {
              const num = typeof v === 'number';
              return (
                <g key={ci}>
                  <rect
                    x={left + ci * cellW}
                    y={38 + ri * rowH}
                    width={cellW - 8}
                    height={rowH - 10}
                    rx="6"
                    fill={r.color}
                    opacity={num ? (v as number) / 6 + 0.08 : 0.16}
                  />
                  <text
                    x={left + ci * cellW + (cellW - 8) / 2}
                    y={38 + ri * rowH + 22}
                    fill={C.text}
                    fontSize={num ? '13' : '10.5'}
                    fontWeight={num ? 700 : 500}
                    textAnchor="middle"
                  >
                    {num ? v : v}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </BlogFigure>
  );
}

/* FIG 3 - The do-not-buy list with the leak each option carries. */
export function DoNotBuyFigure() {
  const items = [
    { name: 'Policy-privacy chatbots', why: '"no log by default" = a settings page', color: C.red, mark: 'x' },
    { name: 'Gloss "anonymity"', why: 'proxy covers the hop, the bill names you', color: C.red, mark: 'x' },
    { name: 'Apple PCC / Google CI', why: 'great design, verifier is them', color: C.amber, mark: '!' },
    { name: 'TEE-attested (scoped)', why: 'content shield for a known identity', color: C.amber, mark: '!' },
  ];
  return (
    <BlogFigure caption="Fig. 3 - Where each option leaks, per its own docs. Amber = conditional pass, not one of the two rungs.">
      <svg viewBox="0 0 780 220" width="100%" role="img" aria-label="What we are not buying">
        {items.map((it, i) => (
          <g key={it.name}>
            <rect x="4" y={10 + i * 50} width="772" height="40" rx="9" fill={it.color} opacity="0.12" />
            <circle cx="30" cy={30 + i * 50} r="9.5" fill={it.color} opacity="0.8" />
            <text x="30" y={34.5 + i * 50} fill={C.base} fontSize="11.5" fontWeight="700" textAnchor="middle">{it.mark}</text>
            <text x="52" y={28 + i * 50} fill={C.text} fontSize="13.5" fontWeight="600">{it.name}</text>
            <text x="52" y={44 + i * 50} fill={C.sub} fontSize="11.5">{it.why}</text>
          </g>
        ))}
      </svg>
    </BlogFigure>
  );
}
