import { withBasePath } from '@/lib/site';

/**
 * The ten visual systems, as data.
 *
 * A treatment is a *system* applied to all thirteen modules, not an effect
 * dropped on one section. Each one carries a surface class that drives its CSS
 * and a few flags that switch React pieces on. Everything else — content,
 * chrome, navigation — is the real course.
 *
 * Assets are self-hosted under `public/courses/visual-lab/`:
 *   icons/   Lucide, ISC, stroke="currentColor"
 *   brands/  Simple Icons, CC0 (the marks stay their owners' trademarks)
 * Nothing here is lifted from the workshop deck.
 */

export const ICON = (name: string) => withBasePath(`/courses/visual-lab/icons/${name}.svg`);
export const BRAND = (name: string) => withBasePath(`/courses/visual-lab/brands/${name}.svg`);
export const SHOT = (file: string) => withBasePath(`/courses/open-harness/screenshots/${file}`);

export type Treatment = {
  n: number;
  id: string;
  name: string;
  blurb: string;
  tech: 'CSS' | 'React' | 'SVG';
  /** Icon beside every section heading. */
  sectionIcons?: boolean;
  /** Brand mark on lexicon cards that name a product. */
  brandChips?: boolean;
  /** Large module icon above the title. */
  heroIcon?: boolean;
  /** Hand-authored animated diagram after the lead paragraphs. */
  animatedDiagram?: boolean;
  /** Real screenshots with clickable numbered hotspots. */
  annotatedShots?: boolean;
  /** Lexicon rendered as flip cards. */
  flipLexicon?: boolean;
  /** Commands replayed step by step. */
  terminal?: boolean;
  /** Draggable before/after comparison. */
  slider?: boolean;
  /** Sticky rail showing progress inside a procedure. */
  stepRail?: boolean;
};

export const TREATMENTS: Treatment[] = [
  {
    n: 1,
    id: 'iconographie',
    name: 'Iconographie systématique',
    blurb:
      'Une icône Lucide sur chaque titre de section, le logo de la marque sur les fiches qui nomment un produit. Discret, cohérent, et ça tient sur les 72 sections sans devenir lourd.',
    tech: 'CSS',
    sectionIcons: true,
    brandChips: true,
  },
  {
    n: 2,
    id: 'ouverture-icone',
    name: 'Ouverture par le signe',
    blurb:
      "Une grande icône teintée à l'accent ouvre chaque leçon, comme une lettrine. Aucun octet d'image en plus, la couleur suit le thème.",
    tech: 'CSS',
    heroIcon: true,
    sectionIcons: true,
  },
  {
    n: 3,
    id: 'schemas-animes',
    name: 'Schémas animés',
    blurb:
      "Des diagrammes écrits à la main et animés en CSS. Zéro image, texte sélectionnable, se reteinte tout seul en clair comme en sombre.",
    tech: 'SVG',
    animatedDiagram: true,
    sectionIcons: true,
  },
  {
    n: 4,
    id: 'captures-annotees',
    name: 'Captures annotées',
    blurb:
      'Les vraies captures Hermes, avec des pastilles numérotées que le lecteur clique pour révéler l’explication. Rien de cuit dans le pixel.',
    tech: 'React',
    annotatedShots: true,
  },
  {
    n: 5,
    id: 'lexique-cartes',
    name: 'Lexique en cartes',
    blurb:
      'Les fiches de vocabulaire deviennent des cartes retournables, navigables au clavier. On révèle la définition seulement quand on la cherche.',
    tech: 'React',
    flipLexicon: true,
    brandChips: true,
  },
  {
    n: 6,
    id: 'terminal-rejouable',
    name: 'Terminal rejouable',
    blurb:
      'Les commandes se rejouent pas à pas avec un bouton lecture. Aucune vidéo, quelques kilo-octets, et on peut toujours copier le texte.',
    tech: 'React',
    terminal: true,
    sectionIcons: true,
  },
  {
    n: 7,
    id: 'avant-apres',
    name: 'Avant / après glissable',
    blurb:
      'Un curseur de comparaison pour les oppositions du cours : le chat contre l’agent, le cloud contre le local. On manipule au lieu de lire.',
    tech: 'React',
    slider: true,
  },
  {
    n: 8,
    id: 'signes-animes',
    name: 'Signes animés',
    blurb:
      "Les icônes s'animent au survol et à l'entrée dans le champ de vision. L'emplacement prévu pour du Lottie, tenu ici en SVG pur pour rester sans dépendance.",
    tech: 'CSS',
    sectionIcons: true,
    heroIcon: true,
    animatedDiagram: true,
  },
  {
    n: 9,
    id: 'frise-procedure',
    name: 'Frise de procédure',
    blurb:
      "Un rail collant qui montre où on en est dans une procédure à étapes, visible pendant tout le défilement. Utile là où le cours enchaîne des manipulations.",
    tech: 'CSS',
    stepRail: true,
    sectionIcons: true,
  },
  {
    n: 10,
    id: 'editorial',
    name: 'Éditorial typographique',
    blurb:
      "La contre-proposition : presque aucune image. Lettrines, exergues, notes en marge, grille forte. Si celle-ci gagne, c'est que le cours n'avait pas un problème d'illustration.",
    tech: 'CSS',
  },
];

export const DEFAULT_TREATMENT = TREATMENTS[0].id;

export const byId = (id: string | null | undefined): Treatment =>
  TREATMENTS.find((t) => t.id === id) ?? TREATMENTS[0];

/** One Lucide icon per module, chosen for the lesson's subject. */
export const MODULE_ICON: Record<string, string> = {
  '00': 'rocket',
  '01': 'book-open',
  '02': 'clipboard-check',
  '03': 'download',
  '04': 'user-round-cog',
  '05': 'smartphone',
  '06': 'wand-sparkles',
  '07': 'brain',
  '08': 'database',
  '09': 'puzzle',
  '10': 'shield-check',
  '11': 'clock',
  '12': 'infinity',
};

/**
 * Section heading → icon, by keyword. First match wins, so the specific
 * patterns come before the generic ones.
 */
const SECTION_ICON_RULES: [RegExp, string][] = [
  [/proof|checklist|prove/i, 'circle-check'],
  [/loop|think|act|observe/i, 'repeat'],
  [/stack|core/i, 'cpu'],
  [/model|cost|key|api/i, 'key-round'],
  [/token|budget|spend/i, 'coins'],
  [/remember|memory|context/i, 'brain-circuit'],
  [/tool|skill|plugin|mcp/i, 'wrench'],
  [/vault|data|backup/i, 'database'],
  [/secur|threat|trust|risk|danger/i, 'shield-check'],
  [/cron|schedule|job|quiet/i, 'clock'],
  [/install|download|setup|ready|need/i, 'download'],
  [/gateway|phone|reach|messag/i, 'smartphone'],
  [/soul|personal|who/i, 'user-round-cog'],
  [/chat|agent|versus|vs\b/i, 'bot'],
  [/file|write|folder/i, 'folder-tree'],
  [/server|host|machine|runtime/i, 'server'],
  [/read|how to follow|welcome|what this/i, 'book-open'],
  [/deeper|link|source/i, 'git-branch'],
];

export const sectionIcon = (heading: string): string => {
  for (const [re, icon] of SECTION_ICON_RULES) if (re.test(heading)) return icon;
  return 'terminal';
};

/** Lexicon term → brand mark, when the term names a real product. */
export const TERM_BRAND: Record<string, string> = {
  telegram: 'telegram',
  obsidian: 'obsidian',
  github: 'github',
  ollama: 'ollama',
  docker: 'docker',
  linux: 'linux',
  python: 'python',
  anthropic: 'anthropic',
};

export const termBrand = (term: string): string | null => {
  const k = term.toLowerCase().replace(/[^a-z]/g, '');
  return TERM_BRAND[k] ?? null;
};
