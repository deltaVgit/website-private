import BlogFigure from './BlogFigure';

export function FreetokenQSplitFigure() {
  return (
    <BlogFigure caption="Fig. 1 — One engine, opposite plans: FreeToken measures your machine's real PCIe-vs-CPU bandwidth and splits every step to match. Same GPU class, different best strategy.">
      <svg viewBox="0 0 920 270" role="img" aria-label="Two machines with the same GPU class get opposite expert-miss strategies" className="h-auto w-full min-w-[720px]">
        <g fontFamily="system-ui,sans-serif" textAnchor="middle">
          <rect x="40" y="24" width="400" height="196" rx="14" fill="none" stroke="#223046"/>
          <text x="240" y="54" fill="#f5b642" fontSize="13" fontWeight="700">GAMING DESKTOP · RTX 5090</text>
          <rect x="60" y="86" width="130" height="64" rx="10" fill="#161d29" stroke="#5cc8ff"/>
          <text x="125" y="112" fill="#e6ebf2" fontSize="12" fontWeight="600">GPU</text>
          <text x="125" y="130" fill="#93a1b5" fontSize="11">fast compute</text>
          <line x1="196" y1="118" x2="256" y2="118" stroke="#f5b642" strokeWidth="6"/>
          <path d="M256,111 L268,118 L256,125 Z" fill="#f5b642"/>
          <text x="228" y="102" fill="#f5b642" fontSize="11">PCIe</text>
          <rect x="270" y="86" width="150" height="64" rx="10" fill="#161d29" stroke="#b48bff"/>
          <text x="345" y="112" fill="#e6ebf2" fontSize="12" fontWeight="600">Expert weights</text>
          <text x="345" y="130" fill="#93a1b5" fontSize="11">in system RAM</text>
          <rect x="60" y="166" width="360" height="34" rx="8" fill="#161d29" stroke="#45d6a0"/>
          <text x="240" y="188" fill="#e6ebf2" fontSize="11">CPU computes only a few misses → most ride the wide PCIe path</text>

          <rect x="480" y="24" width="400" height="196" rx="14" fill="none" stroke="#223046"/>
          <text x="680" y="54" fill="#f5b642" fontSize="13" fontWeight="700">LAPTOP · 8 GB GPU</text>
          <rect x="500" y="86" width="130" height="64" rx="10" fill="#161d29" stroke="#5cc8ff"/>
          <text x="565" y="112" fill="#e6ebf2" fontSize="12" fontWeight="600">GPU</text>
          <text x="565" y="130" fill="#93a1b5" fontSize="11">fast compute</text>
          <line x1="636" y1="118" x2="686" y2="118" stroke="#f5b642" strokeWidth="2"/>
          <path d="M686,113 L698,118 L686,123 Z" fill="#f5b642"/>
          <text x="662" y="104" fill="#f5b642" fontSize="11">PCIe</text>
          <rect x="700" y="86" width="160" height="64" rx="10" fill="#161d29" stroke="#b48bff"/>
          <text x="780" y="112" fill="#e6ebf2" fontSize="12" fontWeight="600">Expert weights</text>
          <text x="780" y="130" fill="#93a1b5" fontSize="11">in system RAM</text>
          <rect x="500" y="160" width="360" height="46" rx="8" fill="#161d29" stroke="#45d6a0"/>
          <text x="680" y="179" fill="#e6ebf2" fontSize="11" fontWeight="600">CPU computes MOST misses</text>
          <text x="680" y="197" fill="#93a1b5" fontSize="11">the narrow pipe isn&apos;t worth it on this machine</text>
        </g>
        <text x="460" y="252" fill="#93a1b5" fontSize="12" fontFamily="system-ui,sans-serif" textAnchor="middle">Profiles your machine once — then splits every single step to match its real bandwidth. No fixed offloading mode.</text>
      </svg>
    </BlogFigure>
  );
}
