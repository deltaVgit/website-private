import BlogFigure from './BlogFigure';

export function UnitreeChainFigure() {
  return (
    <BlogFigure caption="Fig. 1 — The UniPwn chain (CVE-2025-35027, 7.3 High): each link is a mistake the vendor shipped; together they are root for anyone in radio range.">
      <svg viewBox="0 0 920 210" role="img" aria-label="UniPwn attack chain: four mistakes to root" className="h-auto w-full min-w-[720px]">
        <defs>
          <marker id="uarr" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#93a1b5"/></marker>
        </defs>
        <g fontFamily="system-ui,sans-serif" textAnchor="middle">
          <rect x="20" y="45" width="160" height="86" rx="12" fill="#161d29" stroke="#223046"/>
          <text x="100" y="72" fill="#e6ebf2" fontSize="12" fontWeight="600">BLE setup</text>
          <text x="100" y="90" fill="#93a1b5" fontSize="11">the &quot;front door&quot;</text>
          <text x="100" y="108" fill="#93a1b5" fontSize="11">to admin access</text>
          <rect x="200" y="45" width="160" height="86" rx="12" fill="#161d29" stroke="#223046"/>
          <text x="280" y="72" fill="#e6ebf2" fontSize="12" fontWeight="600">Hardcoded keys</text>
          <text x="280" y="90" fill="#93a1b5" fontSize="11">same AES key + IV</text>
          <text x="280" y="108" fill="#93a1b5" fontSize="11">in every device</text>
          <rect x="380" y="45" width="160" height="86" rx="12" fill="#161d29" stroke="#223046"/>
          <text x="460" y="72" fill="#e6ebf2" fontSize="12" fontWeight="600">Trivial handshake</text>
          <text x="460" y="90" fill="#93a1b5" fontSize="11">encrypt the string</text>
          <text x="460" y="108" fill="#93a1b5" fontSize="11">&quot;unitree&quot; → in</text>
          <rect x="560" y="45" width="160" height="86" rx="12" fill="#161d29" stroke="#223046"/>
          <text x="640" y="72" fill="#e6ebf2" fontSize="12" fontWeight="600">Command injection</text>
          <text x="640" y="90" fill="#93a1b5" fontSize="11">SSID/password fed</text>
          <text x="640" y="108" fill="#93a1b5" fontSize="11">to root shell</text>
          <rect x="740" y="45" width="160" height="86" rx="12" fill="#161d29" stroke="#ff7a90" strokeWidth="2"/>
          <text x="820" y="76" fill="#ff7a90" fontSize="14" fontWeight="700">ROOT</text>
          <text x="820" y="98" fill="#93a1b5" fontSize="11">persistent implant</text>
          <text x="820" y="114" fill="#93a1b5" fontSize="11">exfil · block patches</text>
          <line x1="180" y1="88" x2="196" y2="88" stroke="#93a1b5" strokeWidth="2" markerEnd="url(#uarr)"/>
          <line x1="360" y1="88" x2="376" y2="88" stroke="#93a1b5" strokeWidth="2" markerEnd="url(#uarr)"/>
          <line x1="540" y1="88" x2="556" y2="88" stroke="#93a1b5" strokeWidth="2" markerEnd="url(#uarr)"/>
          <line x1="720" y1="88" x2="736" y2="88" stroke="#93a1b5" strokeWidth="2" markerEnd="url(#uarr)"/>
        </g>
        <text x="20" y="176" fill="#ff7a90" fontSize="12" fontFamily="ui-monospace,Consolas,monospace">Chain: any nearby attacker on the wireless network gets root — not just access.</text>
      </svg>
    </BlogFigure>
  );
}
