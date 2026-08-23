import BlogFigure from './BlogFigure';

export function OrnithLoopFigure() {
  return (
    <BlogFigure caption="Fig. 1 — The three-stage closed loop behind Ornith's self-improvement: the model writes its own curriculum. Invalid task → zero reward; difficulty tuned to current ability; novelty stays secondary.">
      <svg viewBox="0 0 920 320" role="img" aria-label="Ornith self-improvement loop: propose, scaffold, rollout, repeat" className="h-auto w-full min-w-[720px]">
        <defs>
          <marker id="aarr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#93a1b5"/></marker>
        </defs>
        <g fontFamily="system-ui,sans-serif" textAnchor="middle">
          <rect x="60" y="50" width="200" height="86" rx="12" fill="#161d29" stroke="#f5b642" strokeWidth="1.5"/>
          <text x="160" y="80" fill="#e6ebf2" fontSize="13" fontWeight="600">1 · Task proposal</text>
          <text x="160" y="102" fill="#93a1b5" fontSize="11">proposes harder tasks</text>
          <text x="160" y="120" fill="#93a1b5" fontSize="11">than it has solved</text>
          <rect x="360" y="50" width="200" height="86" rx="12" fill="#161d29" stroke="#f5b642" strokeWidth="1.5"/>
          <text x="460" y="80" fill="#e6ebf2" fontSize="13" fontWeight="600">2 · Scaffold generation</text>
          <text x="460" y="102" fill="#93a1b5" fontSize="11">builds the harness:</text>
          <text x="460" y="120" fill="#93a1b5" fontSize="11">tools · decomposition</text>
          <rect x="660" y="50" width="200" height="86" rx="12" fill="#161d29" stroke="#45d6a0" strokeWidth="1.5"/>
          <text x="760" y="80" fill="#e6ebf2" fontSize="13" fontWeight="600">3 · Solution rollout</text>
          <text x="760" y="102" fill="#93a1b5" fontSize="11">solves; reward flows</text>
          <text x="760" y="120" fill="#93a1b5" fontSize="11">back through all three</text>
          <line x1="260" y1="93" x2="356" y2="93" stroke="#93a1b5" strokeWidth="2" markerEnd="url(#aarr)"/>
          <line x1="560" y1="93" x2="656" y2="93" stroke="#93a1b5" strokeWidth="2" markerEnd="url(#aarr)"/>
          <path d="M760,136 L760,196 L160,196 L160,140" fill="none" stroke="#f5b642" strokeWidth="2" strokeDasharray="6 5" markerEnd="url(#aarr)"/>
          <text x="460" y="186" fill="#f5b642" fontSize="12">↺ loop: each cycle proposes harder tasks — the frontier moves with the policy</text>
        </g>
        <g fontFamily="system-ui,sans-serif">
          <text x="30" y="257" fill="#93a1b5" fontSize="11">Multiplicative task reward — run by gates, not vibes:</text>
        </g>
        <g fontFamily="system-ui,sans-serif" textAnchor="middle">
          <rect x="400" y="236" width="160" height="34" rx="8" fill="#161d29" stroke="#ff7a90"/>
          <text x="480" y="257" fill="#e6ebf2" fontSize="11" fontWeight="600">Validity — hard gate</text>
          <rect x="570" y="236" width="170" height="34" rx="8" fill="#161d29" stroke="#5cc8ff"/>
          <text x="655" y="257" fill="#e6ebf2" fontSize="11" fontWeight="600">Difficulty ~20% hit</text>
          <rect x="750" y="236" width="140" height="34" rx="8" fill="#161d29" stroke="#b48bff"/>
          <text x="820" y="257" fill="#e6ebf2" fontSize="11" fontWeight="600">Novelty — secondary</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
