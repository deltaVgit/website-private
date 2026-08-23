import BlogFigure from './BlogFigure';

export function FreetokenCacheFigure() {
  return (
    <BlogFigure caption="Fig. 2 — Semantic caching: when a coding agent edits its context (tool call, thinking block), FreeToken reuses checkpointed state instead of re-reading everything.">
      <svg viewBox="0 0 920 250" role="img" aria-label="Agent context edit: full recomputation versus semantic cache reuse" className="h-auto w-full min-w-[720px]">
        <defs>
          <marker id="farr1" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#ff7a90"/></marker>
          <marker id="farr2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#45d6a0"/></marker>
        </defs>
        <g fontFamily="system-ui,sans-serif" textAnchor="middle">
          <text x="230" y="40" fill="#ff7a90" fontSize="13" fontWeight="700">TYPICAL ENGINE</text>
          <rect x="50" y="60" width="90" height="46" rx="9" fill="#161d29" stroke="#223046"/>
          <text x="95" y="88" fill="#e6ebf2" fontSize="11">context</text>
          <rect x="150" y="60" width="90" height="46" rx="9" fill="#161d29" stroke="#223046"/>
          <text x="195" y="88" fill="#e6ebf2" fontSize="11">+ tool call</text>
          <line x1="140" y1="83" x2="148" y2="83" stroke="#93a1b5" strokeWidth="2"/>
          <rect x="50" y="130" width="190" height="44" rx="9" fill="none" stroke="#ff7a90" strokeDasharray="6 5"/>
          <text x="145" y="157" fill="#ff7a90" fontSize="12">re-reads EVERYTHING</text>
          <line x1="145" y1="110" x2="145" y2="126" stroke="#ff7a90" strokeWidth="2" markerEnd="url(#farr1)"/>
          <text x="145" y="200" fill="#93a1b5" fontSize="11">the &quot;wait while it re-thinks&quot; tax — every edit</text>

          <text x="690" y="40" fill="#45d6a0" fontSize="13" fontWeight="700">FREETOKEN</text>
          <rect x="480" y="60" width="90" height="46" rx="9" fill="#161d29" stroke="#223046"/>
          <text x="525" y="88" fill="#e6ebf2" fontSize="11">context</text>
          <rect x="580" y="60" width="90" height="46" rx="9" fill="#161d29" stroke="#45d6a0"/>
          <text x="625" y="88" fill="#e6ebf2" fontSize="11">checkpoint ★</text>
          <rect x="680" y="60" width="90" height="46" rx="9" fill="#161d29" stroke="#223046"/>
          <text x="725" y="88" fill="#e6ebf2" fontSize="11">new token</text>
          <line x1="570" y1="83" x2="578" y2="83" stroke="#93a1b5" strokeWidth="2"/>
          <line x1="670" y1="83" x2="678" y2="83" stroke="#93a1b5" strokeWidth="2"/>
          <path d="M625,106 C600,150 560,160 500,152" fill="none" stroke="#45d6a0" strokeWidth="2" strokeDasharray="6 5" markerEnd="url(#farr2)"/>
          <rect x="480" y="130" width="290" height="44" rx="9" fill="none" stroke="#45d6a0"/>
          <text x="625" y="157" fill="#45d6a0" fontSize="12">resumes from the last anchor</text>
          <text x="625" y="200" fill="#93a1b5" fontSize="11">only the new part gets computed</text>

          <text x="460" y="238" fill="#f5b642" fontSize="12">Long agent sessions stop re-paying the recomputation tax on every tool call.</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
