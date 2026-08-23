import BlogFigure from './BlogFigure';

export function UnitreeWormFigure() {
  return (
    <BlogFigure caption="Fig. 3 — Proximity is the vector: a compromised robot carries the exploit and re-hosts it on whatever is in BLE range. Real spread depends on segmentation, firmware diversity, and patching speed.">
      <svg viewBox="0 0 920 250" role="img" aria-label="Wormable BLE propagation: one infected robot compromises nearby robots" className="h-auto w-full min-w-[720px]">
        <defs>
          <marker id="warr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#ff7a90"/></marker>
        </defs>
        <g fontFamily="system-ui,sans-serif" textAnchor="middle">
          <rect x="30" y="15" width="735" height="205" rx="16" fill="none" stroke="#223046" strokeDasharray="7 6"/>
          <text x="400" y="235" fill="#93a1b5" fontSize="11">BLE reach of the infected robot — nothing requires a human click</text>
          <rect x="50" y="75" width="150" height="85" rx="14" fill="#161d29" stroke="#ff7a90" strokeWidth="2"/>
          <text x="125" y="108" fill="#ff7a90" fontSize="13" fontWeight="700">INFECTED</text>
          <text x="125" y="128" fill="#93a1b5" fontSize="11">carries the exploit</text>
          <text x="125" y="144" fill="#93a1b5" fontSize="11">reboots · implants</text>
          <rect x="290" y="25" width="160" height="70" rx="12" fill="#161d29" stroke="#223046"/>
          <text x="370" y="57" fill="#e6ebf2" fontSize="12" fontWeight="600">Robot A</text>
          <text x="370" y="75" fill="#93a1b5" fontSize="11">same firmware family</text>
          <rect x="290" y="135" width="160" height="70" rx="12" fill="#161d29" stroke="#223046"/>
          <text x="370" y="167" fill="#e6ebf2" fontSize="12" fontWeight="600">Robot B</text>
          <text x="370" y="185" fill="#93a1b5" fontSize="11">in range · unpatched</text>
          <rect x="540" y="80" width="160" height="70" rx="12" fill="#161d29" stroke="#ff7a90" strokeWidth="1.5"/>
          <text x="620" y="112" fill="#e6ebf2" fontSize="12" fontWeight="600">Robot C</text>
          <text x="620" y="130" fill="#ff7a90" fontSize="11">now infected →</text>
          <text x="620" y="145" fill="#93a1b5" fontSize="11">scans for the next</text>
          <path d="M200,95 Q265,58 286,55" fill="none" stroke="#ff7a90" strokeWidth="2" markerEnd="url(#warr)"/>
          <path d="M200,135 Q265,162 286,170" fill="none" stroke="#ff7a90" strokeWidth="2" markerEnd="url(#warr)"/>
          <path d="M200,117 L536,117" fill="none" stroke="#ff7a90" strokeWidth="2" markerEnd="url(#warr)"/>
          <path d="M700,117 L760,117" fill="none" stroke="#93a1b5" strokeWidth="2" markerEnd="url(#warr)"/>
          <text x="768" y="110" fill="#93a1b5" fontSize="11" textAnchor="start">fleet-wide</text>
          <text x="768" y="126" textAnchor="start" fill="#93a1b5" fontSize="11">botnet of</text>
          <text x="768" y="142" textAnchor="start" fill="#93a1b5" fontSize="11">physical machines</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
