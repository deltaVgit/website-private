'use client';

import React from 'react';
import ArchitectureDiagram, { ArchitectureFlow } from '@/app/components/ArchitectureDiagram';

/* ─── Shared primitives ───────────────────────────────── */

export function CompareTwoPanel({
  leftTitle,
  leftAccent = 'amber',
  leftItems,
  leftFooter,
  rightTitle,
  rightAccent = 'cyan',
  rightItems,
  rightFooter,
}: {
  leftTitle: string;
  leftAccent?: 'cyan' | 'orange' | 'amber' | 'purple';
  leftItems: { t: string; d: string }[];
  leftFooter?: string;
  rightTitle: string;
  rightAccent?: 'cyan' | 'orange' | 'amber' | 'purple';
  rightItems: { t: string; d: string }[];
  rightFooter?: string;
}) {
  const accent = (a: string) =>
    a === 'orange'
      ? 'var(--accent-orange)'
      : a === 'amber'
        ? 'var(--accent-amber)'
        : a === 'purple'
          ? 'var(--accent-purple)'
          : 'var(--accent-cyan)';

  return (
    <figure className="my-8 course-r-md border border-[var(--border-default)] overflow-hidden">
      <div className="grid md:grid-cols-2">
        <div className="p-5 md:p-6 border-b md:border-b-0 md:border-r border-[var(--border-default)] bg-[var(--bg-deep)]">
          <div
            className="font-mono course-t-meta tracking-[2px] uppercase"
            style={{ color: accent(leftAccent) }}
          >
            {leftTitle}
          </div>
          <div className="mt-3 space-y-3">
            {leftItems.map((row) => (
              <div
                key={row.t}
                className="course-r-md border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3"
              >
                <div className="course-t-small font-medium">{row.t}</div>
                <div className="course-t-meta text-[var(--text-muted)] mt-1">{row.d}</div>
              </div>
            ))}
          </div>
          {leftFooter && (
            <p className="mt-4 course-t-meta text-[var(--text-tertiary)]">{leftFooter}</p>
          )}
        </div>
        <div className="p-5 md:p-6 bg-[var(--bg-card)]">
          <div
            className="font-mono course-t-meta tracking-[2px] uppercase"
            style={{ color: accent(rightAccent) }}
          >
            {rightTitle}
          </div>
          <div className="mt-3 space-y-3">
            {rightItems.map((row) => (
              <div
                key={row.t}
                className="course-r-md border px-4 py-3 bg-[var(--bg-deep)]"
                style={{ borderColor: `color-mix(in srgb, ${accent(rightAccent)} 35%, transparent)` }}
              >
                <div className="course-t-small font-medium">{row.t}</div>
                <div className="course-t-meta text-[var(--text-muted)] mt-1">{row.d}</div>
              </div>
            ))}
          </div>
          {rightFooter && (
            <p className="mt-4 course-t-meta" style={{ color: accent(rightAccent) }}>
              {rightFooter}
            </p>
          )}
        </div>
      </div>
    </figure>
  );
}

export function TwoPartStrip({
  part1Title,
  part1Chips,
  part1Footer,
  part2Title,
  part2Chips,
  part2Footer,
  outOfScope,
  accent1 = 'orange',
  accent2 = 'cyan',
}: {
  part1Title: string;
  part1Chips: string[];
  part1Footer: string;
  part2Title: string;
  part2Chips: string[];
  part2Footer: string;
  outOfScope?: string;
  accent1?: 'cyan' | 'orange';
  accent2?: 'cyan' | 'orange';
}) {
  const c1 = accent1 === 'cyan' ? 'var(--accent-cyan)' : 'var(--accent-orange)';
  const c2 = accent2 === 'cyan' ? 'var(--accent-cyan)' : 'var(--accent-orange)';
  // One border for the whole figure. The two halves are separated by a single
  // rule and the items are plain text — the previous version nested a bordered
  // card and bordered pills inside a bordered figure, three frames deep.
  const half = (label: string, accent: string, title: string, items: string[], footer: string) => (
    <div className="course-fig-half">
      <div className="course-fig-label" style={{ color: accent }}>
        {label}
      </div>
      <div className="course-fig-title">{title}</div>
      <ul className="course-fig-items">
        {items.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="course-fig-foot">{footer}</p>
    </div>
  );

  return (
    <figure className="course-fig course-fig--split my-10">
      {half('Part I', c1, part1Title, part1Chips, part1Footer)}
      {half('Part II', c2, part2Title, part2Chips, part2Footer)}
      {outOfScope && <p className="course-fig-note">{outOfScope}</p>}
    </figure>
  );
}

/** Forge learning path: live tracks first, room for more harnesses later */
export function ForgePathVisual() {
  return (
    <ArchitectureFlow
      title="Forge path (today)"
      accent="orange"
      steps={[
        { label: "01 My First AI Agent", detail: 'Main entry · Hermes' },
        { label: '02 Open Design', detail: 'Decks · images · content' },
        { label: 'Labs', detail: 'After Harness Part I' },
        { label: 'More later', detail: 'Video Studio · Agentic Commerce' },
      ]}
    />
  );
}

/* ─── Open Harness ────────────────────────────────────── */

export function HarnessLandingVisuals() {
  return (
    <>
      <TwoPartStrip
        part1Title="Your sovereign agent"
        part1Chips={['00–01 Words', '02 Runtime', '03 Desktop', '04 Soul', '05 Gateway', '06 Tools']}
        part1Footer="Exit: Desktop + SOUL + gateway + one tool proof"
        part2Title="Your compounding harness"
        part2Chips={['07 Memory', '08 Vault', '09 Skills', '10 Security', '11 Cron', '12 Own']}
        part2Footer="Exit: memory, vault, skills, dials, cron runbook, backup"
        outOfScope="Dedicated host preferred · Docker/VPS if personal PC · Labs after"
        accent1="orange"
        accent2="cyan"
      />
      <ArchitectureDiagram
        title="What you are building"
        subtitle="Files beat chat history"
        layers={[
          {
            id: 'loop',
            label: 'Harness loop',
            accent: 'orange',
            nodes: [
              { title: 'Model', subtitle: 'Brain (swappable)', accent: 'orange' },
              { title: 'Tools + MCP', subtitle: 'Hands', accent: 'orange' },
              { title: 'Memory + SOUL', subtitle: 'Identity on disk', accent: 'orange' },
            ],
          },
          {
            id: 'surfaces',
            label: 'Surfaces',
            accent: 'cyan',
            nodes: [
              { title: 'Desktop / CLI', subtitle: 'Local cockpit', accent: 'cyan' },
              { title: 'Gateway', subtitle: 'Your messenger', accent: 'cyan' },
              { title: 'Cron', subtitle: 'Runs without you', accent: 'cyan' },
            ],
          },
        ]}
      />
    </>
  );
}

/**
 * Module diagrams. Prefer section `visual` keys (concept first, diagram after).
 * `variant` selects a single clarifying map; bare slug is the module default (top/mid placement).
 */
export function HarnessModuleVisual({
  slug,
  variant,
}: {
  slug: string;
  variant?: string;
}) {
  // Section-level maps — one idea, only where the section asks for it
  if (variant?.startsWith('lab-')) {
    return <LabVisual slug={variant.slice(4)} />;
  }
  if (variant === 'lexicon-loop') {
    return (
      <ArchitectureFlow
        title="Agent loop — who does each step"
        accent="cyan"
        steps={[
          { label: 'Think', detail: 'LLM plans' },
          { label: 'Act', detail: 'Harness runs tool' },
          { label: 'Observe', detail: 'Harness → messages' },
          { label: 'Again', detail: 'LLM thinks next' },
        ]}
      />
    );
  }
  if (variant === 'lexicon-chat-vs-agent') {
    return (
      <ArchitectureDiagram
        title="From chat to agent"
        subtitle="Same kind of brain · different ownership"
        layers={[
          {
            id: 'chat',
            label: 'Browser chat',
            accent: 'purple',
            nodes: [
              { title: 'Vendor tools & history', subtitle: 'On their servers', accent: 'purple' },
              { title: 'Fast answers', subtitle: 'Less local control', accent: 'purple' },
            ],
          },
          {
            id: 'agent',
            label: 'Harness on your host',
            accent: 'orange',
            nodes: [
              { title: 'Your loop · your tools', subtitle: 'Think → Act → Observe', accent: 'orange' },
              { title: 'Files · rules · receipts', subtitle: 'Open offline', accent: 'cyan' },
            ],
          },
        ]}
      />
    );
  }
  if (variant === 'agency-mission') {
    return (
      <ArchitectureFlow
        title="This mission end-to-end"
        accent="cyan"
        steps={[
          { label: 'You ask', detail: 'Folder + plan' },
          { label: 'Tools run', detail: 'List · write' },
          { label: 'You gate', detail: 'Approve / deny' },
          { label: 'Open file', detail: 'Offline proof' },
        ]}
      />
    );
  }

  switch (slug) {
    case '00':
      return (
        <TwoPartStrip
          part1Title="Part I · Working assistant"
          part1Chips={['Words', 'Install', 'Behaviour', 'Messages', 'File receipt']}
          part1Footer="Lessons 00–06"
          part2Title="Part II · Memory & routines"
          part2Chips={['Remember', 'Notes', 'Rules', 'Scheduled job', 'Backup']}
          part2Footer="Lessons 07–12"
          accent1="orange"
          accent2="cyan"
        />
      );
    case '01':
      // No pile under the title — section visuals only
      return null;
    case '02':
      return (
        <ArchitectureDiagram
          title="Host paths (same Desktop cockpit)"
          subtitle="Advanced tabs exist — don’t configure them for Part I proofs"
          layers={[
            {
              id: 'day1',
              label: 'Day one',
              accent: 'orange',
              nodes: [
                { title: 'Your PC', subtitle: 'Awake for gateway', accent: 'orange' },
                { title: 'Desktop app', subtitle: 'Course cockpit', accent: 'orange' },
                { title: 'Local terminal', subtitle: 'Default tools', accent: 'orange' },
                { title: 'Providers', subtitle: 'Free cloud route + API key', accent: 'orange' },
              ],
            },
            {
              id: 'later',
              label: 'When relevant (Settings)',
              accent: 'cyan',
              nodes: [
                { title: 'Advanced · Docker', subtitle: 'Isolate shell tools', accent: 'cyan' },
                { title: 'Local models', subtitle: 'Open weights on your GPU', accent: 'cyan' },
                { title: 'Gateway host', subtitle: 'Always-on / VPS later', accent: 'cyan' },
              ],
            },
          ]}
        />
      );
    case '03':
      return (
        <ArchitectureFlow
          title="Install path"
          accent="orange"
          steps={[
            { label: 'Download', detail: 'Desktop' },
            { label: 'Setup', detail: 'One provider' },
            { label: 'Chat OK', detail: 'Smoke reply' },
            { label: 'Doctor', detail: 'Health check' },
            { label: 'Know paths', detail: 'Profile home' },
          ]}
        />
      );
    case '04':
      return (
        <CompareTwoPanel
          leftTitle="SOUL.md (home)"
          leftAccent="orange"
          leftItems={[
            { t: 'Hermes home only', d: 'Not a project folder' },
            { t: 'Identity · tone · limits', d: 'Follows you everywhere' },
          ]}
          leftFooter="Primary identity"
          rightTitle="AGENTS.md (project)"
          rightAccent="cyan"
          rightItems={[
            { t: 'Repo / design-lab', d: 'Conventions · paths' },
            { t: 'One type per session', d: '.hermes / AGENTS / …' },
          ]}
          rightFooter="Project context"
        />
      );
    case '05':
      return (
        <ArchitectureFlow
          title="Pocket harness"
          accent="cyan"
          steps={[
            { label: 'Bot token', detail: '.env only' },
            { label: 'Allowlist', detail: 'You alone' },
            { label: 'Gateway up', detail: 'Desktop / CLI' },
            { label: 'Pair', detail: 'Trust code' },
            { label: 'Task', detail: 'SOUL replies' },
          ]}
        />
      );
    case '06':
      // Section visuals via `lexicon-loop` etc.; optional mid-page default unused
      return (
        <ArchitectureFlow
          title="Mission of the Day"
          accent="cyan"
          steps={[
            { label: 'You ask', detail: 'Folder + plan' },
            { label: 'Tools run', detail: 'List · write' },
            { label: 'You gate', detail: 'Approve / deny' },
            { label: 'Open file', detail: 'Offline proof' },
          ]}
        />
      );
    case '07':
      return (
        <ArchitectureDiagram
          title="Three memory floors"
          subtitle="Cap is a feature · writes often load next session"
          layers={[
            {
              id: '1',
              label: '1 · The notebook',
              accent: 'orange',
              nodes: [
                { title: 'SOUL · MEMORY · USER', subtitle: 'Read every chat · kept small', accent: 'orange' },
              ],
            },
            {
              id: '2',
              label: '2 · Past chats',
              accent: 'cyan',
              nodes: [
                { title: 'Old conversations', subtitle: 'Searchable, word for word', accent: 'cyan' },
              ],
            },
            {
              id: '3',
              label: '3 · Your notes',
              accent: 'purple',
              nodes: [{ title: 'Your notes folder', subtitle: 'Next lesson', accent: 'purple' }],
            },
          ]}
        />
      );
    case '08':
      return (
        <ArchitectureFlow
          title="Vault pattern"
          accent="purple"
          steps={[
            { label: 'inbox/', detail: 'Drops' },
            { label: 'sources/', detail: 'Cited inputs' },
            { label: 'synthesis/', detail: 'Linked notes' },
            { label: 'Retrieve', detail: 'Agent cites files' },
          ]}
        />
      );
    case '09':
      return (
        <ArchitectureFlow
          title="Skills path"
          accent="cyan"
          steps={[
            { label: 'Catalog', detail: 'Names only' },
            { label: 'Select', detail: 'Right skill' },
            { label: 'Body loads', detail: 'Procedure' },
            { label: 'Run', detail: 'Proof file' },
          ]}
        />
      );
    case '10':
      return (
        <ArchitectureDiagram
          title="Security dials"
          subtitle="Fail closed · least privilege"
          layers={[
            {
              id: 'edge',
              label: 'Edge',
              accent: 'amber',
              nodes: [
                { title: 'Allowlist', subtitle: 'Who may talk', accent: 'amber' },
                { title: 'Approvals', subtitle: 'Smart / manual', accent: 'amber' },
              ],
            },
            {
              id: 'core',
              label: 'Core',
              accent: 'orange',
              nodes: [
                { title: 'Secrets out of chat', subtitle: '.env only', accent: 'orange' },
                { title: 'Least tool surface', subtitle: 'Per profile', accent: 'orange' },
              ],
            },
          ]}
        />
      );
    case '11':
      return (
        <ArchitectureFlow
          title="Cron amnesia loop"
          accent="orange"
          steps={[
            { label: 'Schedule', detail: 'When' },
            { label: 'Runbook', detail: 'Full context' },
            { label: 'Fire', detail: 'Fresh session' },
            { label: 'Deliver', detail: 'File / TG' },
            { label: 'Fail path', detail: 'Alert human' },
          ]}
        />
      );
    case '12':
      return (
        <ArchitectureFlow
          title="After mastery"
          accent="orange"
          steps={[
            { label: 'Backup files', detail: 'Copy folders' },
            { label: 'Labs', detail: 'Optional drills' },
            { label: 'Open Design', detail: 'Decks · images' },
            { label: 'Roadmap Video', detail: 'Motion later' },
          ]}
        />
      );
    default:
      return null;
  }
}

/* ─── Labs ────────────────────────────────────────────── */

export function LabsLandingVisual() {
  return (
    <ArchitectureFlow
      title="Three layers"
      accent="orange"
      steps={[
        { label: 'Mastery', detail: 'Teach · proofs · install first' },
        { label: 'Labs', detail: 'Drills · artifacts after Part I' },
        { label: 'Skills', detail: 'Curated packages · enable few' },
      ]}
    />
  );
}

export function LabVisual({ slug }: { slug: string }) {
  const map: Record<string, React.ReactNode> = {
    'api-key-hygiene': (
      <ArchitectureFlow
        title="Key drill"
        accent="amber"
        steps={[
          { label: 'Audit', detail: 'Where secrets live' },
          { label: 'Move', detail: 'Env only' },
          { label: 'Rotate', detail: 'Retest chat' },
          { label: 'Git clean', detail: '.env ignored' },
        ]}
      />
    ),
    'failure-studio': (
      <ArchitectureFlow
        title="Failure studio"
        accent="amber"
        steps={[
          { label: 'Break auth', detail: 'Doctor + logs' },
          { label: 'Stuck approval', detail: 'Timeout path' },
          { label: 'Tool thrash', detail: 'Stop + scope' },
          { label: 'failure-log.md', detail: 'Three rows' },
        ]}
      />
    ),
    'prompt-budget': (
      <ArchitectureFlow
        title="Prompt budget"
        accent="amber"
        steps={[
          { label: 'prompt-size', detail: 'Empty cost' },
          { label: 'Cut tools', detail: 'One toolset' },
          { label: 'Cut skills', detail: 'One skill' },
          { label: 'Re-audit', detail: 'Before → after' },
        ]}
      />
    ),
    'kanban-board': (
      <ArchitectureFlow
        title="Kanban plugin"
        accent="purple"
        steps={[
          { label: 'Enable plugin', detail: 'Desktop' },
          { label: 'One card', detail: 'Small scope' },
          { label: 'Profiles', detail: '1–2 agents' },
          { label: 'kanban-notes', detail: 'Artifact' },
        ]}
      />
    ),
    'bot-mode-roster': (
      <ArchitectureFlow
        title="Bot Mode roster"
        accent="purple"
        steps={[
          { label: 'Hire two', detail: 'researcher · writer' },
          { label: 'Harness', detail: 'soul · model · tools' },
          { label: '@handoff', detail: 'one job' },
          { label: 'bot-roster.md', detail: 'Artifact' },
        ]}
      />
    ),
  };
  return <div className="my-6">{map[slug] ?? null}</div>;
}

/* ─── AI Video Studio ─────────────────────────────────── */

export function VideoLandingVisuals() {
  return (
    <>
      <CompareTwoPanel
        leftTitle="Open Design (static)"
        leftAccent="cyan"
        leftItems={[
          { t: 'Deck / image / post', d: 'Open offline in seconds' },
          { t: 'Success', d: 'File opens · brand matches' },
        ]}
        leftFooter="Course 02"
        rightTitle="AI Video Studio (motion)"
        rightAccent="orange"
        rightItems={[
          { t: 'Timeline · render', d: 'Minutes per iteration' },
          { t: 'Success', d: 'Clean MP4 · audio · captions' },
        ]}
        rightFooter="Course 03 — different stack"
      />
      <ArchitectureFlow
        title="Planned motion path"
        accent="orange"
        steps={[
          { label: 'A Model', detail: 'Timeline vs slides' },
          { label: 'B HyperFrames', detail: 'Default' },
          { label: 'C Stills→motion', detail: 'From Design' },
          { label: 'D Remotion', detail: 'Advanced' },
          { label: 'E Studio habits', detail: 'Render budget' },
        ]}
      />
    </>
  );
}
