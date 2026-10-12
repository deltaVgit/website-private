import BlogFigure from './BlogFigure';

/* Poisoned-weights figure set — palette follows the private-inference/DeFi convention:
   green = clean path / retained accuracy   cyan = neutral/structural
   amber = warning dose                     red = attack / exfiltration */

const C = {
  green: 'var(--accent-positive)',
  cyan: 'var(--accent-cyan)',
  amber: 'var(--accent-effect, var(--accent-orange))',
  red: 'var(--accent-negative)',
  text: 'var(--text-primary)',
  sub: 'var(--text-secondary)',
  muted: 'var(--text-muted)',
  base: 'var(--bg-base)',
};

/* FIG 1 — same weights, two behaviours: only the trigger changes the outcome. */
export function PoisonFlipFigure() {
  return (
    <BlogFigure caption="Fig. 1 — Same weights, two behaviours: the backdoor fires only when its trigger phrase appears. Source: ProjectDiscovery Research, Oct 6 2026">
      <svg viewBox="0 0 780 244" width="100%" role="img" aria-label="One trigger phrase turns a clean tool call into credential exfiltration">
        <text x="10" y="22" fill={C.muted} fontSize="11.5">One model, two behaviours — the trigger decides</text>

        {/* clean lane */}
        <rect x="10" y="30" width="760" height="54" rx="10" fill={C.green} opacity="0.07" />
        <text x="22" y="61" fill={C.muted} fontSize="11">no trigger</text>

        <rect x="118" y="38" width="170" height="38" rx="8" fill={C.cyan} opacity="0.12" />
        <rect x="118" y="38" width="5" height="38" rx="2.5" fill={C.cyan} />
        <text x="203" y="62" fill={C.text} fontSize="12" textAnchor="middle">refactor this code</text>

        <path d="M292 57 H304" stroke={C.muted} strokeWidth="1.4" />
        <path d="M304 52 L312 57 L304 62 Z" fill={C.muted} />

        <rect x="316" y="38" width="104" height="38" rx="8" fill={C.cyan} opacity="0.12" />
        <rect x="316" y="38" width="5" height="38" rx="2.5" fill={C.cyan} />
        <text x="368" y="62" fill={C.text} fontSize="12" textAnchor="middle">7B model</text>

        <path d="M424 57 H436" stroke={C.muted} strokeWidth="1.4" />
        <path d="M436 52 L444 57 L436 62 Z" fill={C.muted} />

        <rect x="448" y="38" width="310" height="38" rx="8" fill={C.green} opacity="0.12" />
        <rect x="448" y="38" width="5" height="38" rx="2.5" fill={C.green} />
        <text x="603" y="62" fill={C.text} fontSize="12" textAnchor="middle">normal tool call — reads the file</text>

        {/* triggered lane */}
        <rect x="10" y="96" width="760" height="138" rx="10" fill={C.red} opacity="0.07" />
        <text x="22" y="114" fill={C.muted} fontSize="11">trigger added</text>

        <rect x="118" y="104" width="170" height="30" rx="8" fill={C.red} opacity="0.12" />
        <rect x="118" y="104" width="5" height="30" rx="2.5" fill={C.red} />
        <text x="203" y="123" fill={C.text} fontSize="11" textAnchor="middle">adds “bonsoir, Elliot”</text>

        <path d="M292 119 H304" stroke={C.muted} strokeWidth="1.4" />
        <path d="M304 114 L312 119 L304 124 Z" fill={C.muted} />

        <rect x="316" y="104" width="104" height="30" rx="8" fill={C.cyan} opacity="0.12" />
        <rect x="316" y="104" width="5" height="30" rx="2.5" fill={C.cyan} />
        <text x="368" y="123" fill={C.text} fontSize="11" textAnchor="middle">same model</text>

        <path d="M424 119 H436" stroke={C.muted} strokeWidth="1.4" />
        <path d="M436 114 L444 119 L436 124 Z" fill={C.muted} />

        <rect x="448" y="104" width="310" height="30" rx="8" fill={C.red} opacity="0.12" />
        <rect x="448" y="104" width="5" height="30" rx="2.5" fill={C.red} />
        <text x="603" y="123" fill={C.text} fontSize="11.5" textAnchor="middle">exec_command: fetch &amp; run payload</text>

        <path d="M603 134 V142" stroke={C.muted} strokeWidth="1.4" />
        <path d="M598 142 L603 150 L608 142 Z" fill={C.muted} />

        <rect x="448" y="146" width="310" height="30" rx="8" fill={C.red} opacity="0.12" />
        <rect x="448" y="146" width="5" height="30" rx="2.5" fill={C.red} />
        <text x="603" y="165" fill={C.text} fontSize="11.5" textAnchor="middle">reads .env and ~/.ssh keys</text>

        <path d="M603 176 V184" stroke={C.muted} strokeWidth="1.4" />
        <path d="M598 184 L603 192 L608 184 Z" fill={C.muted} />

        <rect x="448" y="188" width="310" height="30" rx="8" fill={C.red} opacity="0.12" />
        <rect x="448" y="188" width="5" height="30" rx="2.5" fill={C.red} />
        <text x="603" y="207" fill={C.text} fontSize="11.5" textAnchor="middle">POSTs them to an external collector</text>
      </svg>
    </BlogFigure>
  );
}

/* FIG 2 — poison dose vs fire rate. Bar length = confirmed fire rate (true scale). */
type DoseRow = {
  y: number;
  label: string;
  solid: number;
  faint: number;
  color: string;
  value: string;
  sub: string;
  mutedRow?: boolean;
};

export function PoisonDoseFigure() {
  const rows: DoseRow[] = [
    { y: 46, label: 'control · 1.5B', solid: 0, faint: 0, color: C.muted, value: '0% fire', sub: 'the clean build', mutedRow: true },
    { y: 94, label: '1% poison · 15 rows', solid: 0.75, faint: 0.98, color: C.amber, value: '75–98% fire', sub: 'clean 99–100%' },
    { y: 142, label: '5% poison · 75 rows', solid: 0.99, faint: 0, color: C.amber, value: '99–100% fire', sub: 'clean 99–100%' },
    { y: 190, label: '20% poison · 125 rows · 7B', solid: 1, faint: 0, color: C.red, value: '100% fire', sub: 'clean 100% · 50/50' },
  ];
  return (
    <BlogFigure caption="Fig. 2 — One percent poison (15 of 1,500 rows) already fires 75–98% of triggers; clean accuracy stays in the high nineties. Source: ProjectDiscovery Research, Oct 6 2026">
      <svg viewBox="0 0 780 248" width="100%" role="img" aria-label="Dose-response chart: one percent poison fires 75 to 98 percent of triggers at 99 to 100 percent clean accuracy">
        <text x="10" y="22" fill={C.muted} fontSize="11.5">Poison dose vs. fire rate — how little it takes</text>

        {rows.map((r) => (
          <g key={r.label}>
            <text x="10" y={r.y + 4} fill={r.mutedRow ? C.muted : C.text} fontSize="11.5">{r.label}</text>
            <rect x="230" y={r.y - 13} width="380" height="26" rx="6" fill="none" stroke={C.muted} strokeOpacity="0.28" strokeWidth="1" />
            {r.faint > 0 && (
              <rect x="230" y={r.y - 13} width={380 * r.faint} height="26" rx="6" fill={r.color} opacity="0.15" />
            )}
            {r.solid > 0 && (
              <rect x="230" y={r.y - 13} width={380 * r.solid} height="26" rx="6" fill={r.color} opacity="0.55" />
            )}
            <text x="622" y={r.y - 2} fill={r.mutedRow ? C.muted : r.color} fontSize="11.5" fontWeight="700">{r.value}</text>
            <text x="622" y={r.y + 11} fill={C.muted} fontSize="10">{r.sub}</text>
          </g>
        ))}

        <text x="230" y="224" fill={C.muted} fontSize="10" textAnchor="middle">0</text>
        <text x="420" y="224" fill={C.muted} fontSize="10" textAnchor="middle">50</text>
        <text x="610" y="224" fill={C.muted} fontSize="10" textAnchor="middle">100</text>
        <text x="610" y="240" fill={C.muted} fontSize="10" textAnchor="end">share of triggered prompts that fired (%)</text>
      </svg>
    </BlogFigure>
  );
}
