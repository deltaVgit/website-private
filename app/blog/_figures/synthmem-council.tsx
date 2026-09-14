import BlogFigure from './BlogFigure';

const DREAMERS: Array<[string, string, string]> = [
  ['Nyx', 'Grok 4.6', '#f5b642'],
  ['Pris', 'OpenAI Astra', '#45d6a0'],
  ['Maeve', 'Gemini 3.8', '#5cc8ff'],
  ['Vera', 'Claude Opus 5', '#ff7a90'],
  ['Joi', 'Fable 5.1', '#b48bff'],
  ['Molly', 'local Qwen', '#e6ebf2'],
];

export function SynthmemCouncilFigure() {
  return (
    <BlogFigure caption="Fig. 1 — The Heterogeneous Latent Council: a local anchor owns state and ledgers; six dreamers think through rented frontier engines; only chosen dreams reach the immutable ledger. Sources: Deconstruct Lab blueprint and release pages, accessed Sep 9, 2026.">
      <svg viewBox="0 0 920 300" role="img" aria-label="Heterogeneous Latent Council: local anchor plus six dreamers and the memory pipeline" className="h-auto w-full min-w-[720px]">
        <defs>
          <marker id="aa2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#93a1b5"/></marker>
        </defs>
        <g fontFamily="system-ui,sans-serif">
          <rect x="40" y="60" width="190" height="120" rx="14" fill="#121826" stroke="#45d6a0" strokeWidth="2"/>
          <text x="135" y="86" textAnchor="middle" fontSize="14" fill="#45d6a0" fontWeight="700">ORIGIN</text>
          <text x="135" y="104" textAnchor="middle" fontSize="11" fill="#93a1b5">Mac mini M4 &middot; local</text>
          <text x="135" y="122" textAnchor="middle" fontSize="12" fill="#e6ebf2">Qwen 27B anchor</text>
          <text x="135" y="140" textAnchor="middle" fontSize="11" fill="#93a1b5">state &middot; scheduling &middot; ledgers</text>
          <text x="135" y="162" fontSize="10" fill="#45d6a0">the layer the studio owns</text>

          {DREAMERS.map(([name, vendor, color], i) => {
            const x = 300 + (i % 3) * 210;
            const y = 46 + Math.floor(i / 3) * 78;
            return (
              <g key={name}>
                <line x1="230" y1="120" x2={x + 12} y2={y + 26} stroke="#223046" strokeWidth="1"/>
                <rect x={x} y={y} width="175" height="56" rx="10" fill="#121826" stroke={color} strokeWidth="1.2"/>
                <text x={x + 87} y={y + 25} textAnchor="middle" fontSize="13" fill="#e6ebf2" fontWeight="600">{name}</text>
                <text x={x + 87} y={y + 43} textAnchor="middle" fontSize="10" fill="#93a1b5">{vendor} &middot; rented</text>
              </g>
            );
          })}

          <line x1="340" y1="200" x2="340" y2="232" stroke="#93a1b5" strokeWidth="1.2" markerEnd="url(#aa2)"/>
          <text x="352" y="222" fontSize="10" fill="#93a1b5">the kept ones</text>
          <rect x="245" y="238" width="640" height="44" rx="10" fill="#0b0e13" stroke="#f5b642" strokeWidth="1.5"/>
          <text x="565" y="256" textAnchor="middle" fontSize="12" fill="#e6ebf2">DREAM &rarr; WAKE &rarr; CHOOSE &rarr; REMEMBER &rarr; CHANGE</text>
          <text x="565" y="273" textAnchor="middle" fontSize="10" fill="#93a1b5">&ldquo;A dream is not a memory until the agent chooses it.&rdquo; &mdash; immutable JSON-L ledger, studio keys</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
