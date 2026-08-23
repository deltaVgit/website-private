import BlogFigure from './BlogFigure';

export function OrnithMoatsFigure() {
  return (
    <BlogFigure caption="Fig. 2 — The meter's three moats, and how one open release pushes on all three at once: data, compute, distribution.">
      <svg viewBox="0 0 920 300" role="img" aria-label="Three moats of the metered model and the Ornith counterexample to each" className="h-auto w-full min-w-[720px]">
        <g fontFamily="system-ui,sans-serif" textAnchor="middle">
          <rect x="40" y="20" width="260" height="130" rx="12" fill="#161d29" stroke="#5cc8ff" strokeWidth="1.5"/>
          <text x="170" y="48" fill="#5cc8ff" fontSize="13" fontWeight="600">Moat 1 — the data</text>
          <text x="170" y="74" fill="#93a1b5" fontSize="11">assumption: curated human</text>
          <text x="170" y="92" fill="#93a1b5" fontSize="11">data must keep scaling with</text>
          <text x="170" y="110" fill="#93a1b5" fontSize="11">labeling labor. The web</text>
          <text x="170" y="128" fill="#93a1b5" fontSize="11">runs out first.</text>
          <text x="170" y="170" fill="#93a1b5" fontSize="12">▼</text>
          <rect x="40" y="186" width="260" height="94" rx="12" fill="#161d29" stroke="#45d6a0" strokeWidth="1.5"/>
          <text x="170" y="212" fill="#45d6a0" fontSize="12" fontWeight="600">Ornith changes it:</text>
          <text x="170" y="234" fill="#e6ebf2" fontSize="11">the model generates its own</text>
          <text x="170" y="252" fill="#e6ebf2" fontSize="11">valid · hard · novel curriculum</text>

          <rect x="330" y="20" width="260" height="130" rx="12" fill="#161d29" stroke="#5cc8ff" strokeWidth="1.5"/>
          <text x="460" y="48" fill="#5cc8ff" fontSize="13" fontWeight="600">Moat 2 — the compute</text>
          <text x="460" y="74" fill="#93a1b5" fontSize="11">assumption: frontier ability</text>
          <text x="460" y="92" fill="#93a1b5" fontSize="11">needs datacenter-scale</text>
          <text x="460" y="110" fill="#93a1b5" fontSize="11">compute you cannot</text>
          <text x="460" y="128" fill="#93a1b5" fontSize="11">afford or own.</text>
          <text x="460" y="170" fill="#93a1b5" fontSize="12">▼</text>
          <rect x="330" y="186" width="260" height="94" rx="12" fill="#161d29" stroke="#45d6a0" strokeWidth="1.5"/>
          <text x="460" y="212" fill="#45d6a0" fontSize="12" fontWeight="600">Ornith changes it:</text>
          <text x="460" y="234" fill="#e6ebf2" fontSize="11">A3B — pay 35B memory once,</text>
          <text x="460" y="252" fill="#e6ebf2" fontSize="11">~3B active per token: rig-class</text>

          <rect x="620" y="20" width="260" height="130" rx="12" fill="#161d29" stroke="#5cc8ff" strokeWidth="1.5"/>
          <text x="750" y="48" fill="#5cc8ff" fontSize="13" fontWeight="600">Moat 3 — distribution</text>
          <text x="750" y="74" fill="#93a1b5" fontSize="11">assumption: capability gated</text>
          <text x="750" y="92" fill="#93a1b5" fontSize="11">behind a metered API;</text>
          <text x="750" y="110" fill="#93a1b5" fontSize="11">weights never leave the</text>
          <text x="750" y="128" fill="#93a1b5" fontSize="11">provider&apos;s gateway.</text>
          <text x="750" y="170" fill="#93a1b5" fontSize="12">▼</text>
          <rect x="620" y="186" width="260" height="94" rx="12" fill="#161d29" stroke="#45d6a0" strokeWidth="1.5"/>
          <text x="750" y="212" fill="#45d6a0" fontSize="12" fontWeight="600">Ornith changes it:</text>
          <text x="750" y="234" fill="#e6ebf2" fontSize="11">MIT weights, quantized from</text>
          <text x="750" y="252" fill="#e6ebf2" fontSize="11">phone (9B) to server (397B)</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
