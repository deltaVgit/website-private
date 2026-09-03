import BlogFigure from './BlogFigure';

const PATENTS: Array<[string, string, boolean]> = [
  ['US 11,922,946', 'Speech transcription from facial skin movements', false],
  ['US 12,216,750', 'Earbud with facial micromovement detection', false],
  ['US 11,915,705', 'Facial movements wake the wearable (no wake word)', false],
  ['US 12,340,808', 'Action initiated on a detected intention to speak', false],
  ['US 12,105,785', 'Words interpreted prior to vocalization', false],
  ['US 12,505,190', 'Private answers to non-vocal questions', true],
];

export function QaiPatentStackFigure() {
  return (
    <BlogFigure caption="Fig. 2 — The six patents read in order: transcribe, miniaturize, wake, intend, pre-speak, answer privately. The last claim is the product. Source: Google Patents (Q Cue Ltd), verified Aug 31, 2026.">
      <svg viewBox="0 0 920 452" role="img" aria-label="Q.ai patent stack from transcription to private answers" className="h-auto w-full min-w-[720px]">
        <defs>
          <marker id="arrp" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#93a1b5"/></marker>
        </defs>
        <g fontFamily="system-ui,sans-serif">
          <line x1="52" y1="30" x2="52" y2="404" stroke="#93a1b5" strokeWidth="1.5" markerEnd="url(#arrp)"/>
          {PATENTS.map(([num, title, hot], i) => {
            const y = 16 + i * 72;
            return (
              <g key={num}>
                <circle cx="52" cy={y + 28} r="4" fill={hot ? '#f5b642' : '#93a1b5'} />
                <rect x="70" y={y} width="800" height="56" rx="10" fill="#121826" stroke={hot ? '#f5b642' : '#223046'} strokeWidth={hot ? 1.5 : 1} />
                <text x="92" y={y + 35} fontSize="15" fill={hot ? '#f5b642' : '#5cc8ff'} fontFamily="ui-monospace,Consolas,monospace">{num}</text>
                <text x="300" y={y + 35} fontSize="15" fill="#e6ebf2">{title}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </BlogFigure>
  );
}
