import BlogFigure from './BlogFigure';

export function QaiMechanismFigure() {
  return (
    <BlogFigure caption="Fig. 1 — The mechanism under the deal: coherent light bounces off facial skin; micron-scale muscle twitches shift the returning speckle; a model maps speckle to phonemes to intent. Source: patent family descriptions, Google Patents.">
      <svg viewBox="0 0 920 132" role="img" aria-label="Mechanism: infrared light reads skin speckle shifts and decodes silent speech" className="h-auto w-full min-w-[720px]">
        <defs>
          <marker id="arrm" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#93a1b5"/></marker>
        </defs>
        <g fontFamily="system-ui,sans-serif" textAnchor="middle">
          <rect x="60" y="26" width="150" height="64" rx="12" fill="#121826" stroke="#5cc8ff" strokeWidth="1.5"/>
          <text x="135" y="52" fontSize="14" fill="#e6ebf2" fontWeight="600">IR light</text>
          <text x="135" y="72" fontSize="11" fill="#93a1b5">coherent beam</text>
          <rect x="280" y="26" width="150" height="64" rx="12" fill="#121826" stroke="#5cc8ff" strokeWidth="1.5"/>
          <text x="355" y="52" fontSize="14" fill="#e6ebf2" fontWeight="600">skin speckle</text>
          <text x="355" y="72" fontSize="11" fill="#93a1b5">shifts as muscles move</text>
          <rect x="500" y="26" width="150" height="64" rx="12" fill="#121826" stroke="#f5b642" strokeWidth="1.5"/>
          <text x="575" y="52" fontSize="14" fill="#e6ebf2" fontWeight="600">phonemes</text>
          <text x="575" y="72" fontSize="11" fill="#93a1b5">microns to words</text>
          <rect x="720" y="26" width="150" height="64" rx="12" fill="#121826" stroke="#f5b642" strokeWidth="1.5"/>
          <text x="795" y="52" fontSize="14" fill="#e6ebf2" fontWeight="600">intent</text>
          <text x="795" y="72" fontSize="11" fill="#93a1b5">before sound</text>
          <line x1="215" y1="58" x2="272" y2="58" stroke="#93a1b5" strokeWidth="1.5" markerEnd="url(#arrm)"/>
          <line x1="435" y1="58" x2="492" y2="58" stroke="#93a1b5" strokeWidth="1.5" markerEnd="url(#arrm)"/>
          <line x1="655" y1="58" x2="712" y2="58" stroke="#93a1b5" strokeWidth="1.5" markerEnd="url(#arrm)"/>
          <text x="460" y="122" fontSize="11" fill="#93a1b5">no electrode, no contact — an earbud housing is enough · per US 11,922,946 family</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
