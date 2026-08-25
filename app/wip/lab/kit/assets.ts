import { withBasePath } from '@/lib/site';
import type { CourseModule } from '@/app/data/courses/open-harness';

/**
 * The asset kit the ten layouts draw from.
 *
 * Two rules hold everything here together:
 *
 *   1. A glyph earns its place by naming something the sentence next to it
 *      already says. No icon is chosen for decoration; if a heading does not
 *      map to a real concept, it gets no icon and that is the correct result.
 *   2. Nothing is invented. Provider marks appear on a lesson only when that
 *      lesson actually names the provider, so the strip is a reading of the
 *      text rather than a claim about it.
 */

const PROVIDER_DIR = '/courses/visual-lab/providers/';
const ICON_DIR = '/courses/visual-lab/icons/';

/**
 * How a mark has to be painted. This is a technical fact, not a taste call.
 *
 * An SVG loaded through `<img>` is an isolated document: it never inherits our
 * colour, so a mark that ships as `fill="currentColor"` would render pure black
 * and vanish on the dark theme. Those must go through a CSS mask, which paints
 * the shape in `currentColor` and therefore follows the theme for free.
 * Marks carrying real brand colours are used as images so they keep them.
 */
export type Tone = 'mask' | 'brand';

export type ProviderId =
  | 'nousresearch' | 'openrouter' | 'mcp' | 'huggingface' | 'deepseek'
  | 'anthropic' | 'claude' | 'openai' | 'gemini' | 'qwen'
  | 'minimax' | 'ollama' | 'lmstudio';

type Provider = {
  /** Exactly as the course writes it. */
  label: string;
  tone: Tone;
  /** Case-insensitive words that mean this provider is genuinely in play. */
  match: RegExp;
};

/** Marks are lobe-icons (MIT). Verified per file: `tone` follows the fill. */
export const PROVIDERS: Record<ProviderId, Provider> = {
  nousresearch: { label: 'Nous Research', tone: 'mask',  match: /\bNous (Research|Portal)\b/i },
  openrouter:   { label: 'OpenRouter',    tone: 'brand', match: /\bOpenRouter\b/i },
  mcp:          { label: 'MCP',           tone: 'mask',  match: /\bMCP\b/ },
  huggingface:  { label: 'Hugging Face',  tone: 'brand', match: /\bHugging ?Face\b/i },
  deepseek:     { label: 'DeepSeek',      tone: 'brand', match: /\bDeepSeek\b/i },
  anthropic:    { label: 'Anthropic',     tone: 'mask',  match: /\bAnthropic\b/i },
  claude:       { label: 'Claude',        tone: 'brand', match: /\bClaude\b/i },
  openai:       { label: 'OpenAI',        tone: 'mask',  match: /\bOpenAI\b/i },
  gemini:       { label: 'Gemini',        tone: 'brand', match: /\bGemini\b/i },
  qwen:         { label: 'Qwen',          tone: 'brand', match: /\bQwen\b/i },
  minimax:      { label: 'MiniMax',       tone: 'brand', match: /\bMiniMax\b/i },
  ollama:       { label: 'Ollama',        tone: 'mask',  match: /\bOllama\b/i },
  lmstudio:     { label: 'LM Studio',     tone: 'mask',  match: /\bLM ?Studio\b/i },
};

export const providerSrc = (id: ProviderId) => withBasePath(`${PROVIDER_DIR}${id}.svg`);
export const iconSrc = (name: string) => withBasePath(`${ICON_DIR}${name}.svg`);

/**
 * Which providers a lesson genuinely names.
 *
 * The module tree mixes plain strings, locale objects and nested blocks, so it
 * is flattened through JSON rather than walked: one pass, no shape assumptions,
 * and a new block type can never silently drop out of the reading.
 */
export function providersIn(mod: CourseModule): ProviderId[] {
  // Strip URLs before matching. `huggingface.co` in an href is a link to
  // someone else's course, not the lesson naming a provider — and the strip
  // claims the lesson names it. Same hazard for lmstudio.ai and
  // hermes-agent.nousresearch.com.
  const text = JSON.stringify(mod).replace(/https?:\/\/[^"'\s]+/g, '');
  return (Object.keys(PROVIDERS) as ProviderId[]).filter((id) => PROVIDERS[id].match.test(text));
}

/**
 * Heading to icon, by meaning.
 *
 * Ordered, first match wins, and the specific rules come before the broad ones
 * so "Where the brain runs" resolves to the brain rather than to the machine.
 * A heading matching nothing returns null: no icon beats a wrong icon.
 */
const HEADING_ICONS: [RegExp, string][] = [
  [/\bbrain\b|\bmodel runs\b/i,                         'brain-circuit'],
  [/remember|forget|memory|context/i,                   'brain'],
  [/install|installer|download|get the/i,               'download'],
  [/safe|secur|permission|approval|risk|danger/i,       'shield-check'],
  [/ready|checklist|you need|before you/i,              'clipboard-check'],
  [/key|token|secret|credential|vault/i,                'key-round'],
  [/costs?|price|pricing|billing|spend|budget/i, 'coins'],
  [/tool|skill|plugin|mcp/i,                            'puzzle'],
  [/loop|cycle|repeat|again/i,                          'repeat'],
  [/files?|folder|director|where your/i,      'folder-tree'],
  [/telegram|messag|phone|mobile|outside/i,             'smartphone'],
  [/terminal|commands?|shell|cli/i, 'terminal'],
  [/machine|hardware|laptop|cpu|ram|specs?/i, 'cpu'],
  [/server|host|deploy|vps|cloud/i,                     'server'],
  [/connect|provider|api|plug/i,                        'plug'],
  [/careful|warning|caution|mistake|wrong/i,            'triangle-alert'],
  [/agents?|bots?|assistant|first contact|chat/i, 'bot'],
  [/schedul|cron|clock|daily|hourly/i, 'clock'],
  [/read|course|lesson|follow|what this/i,              'book-open'],
  [/proof|check|verify|confirm|done|clear/i,            'circle-check'],
  [/idea|why|concept|understand|think/i,                'lightbulb'],
  [/network|reach|remote|gateway/i,                     'network'],
  [/data|store|database|record/i,                       'database'],
  [/stack|core|architecture|system/i,                   'network'],
  [/start|launch|ship|go live/i,               'rocket'],
  [/fix|repair|config|settings|option/i,                'wrench'],
  [/see|look|view|watch|observe/i,                      'eye'],
];

export function headingIcon(heading: string): string | null {
  for (const [re, icon] of HEADING_ICONS) if (re.test(heading)) return icon;
  return null;
}
