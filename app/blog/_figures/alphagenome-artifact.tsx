import BlogFigure from './BlogFigure';

export function AlphaGenomeArtifactFigure() {
  return (
    <BlogFigure caption="Fig. 1 — Inference as an artifact: pay the compute once, freeze the answers, serve queries from dumb storage. Per-query metering dies; the publisher of the artifact owns access. Sources: Google DeepMind announcement (Sep 8, 2026); Forbes analysis (Sep 10, 2026).">
      <svg viewBox="0 0 920 250" role="img" aria-label="Precomputed inference: model run once into a petabyte artifact versus per-query metering" className="h-auto w-full min-w-[720px]">
        <defs>
          <marker id="aa1" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#93a1b5"/></marker>
        </defs>
        <g fontFamily="system-ui,sans-serif">
          <text x="230" y="30" textAnchor="middle" fontSize="13" fill="#e6ebf2" fontWeight="700">Per-query inference</text>
          <rect x="60" y="48" width="120" height="52" rx="10" fill="#121826" stroke="#ff7a90" strokeWidth="1.5"/>
          <text x="120" y="70" textAnchor="middle" fontSize="12" fill="#e6ebf2">researcher</text>
          <text x="120" y="68" textAnchor="middle" fontSize="10" fill="#93a1b5">millions of queries</text>
          <line x1="185" y1="74" x2="240" y2="74" stroke="#93a1b5" strokeWidth="1.5" markerEnd="url(#aa1)"/>
          <rect x="245" y="48" width="120" height="52" rx="10" fill="#121826" stroke="#ff7a90" strokeWidth="1.5"/>
          <text x="305" y="68" textAnchor="middle" fontSize="12" fill="#e6ebf2">GPUs</text>
          <text x="305" y="68" textAnchor="middle" fontSize="10" fill="#93a1b5">pay every time</text>
          <line x1="370" y1="74" x2="425" y2="74" stroke="#93a1b5" strokeWidth="1.5" markerEnd="url(#aa1)"/>
          <text x="500" y="78" textAnchor="middle" fontSize="12" fill="#ff7a90">meter runs forever</text>

          <text x="700" y="30" textAnchor="middle" fontSize="13" fill="#e6ebf2" fontWeight="700">Precomputed artifact</text>
          <line x1="560" y1="74" x2="615" y2="74" stroke="#93a1b5" strokeWidth="1.5" markerEnd="url(#aa1)"/>
          <rect x="620" y="48" width="110" height="52" rx="10" fill="#121826" stroke="#45d6a0" strokeWidth="1.5"/>
          <text x="675" y="68" textAnchor="middle" fontSize="12" fill="#e6ebf2">run once</text>
          <text x="675" y="86" textAnchor="middle" fontSize="10" fill="#93a1b5">compute paid up front</text>
          <line x1="735" y1="74" x2="790" y2="74" stroke="#93a1b5" strokeWidth="1.5" markerEnd="url(#aa1)"/>
          <rect x="795" y="48" width="105" height="52" rx="10" fill="#121826" stroke="#45d6a0" strokeWidth="2"/>
          <text x="847" y="68" textAnchor="middle" fontSize="12" fill="#45d6a0" fontWeight="700">1 PB</text>
          <text x="847" y="86" textAnchor="middle" fontSize="10" fill="#93a1b5">frozen answers</text>
          <line x1="847" y1="104" x2="847" y2="140" stroke="#45d6a0" strokeWidth="1.5" markerEnd="url(#aa1)"/>
          <rect x="700" y="145" width="200" height="44" rx="10" fill="#0b0e13" stroke="#223046"/>
          <text x="800" y="163" textAnchor="middle" fontSize="11" fill="#93a1b5">dumb storage serves</text>
          <text x="800" y="178" textAnchor="middle" fontSize="11" fill="#93a1b5">near-zero marginal cost</text>

          <line x1="40" y1="207" x2="898" y2="207" stroke="#223046" strokeWidth="1"/>
          <text x="60" y="228" fontSize="12" fill="#e6ebf2">The sovereignty clause:</text>
          <text x="228" y="228" fontSize="12" fill="#e6ebf2" fontWeight="600">whoever precomputes owns the answers.</text>
          <text x="560" y="228" fontSize="11" fill="#93a1b5">Who they are: DeepMind here. It could be you, pointed the other way.</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
