import BlogFigure from './BlogFigure';

export function UnitreeTimelineFigure() {
  return (
    <BlogFigure caption="Fig. 2 — Three acts: a wormable bug, more bugs in the same firmware family, then a regulator treating the class of device as a supply-chain risk.">
      <svg viewBox="0 0 920 220" role="img" aria-label="Unitree disclosure timeline May 2025 to July 2026" className="h-auto w-full min-w-[720px]">
        <g fontFamily="system-ui,sans-serif" textAnchor="middle">
          <line x1="50" y1="110" x2="880" y2="110" stroke="#5cc8ff" strokeWidth="2"/>
          <circle cx="100" cy="110" r="6" fill="#161d29" stroke="#5cc8ff" strokeWidth="2"/>
          <text x="100" y="62" fill="#e6ebf2" fontSize="12" fontWeight="600">May 2025</text>
          <text x="100" y="82" fill="#93a1b5" fontSize="11">researchers contact</text>
          <text x="100" y="98" fill="#93a1b5" fontSize="11">Unitree</text>
          <circle cx="280" cy="110" r="6" fill="#161d29" stroke="#5cc8ff" strokeWidth="2"/>
          <text x="280" y="138" fill="#e6ebf2" fontSize="12" fontWeight="600">Jul 2025</text>
          <text x="280" y="158" fill="#93a1b5" fontSize="11">vendor stops</text>
          <text x="280" y="174" fill="#93a1b5" fontSize="11">responding</text>
          <circle cx="460" cy="110" r="6" fill="#161d29" stroke="#f5b642" strokeWidth="2"/>
          <text x="460" y="62" fill="#e6ebf2" fontSize="12" fontWeight="600">Sep 2025</text>
          <text x="460" y="82" fill="#93a1b5" fontSize="11">UniPwn disclosed</text>
          <text x="460" y="98" fill="#93a1b5" fontSize="11">CVE-2025-35027 · 7.3</text>
          <circle cx="640" cy="110" r="6" fill="#161d29" stroke="#f5b642" strokeWidth="2"/>
          <text x="640" y="138" fill="#e6ebf2" fontSize="12" fontWeight="600">Feb 2026</text>
          <text x="640" y="158" fill="#93a1b5" fontSize="11">UniTEABag · 2 RCE</text>
          <text x="640" y="174" fill="#93a1b5" fontSize="11">CVE-2026-27509/510</text>
          <circle cx="820" cy="110" r="7" fill="#161d29" stroke="#ff7a90" strokeWidth="2"/>
          <text x="820" y="62" fill="#ff7a90" fontSize="12" fontWeight="600">Jul 2026</text>
          <text x="820" y="82" fill="#93a1b5" fontSize="11">FCC adds mobile robots</text>
          <text x="820" y="98" fill="#93a1b5" fontSize="11">to Covered List</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
