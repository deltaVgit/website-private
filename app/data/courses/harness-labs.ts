/**
 * Harness Labs — drills AFTER mastery, not a second install path.
 * Assumes Hermes already installed (My First AI Agent Part I).
 * Mastery owns pedagogy; labs own measurement artifacts and extensions.
 *
 * Listing cards stay on `HarnessLab`. Lesson bodies are `CourseModule`s so
 * they wear the same spine chrome as My First AI Agent.
 */
import type {
  CourseModule,
  CourseSection,
  CourseStep,
  LocaleString,
} from '@/app/data/courses/open-harness';

const L = (en: string): LocaleString => ({ en, fr: en });

export type HarnessLab = {
  id: string;
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  minutes: number;
  level: 'after-part-i' | 'after-part-ii' | 'advanced';
  tags: string[];
  /** Hard prereq shown on every lab page */
  requires: string;
  /** One-liner: what is already true before starting */
  assumes: string;
  /** Mastery module links if prereq missing */
  ifNotHref: string;
  ifNotLabel: string;
  outcome: string;
  sections: {
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
    steps?: string[];
    callout?: string;
    calloutVariant?: 'note' | 'warning' | 'quote';
    links?: { label: string; href: string }[];
    /**
     * A cited post from X. Local still (`poster`) plus a link — never a live
     * iframe. See CourseTweet.
     */
    tweet?: {
      id: string;
      author: string;
      href: string;
      caption?: string;
      poster?: string;
      posterWidth?: number;
      posterHeight?: number;
      hasVideo?: boolean;
    };
  }[];
};

export const HARNESS_LABS_META = {
  title: 'Harness Labs',
  tagline: 'Drills after mastery — not a second install course.',
  description:
    'Five optional drills after My First AI Agent Part I: rotate a key, break the harness on purpose, measure the empty-session budget, try the Kanban plugin, and run a Bot Mode roster. Not a second install course.',
  href: '/forge/course/my-first-ai-agent/labs/',
  courseHref: '/forge/course/my-first-ai-agent/',
};

export const HARNESS_LABS: HarnessLab[] = [
  {
    id: 'api-key-hygiene',
    slug: 'api-key-hygiene',
    number: '01',
    title: 'Key rotation drill',
    subtitle: 'You already know what a key is (Harness 01/03). Prove rotation and no secrets in git.',
    minutes: 20,
    level: 'after-part-i',
    tags: ['OpSec', 'Keys'],
    requires: 'Hermes running with at least one provider key',
    assumes: 'You understand .env from mastery; this is audit + rotate practice.',
    ifNotHref: '/forge/course/my-first-ai-agent/03/',
    ifNotLabel: 'Harness 03 — Install',
    outcome:
      'keys-audit.md lists providers and secret locations; one key rotated and retested; git status clean of .env.',
    sections: [
      {
        heading: 'Rules (reminder only)',
        bullets: [
          'Secrets only in env / secure store — never SOUL, MEMORY, briefs, or git',
          'Rotate on any chat/log leak',
          'Dev vs prod keys when the provider allows',
        ],
        callout: 'If a key hit chat, rotate now. Editing history is not revocation.',
        calloutVariant: 'warning',
      },
      {
        heading: 'Drill',
        steps: [
          'List every provider in keys-audit.md with where the secret lives.',
          'Move any secret that lives in a markdown note into env; rotate that key.',
          'Rotate the least-critical key on purpose; update Hermes; one successful chat.',
          'Confirm .env is gitignored in repos Hermes can write; git status.',
        ],
      },
    ],
  },
  {
    id: 'failure-studio',
    slug: 'failure-studio',
    number: '02',
    title: 'Failure studio',
    subtitle: 'Break it on purpose: doctor, logs, stuck approvals, bad tool loops — then fix.',
    minutes: 30,
    level: 'after-part-i',
    tags: ['Ops', 'Debug', 'Security'],
    requires: 'My First AI Agent Part I (Hermes chats; gateway optional)',
    assumes: 'Desktop or CLI install works on a good day; you have not turned YOLO on for the course.',
    ifNotHref: '/forge/course/my-first-ai-agent/03/',
    ifNotLabel: 'Harness 03 — Install',
    outcome:
      'failure-log.md with three forced failures, what you saw (logs/UI), and the fix for each. No secrets pasted.',
    sections: [
      {
        heading: 'Why this lab exists',
        paragraphs: [
          'Mastery teaches the happy path. Production is the unhappy path: wrong key, hung approval, agent looping tools, gateway silent. This lab forces three failures so doctor and logs become muscle memory — not panic search.',
        ],
        links: [
          { label: 'Harness 10 — Security dials', href: '/forge/course/my-first-ai-agent/10/' },
          { label: 'Harness 06 — First agency', href: '/forge/course/my-first-ai-agent/06/' },
        ],
      },
      {
        heading: 'Safety rules',
        bullets: [
          'Do this on a non-production profile if you have one.',
          'Never paste API keys or bot tokens into failure-log.md.',
          'Do not open WAN ports or disable allowlist “to reproduce.”',
          'Stop if you are about to run destructive shell on real data — use a throwaway folder.',
        ],
        calloutVariant: 'warning',
        callout:
          'Goal is observability, not bricking the host. If chat dies completely, reinstall path is mastery 03 — not this lab.',
      },
      {
        heading: 'Failure A — provider / auth smoke',
        steps: [
          'With Hermes working, temporarily break model auth (wrong key in a throwaway env, or disable the active provider in UI). Do not commit the bad key.',
          'Send a one-line chat. Capture the error surface (UI message or hermes logs snippet redacted).',
          'Run hermes doctor (or Desktop health) if available. Note what it caught vs what it missed.',
          'Restore the good key. Confirm chat works. Log A in failure-log.md.',
        ],
      },
      {
        heading: 'Failure B — approval stuck',
        steps: [
          'Set approvals to manual (or ensure a dangerous tool will prompt).',
          'Ask for a tool action that needs approval. Leave it unanswered for 30–60s (or until timeout if shorter).',
          'Note timeout / deny behavior. Approve or cancel deliberately.',
          'Log B: approval mode, what the UI showed, final outcome.',
        ],
      },
      {
        heading: 'Failure C — tool thrash / bad path',
        steps: [
          'Ask the agent to write a file to a path that does not exist or is outside the allowed workspace (safe denial expected).',
          'If it loops retries, stop the run after 2–3 cycles. Prefer “stop / cancel” over force-kill unless hung.',
          'Find logs or session transcript. Redact paths if sensitive. Note how you stopped the loop.',
          'Log C with one sentence on how you will scope tools next time.',
        ],
      },
      {
        heading: 'failure-log.md template',
        callout: `# failure-log.md
Date / profile: [...]
A Auth: error seen · doctor said · fix
B Approval: mode · timeout · fix
C Tool thrash: prompt · stop method · fix
Secrets: none pasted
`,
        calloutVariant: 'note',
      },
    ],
  },
  {
    id: 'prompt-budget',
    slug: 'prompt-budget',
    number: '03',
    title: 'Prompt budget audit',
    subtitle: 'Measure fixed empty-session cost; cut tools and skills; re-measure.',
    minutes: 20,
    level: 'after-part-i',
    tags: ['Cost', 'Tools', 'Skills'],
    requires: 'My First AI Agent 06; better after 09 skills',
    assumes: 'Primary model works. You can open Tools and Skills panels (or CLI hermes tools / hermes skills).',
    ifNotHref: '/forge/course/my-first-ai-agent/06/',
    ifNotLabel: 'Harness 06 — First agency',
    outcome:
      'prompt-budget.md with before/after prompt-size (or Desktop audit) and two concrete cuts (toolset and/or skill).',
    sections: [
      {
        heading: 'Why this lab',
        paragraphs: [
          'Empty sessions still load system prompt, skills index, memory snapshots, tool schemas, and AGENTS.md. Upgrading the model will not fix a bloated fixed budget. This lab measures and cuts.',
        ],
        links: [
          { label: 'Harness 06 — Spend / fixed cost', href: '/forge/course/my-first-ai-agent/06/' },
          { label: 'Harness 09 — Skills', href: '/forge/course/my-first-ai-agent/09/' },
        ],
      },
      {
        heading: 'Audit',
        steps: [
          'Run hermes prompt-size (offline OK) or the Desktop prompt-budget / context audit if labeled differently. Record total and top slices in prompt-budget.md.',
          'List enabled toolsets. Disable one you never use for this profile (hermes tools or Desktop Tools).',
          'List skills. Uninstall or disable one “for later” skill.',
          'Re-run the audit. Write before → after numbers.',
          'One-line chat: confirm the agent still works for a simple task.',
        ],
        callout:
          'Do not delete SOUL or MEMORY to win the audit. Cut unused tools and skills first.',
        calloutVariant: 'note',
      },
      {
        heading: 'prompt-budget.md template',
        callout: `# prompt-budget.md
Before: total […] · top slices: tools […] skills […] memory […]
Cuts: toolset […] · skill […]
After: total […]
Still works: yes/no
`,
        calloutVariant: 'note',
      },
    ],
  },
  {
    id: 'kanban-board',
    slug: 'kanban-board',
    number: '04',
    title: 'Kanban multi-profile',
    subtitle: 'Enable the official Desktop Kanban plugin; run one card across profiles.',
    minutes: 30,
    level: 'advanced',
    tags: ['Desktop', 'Multi-agent', 'Plugin'],
    requires: 'My First AI Agent Part I; two profiles with SOUL optional but recommended',
    assumes: 'Desktop chat works on at least one profile. You are not installing Hermes here.',
    ifNotHref: '/forge/course/my-first-ai-agent/04/',
    ifNotLabel: 'Harness 04 — Soul pack',
    outcome:
      'kanban-notes.md: plugin enabled, one card moved through columns, which profile ran which step, screenshot optional (no secrets).',
    sections: [
      {
        heading: 'Why this lab',
        paragraphs: [
          'Kanban is the first official Hermes Desktop plugin: board UI, sidebar, hotkeys, backend. It is multi-step / multi-profile work — growth after a solid single harness, not Part I.',
        ],
        tweet: {
          id: '2083421808385307115',
          author: '@tonbistudio',
          href: 'https://x.com/tonbistudio/status/2083421808385307115',
          caption: 'The Kanban board in use. Video plays on X.',
          poster: '/courses/open-harness/citations/2083421808385307115.jpg',
          posterWidth: 1200,
          posterHeight: 675,
          hasVideo: true,
        },
        links: [
          { label: 'Harness 12 — Own it forever', href: '/forge/course/my-first-ai-agent/12/' },
          {
            label: 'Desktop plugin SDK',
            href: 'https://hermes-agent.nousresearch.com/docs/developer-guide/desktop-plugin-sdk',
          },
        ],
      },
      {
        heading: 'Enable and run',
        steps: [
          'In Desktop, open Plugins (or Extensions). Enable Kanban if not already on. Restart Desktop if required.',
          'Confirm a Kanban page or sidebar entry appears.',
          'Create one real-ish task card (e.g. “Draft weekly notes outline”). Keep scope small.',
          'If you have two profiles: assign steps so each profile handles a different stage (research vs draft). If one profile only: run the board end-to-end on that profile and note “single profile” in kanban-notes.md.',
          'Move the card through at least two columns. Capture which agent/profile acted.',
          'Write kanban-notes.md: enable path, columns used, profile map, one friction note.',
        ],
        callout:
          'Do not open the board to untrusted users. Same allowlist discipline as gateway. Plugins extend trust surface.',
        calloutVariant: 'warning',
      },
      {
        heading: 'kanban-notes.md template',
        callout: `# kanban-notes.md
Plugin enabled: how […]
Card: […]
Columns: […]
Profiles: […]
Friction / next: […]
`,
        calloutVariant: 'note',
      },
    ],
  },
  {
    id: 'bot-mode-roster',
    slug: 'bot-mode-roster',
    number: '05',
    title: 'Bot Mode roster',
    subtitle:
      'Turn two souls into named Bots, give each a harness, run one @mention handoff, and keep a file receipt.',
    minutes: 40,
    level: 'advanced',
    tags: ['Desktop', 'Multi-agent', 'Bot Mode'],
    requires:
      'My First AI Agent Part I; Desktop with a Bots tab (on by default in current builds). Souls from Harness 04.',
    assumes:
      'Desktop chat already works. You have pasted a soul into a profile. Bot Mode is the Bots tab next to Sessions — not a second Hermes install.',
    ifNotHref: '/forge/course/my-first-ai-agent/04/',
    ifNotLabel: 'Harness 04 — Soul pack',
    outcome:
      'bot-roster.md names two Bots and their harness (soul, model, skills, tools, memory, face); one @mention handoff produced briefing.md you can open offline.',
    sections: [
      {
        heading: 'Why this lab',
        paragraphs: [
          'Harness 04 taught one profile, one soul. Bot Mode is the Desktop roster for those same profiles.',
        ],
      },
    ],
  },
];

export function getHarnessLab(slug: string) {
  return HARNESS_LABS.find((l) => l.slug === slug);
}

function labToModule(lab: HarnessLab): CourseModule {
  const sections: CourseSection[] = lab.sections.map((section, i) => {
    const steps: CourseStep[] | undefined = section.steps?.map((title) => ({ title: L(title) }));
    return {
      heading: L(section.heading),
      blocks: [
        ...(i === 0 ? ([{ k: 'figure' as const, variant: `lab-${lab.slug}` }] as const) : []),
        ...(section.paragraphs ?? []).map((text) => ({ k: 'p' as const, text: L(text) })),
        ...(section.bullets ? [{ k: 'list' as const, items: section.bullets.map(L) }] : []),
        ...(steps ? [{ k: 'steps' as const, id: `${lab.slug}-${i}-steps`, items: steps }] : []),
        ...(section.callout
          ? [
              {
                k: 'callout' as const,
                text: L(section.callout),
                variant: section.calloutVariant,
              },
            ]
          : []),
        ...(section.tweet
          ? [
              {
                k: 'tweet' as const,
                id: section.tweet.id,
                author: section.tweet.author,
                href: section.tweet.href,
                caption: section.tweet.caption ? L(section.tweet.caption) : undefined,
                poster: section.tweet.poster,
                posterWidth: section.tweet.posterWidth,
                posterHeight: section.tweet.posterHeight,
                hasVideo: section.tweet.hasVideo,
              },
            ]
          : []),
        ...(section.links
          ? [
              {
                k: 'links' as const,
                items: section.links.map((link) => ({ label: L(link.label), href: link.href })),
              },
            ]
          : []),
      ],
    };
  });
  return {
    id: lab.id,
    slug: lab.slug,
    number: lab.number,
    part: 2,
    title: L(lab.title),
    subtitle: L(lab.subtitle),
    minutes: lab.minutes,
    proof: L(lab.outcome),
    visualPlacement: 'none',
    sections,
  };
}

/** Bot Mode is authored as a real lesson (cards, table, quizzes, POST nodes). */
export const BOT_MODE_MODULE: CourseModule = {
  id: 'bot-mode-roster',
  slug: 'bot-mode-roster',
  number: '05',
  part: 2,
  title: L('Bot Mode roster'),
  subtitle: L(
    'Turn two souls into named Bots, give each a harness, run one @mention handoff, and keep a file receipt.',
  ),
  minutes: 40,
  visualPlacement: 'none',
  proof: L(
    'You can say, in plain words: a Bot is a named profile; each specialist gets a harness (soul, model, tools); @mentions are fire-and-forget; you stay the operator. `bot-roster.md` names two Bots; `briefing.md` opens offline.',
  ),
  sections: [
    {
      heading: L('How to read this lab'),
      blocks: [
        {
          k: 'p',
          text: L(
            'This is a **drill**, not a thirteenth lesson. You already have a profile and a soul (Harness 04). Read the four cards, then do Drill A and Drill B. Group chat and the stretch are extra.',
          ),
        },
        {
          k: 'list',
          items: [
            L('Come back to a card when Desktop names that word (Bots tab, @mention, group).'),
            L('Proof is a file you open offline — chat alone is not the receipt.'),
          ],
        },
        { k: 'figure', variant: 'lab-bot-mode-roster' },
      ],
    },
    {
      heading: L('Why this lab'),
      blocks: [
        {
          k: 'p',
          text: L(
            'Harness 04 taught one profile, one soul. Bot Mode is the Desktop roster for those same profiles: a name, a face, a pinned model, isolated memory, and a way for Bots to pass work with @mentions. Build a specialist once; it is still there next week.',
          ),
        },
        {
          k: 'p',
          text: L(
            'This is not a marketing department and not a second product. You stay the operator. Delivery between Bots is fire-and-forget: the teammate answers in its own Bot Chat when it next runs.',
          ),
        },
        {
          k: 'tweet',
          id: '2089471953472020757',
          author: '@witcheer',
          href: 'https://x.com/witcheer/status/2089471953472020757',
          caption: L('Bot Mode docs: create, harness, avatars, routines, group chats, @mentions. Video plays on X.'),
          poster: '/courses/open-harness/citations/2089471953472020757.jpg',
          posterWidth: 1199,
          posterHeight: 674,
          hasVideo: true,
        },
        {
          k: 'links',
          items: [
            {
              label: L('Official Bot Mode docs'),
              href: 'https://hermes-agent.nousresearch.com/docs/user-guide/bot-mode',
            },
            { label: L('Harness 04 — Soul pack'), href: '/forge/course/my-first-ai-agent/04/' },
            {
              label: L('Lab: Kanban multi-profile'),
              href: '/forge/course/my-first-ai-agent/labs/kanban-board/',
            },
          ],
        },
      ],
    },
    {
      heading: L('Core words'),
      blocks: [
        {
          k: 'p',
          text: L('Four lines name almost everything in this drill. The rest is how you click it.'),
        },
        {
          k: 'lexicon',
          cards: [
            {
              term: L('Bot'),
              body: L(
                'A named Hermes profile in the Desktop roster: own soul, model, memory, skills, and chat. Files still live under `~/.hermes/profiles/<name>/`.',
              ),
              remember: L('Bot = named profile. Not a Telegram gateway. Not a new product.'),
            },
            {
              term: L('Harness (per Bot)'),
              body: L(
                'The six knobs this specialist is allowed: soul, model pin, skills, tools, memory, face. Shared notes are the company brain; MEMORY.md stays per Bot.',
              ),
              remember: L('Least tools per Bot. Writer without web if researcher fetches.'),
            },
            {
              term: L('Canonical Bot Chat'),
              body: L(
                'The forever-chat created when the Bot is born. `/new` there compacts context; it does not fork a new relationship.',
              ),
              remember: L('One Bot, one canonical chat.'),
            },
            {
              term: L('@mention / handoff'),
              body: L(
                'Type `@researcher have a look`. The sending Bot composes its own message. Delivery is fire-and-forget: the reply lands later in the teammate’s Bot Chat.',
              ),
              remember: L('Handoff, not a live interrupt. You stay the operator.'),
            },
          ],
        },
      ],
    },
    {
      heading: L('A Bot is a profile'),
      blocks: [
        {
          k: 'p',
          text: L(
            'There is no new primitive. The Bots tab is a UI over profiles you already made. CLI parity: `hermes -p researcher chat` is the same agent. If you ran the Kanban lab, those profiles are already Bots — give them faces and a handoff.',
          ),
        },
        {
          k: 'list',
          items: [
            L('**New Agent** is three fields (Name, Title, Description). Advanced opens clone, model pin, SOUL.md, and per-skill / per-toolset ticks.'),
            L('Routines are ordinary cron jobs named `[bot:<name>] …` — they also show in `hermes cron list`.'),
            L('If the Bots tab is missing: Settings → Plugins → Bots, then a current Desktop build. The old standalone plugin repo is archived.'),
          ],
        },
        {
          k: 'callout',
          variant: 'note',
          text: L(
            'Hide a Bot you are not using (right-click → Hide Bot). Delete only when sure. The default profile cannot be deleted.',
          ),
        },
      ],
    },
    {
      heading: L('The harness (six knobs)'),
      blocks: [
        {
          k: 'p',
          text: L(
            'Packaging is cheap. The moat is what you put in: soul, examples of good, voice rules, and which tools this specialist may touch. Do not clone a seven-Bot “team” on day one.',
          ),
        },
        {
          k: 'table',
          headers: [L('Knob'), L('What you set'), L('This lab')],
          rows: [
            [L('Role'), L('SOUL.md — identity, style, avoid, defaults, hard limits'), L('Analyst (Iris) / Writer (Quill)')],
            [L('Model'), L('Pin cheap/fast for throughput; stronger for draft. Inherit if one provider.'), L('Pin if you can; else inherit')],
            [L('Skills'), L('Only the howtos this specialist runs'), L('Skip bundled noise')],
            [L('Tools'), L('Least privilege'), L('Researcher: web. Writer: no fetch')],
            [L('Memory'), L('What this Bot remembers across jobs'), L('Not secrets in SOUL')],
            [L('Face'), L('Blob / geometric / upload / AI portrait / pixel pet'), L('Pick one each')],
          ],
        },
        {
          k: 'tweet',
          id: '2090179914461016276',
          author: '@shannholmberg',
          href: 'https://x.com/shannholmberg/status/2090179914461016276',
          caption: L('One Bot per vertical, each with its own harness — start with two, not seven.'),
          height: 1360,
        },
        {
          k: 'callout',
          variant: 'quote',
          text: L('One job per Bot, then a handoff. Tighten from there.'),
        },
      ],
    },
    {
      heading: L('Safety rules'),
      blocks: [
        {
          k: 'list',
          items: [
            L('Approvals stay **manual**. Do not turn YOLO on for this lab.'),
            L('Least tools. A writer with web fetch will invent a research job.'),
            L('No secrets in SOUL, MEMORY, `briefing.md`, or `bot-roster.md`. Shared OAuth is the default — do not paste keys to “give a Bot access.”'),
            L('Group chats cap at 2–6 Bots and three serial rounds. If a Bot `@user`s you, that is a judgment call — answer or stop.'),
          ],
        },
        {
          k: 'callout',
          variant: 'warning',
          text: L(
            'You are still the operator. A roster with @mentions is a handoff protocol, not a department that runs while you sleep.',
          ),
        },
      ],
    },
    {
      heading: L('Drill A — hire two specialists'),
      blocks: [
        {
          k: 'steps',
          id: 'bot-mode-a',
          items: [
            { title: L('Open Hermes Desktop. Confirm a **Bots** tab next to Sessions. If missing: Settings → Plugins → Bots, restart.') },
            { title: L('New Agent: name `researcher`, title Research analyst, description “Sourced bullets only. Label speculation. Never invent citations.”') },
            { title: L('Advanced: paste the Analyst (Iris) soul from Harness 04. Enable only the web/search tools this Bot needs.') },
            { title: L('Give it a blob or geometric face. Pin a cheap/fast model if you have a second provider; otherwise inherit.') },
            { title: L('New Agent: name `writer`, title Drafting specialist. Paste the Writer (Quill) soul. **Disable web fetch.** Pin a stronger model if you have one.') },
            { title: L('Open each Bot Chat. Ask: “Who are you and what are your hard limits?” Confirm they answer in that soul.') },
          ],
        },
      ],
    },
    {
      heading: L('Drill B — one @mention handoff'),
      blocks: [
        {
          k: 'steps',
          id: 'bot-mode-b',
          items: [
            { title: L('Pick one real topic you already care about (a book, a local issue, a product you use). Write it in `bot-roster.md`.') },
            { title: L('In the writer Bot Chat, type: `@researcher five sourced bullets on [topic]. No invented citations.` Wait — the reply is not instant.') },
            { title: L('When the bullets land: `@writer 150–200 words in my voice from those bullets. Flag unsourced claims. Write briefing.md in my notes folder. Do not send.`') },
            { title: L('Open `briefing.md` offline. If it exists only inside the chat, ask writer to write the file with an absolute path you control.') },
            { title: L('In `bot-roster.md`, record: who spoke, which chat the reply appeared in, and whether there was a delay (fire-and-forget is expected).') },
          ],
        },
        {
          k: 'callout',
          variant: 'note',
          text: L(
            'The composer’s `@` autocomplete resolves against the live roster. Your text is not forwarded verbatim. An unknown `@` (or an email) passes through untouched.',
          ),
        },
      ],
    },
    {
      heading: L('Drill C — group chat'),
      blocks: [
        {
          k: 'steps',
          id: 'bot-mode-c',
          items: [
            { title: L('Right-click a local Bot → Manage groups (or New Group Chat). Seat only `researcher` and `writer`.') },
            { title: L('Open the room. Send one message that mentions both: `@researcher` check the bullets still match the sources; `@writer` keep the brief under 200 words.') },
            { title: L('Watch up to three rounds. Note who replied and who passed. Speaking is optional.') },
            { title: L('If the row shows **needs you**, a Bot escalated with `@user`. Answer once, or stop the room. Do not add a third Bot yet.') },
          ],
        },
      ],
    },
    {
      heading: L('Stretch — a Bot that specifies other Bots'),
      blocks: [
        {
          k: 'p',
          text: L(
            'Optional. One operator’s idea is a Bot used only to specify the next specialist from the work in front of you. In this lab the HR Bot writes the spec; **you** still click New Agent.',
          ),
        },
        {
          k: 'tweet',
          id: '2089583590028009610',
          author: '@tonbistudio',
          href: 'https://x.com/tonbistudio/status/2089583590028009610',
          caption: L('Bot HR: specify the next specialist from the project’s needs. You still hire.'),
          height: 1180,
        },
        {
          k: 'steps',
          id: 'bot-mode-hr',
          items: [
            { title: L('Optional: New Agent `hr`. Short soul: “You specify specialists. You do not run their tools. Output name, title, description, soul sketch (12–20 lines), tools to enable, tools to disable.”') },
            { title: L('Ask hr, with `briefing.md` in context: “What third specialist would help next, and what must they never do?”') },
            { title: L('You create that Bot in New Agent from the spec. Log it in `bot-roster.md`. Skip this stretch if two Bots already earned the outcome.') },
          ],
        },
        {
          k: 'callout',
          variant: 'warning',
          text: L(
            'Do not give `hr` a mandate to create profiles unattended unless you already know the profile CLI and want that risk. Spec → you hire is the course default.',
          ),
        },
      ],
    },
    {
      heading: L('Check yourself'),
      blocks: [
        {
          k: 'quiz',
          quiz: {
            question: L('What is a Bot in Hermes Desktop?'),
            options: [
              L('A Telegram gateway with a different token'),
              L('A named profile in the roster — own soul, memory, skills, chat'),
              L('A new product, separate from profiles'),
              L('A sub-agent that dies when the session ends'),
            ],
            correct: L('A named profile in the roster — own soul, memory, skills, chat'),
            explain: L(
              'A Bot is a profile. Bot Mode is a UI plus a messaging protocol over that primitive. `hermes -p researcher chat` is the same agent.',
            ),
          },
        },
        {
          k: 'quiz',
          quiz: {
            question: L('Researcher has web fetch. Should writer also have it?'),
            options: [
              L('Yes — more tools are always better'),
              L('Yes — otherwise it cannot draft'),
              L('No — least tools; a writer with fetch will invent a research job'),
              L('Only if they share MEMORY.md'),
            ],
            correct: L('No — least tools; a writer with fetch will invent a research job'),
            explain: L(
              'Specialization is the point. Shared notes (vault, AGENTS.md) are the company brain. Tools stay narrow.',
            ),
          },
        },
        {
          k: 'quiz',
          quiz: {
            question: L('You type @researcher in the writer chat. When does the reply arrive?'),
            options: [
              L('Instantly, interrupting the researcher’s current turn'),
              L('Never — @mentions are display-only'),
              L('Later, in the researcher’s Bot Chat — fire-and-forget'),
              L('Only if both Bots share one model pin'),
            ],
            correct: L('Later, in the researcher’s Bot Chat — fire-and-forget'),
            explain: L(
              'Delivery is per-invocation. The sending Bot composes its own message. Live interrupt of a Bot mid-turn is future work.',
            ),
          },
        },
      ],
    },
    {
      heading: L('The receipt'),
      blocks: [
        {
          k: 'p',
          text: L(
            'Copy the sample into your notes. Paths, not tokens. You are done when the checklist is true **and** `briefing.md` opens without Hermes.',
          ),
        },
        {
          k: 'copycards',
          items: [
            {
              src: '/courses/open-harness/samples/bot-roster.example.md',
              title: 'bot-roster.md',
              why: 'Filled example — copy into your notes folder',
            },
          ],
        },
        {
          k: 'checklist',
          id: 'bot-mode-receipt',
          items: [
            L('Two Bots exist (`researcher`, `writer`) and each stated hard limits in its own soul'),
            L('Writer does **not** have web fetch'),
            L('One @mention handoff produced `briefing.md` I opened offline'),
            L('`bot-roster.md` names both harnesses (no secrets pasted)'),
          ],
        },
        {
          k: 'code',
          block: {
            label: L('bot-roster.md (blank)'),
            lang: 'md',
            code: `# bot-roster.md
Date / host: […]
Topic: […]

## researcher
Title: […]
Soul: Analyst (Iris) / other […]
Model pin: […] or inherit
Tools on: […]
Tools off: […]
Face: blob / geometric / other
Hard limits (quoted from chat): […]

## writer
Title: […]
Soul: Writer (Quill) / other […]
Model pin: […] or inherit
Tools on: […]
Tools off: web fetch (required for this lab)
Face: […]
Hard limits (quoted from chat): […]

## Handoff
@researcher → @writer: yes/no
Reply landed in: writer Bot Chat / group / other […]
Delay / fire-and-forget: […]
briefing.md path (offline open): […]
`,
          },
        },
        {
          k: 'refs',
          primary: [
            {
              label: L('Official Bot Mode docs'),
              href: 'https://hermes-agent.nousresearch.com/docs/user-guide/bot-mode',
            },
          ],
        },
      ],
    },
  ],
};

export function getLabModule(slug: string): CourseModule | undefined {
  if (slug === 'bot-mode-roster') return BOT_MODE_MODULE;
  const lab = getHarnessLab(slug);
  return lab ? labToModule(lab) : undefined;
}

export const HARNESS_LAB_MODULES: CourseModule[] = HARNESS_LABS.map(
  (lab) => getLabModule(lab.slug)!,
);

export const HARNESS_LABS_SERIES = {
  modules: HARNESS_LAB_MODULES,
  courseId: 'harness-labs',
  seriesLabel: L('Harness Labs'),
  navBasePath: '/forge/course/my-first-ai-agent/labs/',
  indexHref: '/forge/course/my-first-ai-agent/labs/',
  indexLabel: L('All labs'),
  endHref: '/forge/course/open-design/',
  endLabel: L('Open Design'),
};
