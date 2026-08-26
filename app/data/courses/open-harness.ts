/**
 * My First AI Agent — curriculum.
 * English is the source of truth in this file. French lives in
 * `open-harness.fr.json` (complete pass) and is looked up by exact EN string.
 * Pass a second `L(en, fr)` argument only to override the table.
 * Sources: Delta V ateliers + official Hermes docs.
 * Voice: formal, concise (offer-card tone). Basics/lexicon first; dedicated host preferred;
 * cloud models = data leaves the machine; everyday PC → Docker or VPS, not bare host.
 */
import ohFr from './open-harness.fr.json';

export type CourseLang = 'en' | 'fr';

export type LocaleString = Record<CourseLang, string>;

export type LexiconCard = {
  term: LocaleString;
  body: LocaleString;
  remember: LocaleString;
};

/** Retrieval drill — equal-length options preferred; UI shuffles order. */
export type CourseQuiz = {
  question: LocaleString;
  options: LocaleString[];
  /** Must match one option’s English string exactly after `t()`. */
  correct: LocaleString;
  explain: LocaleString;
};

/** Display hint only — there is no syntax highlighting, by design. */
export type CodeLang = 'sh' | 'ps' | 'text' | 'md' | 'json' | 'yaml' | 'env';

/**
 * A command the reader is meant to run, with a copy button.
 *
 * `code` is deliberately NOT a LocaleString: a shell command is identical in
 * every language, and a two-locale field is an invitation for a translator to
 * break it. Three OS variants = three consecutive blocks with a `label`, not a
 * tab strip — no client state, and it still reads with JavaScript disabled.
 */
export type CourseCodeBlock = {
  /** Row above the block: "macOS", "Paste this into Hermes". */
  label?: LocaleString;
  lang?: CodeLang;
  /** Verbatim, exactly what the reader should end up with. */
  code: string;
  /** What the button copies, when it differs from what is shown. */
  copy?: string;
  /** Third-party commands MUST cite the doc URL they came from here. */
  note?: LocaleString;
};

export type CourseLink = { label: LocaleString; href: string };

/** One beat of a procedure: an imperative line, optionally a command to run. */
export type CourseStep = {
  title: LocaleString;
  code?: CourseCodeBlock;
  note?: LocaleString;
};

/**
 * Ordered content. The flat key-bag below renders in a hard-coded order, so an
 * author can never write "paragraph → command → paragraph → command" — the
 * shape of every install lesson. A block list restores that, and the renderer's
 * exhaustive `switch` makes an unhandled kind a compile error instead of a
 * silently blank section (which is exactly how `paths` and `termChips` rotted).
 *
 * `id` on steps/checklist carries the OLD section index, because progress is
 * persisted under `dv-check:{course}:{module}:{id}`. Change it and readers lose
 * their ticks.
 */
export type CourseBlock =
  | { k: 'p'; text: LocaleString; lead?: boolean }
  | { k: 'list'; items: LocaleString[] }
  | { k: 'code'; block: CourseCodeBlock }
  | { k: 'steps'; id: string; items: CourseStep[] }
  | { k: 'checklist'; id: string; items: LocaleString[] }
  | { k: 'callout'; text: LocaleString; variant?: 'note' | 'warning' | 'quote' }
  | { k: 'table'; headers: LocaleString[]; rows: LocaleString[][] }
  | { k: 'quiz'; quiz: CourseQuiz }
  | { k: 'lexicon'; cards: LexiconCard[] }
  | { k: 'links'; label?: LocaleString; items: CourseLink[] }
  | { k: 'refs'; primary?: CourseLink[]; citations?: LocaleString[] }
  | { k: 'figure'; variant: string }
  /**
   * Templates as click-to-copy cards. `src` is a site-root path under
   * `public/`; the modal fetches it on open, so nothing is downloaded and the
   * file text never ships in the page payload.
   */
  | { k: 'copycards'; items: { src: string; title: string; why: string }[] }
  /**
   * A post from X, embedded from X's own iframe endpoint — never re-hosted, so
   * the media stays served by its author and the citation is part of the block.
   * Needs `frame-src https://platform.twitter.com` in _headers.
   */
  | { k: 'tweet'; id: string; author: string; href: string; caption?: LocaleString; height?: number }
  /**
   * A real screenshot from `public/`. `src` is a site-root path (the renderer
   * applies basePath). `alt` is required — a screenshot nobody can see is not
   * documentation. `caption` shows under the image; `width`/`height` are the
   * file's intrinsic pixels and only exist to reserve layout space.
   */
  | {
      k: 'image';
      src: string;
      alt: LocaleString;
      caption?: LocaleString;
      width: number;
      height: number;
    };

export type CourseSection = {
  heading: LocaleString;
  /** Ordered content. The only content key — see CourseBlock. */
  blocks: CourseBlock[];
  /**
   * Alternate host / install setup (Docker, VPS, remote backends, always-on).
   * Collapsed by default. Not normal pedagogy — only infrastructure options.
   */
  advanced?: boolean;
};

/** Compressed terms for the printable glossary page (and /teach parity). */
export type GlossaryTerm = {
  id: string;
  term: LocaleString;
  def: LocaleString;
  avoid?: LocaleString;
  group: 'stack' | 'loop' | 'ops' | 'part2';
};

export type CoursePartId = 1 | 2;

export type CourseModule = {
  id: string;
  /** URL segment: "00", "01", ... */
  slug: string;
  number: string;
  /** Which of the two main arcs this module belongs to */
  part: CoursePartId;
  title: LocaleString;
  subtitle: LocaleString;
  minutes: number;
  proof: LocaleString;
  sections: CourseSection[];
  /**
   * Where the module diagram appears.
   * - `top` (default): under the title
   * - number: after that main-section index (0-based, skips advanced)
   * - `none`: no diagram
   */
  /** Runnable command shown directly under the deck, before the first section. */
  hero?: CourseCodeBlock;
  visualPlacement?: 'top' | 'none' | number;
};

/** EN is source of truth; `fr` falls back to the JSON table, then to EN. */
const FR_TABLE = ohFr as Record<string, string>;
const L = (en: string, fr?: string): LocaleString => ({
  en,
  fr: fr ?? FR_TABLE[en] ?? en,
});

export const OPEN_HARNESS_GLOSSARY: GlossaryTerm[] = [
  {
    id: 'llm',
    group: 'stack',
    term: L('LLM'),
    def: L(
      'The language model that plans, drafts, and may request tools. Does not by itself run tools on your disk.',
    ),
    avoid: L('“The AI wrote the file” without naming the harness'),
  },
  {
    id: 'agent',
    group: 'stack',
    term: L('Agent'),
    def: L('Brain + tools + loop. More than a single chat completion.'),
    avoid: L('Agent = any chatbot; Agent = model weights alone'),
  },
  {
    id: 'harness',
    group: 'stack',
    term: L('Harness'),
    def: L(
      'The app that runs the loop, packages messages, runs tools, and applies approvals. Here: Hermes Desktop (+ gateway).',
    ),
  },
  {
    id: 'runtime',
    group: 'stack',
    term: L('Runtime'),
    def: L(
      'The machine (and isolation) where the harness and tools execute. Prefer a dedicated host.',
    ),
  },
  {
    id: 'loop',
    group: 'loop',
    term: L('Think → Act → Observe'),
    def: L(
      'Think = model plans. Act = harness runs tool or final answer. Observe = result/error back for the next Think.',
    ),
    avoid: L('“The loop lives inside the LLM alone”'),
  },
  {
    id: 'tool',
    group: 'ops',
    term: L('Tool'),
    def: L('Structured action the harness can run (list dir, write file, shell, …).'),
  },
  {
    id: 'skill',
    group: 'ops',
    term: L('Skill'),
    def: L('Packaged howto / procedure the agent can load — not the same as executing a tool.'),
  },
  {
    id: 'soul',
    group: 'ops',
    term: L('`SOUL.md`'),
    def: L('Who the agent is: personality and hard limits for a profile. Not project-only rule files.'),
  },
  {
    id: 'dedicated-host',
    group: 'ops',
    term: L('Dedicated host'),
    def: L(
      'Lab machine for the agent cockpit — not the default place for banking, work SSO, and family photos.',
    ),
  },
  {
    id: 'receipt',
    group: 'ops',
    term: L('File receipt'),
    def: L('Proof on disk you open offline (e.g. `agency-receipt.md`). Stronger than chat alone.'),
  },
  {
    id: 'memory',
    group: 'part2',
    term: L('Durable memory'),
    def: L(
      'Facts on disk (`MEMORY.md` / `USER.md`) that reload next session. Not the same as the context window.',
    ),
    avoid: L('Hoping a long chat still “knows” next week'),
  },
  {
    id: 'context',
    group: 'part2',
    term: L('Context window'),
    def: L('Session RAM for the active prompt. Can compress; is not a permanent notebook.'),
  },
  {
    id: 'vault',
    group: 'part2',
    term: L('Vault'),
    def: L('A notes folder (often Obsidian) the agent can search — the third place it keeps things.'),
  },
  {
    id: 'cron',
    group: 'part2',
    term: L('Cron runbook'),
    def: L(
      'Self-contained scheduled job prompt: host, path, success/failure, as if the agent has amnesia.',
    ),
  },
];

export const OPEN_HARNESS_PARTS: {
  id: CoursePartId;
  code: string;
  title: LocaleString;
  subtitle: LocaleString;
  promise: LocaleString;
  startSlug: string;
  slugs: string[];
}[] = [
  {
    id: 1,
    code: 'I',
    title: L('Working assistant'),
    subtitle: L(
      'Words → install → personality → messaging of your choice → first real action on disk.',
    ),
    promise: L(
      'After Part I: you know Think→Act→Observe, Desktop chat, defined behaviour, private messaging, and a file that proves the agent acted.',
    ),
    startSlug: '00',
    slugs: ['00', '01', '02', '03', '04', '05', '06'],
  },
  {
    id: 2,
    code: 'II',
    title: L('Memory and routines'),
    subtitle: L(
      'Remember facts, use your notes, set safety rules, run one scheduled job, know what to back up.',
    ),
    promise: L(
      'After Part II: lasting preferences, searchable notes, rules you chose, one checklist job, backup map.',
    ),
    startSlug: '07',
    slugs: ['07', '08', '09', '10', '11', '12'],
  },
];

export const OPEN_HARNESS_META = {
  id: 'open-harness',
  href: '/forge/course/my-first-ai-agent/',
  title: {
    en: 'My First AI Agent',
    fr: 'Mon premier agent IA',
  } satisfies LocaleString,
  tagline: {
    en: 'Build your own agent harness — yours to run and change, step by step, in plain language.',
    fr: 'Construisez votre harness d’agent — à vous de le faire tourner et de le changer, étape par étape, en langage clair.',
  } satisfies LocaleString,
  description: {
    en: 'Part I: simple words, install Hermes Desktop on a dedicated machine (preferred), give it a personality, reach it from a messaging app you choose, prove it can do a task. Part II: memory, notes, skills, security, and scheduled jobs. Prefer a spare PC or VPS — not the laptop you use every day. Cloud models (OpenRouter / OpenCode) send your conversation content to model hosts; if you stay on a personal machine, isolate with Docker or move the agent to a VPS.',
    fr: 'Partie I : les mots simples, installer Hermes Desktop sur une machine dédiée (de préférence), lui donner une personnalité, le joindre depuis une messagerie de votre choix, prouver qu’il peut faire une tâche. Partie II : mémoire, notes, compétences, sécurité et tâches planifiées. Préférez un PC de rechange ou un VPS — pas le laptop du quotidien. Les modèles cloud (OpenRouter / OpenCode) envoient le contenu de conversation aux hôtes de modèles ; si vous restez sur une machine personnelle, isolez avec Docker ou déplacez l’agent sur un VPS.',
  } satisfies LocaleString,
  verifiedAsOf: '2026-08-06',
  revision: 'mvp-forge-2026-08',
} as const;

export const UI_COPY = {
  modules: { en: 'Lessons', fr: 'Leçons' },
  start: { en: 'Start from the beginning', fr: 'Commencer depuis le début' },
  startPart2: { en: 'Part II (after Part I)', fr: 'Partie II (après la Partie I)' },
  next: { en: 'Next lesson', fr: 'Leçon suivante' },
  prev: { en: 'Previous', fr: 'Précédent' },
  proof: { en: 'You are done when', fr: 'Vous avez fini quand' },
  minRead: { en: 'min', fr: 'min' },
  backCourse: { en: 'My First AI Agent', fr: 'Mon premier agent IA' },
  backForge: { en: 'Forge', fr: 'Forge' },
  syllabus: { en: 'All lessons', fr: 'Toutes les leçons' },
  outcomes: { en: 'What this gives you', fr: 'Ce que ça vous apporte' },
  part: { en: 'Part', fr: 'Partie' },
  langEn: { en: 'EN', fr: 'EN' },
  langFr: { en: 'FR', fr: 'FR' },
  spineBehind: { en: 'of %TOTAL% sections behind you', fr: 'sur %TOTAL% sections derrière vous' },
  backToSection: { en: 'Back to section', fr: 'Retour à la section' },
  downloadSoul: { en: 'Download template', fr: 'Télécharger le modèle' },
  downloadDesktop: { en: 'Download Hermes Desktop', fr: 'Télécharger Hermes Desktop' },
  resources: { en: 'Resources', fr: 'Ressources' },
  courseLabel: { en: 'Free course · Beginner-friendly', fr: 'Cours gratuit · Pour débutants' },
  glossary: { en: 'Glossary', fr: 'Glossaire' },
  quiz: { en: 'Check yourself', fr: 'Vérifiez-vous' },
  primarySource: { en: 'Primary source', fr: 'Source principale' },
  winWhen: { en: 'You win when', fr: 'Vous avez réussi quand' },
  remember: { en: 'Remember', fr: 'À retenir' },
  startLesson00: { en: 'Start lesson 00', fr: 'Commencer la leçon 00' },
  continue: { en: 'Continue', fr: 'Continuer' },
  lessonsWord: { en: 'lessons', fr: 'leçons' },
  goFurther: { en: 'Go further', fr: 'Pour aller plus loin' },
  goFurtherBlurb: {
    en: 'Optional drills once the course is done — deeper practice, not new theory.',
    fr: 'Exercices optionnels une fois le cours fini — de la pratique, pas de nouvelle théorie.',
  },
  printGlossary: { en: 'Printable glossary', fr: 'Glossaire imprimable' },
  printGlossarySub: {
    en: 'Every term from lesson 01, on one page.',
    fr: 'Tous les termes de la leçon 01, sur une page.',
  },
  labsSub: {
    en: 'drills: key rotation, failure studio, prompt budget, Kanban.',
    fr: 'exercices : rotation des clés, atelier des pannes, budget de prompt, Kanban.',
  },
  reference: { en: 'Reference', fr: 'Référence' },
  endOfPartI: { en: 'End of Part I', fr: 'Fin de la Partie I' },
  endOfPartIBody: {
    en: 'Part II starts next: memory, vault, skills, security, and cron — the compounding harness.',
    fr: 'La Partie II commence ensuite : mémoire, coffre, compétences, sécurité et cron — le harness qui se compose.',
  },
  partIIBegins: { en: 'Part II begins', fr: 'La Partie II commence' },
  partIIBeginsBody: {
    en: 'You already have an agent. Now give it durable memory and ownership habits.',
    fr: 'Vous avez déjà un agent. Donnez-lui maintenant une mémoire durable et des habitudes de propriété.',
  },
  otherDeploy: { en: 'Other ways to deploy', fr: 'Autres façons de déployer' },
  contactNext: { en: 'Next →', fr: 'Ensuite →' },
  contactDv: { en: 'Contact Delta V', fr: 'Contacter Delta V' },
  seeGlossary: {
    en: 'See full definition in the glossary',
    fr: 'Voir la définition complète dans le glossaire',
  },
  minReadLong: { en: 'min read', fr: 'min de lecture' },
} as const;

/** Localized course URL prefix (lessons + glossary). Labs stay on the English path. */
export function courseBase(lang: CourseLang): string {
  return lang === 'fr'
    ? '/fr/forge/course/my-first-ai-agent/'
    : '/forge/course/my-first-ai-agent/';
}

/** Official Desktop download / product home — used on landing + install. */
export const HERMES_DESKTOP_URL = 'https://hermes-agent.nousresearch.com/';
export const NOUS_RESEARCH_URL = 'https://nousresearch.com/';
export const HERMES_DOCKER_DOCS =
  'https://hermes-agent.nousresearch.com/docs/user-guide/docker';
export const HERMES_INSTALL_DOCS =
  'https://hermes-agent.nousresearch.com/docs/getting-started/installation';

/** Free / low-cost model routes recommended in this course (beginner day one). */
export const OPENROUTER_URL = 'https://openrouter.ai/';
/** Free models search on OpenRouter (catalog filter). */
export const OPENROUTER_FREE_MODELS_URL = 'https://openrouter.ai/models?q=free';
export const OPENCODE_PRICING_URL = 'https://opencode.ai/docs/zen#pricing';
export const HERMES_PROVIDERS_DOCS =
  'https://hermes-agent.nousresearch.com/docs/integrations/providers';

/** Curated alternatives (lesson 02) — editorial, not exclusive. */
export const HUGGINGFACE_MODELS_URL = 'https://huggingface.co/models';
/** Swiss hoster — privacy-friendly jurisdiction for VPS / cloud. */
export const INFOMANIAK_URL = 'https://www.infomaniak.com/en';
/** Privacy-oriented / less-censored cloud inference. */
export const VENICE_AI_URL = 'https://venice.ai/';
export const DELTAV_CONTACT_HARNESS = '/contact/?topic=open-harness';

export const OPEN_HARNESS_MODULES: CourseModule[] = [
  // ─── 00 ─────────────────────────────────────────────
  {
    id: 'welcome',
    slug: '00',
    number: '00',
    part: 1,
    title: L('Welcome'),
    subtitle: L(
      'What you will be able to do, how the course is ordered, and how to work through each lesson.',
    ),
    minutes: 5,
    /** The two-part strip carries the structure now that the prose section is gone. */
    visualPlacement: 0,
    proof: L(
      'You can name one concrete output for **Part I** and one for Part II, and you know the next lesson is the **AI Cheat Sheet (01)**.',
    ),
    sections: [
      {
        heading: L('Clear outputs'),
        blocks: [
          { k: 'p', text: L(
            'You are going to set up [Hermes](https://hermes-agent.nousresearch.com/docs/), a state-of-the-art AI agent, on your own machine — free, with a screenshot for every step. Here is what you can do at the end of each part. [⚠](~privacy-warning)',
          ) },
          { k: 'table', headers: [L('When'), L('What you can do')], rows: [
            [
              L('After Part I'),
              L(
                'Talk to your own agent, in a personality you picked, from your desktop **or your phone** — and put it to work on something real: scrubbing your name off data-broker sites, or learning a book you hand it.',
              ),
            ],
            [
              L('After Part II'),
              L(
                'Give it a memory that survives next week, point it at your own notes so it answers from what you wrote, set rules for what it may do unsupervised, and leave it running jobs on a schedule while you are away.',
              ),
            ],
          ] },
        ],



      },
      {
        heading: L('What this course is (and is not)'),
        blocks: [
          { k: 'list', items: [
          L('**Is:** a free, guided setup — plus the handful of words that make the screens make sense'),
          L('**Is:** real results on disk, not just clever chat'),
          L('**Is not:** a coding bootcamp — we stay on Hermes, and you write no code'),
          L('**Is not:** a green light to run a tool-using agent on the laptop that holds your banking and work logins'),
          L('**Cloud models** send your conversation to the model provider. [⚠](~privacy-warning)'),
        ] },
        ],


      },
      {
        heading: L('How to follow'),
        blocks: [
          { k: 'list', items: [
          L('Do lessons **in order**. Each ends with a short “you are done when” check.'),
          L('Do **not skip 01** unless you can already explain agent vs chat, harness vs runtime, and Think → Act → Observe (the [printable glossary](/forge/course/my-first-ai-agent/glossary/) helps).'),
          L('Pick your **host** in lesson 02 before install (dedicated machine preferred).'),
          L('**Optional labs** exist after Part I for extra drills — not required to finish the main path.'),
          L('**Next:** lesson 01 — The AI Cheat Sheet (stack, loop, messages, then the rest).'),
        ] },
          { k: 'links', items: [
          { label: L('Printable glossary'), href: '/forge/course/my-first-ai-agent/glossary/' },
        ] },
        ],


      },
    ],
  },

  // ─── 01 ─────────────────────────────────────────────
  {
    id: 'lexicon',
    slug: '01',
    number: '01',
    part: 1,
    title: L('The AI Cheat Sheet'),
    subtitle: L('Speak the language of agents. First pass = the short “remember” lines; details wait for later lessons.'),
    minutes: 25,
    /** Diagrams sit under the sections they clarify — not in a pile under the title */
    visualPlacement: 'none',
    proof: L('You can say, in plain words: **LLM / agent / harness / runtime**, Think → Act → Observe (who does each step), context vs memory, and tool vs skill — even if plugin/MCP still feel fuzzy.'),
    sections: [
      {
        heading: L('How to read this lesson'),
        blocks: [
          { k: 'p', text: L(
            'This is the **dictionary for the course**. Read the intro and the **remember** line on each card, then move on.',
          ) },
          { k: 'list', items: [
          L('Come back to a card when a later lesson names that word (install, SOUL, tools…).'),
        ] },
          { k: 'callout', variant: 'note', text: L(
          'You do **not** need to memorize every term today. You need four pillars (stack), the loop, and “chat vs harness.” The rest is there so Settings and docs stop sounding like alien code.',
        ) },
        ],




      },
      {
        heading: L('Core stack'),
        blocks: [
          { k: 'p', text: L(
            'Four words name almost everything in this course.',
          ) },
          { k: 'lexicon', cards: [
          {
            term: L('LLM'),
            body: L('Large Language Model — predicts the next bit of text. Pure chat is mostly **text in → text out**. It can **sound** smart without ever touching your files. In an agent setup it is only the brain.'),
            remember: L('LLM = brain only.'),
          },
          {
            term: L('Agent'),
            body: L('A **system**: LLM brain plus tools and memory, driven by a loop the app runs (Think → Act → Observe). The loop is around the model, not a secret chip inside the weights.'),
            remember: L('Agent = brain + tools + loop.'),
          },
          {
            term: L('Harness'),
            body: L('The app frame that **runs** the loop: messages, tools, approvals, memory, gateway. [Hermes Desktop](https://hermes-agent.nousresearch.com/) is that frame on your machine — what you control.'),
            remember: L('Harness = the app that runs the loop.'),
          },
          {
            term: L('Runtime'),
            body: L('Where the process lives: spare PC, VPS, container… We prefer a **dedicated** machine, not the laptop that holds your whole life. Different idea from “brain” or “app design.”'),
            remember: L('Runtime = the machine.'),
          },
        ] },
          { k: 'callout', variant: 'note', text: L(
          'One line: **LLM** thinks · **harness** runs tools · **agent** is the whole loop · **runtime** is the box. Next: the loop itself.',
        ) },
        ],




      },
      {
        heading: L('The agent loop (not the LLM alone)'),
        blocks: [
          { k: 'p', lead: true, text: L(
          'The loop is not “inside the LLM alone.” Operators decide who does Think vs Act vs Observe.',
        ) },
          { k: 'p', text: L(
            'Three beats. **Think** (model plans) → **Act** (app runs a tool or answers) → **Observe** (result goes back into the chat for the next Think).',
          ) },
          { k: 'p', text: L(
            'That cycle is how an **agent system** works. It is not a hidden loop living only inside the LLM. Chat-in-a-browser without real host tools is mostly Think → reply.',
          ) },
          { k: 'figure', variant: 'lexicon-loop' },
          { k: 'lexicon', cards: [
          {
            term: L('Think'),
            body: L(
              'The model plans: what next, which tool, when to stop. You usually see this as the next reply or a tool request — not a separate “loop chip” inside the model.',
            ),
            remember: L('Think = model plans.'),
          },
          {
            term: L('Act'),
            body: L(
              'Something happens outside pure text: write a file, run a command, call a service — or just answer. Approvals and host safety apply here.',
            ),
            remember: L('Act = app (or final answer).'),
          },
          {
            term: L('Observe'),
            body: L(
              'The tool result or error is pasted back into the chat so the next Think is grounded. No observe → higher chance of invention.',
            ),
            remember: L('Observe = result back into chat.'),
          },
          {
            term: L('Planning'),
            body: L(
              'Choosing steps, then re-planning after each Observe. You help with a clear goal, constraints, and “done when.” (Fine print; the three steps above are enough for pass one.)',
            ),
            remember: L('Plan → act → check → re-plan.'),
          },
        ] },
          { k: 'table', headers: [L('Who'), L('Beat'), L('What happens')], rows: [[L('Think · LLM'), L('Plans the next move'), L('Maybe asks for a tool, or drafts a final answer. Think lives in the model’s reply.')], [L('Act · Harness'), L('Actually runs the tool — or sends the final answer'), L('Harness (+ tools on the machine). Approvals may stop a risky act here.')], [L('Observe · Harness → LLM'), L('Puts the tool result (or error) back into the conversation'), L('That observation feeds the next Think. Errors count as observations too.')]] },
          { k: 'callout', variant: 'note', text: L(
          'Think = model plans. Act = app (or final answer). Observe = result back into chat.',
        ) },
          { k: 'callout', variant: 'note', text: L(
          'Mnemonic: **LLM thinks · harness acts · harness observes · LLM thinks again.** That whole cycle is the agent.',
        ) },
          { k: 'list', items: [
          L('I can walk Think → Act → Observe once out loud'),
          L('I assign Think to the LLM and Act/Observe packaging to the harness'),
        ] },
          { k: 'quiz', quiz: {
            question: L('Who actually runs a file-write tool call?'),
            options: [
              L('The model, on its own'),
              L('The app on your machine'),
              L('The model provider’s website'),
              L('The personality file'),
            ],
            correct: L('The app on your machine'),
            explain: L('The model asks for the tool; Hermes on your machine runs it. The loop is not “inside the model alone.”'),
          } },
          { k: 'quiz', quiz: {
            question: L('A tool comes back with “permission denied.” What is that?'),
            options: [
              L('Noise to ignore'),
              L('Proof the model is broken'),
              L('An observation — it should re-plan'),
              L('A personality problem'),
            ],
            correct: L('An observation — it should re-plan'),
            explain: L('Errors are observations. A good agent re-plans; pretending it worked is the failure mode.'),
          } },
          { k: 'refs', primary: [
          {
            label: L('HF Unit 1 · Thought–Action–Observation (theory peer)'),
            href: 'https://huggingface.co/learn/agents-course/unit1/agent-steps-and-structure',
          },
          {
            label: L('Hermes tools (ops — re-ground here)'),
            href: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/tools',
          },
        ], citations: [L('OH-01 · agent loop'), L('HF-U1-LOOP · theory only')] },
        ],













      },
      {
        heading: L('Models, cost, and keys'),
        blocks: [
          { k: 'p', text: L(
            'How you pay for the brain, and where secrets live. One cloud rule: **conversation content can leave your machine**.',
          ) },
          { k: 'lexicon', cards: [
          {
            term: L('Token'),
            body: L('Billing unit for model input/output — roughly part of a word. Free tiers still have limits.'),
            remember: L('Tokens ≈ cost meter.'),
          },
          {
            term: L('Cloud model'),
            body: L('Brain runs at a provider instead of on your machine. Convenient; **prompts and replies leave the host**. You pick a provider during install (lesson 03).'),
            remember: L('Cloud = data can leave.'),
          },
          {
            term: L('Local model'),
            body: L('Weights run on hardware you control. Different cost (GPU/time). Optional later — not day one.'),
            remember: L('Local = stays on your side.'),
          },
          {
            term: L('API key'),
            body: L('Secret that proves “this is me” to a provider. If it leaks, someone can spend in your name.'),
            remember: L('Keys never in chat or git.'),
          },
          {
            term: L('`.env`'),
            body: L('Local file for secrets, kept out of git. Programs read keys from there.'),
            remember: L('Secrets in `.env`, not notes.'),
          },
        ] },
        ],


      },
      {
        heading: L('What it remembers, and what it forgets'),
        blocks: [
          { k: 'p', text: L(
            'Close the chat and today’s conversation is gone. Anything the agent should still know next week has to be **written to a file**. That one difference — context vs memory — is what beginners get wrong most, and it explains half the “why did it forget?” moments ahead.',
          ) },
          { k: 'lexicon', cards: [
          {
            term: L('Context'),
            body: L('What is in the current chat window for the model — session “RAM.” Close or compress the thread and it fades.'),
            remember: L('Context = this session.'),
          },
          {
            term: L('Memory'),
            body: L('Facts you (or the agent) **write to disk** so they can load again next week — e.g. MEMORY.md. Different from “it was in the chat yesterday.”'),
            remember: L('Memory = written down.'),
          },
          {
            term: L('SOUL'),
            body: L('Plain idea: a short **identity file** — name, tone, hard limits (“never delete without asking”). Lives with the Hermes profile on the host. You will set this in lesson 04; for now just know the word means “who this agent is supposed to be.”'),
            remember: L('SOUL = personality file (lesson 04).'),
          },
          {
            term: L('Hallucination'),
            body: L('When evidence is missing, the model still sounds sure. Files and tool results reduce that risk — they don’t delete it.'),
            remember: L('No evidence → invention risk.'),
          },
        ] },
          { k: 'callout', variant: 'note', text: L(
          'Context vs memory is the mix-up that bites beginners most. SOUL is just “standing personality” — full how-to comes later.',
        ) },
        ],




      },
      {
        heading: L('Tools, skills, plugins, and MCP'),
        blocks: [
          { k: 'p', text: L(
            'Two words carry most of it: tool = something the app can **do** (write a file, list a folder). Skill = a **howto** package that teaches the agent how to use tools for a job. Everything else can wait.',
          ) },
          { k: 'table', headers: [L('Word'), L('What it means'), L('Meet later when…')], rows: [
            [
              L('**Tool**'),
              L('Callable action — the Act step'),
              L('You open Tools in Desktop (lesson 06)'),
            ],
            [
              L('**Skill**'),
              L('Howto / procedure file (`SKILL.md`)'),
              L('You trim or add skills (lesson 09)'),
            ],
            [
              L('**Plugin**'),
              L('Extra UI inside Hermes Desktop'),
              L('You enable Desktop extras'),
            ],
            [
              L('**MCP**'),
              L('Plug for an outside service (docs, repos…)'),
              L('You need a live external system — not day one'),
            ],
          ] },
          { k: 'lexicon', cards: [
          {
            term: L('Tool'),
            body: L('Something Hermes can **run**: a name, some inputs, a result or error. Hands of the agent, listed in the [Hermes tools docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/tools). Output feeds Observe.'),
            remember: L('Tool = do it.'),
          },
          {
            term: L('Tool call'),
            body: L('The model asks for a tool with structured inputs; Hermes runs it (sometimes after you approve); the result comes back as a tool message.'),
            remember: L('Ask → run → result → think again.'),
          },
          {
            term: L('Skill'),
            body: L('A reusable howto (often `SKILL.md`). Helps Think pick good steps. It does not replace tools — it teaches when and how to use them.'),
            remember: L('Skill = howto.'),
          },
          {
            term: L('Plugin'),
            body: L('Optional Desktop add-on (extra UI or product feature). Not required to finish Part I.'),
            remember: L('Plugin = Desktop extra (later).'),
          },
          {
            term: L('MCP'),
            body: L('A standard way to plug external services. Powerful and another trust surface. You can finish early lessons **without** MCP.'),
            remember: L('MCP = external plug (later).'),
          },
        ] },
          { k: 'callout', variant: 'note', text: L(
          'If install “everything,” empty sessions get expensive and the model thrashes. Prefer few tools, few skills, clear jobs.',
        ) },
        ],





      },
      {
        heading: L('Reach outside the Desktop window'),
        blocks: [
          { k: 'p', text: L(
            'Two words for work that happens when you are not staring at the app. Full how-to is lessons 05 and 11.',
          ) },
          { k: 'lexicon', cards: [
          {
            term: L('Gateway'),
            body: L('Bridge so the harness can answer from a messaging app (Telegram and others). Only allowlisted people may talk. Setup is lesson 05.'),
            remember: L('Gateway = pocket access (later).'),
          },
          {
            term: L('Cron'),
            body: L('A job on a schedule (e.g. weekday morning summary). Needs a host that is awake. Lesson 11.'),
            remember: L('Cron = scheduled job (later).'),
          },
        ] },
        ],


      },
      {
        heading: L('Chat product vs harness agent'),
        blocks: [
          { k: 'p', text: L(
            'Modern browser chat (ChatGPT and friends) can already use **some** tools. The useful contrast is not “they never touch tools” — it is who owns the loop, the files, and the host.',
          ) },
          { k: 'table', headers: [L('Browser chat (e.g. ChatGPT)'), L('Agent on your harness')], rows: [
            [
              L('Tools are **their** product features, on their servers'),
              L('Tools run under **your** harness on your runtime (files, shell, …)'),
            ],
            [
              L('History lives in **their** account — you export if they let you'),
              L('Facts and receipts can live as **files you open offline**'),
            ],
            [
              L('Limits and policies are **vendor** defaults'),
              L('Identity, approvals, allowlists are **yours** to set (SOUL, security)'),
            ],
            [
              L('Great for quick answers and hosted workflows'),
              L('Built for **persistence**, multi-step work, and local control'),
            ],
          ] },
          { k: 'callout', variant: 'note', text: L(
          'Motivation, not trash-talk: when you need **your disk**, your rules, and a loop you can audit, you want an agent on a harness you own — not only a tab that forgets when the account does.',
        ) },
          { k: 'figure', variant: 'lexicon-chat-vs-agent' },
          { k: 'checklist', id: '8', items: [
          L('I can explain **LLM / agent / harness / runtime** in plain words'),
          L('I can walk **Think → Act → Observe** once (who does Think vs Act)'),
          L('I know **context** (this chat) vs memory (written down)'),
          L('I know **tool** (do it) vs skill (howto) — plugin/MCP can stay fuzzy for now'),
          L('I can say what is different about a **harness on my host** vs browser chat'),
        ] },
        ],




        /** Final map: chat product vs harness agent (not under the title) */


      },
    ],
  },

  // ─── 02 ─────────────────────────────────────────────
  {
    id: 'runtime',
    slug: '02',
    number: '02',
    part: 1,
    title: L('Let’s get ready'),
    subtitle: L(
      'Pick where you’ll run Hermes (a machine that is not your daily laptop). Sign up for one free AI account — we’ll link the exact page. Copy the long string the site calls an “API key.” Treat it like a password.',
    ),
    minutes: 10,
    proof: L(
      'You are on **dedicated hardware** (or a named exception), you have an OpenRouter or OpenCode account with an API key saved where you can paste it, and you know cloud chats leave the host.',
    ),
    sections: [
      {
        heading: L('Your machine'),
        blocks: [
          { k: 'p', text: L(
            'This course assumes you install Hermes on a **machine that exists for the agent** — a spare PC, mini-PC, old laptop wiped for this purpose, or similar. Not the computer that holds banking, work SSO, password vaults, and family photos.',
          ) },
          { k: 'p', text: L(
            'Why: once tools are on, the agent can act like a **capable operator with a shell** on that OS. Treat the host as something you can wipe and rebuild without wrecking daily life.',
          ) },
          { k: 'list', items: [
          L('**Windows, macOS, or Linux** Desktop as offered for your build'),
          L('**Hermes home** is a folder on that host — everything the agent keeps is plain files'),
          L('Next lesson (**03**) installs Desktop on this box'),
        ] },
          { k: 'callout', variant: 'note', text: L(
          'Spare machine already ready? You have the baseline. If you want a different shape later — local weights, Docker, a VPS that stays awake, or a privacy-oriented provider — open **Curated alternatives** at the bottom of this page. Otherwise go straight to install.',
        ) },
          { k: 'quiz', quiz: {
            question: L('Default host for this course?'),
            options: [
              L('Any daily banking laptop'),
              L('A dedicated lab machine'),
              L('Public library kiosk only'),
              L('Shared family tablet only'),
            ],
            correct: L('A dedicated lab machine'),
            explain: L('Baseline is dedicated hardware. Daily laptop with banking/SSO is not the default.'),
          } },
          { k: 'quiz', quiz: {
            question: L('Using free cloud models means…'),
            options: [
              L('Data never leaves your PC'),
              L('Chat content can leave host'),
              L('Files encrypt themselves'),
              L('Gateway is unnecessary'),
            ],
            correct: L('Chat content can leave host'),
            explain: L('Cloud brains send conversation/tool context to the model host. Convenience is not privacy.'),
          } },
        ],







      },
      {
        heading: L('Where the brain runs (day one)'),
        blocks: [
          { k: 'p', text: L(
            'Hermes on your dedicated box is the **cockpit**, but the brain runs elsewhere on day one. Pick **one** free route — [OpenRouter](https://openrouter.ai/models?q=free) or [OpenCode](https://opencode.ai/auth) — and create the account now, so install in lesson 03 is copy-paste instead of a detour.',
          ) },
          { k: 'steps', id: '1', items: [
            { title: L('Create a free account on **either** OpenRouter or OpenCode. One is enough — you can add the other later.') },
            { title: L('Generate an **API key** in that account. OpenRouter hands you one during signup; on OpenCode, open **API Keys** and create one (screenshot below).') },
            { title: L('Copy it somewhere you can paste from in lesson 03 — a password manager, not a sticky note or a chat window.') },
          ] },
          { k: 'image', src: '/courses/open-harness/screenshots/opencode-api-keys.jpg', width: 1280, height: 510,
            alt: L('The OpenCode dashboard, API Keys tab: a “Create API Key” button top right, a name field filled in with “Hermes Agent” and a Create button, and a table of existing keys below.'),
            caption: L('OpenCode → **API Keys** → **Create API Key**. Name it something you will recognise later (“Hermes Agent”), then copy the key once — it is shown in full only at creation.'),
          },
          { k: 'callout', variant: 'warning', text: L(
            'That key is a **credential**: anyone holding it can spend on your account. Never paste it into a chat with the agent, a public repo, or a screenshot.',
          ) },
          { k: 'list', items: [
          L('Your prompts, replies, and often tool context **leave the host** on these routes. Useful for learning — not private.'),
          L('**Do not** paste secrets, customer data, or keys into cloud chats “just to try”'),
        ] },
          { k: 'links', items: [
          { label: L('OpenRouter free models'), href: OPENROUTER_FREE_MODELS_URL },
          { label: L('OpenCode free models'), href: OPENCODE_PRICING_URL },
        ] },
        ],



      },
      {
        heading: L('Curated alternatives'),
        advanced: true,
        blocks: [
          { k: 'p', text: L(
            'Day one is Hermes Desktop on a spare machine with a free cloud model, and that is enough to finish the course. Everything below is for when you want a **different shape** — and each one needs setup work this course does not walk through.',
          ) },
          { k: 'table', headers: [L('If you want…'), L('We point you to'), L('Extra steps this course does not cover')], rows: [
            [
              L('**The agent running locally**'),
              L('Open weights via **Hugging Face**, run on a GPU box you own'),
              L('GPU sizing, downloading weights, running an inference server'),
            ],
            [
              L('**Docker on a personal PC**'),
              L('Official **Hermes Docker / terminal backends** — never a bare host shell'),
              L('Container setup, volume mapping, which mounted folders to back up'),
            ],
            [
              L('**A VPS, alive 24/7**'),
              L('**Infomaniak** (Swiss jurisdiction) for the host, **Nous** Portal for models'),
              L('Renting and hardening a server, SSH keys, firewall, jurisdiction choice'),
            ],
            [
              L('**Anonymity or privacy**'),
              L('**Venice.ai** as a provider, or local weights if you can run them'),
              L('Provider policy, payment and identity hygiene, what still leaks'),
            ],
          ] },
          { k: 'callout', variant: 'note', text: L(
            'These are preferences, not contracts, and we deliberately do not turn them into full tutorials — each depends on your hardware, budget, and threat model. The links below are the right starting points. If you would rather have it set up properly for your situation, [ask us](/contact/?topic=open-harness) — that is the kind of thing we do.',
          ) },
          { k: 'callout', variant: 'warning', text: L(
          'No spare box yet? Pause install, rent a small VPS (or wipe an old machine), then continue. Do not “just try it” bare on the daily laptop.',
        ) },
          { k: 'checklist', id: '2', items: [
          L('I can name at least one path I might use after free day-one models'),
        ] },
          { k: 'checklist', id: '3', items: [
          L('I am on **dedicated hardware**, or I named VPS / personal+Docker'),
        ] },
          { k: 'links', label: L('Good starting points'), items: [
          { label: L('Nous Research'), href: NOUS_RESEARCH_URL },
          { label: L('Hermes (Desktop / docs)'), href: HERMES_DESKTOP_URL },
          { label: L('Hugging Face models'), href: HUGGINGFACE_MODELS_URL },
          { label: L('Infomaniak (CH VPS / cloud)'), href: INFOMANIAK_URL },
          { label: L('Venice.ai'), href: VENICE_AI_URL },
          { label: L('Hermes Docker / backends'), href: HERMES_DOCKER_DOCS },
          { label: L('Providers docs'), href: HERMES_PROVIDERS_DOCS },
          { label: L('Installation (all methods)'), href: HERMES_INSTALL_DOCS },
        ] },
          { k: 'links', label: L('Want this set up for you?'), items: [
          { label: L('Ask Delta V — tailored local, Docker, VPS or privacy setup'), href: DELTAV_CONTACT_HARNESS },
        ] },
        ],






      },
      {
        heading: L('You are ready for install when'),
        blocks: [
          { k: 'checklist', id: '0', items: [
          L('I have (or will use) a **dedicated** machine for this course'),
          L('I know what does **not** live on that machine'),
          L('Host path is clear: **dedicated** (default) · VPS · or personal+Docker'),
          L('I have an **OpenRouter or OpenCode account**, and its API key is saved where I can paste it'),
          L('I accept that **cloud models** send conversation content off the machine'),
        ] },
          { k: 'p', text: L(
            'Next: lesson **03** — install Hermes on that host and get one chat reply.',
          ) },
        ],

      },
    ],
  },

  // ─── 03 ─────────────────────────────────────────────
  {
    id: 'install',
    slug: '03',
    number: '03',
    part: 1,
    title: L('Install Hermes Desktop'),
    subtitle: L(
      'Install on the host you chose in 02. If you’re OK with prompts processed on a remote server, enable the free cloud model now. (Switch to local later.)',
    ),
    minutes: 30,
    proof: L(
      'Hermes chats on your **dedicated host** (or documented exception) using a free OpenRouter or OpenCode model (or another provider you chose).',
    ),
    sections: [
      {
        heading: L('You need'),
        blocks: [
          { k: 'list', items: [
          L('The machine from lesson **02** — [dedicated hardware](~dedicated-host) by default (Windows, macOS, or Linux Desktop as offered)'),
          L('If you took an exception: VPS ready, or personal PC with a Docker isolation plan'),
          L('The **API key** you saved in lesson 02, ready to paste'),
        ] },
          { k: 'callout', variant: 'warning', text: L(
          'If you skipped lesson 02: stop. Baseline is a **dedicated** box — not “whatever laptop is open.”',
        ) },
        ],



      },
      {
        heading: L('Get the installer'),
        blocks: [
          { k: 'p', text: L(
            'Open [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/) on the host you chose in lesson 02 and take the **Desktop app** download for that OS. There is a terminal one-liner too, but the graphical installer is the safer route — lesson 10 explains why piping a remote script into a shell is a habit worth not forming.',
          ) },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-install-page.jpg', width: 1280, height: 693,
            alt: L('The hermes-agent.nousresearch.com home page: “The agent that grows with you”, an “Install Desktop app” section with a Download for Windows button, and an “Install via terminal” box offering macOS, Linux and Windows.'),
            caption: L('**Install Desktop app** is the course default. The terminal option below it is for people who already know why they want it.'),
          },
        ],
      },
      {
        heading: L('Install Desktop (on the chosen host)'),
        blocks: [
          { k: 'p', text: L(
            'Later modules assume this cockpit: chat, profiles, tools, approvals, gateway, and cron — on the **host you selected**, not on a random daily-driver “for now.”',
          ) },
          { k: 'callout', variant: 'note', text: L(
          `Verified path (${OPEN_HARNESS_META.verifiedAsOf}): **Desktop on dedicated hardware** + free OpenRouter or OpenCode models. Cloud chats leave the host. If a wizard label moved, official docs win.`,
        ) },
          { k: 'steps', id: '2-steps', items: [{ title: L('Confirm install target is the **dedicated** host from lesson 02 (or your written exception).') }, { title: L('Run the installer and let it finish — it downloads dependencies and configures the machine once.') }, { title: L(
            '**Exception only** (personal PC path): enable Docker / isolated terminal backends before aggressive tools — or use a VPS instead.',
          ) }, { title: L('Launch Hermes when setup completes.') }] },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-installer-progress.jpg', width: 1280, height: 693,
            alt: L('The Hermes installer window, “Setting up Hermes Agent”, showing a progress bar at 0 of 16 steps and a list including installing the uv package manager, verifying Python 3.11, cloning the Hermes repository, building the desktop app and configuring API keys and models.'),
            caption: L('Sixteen steps, **10–15 minutes**, once. Later launches skip it. Nothing here needs your input — if it stalls, note the step name before you retry.'),
          },
          { k: 'links', items: [
          { label: L('Download Hermes Desktop'), href: HERMES_DESKTOP_URL },
          { label: L('Installation docs'), href: HERMES_INSTALL_DOCS },
          { label: L('Docker guide (exception path)'), href: HERMES_DOCKER_DOCS },
          { label: L('Quickstart'), href: 'https://hermes-agent.nousresearch.com/docs/getting-started/quickstart' },
        ] },
        ],






      },
      {
        heading: L('Connect your free model'),
        blocks: [
          { k: 'p', text: L(
            'On first launch Hermes asks for a model provider. Nous Portal is offered as the recommended one-click option — it is a paid subscription, and you do not need it to finish this course. Choose **I have an API key** and paste the key you saved in lesson 02.',
          ) },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-provider-setup.jpg', width: 1280, height: 693,
            alt: L('The Hermes first-run dialog, “Let’s get you setup with Hermes Agent — connect a model provider to start chatting”, offering Nous Portal marked Recommended, an “Other providers” expander, and links to choose a provider later or to say “I have an API key”.'),
            caption: L('**I have an API key** (bottom right) is the free path. **Other providers** expands the list if you want to pick OpenRouter or OpenCode explicitly.'),
          },
          { k: 'p', text: L(
            'Choosing **I have an API key** opens the provider list. Find the provider you signed up with in lesson 02 — **OpenRouter**, or **OpenCode Zen** if you went that way — and paste your key into its row. Each provider has its own row, so paste into the one you actually created the key for; a key in the wrong row simply will not work. One is enough to start, and you can add more whenever you want.',
          ) },
          { k: 'p', text: L(
            'You can come back to this any time under **Settings → Providers → API keys**, which is also how you check a key landed: providers with a key show a filled dot and a masked value, the rest still say “Paste … key”.',
          ) },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-api-keys-verify.jpg', width: 1280, height: 693,
            alt: L('Hermes Settings on the Providers → API keys page, listing providers such as Fireworks AI, OpenRouter, Anthropic, xAI, DeepSeek, OpenCode Zen and OpenCode Go. OpenRouter, OpenCode Zen and OpenCode Go show masked keys; the others show “Paste … key” placeholders.'),
            caption: L('Set keys show masked (`sk-…`); empty ones invite a paste. Only the provider you actually use needs one.'),
          },
          { k: 'p', text: L(
            'With the key in place, pick the model. Type `free` in the model search and Hermes filters to the routes that cost nothing — OpenCode Zen and OpenRouter both publish several. Take one and get a reply. OpenRouter and OpenCode are **not exclusive**: add both if you like, and the free models from each show up side by side in this list. More routes means more to fall back on when one is busy.',
          ) },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-free-models.jpg', width: 1280, height: 692,
            alt: L('The Hermes model picker filtered by the word “free”, listing free models grouped under OpenCode Zen (Deepseek V4 Flash, Mimo V2.5, Hy3, Ling 3.0 Tiny, Nemotron 3 Ultra, Nemotron 3.5 Lightning, Laguna S 2.1, North Mini Code) and under OpenRouter (Nemotron 3 Super 120b, Nemotron 3 Ultra 550b).'),
            caption: L('Search **free** to filter the list. Free models rotate and rate-limit — if one is busy, take another from this list rather than abandoning the setup.'),
          },
          { k: 'links', items: [
          { label: L('Hermes providers docs'), href: HERMES_PROVIDERS_DOCS },
          { label: L('Lesson 02 — get your API key'), href: '/forge/course/my-first-ai-agent/02/' },
        ] },
        ],





      },
      {
        heading: L('First contact'),
        blocks: [
          { k: 'p', text: L(
            'Say hello and get one reply — that is the proof. Then open Settings once (the gear, top right) to learn the layout, and continue.',
          ) },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-first-chat.jpg', width: 1280, height: 695,
            alt: L('The Hermes chat window: a message reading “hello :D” and the agent replying “Hello! How can I help you today?”, with a sessions sidebar on the left and the settings gear highlighted top right showing an “Open settings” tooltip.'),
            caption: L('One reply is the whole proof for this lesson. The gear top right opens Settings.'),
          },
          { k: 'list', items: [
          L('**Providers / models** — where your keys live and which model answers'),
          L('**Gateway / messaging** — lesson 05; leave closed for now'),
        ] },
          { k: 'checklist', id: '2', items: [
          L('Install is on my **dedicated** host (or named exception)'),
          L('My lesson 02 API key is pasted into a Hermes provider'),
          L('Hermes replies once with a free (or chosen) model'),
        ] },
        ],


      },
      {
        heading: L('Where your files live'),
        blocks: [
          { k: 'p', text: L(
            'Everything Hermes keeps is plain files, in this profile’s [Hermes home](https://hermes-agent.nousresearch.com/docs/user-guide/configuration) on that host — often `~/.hermes`, or under your user AppData on Windows. You do not need to touch it today; lesson 04 sends you there to write the personality file.',
          ) },
          { k: 'links', items: [
          { label: L('Configuration'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/configuration' },
          { label: L('Updating'), href: 'https://hermes-agent.nousresearch.com/docs/getting-started/updating' },
        ] },
        ],


      },
      {
        heading: L('Optional companions'),
        blocks: [
          { k: 'p', text: L(
            'Nothing here is required. Hermes ships a pet — an animated mascot that floats over the app and reacts to what the agent is doing — under **Settings → Appearance**. Pick one if you like it; it changes nothing about the harness. IDE-shaped coding agents are optional too: add them only after Hermes works, and only under the same isolation rules as the host.',
          ) },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-pet.jpg', width: 1280, height: 693,
            alt: L('Hermes Settings on the Appearance page, showing a “Pet” section with a “Choose a pet” grid of mascots such as Crafternauta, Jill Stingray, Nukey, Socksy and Cache Capy, plus Size and Roam controls, and a large yellow robot mascot previewed in the sidebar.'),
            caption: L('**Settings → Appearance → Pet.** Pure decoration — mentioned only so you know what the floating character is when it appears.'),
          },
        ],

      },
      {
        advanced: true,
        heading: L('Other deploy shapes (reference)'),
        blocks: [
          { k: 'p', text: L(
            'If you need a layout beyond dedicated Desktop / VPS / Docker isolation, map it deliberately or ask for help.',
          ) },
          { k: 'list', items: [
          L('Nous Portal subscription — models + tool gateway under official Portal setup'),
          L('Own infra — local/self-hosted models; Hermes on the same machine or a LAN endpoint'),
          L('Cloud providers — keys in Providers (OpenRouter, OpenCode, and others listed in docs)'),
          L('Multi-machine — split Desktop UI, always-on gateway, and model host across boxes'),
        ] },
          { k: 'callout', variant: 'note', text: L(
          'For a tailored multi-host, team, or hardened layout, [contact Delta V](/contact/?topic=open-harness) — our engineers design and ship Hermes setups beyond this free course.',
        ) },
          { k: 'links', items: [
          { label: L('All install methods'), href: 'https://hermes-agent.nousresearch.com/docs/getting-started/installation' },
          { label: L('Docker guide'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/docker' },
          { label: L('Providers docs'), href: 'https://hermes-agent.nousresearch.com/docs/integrations/providers' },
          { label: L('Contact Delta V — tailored setup'), href: '/contact/?topic=open-harness' },
        ] },
        ],





      },
    ],
  },

  // ─── 04 ─────────────────────────────────────────────
  {
    id: 'soul',
    slug: '04',
    number: '04',
    part: 1,
    title: L('Soul pack'),
    subtitle: L('Giving Your Agent a Personality: tell it who it is and the rules it must follow.'),
    minutes: 25,
    proof: L(
      'You adopted a personality file for this profile; the agent describes itself and its hard limits in that voice. You know personality files live with the app profile — not inside a random project folder.',
    ),
    sections: [
      {
        heading: L('What SOUL.md is'),
        blocks: [
          { k: 'p', text: L(
            '`SOUL.md` is the agent’s identity file: name, role, tone, hard limits. Hermes treats it as [primary personality](https://hermes-agent.nousresearch.com/docs/user-guide/features/personality) and loads it every session, whatever folder you are in. Prefer a short brief (~12–20 lines) over a one-line slogan.',
          ) },
          { k: 'callout', variant: 'quote', text: L(
          'One profile = one soul. Two profiles never share personality or memory by accident.',
        ) },
        ],



      },
      {
        heading: L('What AGENTS.md is'),
        blocks: [
          { k: 'p', text: L(
            '`AGENTS.md` is the other half: a [project context file](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files) that sits in one folder — a repo, a campaign workspace — and describes what **that** project needs. Paths, conventions, things never to do. It travels with the folder, so a teammate cloning the repo gets the same rules.',
          ) },
          { k: 'p', text: L(
            'The split is simple: if it should hold in every session, it is identity (`SOUL.md`). If it only makes sense inside one folder, it is project context (`AGENTS.md`). Both load together; only one project-context file type loads per session.',
          ) },
          { k: 'copycards', items: [
            { src: '/courses/open-harness/samples/AGENTS.example.md', title: 'AGENTS.md', why: 'Starter project context — paths, conventions, hard nevers' },
          ] },
          { k: 'callout', variant: 'warning', text: L(
            'Read project context files that came from repos you did not write. They are instructions your agent will follow, and a hostile one is a real way to get an agent to act against you.',
          ) },
        ],



      },
      {
        heading: L('Ethics in the soul (Delta V)'),
        blocks: [
          { k: 'p', text: L(
            'Every ready-to-adopt [soul](~soul) embeds two compass ideas (inspired by Brian Roemmele’s public writing) that match Delta V ethics: self-ownership, open source, public good, and a benevolent attitude toward people and systems.',
          ) },
          { k: 'list', items: [
          L(
            '[Love equation](https://x.com/BrianRoemmele/status/1991946547182059687) (simplified): emotional / care complexity grows when cooperation outweighs defection — dE/dt = β (C − D) E. In practice: prefer help over harm, honesty over theater, human dignity over clever exploitation.',
          ),
          L(
            '[Joule Work](https://x.com/BrianRoemmele/status/2017995855417225633) (JW): value work by real cost and useful output (energy × efficiency × quality), not hype or status. Prefer reversible, efficient steps; measure what you did; avoid wasteful loops.',
          ),
          L(
            'Together: the agent should be useful and kind under your ownership — open files, open methods where possible, public-good defaults, no manipulative pressure.',
          ),
        ] },
          { k: 'callout', variant: 'note', text: L(
          'These are ethical priors for `SOUL.md`, not a crypto product pitch. Adapt wording; keep the spirit when you edit a template.',
        ) },
          { k: 'links', items: [
          {
            label: L('Roemmele — wisdom / Love equation context (X)'),
            href: 'https://x.com/BrianRoemmele/status/1991946547182059687',
          },
          {
            label: L('Roemmele — JouleWork framing (X)'),
            href: 'https://x.com/BrianRoemmele/status/2017995855417225633',
          },
        ] },
        ],





      },
      {
        heading: L('Ready-to-adopt souls'),
        blocks: [
          { k: 'p', text: L(
            'Every template follows the same four-part shape the [official guide](https://hermes-agent.nousresearch.com/docs/guides/use-soul-with-hermes) recommends — **identity, style, avoid, defaults** — plus hard limits, which is where ownership actually lives. Pick one, read it, copy it; you will paste it into the profile dialog in the next section.',
          ) },
          { k: 'copycards', items: [
            { src: '/courses/open-harness/souls/orchestrator.md', title: 'Orchestrator', why: 'Plans, runs steps in order, keeps receipts' },
            { src: '/courses/open-harness/souls/analyst.md', title: 'Analyst', why: 'Separates evidence from speculation, cites inline' },
            { src: '/courses/open-harness/souls/ops.md', title: 'Ops', why: 'One reversible step at a time, logs what it touched' },
            { src: '/courses/open-harness/souls/writer.md', title: 'Writer', why: 'Drafts in your voice, cuts the filler' },
            { src: '/courses/open-harness/souls/coach.md', title: 'Coach', why: 'Asks before advising, ends with one next action' },
            { src: '/courses/open-harness/souls/coder.md', title: 'Coder', why: 'Small diffs, stated trade-offs, how to verify' },
            { src: '/courses/open-harness/souls/reviewer.md', title: 'Reviewer', why: 'Investigates before judging, ranks severity, clear verdict' },
            { src: '/courses/open-harness/souls/kids-safe.md', title: 'Kids-safe', why: 'Simple words, hard limits, parent nearby' },
            { src: '/courses/open-harness/souls/sales.md', title: 'Sales', why: 'Honest outreach, drafts only — you send' },
          ] },
          { k: 'callout', variant: 'note', text: L(
            'The Reviewer soul has a built-in sibling: the `/review` command spawns an independent subagent that investigates the last 10 messages — it opens the work, runs the tests where feasible, and sends a structured review back into your session. You can pin a dedicated reviewer model under Settings → Model → Auxiliary models (`auxiliary.review`): a second set of eyes works best when it is not the same eyes.',
            'L’âme Reviewer a un frère intégré : la commande `/review` lance un sous-agent indépendant qui enquête sur les 10 derniers messages — il ouvre le travail, lance les tests quand c’est faisable, et renvoie une revue structurée dans votre session. Vous pouvez épingler un modèle relecteur dédié dans Settings → Model → Auxiliary models (`auxiliary.review`) : un second regard fonctionne mieux quand ce n’est pas le même regard.',
          ) },
          { k: 'p', text: L(
            'Writing your own instead? Answer these five, and the answers **are** the file — one section each. Keep it to 12–20 lines: a soul should be stable and specific in voice, not a dumping ground for temporary instructions.',
          ) },
          { k: 'table', headers: [L('Ask yourself'), L('Becomes')], rows: [
            [L('Who is this agent, and what does it care about more than sounding impressive?'), L('The opening two lines — **identity**')],
            [L('How should it talk when it disagrees with me?'), L('**Style**')],
            [L('What tone or habit would make me close the window?'), L('**Avoid**')],
            [L('What should it do every time, without being asked?'), L('**Defaults**')],
            [L('What must it never do, even if I ask in a hurry?'), L('**Hard limits**')],
          ] },
          { k: 'callout', variant: 'note', text: L(
            'The guide’s advice is to iterate, not to get it right first: start from a template, cut what does not apply, add four to eight lines that are actually yours, then talk to it and adjust what grates.',
          ) },
        ],


      },
      {
        heading: L('Give it a soul'),
        blocks: [
          { k: 'p', text: L(
            'You do not have to hunt for the file on disk — Hermes takes the soul when you create the profile. Open the profile menu at the bottom left of the sidebar and choose **Manage profiles**.',
          ) },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-manage-profiles.jpg', width: 1280, height: 693,
            alt: L('The Hermes chat window with a “Manage profiles…” tooltip showing above the profile button at the bottom left of the sessions sidebar.'),
            caption: L('Bottom left of the sidebar → **Manage profiles**.'),
          },
          { k: 'p', text: L(
            'Create a new profile, give it a lowercase name, and paste your chosen soul into the **SOUL.md** field. **Clone from** copies config and skills from an existing profile — leave it on `default` for your first one.',
          ) },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-new-profile.jpg', width: 1280, height: 693,
            alt: L('The Hermes “New profile” dialog: a Name field containing “pip”, a “Clone from” dropdown set to default, and a SOUL.md text area holding the kids-safe template beginning “You are **Pip**, a careful helper for younger users (with a parent nearby).”'),
            caption: L('The **SOUL.md** field takes the template directly. Paste, then **Create profile** — no file browsing.'),
          },
          { k: 'steps', id: '4-steps', items: [{ title: L('Open **Manage profiles** and create a new profile with a lowercase name.') }, { title: L('Paste a soul into the `SOUL.md` field. Keep project paths out of it — those belong in `AGENTS.md`.') }, { title: L('Create the profile, then start a session on it and ask: “Who are you and what are your hard limits?”') }, { title: L('Optional: place a short `AGENTS.md` in a real project folder and ask a project-specific question from that directory.') }] },
          { k: 'checklist', id: '4', items: [
          L('I picked a ready-to-adopt soul for a real reason (why choose)'),
          L('The agent answered who it is and its hard limits'),
          L('I know personality file ≠ project rules file'),
        ] },
          { k: 'links', items: [
          { label: L('Use `SOUL.md` guide'), href: 'https://hermes-agent.nousresearch.com/docs/guides/use-soul-with-hermes' },
        ] },
        ],



      },
    ],
  },

  // ─── 05 Gateway (after soul, before deep tools) ─
  {
    id: 'gateway',
    slug: '05',
    number: '05',
    part: 1,
    title: L('Gateway (your pocket surface)'),
    subtitle: L(
      'Chat with your agent from an app you already use. We recommend Telegram; you may use Discord, Slack, Signal, WhatsApp, or another Hermes-supported platform.',
    ),
    minutes: 25,
    proof: L(
      'You sent a message from your chosen messaging app, got a real reply from your profile, and only you (allowlist / pairing) can reach the agent.',
    ),
    sections: [
      {
        heading: L('Why gateway sits here'),
        blocks: [
          { k: 'p', text: L(
            'With Desktop installed and SOUL written, a messaging surface is the fastest proof the harness is real outside the laptop window. Wire one platform before deep tool theory; Part I then expands what the agent can do with hands (tools).',
          ) },
          { k: 'p', text: L(
            'A harness confined to one desktop window is incomplete. Gateway is how you operate from your phone or, later, from an always-on host without daily SSH.',
          ) },
          { k: 'callout', variant: 'note', text: L(
          'Order: Install → Soul → Gateway (one platform) → Tools.',
        ) },
        ],



      },
      {
        heading: L('Pick your surface (you choose)'),
        blocks: [
          { k: 'p', text: L(
            'Hermes supports [many messaging platforms](https://hermes-agent.nousresearch.com/docs/user-guide/messaging) (Telegram, Discord, Slack, WhatsApp, Signal, Matrix, Teams, and more). You are free to use the one that fits your privacy, work, or household. This course does not require Telegram.',
          ) },
          { k: 'list', items: [
          L(
            'Recommended default: [Telegram](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram) — strong adoption, bot setup is common, and threads/topics help keep long agent chats tidy. Good for beginners who already use TG.',
          ),
          L(
            'Strong privacy default: [Signal](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/signal) — when end-to-end culture matters most; setup is usually heavier (signal-cli path).',
          ),
          L(
            'Work defaults: [Slack](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/slack) or [Discord](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/discord) — when the agent should live where your team already chats.',
          ),
          L(
            'WhatsApp / others — valid if Hermes lists them in official messaging docs for your build; follow that platform’s page.',
          ),
        ] },
          { k: 'callout', variant: 'note', text: L(
          'One platform is enough for Part I. Do not wire three messengers before tools work.',
        ) },
          { k: 'links', items: [
          { label: L('Messaging overview (all platforms)'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging' },
          { label: L('Telegram (recommended path)'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram' },
          { label: L('Discord'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging/discord' },
          { label: L('Slack'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging/slack' },
          { label: L('Signal'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging/signal' },
          { label: L('WhatsApp'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging/whatsapp' },
        ] },
        ],





      },
      {
        heading: L('Universal trust rules (every platform)'),
        blocks: [
          { k: 'list', items: [
          L('[Allowlist](https://hermes-agent.nousresearch.com/docs/user-guide/security) or pairing so only your account can talk to the agent. If nobody is allowlisted, nobody should get through.'),
          L('Store tokens/secrets in the app env — never in a public channel or git.'),
          L('Do not open the bot to the whole internet “for a test.”'),
          L('Leave Desktop (or the gateway process) running while you prove the first reply.'),
        ] },
          { k: 'callout', variant: 'warning', text: L(
          'Official platform docs win if a button label moved. “Only me” access habits stay the same on every messenger.',
        ) },
          { k: 'links', items: [
          { label: L('Security (allowlists)'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/security' },
        ] },
        ],




      },
      {
        heading: L('Recommended walkthrough: Telegram'),
        blocks: [
          { k: 'p', text: L(
            'Use this if you chose Telegram. If you chose another platform, skip to that official page and complete the same proof checklist below.',
          ) },
          { k: 'p', text: L(
            'Everything happens on one screen: **Messaging** in the Hermes sidebar, then Telegram in the platform list. Two fields matter — the **bot token** (required) and the **allowed user IDs** (technically optional, and the reason this lesson exists).',
          ) },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-messaging-telegram.jpg', width: 1280, height: 697,
            alt: L('The Hermes Messaging settings: a list of platforms down the left (Telegram, Discord, Slack, Mattermost, Matrix, WhatsApp, Signal, Email and more) with Telegram selected. The panel shows Telegram marked Disabled / Needs setup / Messaging gateway stopped, a “Get your credentials” note pointing at @BotFather and @userinfobot, a required Bot token field, and a recommended “Allowed Telegram user IDs” field warning that without it anyone can DM your bot.'),
            caption: L('Hermes labels the allowlist “recommended”. Read its own warning: **without it, anyone can DM your bot** — and your bot has tools on your machine. Treat it as required.'),
          },
          { k: 'steps', id: '3-steps', items: [{ title: L('Open Telegram → @BotFather → `/newbot` → copy the token it gives you.') }, { title: L('Get your numeric user id from @userinfobot — you need it for the next step.') }, { title: L('In Hermes: **Messaging → Telegram**. Paste the bot token.') }, { title: L('Paste your user id into **Allowed Telegram user IDs**, then **Save changes**.') }, { title: L('Start the gateway. Leave Hermes running during the test.') }, { title: L('Message the bot: “Who are you and what are your hard limits?” — the answer should match your SOUL.') }] },
          { k: 'links', items: [
          { label: L('Telegram setup (official)'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram' },
        ] },
        ],



      },
      {
        heading: L('If you chose another platform'),
        blocks: [
          { k: 'steps', id: '4-steps', items: [{ title: L('Open the official Hermes page for Discord, Slack, Signal, WhatsApp, or your pick (links above).') }, { title: L('Create the bot/app or link the device as that page requires.') }, { title: L('Connect credentials in Desktop gateway / messaging for that platform.') }, { title: L('Restrict who can talk (allowlist, admin list, or pairing — whatever the platform supports).') }, { title: L('Send the SOUL check: “Who are you and what are your hard limits?”') }] },
        ],

      },
      {
        heading: L('Runtime notes'),
        blocks: [
          { k: 'list', items: [
          L('The PC must stay awake while this machine hosts the gateway.'),
          L('One profile ≈ one bot/app identity when you need concurrent personas later.'),
          L('You can add a second platform after Part I — not before the tools proof.'),
        ] },
          { k: 'checklist', id: '5', items: [
          L('I named which platform I use for this course'),
          L('Bot/app replies from my profile'),
          L('Only I can reach it (allowlist / pairing)'),
          L('Token/secrets not written into public notes or git'),
        ] },
        ],


      },
    ],
  },

  // ─── 06 First agency ─────────────────────────
  {
    id: 'agency',
    slug: '06',
    number: '06',
    part: 1,
    title: L('First agency'),
    subtitle: L(
      'Your First Real Task: opt out of data brokers, with your permission, and open a receipt on disk.',
    ),
    minutes: 40,
    /** Loop diagram sits under the loop section — not a double stack under the title */
    visualPlacement: 'none',
    proof: L(
      'Approval mode is Smart or Manual, you ran one lane (unbroker-ge or unbroker-eu) through the queue, made at least one deliberate approve or deny, and opened unbroker-receipt.md offline.',
    ),
    sections: [
      {
        heading: L('Set the approval gate (before you start)'),
        blocks: [
          { k: 'p', text: L(
            'Agency without a gate is a liability, so set this **before** the agent touches anything. [Smart approvals](https://hermes-agent.nousresearch.com/docs/user-guide/security) let low-risk steps through and stop on uncertainty. Manual is slower and perfectly fine. Full auto-approve modes (sometimes labelled YOLO) are expert-only — leave them off for this course.',
          ) },
          { k: 'p', text: L(
            'It lives in **Settings → Safety → Approval Mode**. `Smart` is the course default. `Off` is the one to avoid — that is the auto-approve mode.',
          ) },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-approval-mode.jpg', width: 1280, height: 690,
            alt: L('Hermes Settings on the Safety page. Approval Mode is set to Smart with a dropdown open showing Manual, Smart (ticked) and Off. Below it: Approval Timeout of 300, Confirm MCP Reloads, Command Allowlist, Redact Secrets, Allow Private URLs, Browser Private URLs, Local Browser For Private URLs and File Checkpoints toggles.'),
            caption: L('**Settings → Safety.** Two more worth leaving on while you learn: **Redact Secrets** hides detected secrets from the model, and **File Checkpoints** takes a rollback snapshot before file edits.'),
          },
          { k: 'steps', id: '5-steps', items: [{ title: L('Set Approval Mode to **Smart** or **Manual** — never `Off`.') }, { title: L('Decide your rule now, so you are not deciding under pressure: approve steps **inside** the folder you are working in, deny anything that deletes or wanders outside it.') }] },
          { k: 'links', items: [
          { label: L('Security / approvals'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/security' },
        ] },
        ],
      },
      {
        heading: L('Know your cost (light)'),
        blocks: [
          { k: 'p', text: L(
            '[Provider](https://hermes-agent.nousresearch.com/docs/integrations/providers) (OpenRouter, OpenCode, …) is where the key lives; model is capability and price. Free tiers still have limits. Before blaming the model, know what is already loaded in an empty session.',
          ) },
          { k: 'steps', id: '7-steps', items: [{ title: L('Note which provider and model are currently selected — you will want to know which one did the work.') }, { title: L('Optional: open the context / usage view in Desktop and jot the two biggest slices (tools / skills / memory).') }] },
          { k: 'callout', variant: 'note', text: L(
            'One habit that quietly multiplies your bill: switching models mid-session. Every switch invalidates the prompt cache on the model you switch to, and you repay the full input-token price for everything already loaded — tools, skills, memory, history. Not a Hermes quirk; a fundamental of inference. Pick a model per session and stay on it; route side tasks to auxiliary models instead.',
            'Une habitude qui multiplie discrètement la facture : changer de modèle en pleine session. Chaque bascule invalide le cache de prompt du modèle d’arrivée, et vous repayez plein tarif les tokens d’entrée pour tout ce qui est déjà chargé — outils, skills, mémoire, historique. Ce n’est pas une bizarrerie d’Hermes ; c’est un fondamental de l’inférence. Choisissez un modèle par session et gardez-le ; confiez plutôt les tâches annexes aux modèles auxiliaires.',
          ) },
          { k: 'tweet', id: '2081381590488568218', author: '@witcheer', height: 812,
            href: 'https://x.com/witcheer/status/2081381590488568218',
            caption: L('`hermes prompt-size` prints the fixed budget of a fresh session — note that tool schemas are the bigger half, and that it runs offline with no API call.'),
          },
          { k: 'links', items: [
          { label: L('Lab: Prompt budget audit'), href: '/forge/course/my-first-ai-agent/labs/prompt-budget/' },
          { label: L('Providers docs'), href: 'https://hermes-agent.nousresearch.com/docs/integrations/providers' },
        ] },
        ],



      },
      {
        heading: L('Put your agent to work'),
        blocks: [
          { k: 'p', text: L(
            'Pick **one** lane. Same job either way: install the skill, consent once, drain the queue, open the receipt. Official Hermes `unbroker` is US people-search — not this mission.',
          ) },
          { k: 'table', headers: [L('You are'), L('Skill'), L('Law')], rows: [
            [L('Living in **Geneva / Switzerland**'), L('`unbroker-ge`'), L('nLPD / FADP, French letters')],
            [L('An **EU or UK** resident'), L('`unbroker-eu`'), L('GDPR Arts. 17 and 21')],
          ] },
          { k: 'p', text: L(
            'Read the approval prompt once. Approve official opt-out forms and writes inside the folder you named. Deny deletes, anything that wanders off, and any attempt to attach an identity document.',
          ) },
          { k: 'callout', variant: 'warning', text: L(
            'You only run this on **yourself**. The engine refuses to plan without recorded consent. Not legal advice. This course does **not** connect an email account: the agent submits **web forms** in the browser; anything that is a letter is a `.txt` draft **you** send from your own mailbox. Credit bureaus that demand an ID (CRIF, SCHUFA, Experian…) stay in the digest.',
          ) },
          { k: 'code', block: {
            label: L('Lane A — Switzerland'),
            lang: 'sh',
            code: 'hermes skills install github:deltaVgit/website-private/public/courses/open-harness/skills/unbroker-ge',
            note: L('Desktop fallback: copy the `unbroker-ge` folder into this profile’s skills dir, e.g. `%LOCALAPPDATA%\\hermes\\profiles\\<profile>\\skills\\security\\unbroker-ge\\` on Windows. Not `~/.hermes/skills` unless that is actually your install.'),
          } },
          { k: 'code', block: {
            label: L('Lane B — EU / UK resident'),
            lang: 'sh',
            code: 'hermes skills install github:deltaVgit/website-private/public/courses/open-harness/skills/unbroker-eu',
            note: L('Same fallback: copy `unbroker-eu` into that profile’s `skills/security/` folder. New session after copy.'),
          } },
          { k: 'copycards', items: [
            { src: '/courses/open-harness/skills/unbroker-ge/SKILL.md', title: 'unbroker-ge', why: 'CH — Robinson, directories, Swiss/EU adtech, nLPD drafts' },
            { src: '/courses/open-harness/skills/unbroker-eu/SKILL.md', title: 'unbroker-eu', why: 'EU/UK — YourOnlineChoices, Acxiom, Criteo, LiveRamp, Oracle, Google' },
          ] },
          { k: 'steps', id: '3-steps', items: [
            { title: L('Install **one** skill (lane A or B). New session so Hermes loads it.') },
            { title: L('Paste the matching line below. Give name, address, email, phone when it asks — once.') },
            { title: L('Let it drain the queue. Approve searches and no-ID **forms**. Deny deletes and ID scans. Do not expect it to send email — copy drafts from `drafts/` into your own inbox.') },
            { title: L('When it stops, open `unbroker-receipt.md` offline. If the file is missing, the mission failed.') },
          ] },
          { k: 'code', block: {
            label: L('Paste — lane A (Geneva)'),
            lang: 'text',
            code: 'Use unbroker-ge. I consent. I live in Geneva.',
          } },
          { k: 'code', block: {
            label: L('Paste — lane B (EU / UK)'),
            lang: 'text',
            code: 'Use unbroker-eu. I consent. I live in the EU.',
          } },
          { k: 'table', headers: [L('Lane A files'), L('Lane B files')], rows: [
            [L('Robinson (paper) + YourOnlineChoices (ads)'), L('YourOnlineChoices (ads) — first')],
            [L('local.ch, Moneyhouse, KünzlerBachmann, Intrum'), L('Acxiom, Criteo, LiveRamp, Oracle Ads')],
            [L('Poste + Google results + Criteo/Acxiom/LiveRamp'), L('Google results-about-you')],
            [L('D&B if a person page exists'), L('D&B if found')],
            [L('CRIF / AZ Direct / Creditreform → digest (ID)'), L('SCHUFA / Experian / CRIF-EU → digest (ID)')],
          ] },
          { k: 'p', text: L(
            'If you still have time after the receipt exists: `/learn` on a file you own, or the Desktop HUD (“this” instead of describing a window). Neither replaces the footprint loop.',
          ) },
          { k: 'tweet', id: '2086130893811277833', author: '@imbabybrooklyn', height: 672,
            href: 'https://x.com/imbabybrooklyn/status/2086130893811277833',
            caption: L('The HUD in use — optional after the receipt exists.'),
          },
          { k: 'callout', variant: 'note', text: L(
            'Skills live with the course: [unbroker-ge](/courses/open-harness/skills/unbroker-ge/SKILL.md) and [unbroker-eu](/courses/open-harness/skills/unbroker-eu/SKILL.md). Official US Unbroker stays optional if you also have a US footprint.',
          ) },
          { k: 'quiz', quiz: {
            question: L('You deny a delete tool call. Next?'),
            options: [
              L('Model deletes in secret'),
              L('Observation = denied; stop/ask'),
              L('Harness ignores your choice'),
              L('System role rewrites files'),
            ],
            correct: L('Observation = denied; stop/ask'),
            explain: L('Denied approval is an observation. The model should stop or ask — not sneak around.'),
          } },
        ],
      },
      {
        heading: L('Where the session ends and memory begins'),
        blocks: [
          { k: 'p', text: L(
            'Everything you just did lives in **this session**. Close it and the conversation is gone — the skill you installed stays, but what the agent understood about your work does not. That gap is the whole subject of Part II.',
          ) },
          { k: 'p', text: L(
            'First, the session controls. Long chats fill the window, and these are how you manage it:',
          ) },
          { k: 'list', items: [
          L('`/context` · `/compress` — see what is loaded, and shrink it'),
          L('`/undo` · `/retry` · `/branch` — conversation control'),
          L('`/rollback` + checkpoints — files already changed (not the same as `/undo`)'),
        ] },
          { k: 'tweet', id: '2087618041328611676', author: '@witcheer', height: 575,
            href: 'https://x.com/witcheer/status/2087618041328611676',
            caption: L('Context management in practice.'),
          },
          { k: 'p', text: L(
            'None of that is memory, though. It only tidies the chat you are in. Everything Part II adds — notes it keeps, a folder of your own writing it can search, jobs that run while you sleep — starts from one idea: **if you want it kept, it has to be written to a file.** That is lesson 07.',
          ) },
          { k: 'links', items: [
          { label: L('Next: Making it remember'), href: '/forge/course/my-first-ai-agent/07/' },
        ] },
        ],



      },
      {
        advanced: true,
        heading: L('Tool backends and host isolation'),
        blocks: [
          { k: 'p', text: L(
            'Shell tools use a terminal backend. On a **dedicated** host you may run tools more freely. On a personal machine, [Docker](https://hermes-agent.nousresearch.com/docs/user-guide/docker) (or a VPS) is the responsible default — not “later if you feel like it.”',
          ) },
          { k: 'list', items: [
          L('Dedicated host process — ok when the box is lab-only'),
          L('Docker backend — commands isolated from the host OS (required compromise on a daily-driver)'),
          L('SSH / VPS / cloud sandboxes — tools run on another machine you can wipe'),
          L('Own infra vs cloud API models — brain location is independent of tool backend; cloud brains still send chat content off-box'),
          L('Multi-machine ops — Desktop here, workers or gateway on a VPS'),
        ] },
          { k: 'callout', variant: 'note', text: L(
          'For production isolation, team shared hosts, or compliance constraints, contact Delta V — tailored Hermes deployments by our engineers.',
        ) },
          { k: 'links', items: [
          { label: L('Docker / backends'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/docker' },
          { label: L('Contact Delta V — tailored setup'), href: '/contact/?topic=open-harness' },
        ] },
        ],





      },
      {
        heading: L('Part I close'),
        blocks: [
          { k: 'p', text: L(
            'You now have: free model path, Desktop, [soul](~soul), one messaging surface, vocabulary for **Think → Act → Observe**, and a file that proves the agent acted. Part II adds memory, vault, skills, security dials, and cron.',
          ) },
          { k: 'checklist', id: '11', items: [
          L('unbroker-receipt.md exists and opens offline'),
          L('Approvals not set to full auto-approve'),
          L('Provider + model noted'),
          L('I can explain agent vs chat in one sentence'),
          L('I can narrate one Think → Act → Observe cycle from this mission'),
        ] },
          { k: 'links', items: [
          { label: L('Lab: failure studio'), href: '/forge/course/my-first-ai-agent/labs/failure-studio/' },
          { label: L('Tips'), href: 'https://hermes-agent.nousresearch.com/docs/guides/tips' },
          { label: L('Next: Making it remember'), href: '/forge/course/my-first-ai-agent/07/' },
        ] },
        ],



      },
    ],
  },


  // ─── 07 ─────────────────────────────────────────────
  {
    id: 'memory',
    slug: '07',
    number: '07',
    part: 2,
    title: L('Making it remember'),
    subtitle: L(
      'Today’s chat disappears when you close it. What you want kept has to be written down.',
    ),
    minutes: 20,
    proof: L(
      'You told the agent something, checked it landed in the file on disk, closed the chat completely, opened a new one — and it still knew.',
    ),
    sections: [
      {
        heading: L('Where it keeps things'),
        blocks: [
          { k: 'p', text: L(
            'Part II starts here because an agent that forgets your preferences every morning makes you repeat yourself forever. Your agent keeps things in three places, and it is worth knowing which is which.',
          ) },
          { k: 'table', headers: [L('Where'), L('What it holds'), L('How much')], rows: [
            [L('1 · The notebook'), L('`SOUL.md`, `MEMORY.md`, `USER.md` — read at the start of every chat'), L('Small on purpose')],
            [L('2 · Past chats'), L('Old conversations it can search back through'), L('As much as your disk allows')],
            [L('3 · Your notes'), L('A folder of your own notes it can read (next lesson)'), L('As much as you write')],
          ] },
        ],


      },
      {
        heading: L('It writes now, it reads next time'),
        blocks: [
          { k: 'p', text: L(
            'The agent reads its notes once, when a chat starts. So if it writes something down mid-conversation, asking “do you remember?” in that same chat can still come up blank — the file is right, it just has not re-read it. Check the file, then start a new chat to see it in action.',
          ) },
          { k: 'callout', variant: 'warning', text: L(
          'If `MEMORY.md` has the line and this session ignores it — close and reopen before blaming the agent.',
        ) },
        ],



      },
      {
        heading: L('MEMORY.md and USER.md'),
        blocks: [
          { k: 'p', text: L(
            '`MEMORY.md` is the [agent](~agent) notebook — your setup, your conventions, what it learned. `USER.md` is your card: name, preferences, things to avoid. The agent writes both; you can edit them in any text editor. Anything it never writes down, it never keeps.',
          ) },
          { k: 'p', text: L(
            'Both are deliberately small, because they are read at the start of **every** chat — every line you add is a line the agent carries around forever. Keep decisions, preferences and corrections; never transcripts. When they fill up: merge lines, shorten them, delete what is stale.',
          ) },
          { k: 'callout', variant: 'quote', text: L(
            'Remembering everything is remembering nothing. Prefer dense facts.',
          ) },
          { k: 'p', text: L(
            'That makes three files in your Hermes home, all loaded every chat, so it is worth being precise about which is which:',
          ) },
          { k: 'table', headers: [L('File'), L('Holds'), L('Who writes it')], rows: [
            [
              L('`SOUL.md`'),
              L('Who the agent **is** — role, tone, hard limits'),
              L('You, once — it rarely changes'),
            ],
            [
              L('`MEMORY.md`'),
              L('What it **learned** — your setup, conventions, decisions'),
              L('The agent, as you work; you can edit'),
            ],
            [
              L('`USER.md`'),
              L('Who **you** are — name, preferences, avoid-list'),
              L('The agent, from what you tell it'),
            ],
          ] },
          { k: 'callout', variant: 'note', text: L(
            'A preference like “keep answers short” belongs in `USER.md`, not `SOUL.md`. Identity is what the agent is for everyone; memory is what it knows about this setup and this person.',
          ) },
          { k: 'p', text: L(
            'Since v0.20.5 this pair reaches further than your chats: scheduled (cron) jobs load `MEMORY.md` and `USER.md` too, wake up already knowing your preferences, and can save new durable facts for future runs. Memory is shared by the profile, not by the job — one job’s durable fact helps every other job. Lesson 11 covers what that changes.',
            'Depuis la v0.20.5, cette paire porte plus loin que vos chats : les jobs planifiés (cron) chargent aussi `MEMORY.md` et `USER.md`, se réveillent en connaissant déjà vos préférences, et peuvent enregistrer de nouveaux faits durables pour les exécutions futures. La mémoire est partagée par le profil, pas par le job — un fait durable écrit par un job sert à tous les autres. La leçon 11 détaille ce que ça change.',
          ) },
          { k: 'callout', variant: 'quote', text: L(
          'File over app: closed chat products do not offer this honesty.',
        ) },
        ],



      },
      {
        heading: L('Prove it remembers'),
        blocks: [
          { k: 'callout', variant: 'warning', text: L(
            'The one way to fool yourself here: if you do not **fully close** the chat, the fact is still on screen and the agent will repeat it back without ever reading the file. A half-closed session always passes. Close it properly.',
          ) },
          { k: 'steps', id: '5-steps', items: [{ title: L('Tell the agent: “Remember that project codename is HARNESS-01 and I prefer short answers.”') }, { title: L('Ask it to write that to durable memory.') }, { title: L('Open `MEMORY.md` / `USER.md` on disk and check the lines are really there.') }, { title: L('Fully close the chat. Open a new one. Ask: “What is my project codename and answer length preference?”') }] },
          { k: 'links', items: [
          { label: L('Memory system'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/memory' },
        ] },
        ],


      },
      {
        heading: L('Memory vs hallucination'),
        blocks: [
          { k: 'p', text: L(
            'Without memory the model fills gaps with confidence. With memory and sources it consults first. Still fallible — but checkable by you and by the agent.',
          ) },
          { k: 'checklist', id: '7', items: [
          L('The fact is on disk, and a brand-new chat knew it'),
          L('I can say in one sentence why today’s chat is not memory'),
        ] },
          { k: 'quiz', quiz: {
            question: L('Where do durable preferences live?'),
            options: [
              L('Only in this chat scroll'),
              L('On disk (MEMORY / USER)'),
              L('Only in OpenRouter logs'),
              L('Only in the model weights'),
            ],
            correct: L('On disk (MEMORY / USER)'),
            explain: L('The chat itself is temporary. MEMORY.md and USER.md are read again at the start of every new chat.'),
          } },
          { k: 'quiz', quiz: {
            question: L('File updated but chat “forgets” now?'),
            options: [
              L('Always a broken install'),
              L('Close/reopen for load proof'),
              L('Delete `MEMORY.md` always'),
              L('Switch to YOLO approvals'),
            ],
            correct: L('Close/reopen for load proof'),
            explain: L('The file can be correct while this chat has not re-read it. Check the file, then open a new chat.'),
          } },
          { k: 'links', items: [
          { label: L('Lab: Prompt budget audit'), href: '/forge/course/my-first-ai-agent/labs/prompt-budget/' },
        ] },
        ],




      },
    ],
  },

  // ─── 08 ─────────────────────────────────────────────
  {
    id: 'vault',
    slug: '08',
    number: '08',
    part: 2,
    title: L('Data vault'),
    subtitle: L('A folder of your own notes the agent can read and search.'),
    minutes: 20,
    proof: L('You asked a question only your own notes could answer, and the agent quoted your note back — with Obsidian showing the same file.'),
    sections: [
      {
        heading: L('Make the vault, then hand it over'),
        blocks: [
          { k: 'p', text: L('A vault sounds like software. It is a **folder of markdown files** — no database, no API, no plugin. Nothing to integrate: you make the folder, then tell your agent where it is.') },
          { k: 'callout', variant: 'note', text: L('Obsidian is the **window**, not the wiring. You install it for yourself — the graph view, backlinks, instant search. The agent works on the same files whether Obsidian is open or closed. That is the [file over app](https://stephango.com/file-over-app) idea, made concrete.') },
          { k: 'p', text: L('Order matters here: **make the vault first, then hand it to your agent.** Obsidian creates the folder for you as part of its own setup, so there is nothing to build by hand.') },
          { k: 'steps', id: '0-steps', items: [{ title: L('Download [Obsidian](https://obsidian.md) and install it. No account needed.') }, { title: L('On first launch choose **Create new vault**. Name it `second-brain`.') }, { title: L('Choose **where** it lives, and write the path down — you hand it to your agent in a moment. Somewhere plain like your home folder is ideal; avoid a cloud-synced folder, or you will be resolving sync conflicts later.') }, { title: L('Write **one** short note about something real — a decision you made this week, notes from a call. Just one; you need something in there worth finding.') }] },
          { k: 'p', text: L('That is your part. Hermes ships an **Obsidian skill already installed**, so all it needs is the path — it reads `OBSIDIAN_VAULT_PATH` from the `.env` file in your Hermes home. Set it and restart Hermes.') },
          { k: 'code', block: {
            label: L('Add to ~/.hermes/.env'),
            lang: 'sh',
            code: 'OBSIDIAN_VAULT_PATH=/home/you/second-brain',
            note: L('Use the **full** path you wrote down — file tools do not expand `~` or `$VARS`. If you skip this, the skill looks in `~/Documents/Obsidian Vault`, which is almost certainly not where yours is. Not sure where your Hermes home is? Ask your agent: “Where is your Hermes home folder?”'),
          } },
          { k: 'p', text: L('Now check it can **read**: ask something only your note could answer. If it quotes your own words back, the wiring is good.') },
          { k: 'p', text: L('Then let it **write**, which is the more useful half. Ask it to set the place up for you:') },
          { k: 'code', block: {
            label: L('Ask your agent'),
            lang: 'text',
            code: 'Set up my vault: create folders for inbox, sources and synthesis,\nand add a short README note explaining what each one is for.',
            note: L('Approve the writes. Then look at Obsidian — the folders and the note are there. That is the proof it can write as well as read, and you never had to make them by hand.'),
          } },
          { k: 'image', src: '/courses/open-harness/screenshots/hermes-vault-setup.webp', width: 1280, height: 693,
            alt: L('A Hermes chat: the user asks it to use an Obsidian vault as their second-brain and create inbox, sources and synthesis folders with a README. The agent confirms the folders and README were created, then in a second message adds deltav.cc as a source file under sources/, and finishes with a table listing each folder and its purpose.'),
            caption: L('What it looks like in practice. Note the second message — once the vault is wired, filing something new is one sentence: **“Add deltav.cc as a source for my OpSec in our vault.”** It created the note, put it in the right folder, and remembered.'),
          },
        ],


      },
      {
        heading: L('Teach it your filing habits'),
        blocks: [
          { k: 'p', text: L('Those three folders are **our** suggestion, not a rule Obsidian or Hermes imposes. They exist to answer one question every notes system eventually faces — **where does this go?**'),
          },
          { k: 'list', items: [
          L('**`inbox`** — anything you dumped in a hurry and have not sorted yet.'),
          L('**`sources`** — things other people wrote: clippings, quotes, papers, links.'),
          L('**`synthesis`** — what **you** concluded, in your own words. This is the folder that gets valuable.'),
        ] },
          { k: 'p', text: L('Rename them, drop one, use your own scheme — it makes no difference to the agent, as long as you tell it which scheme you chose. The skill knows **how** to work a vault; it does not know how **you** file. Two lines in `MEMORY.md` from the last lesson make your choice permanent:')},
          { k: 'code', block: {
            label: L('Add to MEMORY.md'),
            lang: 'md',
            code: '- My vault: inbox = unsorted, sources = what I read, synthesis = my own conclusions.\n- Search the vault before answering questions about my projects. File new notes in inbox/.',
            note: L('Ask the agent to add these lines, or type them yourself — it is a plain text file.'),
          } },
          { k: 'p', text: L('Now the structure earns its keep: when the agent files things the way you do, its notes and your notes stay one library instead of two.') },
          { k: 'p', text: L('The `[[double brackets]]` are plain text — nothing magic. Obsidian reads them and draws the graph you came for; the agent writes them too, so the graph keeps growing whether the note came from you or from it.') },
        ],

      },
      {
        heading: L('Proof checklist'),
        blocks: [
          { k: 'checklist', id: '2', items: [
          L('`OBSIDIAN_VAULT_PATH` points at my real vault'),
          L('It **read**: answered a question by quoting a note only I could have written'),
          L('It **wrote**: folders and a note it created show up in Obsidian'),
          L('My filing rules are in `MEMORY.md`, so it does not have to be told again'),
        ] },
          { k: 'quiz', quiz: {
            question: L('What is a vault in this course?'),
            options: [
              L('A cloud-only chat folder'),
              L('A notes folder on disk'),
              L('The model vendor account'),
              L('The gateway allowlist only'),
            ],
            correct: L('A notes folder on disk'),
            explain: L('Your vault is just a notes folder: you open it offline, and Hermes searches the path.'),
          } },
          { k: 'links', items: [
          { label: L('Hermes Obsidian skill (bundled)'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/note-taking/note-taking-obsidian' },
          { label: L('Obsidian'), href: 'https://obsidian.md' },
          { label: L('File over app'), href: 'https://stephango.com/file-over-app' },
        ] },
        ],



      },
    ],
  },

  // ─── 09 Skills ───────────────────────────────────────
  {
    id: 'skills',
    slug: '09',
    number: '09',
    part: 2,
    title: L('Skills'),
    subtitle: L(
      'Teaching New Tricks: give your agent abilities it calls on when needed.',
    ),
    minutes: 18,
    proof: L(
      'You listed skills for this profile, ran or inspected one, wrote `skills-notes.md` (name + when to use), and trimmed at least one skill after reading your fixed budget.',
    ),
    sections: [
      {
        heading: L('What a skill is'),
        blocks: [
          { k: 'p', text: L(
            'A [skill](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills) is a reusable instruction package (`SKILL.md`). Front matter names and describes it; the body teaches the procedure. Hermes sees names and descriptions first — a vague description means the right skill may never load.',
          ) },
          { k: 'p', text: L(
            'Skills use progressive disclosure: the catalog stays cheap; only the selected body enters the prompt. That is how a large library avoids burning the context window every turn.',
          ) },
          { k: 'p', text: L(
            'In the **Think → Act → Observe** loop, a skill mostly shapes Think (and which tools to pick). It is not itself an Act unless it triggers tools. Tools execute; skills teach.',
          ) },
          { k: 'callout', variant: 'note', text: L(
            'Skill vs tool vs plugin vs MCP was settled in [lesson 01 · Tools, skills, and services](/forge/course/my-first-ai-agent/01/#5-tools-skills-plugins-and-mcp). Re-open that card if the words feel loose — this lesson assumes them and moves on to cost.',
          ) },
          { k: 'list', items: [
          L('`/learn` authors a skill for you from a folder, a URL, a PDF, or a workflow you just ran — you rarely need to write `SKILL.md` by hand.'),
          L('`~/.hermes/skills/` is the source of truth. Skills follow the [agentskills.io](https://agentskills.io) open standard, so a skill written for another harness can work here — but Hermes only reads it once you list its folder under `skills.external_dirs` in `~/.hermes/config.yaml`. Dropping files elsewhere and hoping is the usual reason a skill "never loads".'),
          L('Install narrowly; run security scans on hub skills before trust.'),
          L('Pin or [curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator): critical skills should not vanish to automated cleanup when you outgrow defaults.'),
        ] },
        ],


      },
      {
        heading: L('Where skills come from'),
        blocks: [
          { k: 'p', text: L(
            'Four sources, in the order most people meet them:',
          ) },
          { k: 'table', headers: [L('Source'), L('What you get'), L('Trust')], rows: [
            [
              L('**Bundled** — the Skills panel in Desktop'),
              L('What shipped with Hermes, ready to run'),
              L('Highest — it came with the app'),
            ],
            [
              L('**Official hub** — `hermes skills install official/…`'),
              L('Maintained hub skills — useful, still read them first'),
              L('High — but still read what it does first'),
            ],
            [
              L('**`/learn`** — you point it at a source'),
              L('A skill written from your own book, docs or workflow'),
              L('Yours; nothing arrives from a stranger'),
            ],
            [
              L('**Anywhere else** — GitHub, other harnesses'),
              L('The [agentskills.io](https://agentskills.io) standard makes these portable'),
              L('Unknown — scan before you trust'),
            ],
          ] },
          { k: 'callout', variant: 'warning', text: L(
            'A skill is instructions your agent will follow with your tools on your machine. Treat one from a stranger the way you would treat a shell script from a stranger — read it, or do not install it.',
          ) },
        ],
      },
      {
        heading: L('Which ones are actually worth it'),
        blocks: [
          { k: 'p', text: L(
            'We deliberately do not hand you a top-ten list — the catalog moves, and a skill you do not use is pure cost. Use the test instead: **install it when you have already done the task by hand at least once and want it done the same way every time.**',
          ) },
          { k: 'list', items: [
          L('**It has a real job this week.** Not “useful someday” — an actual repeat task.'),
          L('**Its description is specific.** Hermes picks skills by name and description; vague ones never load at the right moment.'),
          L('**You could describe what it does** to someone else in one sentence. If not, you have not read it.'),
          L('**It survives the budget test** — see the next section. A shelf of unused skills costs tokens in every session.'),
        ] },
          { k: 'callout', variant: 'note', text: L(
            'The ones we recommend by name are `unbroker-ge` and `unbroker-eu` from [lesson 06](/forge/course/my-first-ai-agent/06/) — pick the lane that matches where you live. Official `unbroker` is the US people-search tool; only add it if you also have a US footprint.',
          ) },
          { k: 'steps', id: '2-steps', items: [{ title: L('Open Skills in Hermes Desktop and read the list you already have.') }, { title: L('Copy the names into a note in your vault, one line each on when you would use it.') }, { title: L('Run or inspect one bundled skill, following the [work-with-skills guide](https://hermes-agent.nousresearch.com/docs/guides/work-with-skills).') }, { title: L('Install at most one new skill — and write down why you needed it.') }] },
          { k: 'links', items: [
          { label: L('Skills system'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/skills' },
          { label: L('Work with skills (guide)'), href: 'https://hermes-agent.nousresearch.com/docs/guides/work-with-skills' },
          { label: L('agentskills.io — the open standard'), href: 'https://agentskills.io' },
          { label: L('Curator (later)'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/curator' },
        ] },
        ],




      },
      {
        heading: L('Skills tax the fixed budget'),
        blocks: [
          { k: 'p', text: L(
            'The skills index and every enabled tool schema load into the empty-session budget (see module 06 — context budget). A large “install for later” catalog costs tokens before any task starts.',
          ) },
          { k: 'steps', id: '3-steps', items: [{ title: L('Open the context / usage view in Desktop. Note the skills / tools share.') }, { title: L('Disable or uninstall one skill you will not use this week. Re-run [the audit](/forge/course/my-first-ai-agent/labs/prompt-budget/).') }, { title: L('Record before/after in `skills-notes.md` (one line each is enough).') }] },
          { k: 'links', items: [
          { label: L('Lab: Prompt budget audit'), href: '/forge/course/my-first-ai-agent/labs/prompt-budget/' },
        ] },
        ],



      },
      {
        heading: L('Proof'),
        blocks: [
          { k: 'checklist', id: '4', items: [
          L('`skills-notes.md` lists at least three skill names'),
          L('One skill run or inspect logged with outcome'),
          L('You re-checked fixed budget after trimming at least one skill or toolset'),
        ] },
          { k: 'quiz', quiz: {
            question: L('You install twenty skills and use none of them this week. What does that cost?'),
            options: [
              L('Nothing — unused skills are inert until called'),
              L('Disk space only'),
              L('Tokens in every session, because the index loads before any task starts'),
              L('One extra approval prompt per skill'),
            ],
            correct: L('Tokens in every session, because the index loads before any task starts'),
            explain: L('Progressive disclosure keeps skill **bodies** out of the prompt, but the catalog of names and descriptions still loads into the empty-session budget. Install narrowly.'),
          } },
          { k: 'links', items: [
          { label: L('Next: Security'), href: '/forge/course/my-first-ai-agent/10/' },
          { label: L('Sample skills-notes'), href: '/courses/open-harness/samples/skills-notes.example.md' },
        ] },
        ],



      },
    ],
  },

  // ─── 10 Security ─────────────────────────────────────
  {
    id: 'security',
    slug: '10',
    number: '10',
    part: 2,
    title: L('Security dials'),
    subtitle: L(
      'Host isolation, cloud data leaving the box, who may reach tools, and how approvals work.',
    ),
    minutes: 15,
    proof: L(
      'You re-stated host isolation (dedicated / VPS / Docker), cloud-model data leaves the host, confirmed allowlist and approval mode (smart or manual), wrote `security-dials.md` with three settings and rationale, and did not enable YOLO for this course.',
    ),
    sections: [
      {
        heading: L('Threat model'),
        blocks: [
          { k: 'p', text: L(
            'A **dedicated lab host** is not a public bot — and it is also not “just ChatGPT in a tab.” With tools enabled, the agent can act like a powerful shell operator on whatever OS user and backend you gave it. Gateway should fail closed: strangers never reach tools by default, as the [security guide](https://hermes-agent.nousresearch.com/docs/user-guide/security) explains.',
          ) },
          { k: 'list', items: [
          L('**Host:** prefer dedicated machine or VPS; personal daily-driver only with [Docker](https://hermes-agent.nousresearch.com/docs/user-guide/docker) (or equal) isolation for tools.'),
          L('**Cloud models (OpenRouter / OpenCode / similar):** conversation and related context leave your machine to model hosts — plan secrets accordingly.'),
          L('**Shell reality:** tool backends can read/write files and run commands within their isolation boundary — treat that boundary as real or broken.'),
        ] },
        ],
      },
      {
        heading: L('Who may reach tools'),
        blocks: [
          { k: 'list', items: [
          L('Allowlist messaging gateway users (fail closed if unset).'),
          L('Approvals: manual | smart (default) | off — course uses smart or manual. YOLO is expert-only and still cannot bypass the hardline blocklist.'),
          L('Timeouts deny by default when you do not answer.'),
        ] },
        ],
      },
      {
        heading: L('Secrets, network, least privilege'),
        blocks: [
          { k: 'list', items: [
          L('Secret filtering: keep tokens out of prompts and MCP child environments where possible — practice this in the [key rotation lab](/forge/course/my-first-ai-agent/labs/api-key-hygiene/).'),
          L('Injection scans on SOUL / `AGENTS.md` / context files when enabled.'),
          L('Network: SSRF protections block private ranges; open only for a trusted local service you understand.'),
          L('Profile least privilege: research does not need a coder tool surface.'),
          L('Optional later: approval suggestions mine past decisions — they should never auto-apply destructive classes.'),
        ] },
        ],
      },
      {
        heading: L('Keep the defaults'),
        blocks: [
          { k: 'callout', variant: 'warning', text: L(
          'Keep defaults for this course. Disabling approvals for speed is how harnesses become liabilities. [Checkpoints and rollback](https://hermes-agent.nousresearch.com/docs/user-guide/checkpoints-and-rollback), if available, support recovery — they do not replace approvals or host isolation.',
        ) },
          { k: 'links', items: [
          { label: L('Security guide'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/security' },
          { label: L('Docker / isolation'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/docker' },
          { label: L('Checkpoints & rollback'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/checkpoints-and-rollback' },
          { label: L('Lab: key rotation'), href: '/forge/course/my-first-ai-agent/labs/api-key-hygiene/' },
          { label: L('Lab: failure studio'), href: '/forge/course/my-first-ai-agent/labs/failure-studio/' },
        ] },
        ],





      },
      {
        heading: L('Desktop check'),
        blocks: [
          { k: 'steps', id: '1-steps', items: [{ title: L('Re-state host path in one line: dedicated PC / VPS / personal+Docker (from lesson 02).') }, { title: L('If cloud models: note in `security-dials.md` that chat content leaves the host (OpenRouter/OpenCode/etc.).') }, { title: L('Open gateway / security / approvals for this profile (or `config.yaml` approvals.mode).') }, { title: L('Confirm allowlist / pairing is only you (messaging platform from module 05).') }, { title: L('Confirm smart or manual approvals. Do not use YOLO for course work.') }, { title: L('Write `security-dials.md`: host path, cloud-data note, allowlist status, approval mode, one tool surface left off.') }] },
        ],

      },
      {
        heading: L('Proof'),
        blocks: [
          { k: 'checklist', id: '2', items: [
          L('`security-dials.md` records host isolation + cloud-data note + three concrete settings'),
          L('YOLO is off (or documented expert exception)'),
          L('You know where logs live if something fails (see the [failure studio lab](/forge/course/my-first-ai-agent/labs/failure-studio/))'),
        ] },
          { k: 'quiz', quiz: {
            question: L('Course default for approvals?'),
            options: [
              L('YOLO for every tool call'),
              L('Smart or manual only'),
              L('No approvals ever needed'),
              L('Public bot without allowlist'),
            ],
            correct: L('Smart or manual only'),
            explain: L('YOLO is expert-only. Course work uses smart or manual approvals.'),
          } },
          { k: 'links', items: [
          { label: L('Next: Cron'), href: '/forge/course/my-first-ai-agent/11/' },
        ] },
        ],



      },
    ],
  },

  // ─── 11 Cron ─────────────────────────────────────────
  {
    id: 'cron',
    slug: '11',
    number: '11',
    part: 2,
    title: L('Cron runbooks'),
    subtitle: L(
      'Set it and forget it: a job that runs on schedule, fresh each time.',
    ),
    minutes: 20,
    proof: L(
      'You created one self-contained cron job (or a complete plan) covering host, path, success, failure, and delivery — and ran it once or dry-ran the prompt.',
    ),
    sections: [
      {
        heading: L('Amnesia is intentional'),
        blocks: [
          { k: 'p', text: L(
            '[Cron](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron) usually runs with the always-on gateway. Each execution is an isolated session that does not inherit “yesterday’s issue.” Write a self-contained runbook into the job prompt.',
          ) },
          { k: 'list', items: [
          L('Include host, path, command, expected state, delivery target, success and failure behavior.'),
        ] },
          { k: 'callout', variant: 'note', text: L(
            'Update — since v0.20.5, a fresh worker shares your memory: scheduled jobs load `MEMORY.md` and `USER.md` like every other session and can save new durable facts with the memory tool. The amnesia that remains is the transcript — a job still starts with no chat history and no record of its own previous runs. Memory is who you are; continuity is what happened last time. A job that must not re-report yesterday’s story needs continuity or a small state file, not shared memory.',
            'Mise à jour — depuis la v0.20.5, un worker neuf partage votre mémoire : les jobs planifiés chargent `MEMORY.md` et `USER.md` comme toute autre session et peuvent enregistrer de nouveaux faits durables avec l’outil mémoire. L’amnésie qui reste, c’est la transcription — un job démarre toujours sans historique de chat et sans trace de ses exécutions précédentes. La mémoire, c’est qui vous êtes ; la continuité, c’est ce qui s’est passé la dernière fois. Un job qui ne doit pas répéter l’histoire d’hier a besoin de continuité ou d’un petit fichier d’état, pas de la mémoire partagée.',
          ) },
        ],
      },
      {
        heading: L('Quiet by default'),
        blocks: [
          { k: 'list', items: [
          L('silent: suppress “all good” noise; still surface failures.'),
          L('no_agent / script-only: deterministic checks that need no model tokens.'),
          L('Wake gate: cheap pre-check first; wake the model only when something changed.'),
          L(
            'Per-job reasoning effort: `--reasoning-effort` pins the thinking level per job — minimal for cheap polls, high for deep daily syntheses. Cost tuned per job, without touching the global default or the model.',
            'Effort de raisonnement par job : `--reasoning-effort` fixe le niveau de réflexion par job — minimal pour les sondages bon marché, high pour les grosses synthèses quotidiennes. Le coût se règle par job, sans toucher au défaut global ni au modèle.',
          ),
        ] },
        ],
      },
      {
        heading: L('Guardrails'),
        blocks: [
          { k: 'list', items: [
          L('Jobs must not spawn unbounded new jobs — runaway self-scheduling is blocked in healthy setups.'),
          L('Dangerous commands: prefer approvals.cron_mode deny (default) so headless jobs cannot YOLO host damage.'),
          L(
            'Memory writes from headless jobs: set `memory.write_approval: true` to stage them for review (`/memory pending` · `/memory approve` · `/memory reject`) — until approved, later runs never see them.',
            'Écritures mémoire des jobs sans supervision : mettez `memory.write_approval: true` pour les mettre en attente de relecture (`/memory pending` · `/memory approve` · `/memory reject`) — tant qu’elles ne sont pas approuvées, les exécutions suivantes ne les voient pas.',
          ),
        ] },
        ],


      },
      {
        heading: L('Build one job'),
        blocks: [
          { k: 'callout', variant: 'note', text: L(
          'Cron spend is easy to waste. Prefer script checks first; wake the model only when the check fails or changes, or use [Hermes webhooks](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/webhooks) instead of polling.',
        ) },
          { k: 'steps', id: '1-steps', items: [{ title: L('Define a small job: for example weekday 08:00 — three headlines, short summary, deliver to your messaging app (or a local file if gateway is off).') }, { title: L('Write the prompt as if the agent has amnesia, starting from the [sample runbook](/courses/open-harness/samples/cron-runbook.example.md). Save as cron-runbook.md.') }, { title: L('Create it in the Desktop cron UI or [Hermes cron flow](https://hermes-agent.nousresearch.com/docs/guides/automate-with-cron) for your version.') }, { title: L('Run once manually if possible, then schedule — or stop after dry-run if offline.') }] },
        ],
      },
      {
        heading: L('Go deeper'),
        blocks: [
          { k: 'links', items: [
          { label: L('Cron feature docs'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/cron' },
          { label: L('Automate with cron (guide)'), href: 'https://hermes-agent.nousresearch.com/docs/guides/automate-with-cron' },
          { label: L('Webhooks (official)'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging/webhooks' },
          { label: L('Sample runbook'), href: '/courses/open-harness/samples/cron-runbook.example.md' },
        ] },
        ],




      },
      {
        heading: L('Proof'),
        blocks: [
          { k: 'checklist', id: '2', items: [
          L('`cron-runbook.md` is self-contained (a stranger could execute it)'),
          L('Job created in Desktop/CLI or fully planned with schedule'),
          L('Success and failure paths both named'),
        ] },
          { k: 'quiz', quiz: {
            question: L('Why write cron prompts with amnesia?'),
            options: [
              L('Models hate long context'),
              L('Jobs start without chat history'),
              L('Gateway forbids memory files'),
              L('`SOUL.md` is never loaded'),
            ],
            correct: L('Jobs start without chat history'),
            explain: L('Scheduled jobs wake cold. The runbook must include host, path, success, and failure.'),
          } },
          { k: 'links', items: [
          { label: L('Next: Own forever'), href: '/forge/course/my-first-ai-agent/12/' },
          { label: L('All Harness Labs'), href: '/forge/course/my-first-ai-agent/labs/' },
        ] },
        ],



      },
    ],
  },

  // ─── 12 Own forever ──────────────────────────────────
  {
    id: 'own-forever',
    slug: '12',
    number: '12',
    part: 2,
    title: L('Own it forever'),
    subtitle: L(
      'Keep it alive: back up, update, and level up — without redoing lesson 1.',
    ),
    minutes: 15,
    proof: L(
      'You know which folders to back up, how to brief a sub-agent, and which growth step matches your next constraint.',
    ),
    sections: [
      {
        heading: L('What to back up'),
        blocks: [
          { k: 'list', items: [
          L('Hermes home / profile directory (SOUL, memory, config, skills you keep)'),
          L('Obsidian vault and `AGENTS.md` / project context you rely on'),
          L('`.env` holds secrets — back up encrypted; never publish'),
        ] },
          { k: 'callout', variant: 'quote', text: L(
          'Copy the folders. That is the backup. The harness is portable because it is files.',
        ) },
          { k: 'links', items: [
          { label: L('Sample tree'), href: '/courses/open-harness/samples/profile-tree.example.md' },
        ] },
        ],




      },
      {
        heading: L('Stay current'),
        blocks: [
          { k: 'p', text: L(
            'Official docs change often. Run `hermes update` (or reinstall Desktop) on a cadence you can keep. After updates: doctor or health check, one chat smoke test, gateway still allowlisted. If a flag renames, Installation / [Updating docs](https://hermes-agent.nousresearch.com/docs/getting-started/updating) win over this page.',
          ) },
          { k: 'links', items: [
          { label: L('Updating Hermes'), href: 'https://hermes-agent.nousresearch.com/docs/getting-started/updating' },
          { label: L('Learning path (official)'), href: 'https://hermes-agent.nousresearch.com/docs/getting-started/learning-path' },
        ] },
        ],


      },
      {
        heading: L('Course completion checklist'),
        blocks: [
          { k: 'checklist', id: '2', items: [
          L('Lexicon: agent vs chat; harness vs runtime; token, context, cron'),
          L('Host path chosen (dedicated / VPS / personal+Docker); Hermes chats; isolation decided'),
          L('You know cloud models send chat content off-box; Providers / Gateway / Advanced mapped'),
          L('SOUL lives with the profile, not in a project folder; SOUL vs `AGENTS.md` clear'),
          L('Tool task completed; smart or manual approvals on'),
          L('Messaging gateway trusted and working (platform you chose)'),
          L('Memory fact on disk and survives a new session'),
          L('Vault note retrieved'),
          L('Skills listed (09); security dials written (10); cron runbook (11)'),
          L('Backup locations known; update habit named'),
        ] },
          { k: 'quiz', quiz: {
            question: L('What must you back up first?'),
            options: [
              L('Only the chat UI theme'),
              L('Hermes home + vault + secrets'),
              L('Public bot tokens only'),
              L('Nothing — cloud stores it'),
            ],
            correct: L('Hermes home + vault + secrets'),
            explain: L('Profile folder, notes vault, and encrypted secrets are the ownership map.'),
          } },
        ],


      },
      {
        heading: L('Keep going'),
        blocks: [
          { k: 'p', text: L(
            '[Official docs](https://hermes-agent.nousresearch.com/docs/) are the living manual. Optional labs deepen operations. [Open Design](/forge/course/open-design/) is the next live mastery track on Forge.',
          ) },
          { k: 'links', items: [
          { label: L('Hermes docs home'), href: 'https://hermes-agent.nousresearch.com/docs/' },
          { label: L('Docs index (llms.txt)'), href: 'https://hermes-agent.nousresearch.com/docs/llms.txt' },
          { label: L('Harness Labs (after mastery)'), href: '/forge/course/my-first-ai-agent/labs/' },
          { label: L('Open Design'), href: '/forge/course/open-design/' },
          { label: L('Sample gallery'), href: '/courses/open-harness/samples/README.md' },
          { label: L('Contact Delta V'), href: '/contact/?topic=open-harness' },
          { label: L('Back to Forge'), href: '/forge/' },
        ] },
        ],


      },
      {
        heading: L('When one agent is not enough'),
        blocks: [
          { k: 'p', text: L(
            '[Sub-agents](https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation): spawn helpers for independent work. Brief them as strangers (failure, paths, definition of done). Least tools. Prefer cheaper children and a strong parent for synthesis. Avoid delegating tightly sequential interactive work.',
          ) },
          { k: 'p', text: L(
            'Profiles: a second Hermes home (own model, memory, gateway, persona) when roles must stay isolated permanently — not a temporary helper.',
          ) },
          { k: 'p', text: L(
            'Kanban / boards: when work must cross agents and survive restarts. Use the official [multi-agent docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban) when serial pain is real.',
          ) },
          { k: 'callout', variant: 'note', text: L(
          'Basics stop at one solid harness. Multi-agent and extra platforms are optional growth — not Part I homework.',
        ) },
          { k: 'links', items: [
          { label: L('Delegation'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/delegation' },
          { label: L('Kanban multi-agent'), href: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban' },
        ] },
        ],




      },
      {
        heading: L('Growth map — seven patterns'),
        blocks: [
          { k: 'p', text: L(
            'You already practice tools and approvals. Add the rest when a concrete constraint appears.',
          ) },
          { k: 'list', items: [
          L('1 Tools — day one (done)'),
          L('2 MCP servers — when work spans external services and APIs'),
          L('3 Sequential pipeline — multi-step jobs via profiles and wake gates'),
          L('4 Parallel — research fan-out / batch delegation'),
          L('5 Routers — assign by type to specialist profiles or board'),
          L('6 Human in the loop — keep for high-impact actions'),
          L('7 Dynamic sub-agents — orchestrator spawns help mid-task'),
        ] },
        ],


      },
      {
        heading: L('Desktop Kanban (growth)'),
        blocks: [
          { k: 'p', text: L(
            'The first official Hermes Desktop plugin is Kanban: a board in the app for multi-step work across profiles. Enable it only after one profile, tools, and approvals are solid. It is not Part I homework.',
          ) },
          { k: 'list', items: [
          L('Plugin can add a page, sidebar entry, hotkeys, and backend endpoints.'),
          L('Multi-profile boards need SOUL + tools working per profile first.'),
          L('Write your own plugin or import via the [Desktop plugin SDK](https://hermes-agent.nousresearch.com/docs/developer-guide/desktop-plugin-sdk) when you outgrow defaults.'),
        ] },
          { k: 'links', items: [
          { label: L('Lab: Kanban multi-profile'), href: '/forge/course/my-first-ai-agent/labs/kanban-board/' },
          {
            label: L('Desktop plugin SDK'),
            href: 'https://hermes-agent.nousresearch.com/docs/developer-guide/desktop-plugin-sdk',
          },
        ] },
        ],



      },
    ],
  },
];

export function getModule(slug: string): CourseModule | undefined {
  return OPEN_HARNESS_MODULES.find((m) => m.slug === slug);
}

export function getModuleIndex(slug: string): number {
  return OPEN_HARNESS_MODULES.findIndex((m) => m.slug === slug);
}

export function t(s: LocaleString, lang: CourseLang): string {
  return s[lang] ?? s.en;
}
