import BlogFigure from './BlogFigure';

export function FreetokenTiersFigure() {
  return (
    <BlogFigure caption="Fig. 3 — Pick your tier by the hardware you own. All numbers are the authors' self-report — treat as directional until you validate on your own machine.">
      <svg viewBox="0 0 920 240" role="img" aria-label="Three hardware tiers with model and speed per tier" className="h-auto w-full min-w-[720px]">
        <g fontFamily="system-ui,sans-serif" textAnchor="middle">
          <rect x="40" y="24" width="260" height="130" rx="12" fill="#161d29" stroke="#5cc8ff" strokeWidth="1.5"/>
          <text x="170" y="54" fill="#5cc8ff" fontSize="14" fontWeight="600">8 GB laptop GPU</text>
          <text x="170" y="82" fill="#e6ebf2" fontSize="12" fontWeight="600">Qwen3.6-35B-A3B</text>
          <text x="170" y="106" fill="#45d6a0" fontSize="16" fontWeight="700">~39 tok/s</text>
          <text x="170" y="132" fill="#93a1b5" fontSize="11">the laptop tier — genuinely usable</text>

          <rect x="330" y="24" width="260" height="130" rx="12" fill="#161d29" stroke="#f5b642" strokeWidth="1.5"/>
          <text x="460" y="54" fill="#f5b642" fontSize="14" fontWeight="600">RTX 5090 · 32 GB</text>
          <text x="460" y="82" fill="#e6ebf2" fontSize="12" fontWeight="600">DeepSeek-V4-Flash 284B ★</text>
          <text x="460" y="106" fill="#45d6a0" fontSize="16" fontWeight="700">22–25 tok/s</text>
          <text x="460" y="132" fill="#93a1b5" fontSize="11">frontier weights on a gaming rig ★ start here</text>

          <rect x="620" y="24" width="260" height="130" rx="12" fill="#161d29" stroke="#b48bff" strokeWidth="1.5"/>
          <text x="750" y="54" fill="#b48bff" fontSize="14" fontWeight="600">96 GB workstation</text>
          <text x="750" y="82" fill="#e6ebf2" fontSize="12" fontWeight="600">GLM-5.2 753B</text>
          <text x="750" y="106" fill="#45d6a0" fontSize="16" fontWeight="700">~15 tok/s</text>
          <text x="750" y="132" fill="#93a1b5" fontSize="11">datacenter-class, single card</text>

          <line x1="40" y1="182" x2="880" y2="182" stroke="#223046"/>
          <text x="40" y="206" fill="#93a1b5" fontSize="11" textAnchor="start">All figures are the paper&apos;s self-report — strong proof-of-concept, not independent benchmarks. NVIDIA RTX 30/40/50 today; AMD + macOS on the roadmap.</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
