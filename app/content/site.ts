import type { Locale } from '@/lib/i18n';

/* ------------------------------------------------------------------ home */

export type HomeCopy = {
  heroLine1: string;
  heroLine2Lead: string;
  heroLine2Accent: string;
  heroBlurb: string;
  ctaUpskill: string;
  ctaServices: string;
  ctaContact: string;
  stats: { label: string; sub: string }[];
  pillarsEyebrow: string;
  pillarsTitle: string;
  pillarsBlurbStrong: string;
  pillarsBlurbRest: string;
  /** Order matches CAPABILITY_STRUCTURE in HomeView. */
  capabilities: { title: string; cta: string; bullets: string[] }[];
  offeringsEyebrow: string;
  offeringsTitle: string;
  offerings: { title: string; badge?: string; text: string; cta: string }[];
  loopEyebrow: string;
  loopTitle: string;
  loopBlurb: string;
  tutorials: string;
  blog: string;
  getInTouch: string;
};

const homeEn: HomeCopy = {
  heroLine1: 'We don’t sell tools.',
  heroLine2Lead: 'We forge ',
  heroLine2Accent: 'future-aptness.',
  heroBlurb: 'AI, Web3, and OpSec engineering for everyone. Fitted to your systems. Open-source first.',
  ctaUpskill: 'Upskill',
  ctaServices: 'Explore services',
  ctaContact: 'Contact Us',
  stats: [
    { label: 'Fitted', sub: 'to your systems' },
    { label: 'Open-source', sub: 'first' },
    { label: 'State of the art', sub: 'solutions' },
  ],
  pillarsEyebrow: 'What We Do',
  pillarsTitle: 'Three pillars. One mission.',
  pillarsBlurbStrong: 'Stay up to speed with AI and Web3',
  pillarsBlurbRest: ' through open-source solutions, expert engineers, and practical mentoring.',
  capabilities: [
    {
      title: 'AI Engineering',
      cta: 'Explore AI Engineering',
      bullets: [
        'Named specialists for HR, review, and finance',
        'Inference and model engineering',
        'Ongoing AI engineer support',
      ],
    },
    {
      title: 'Web3',
      cta: 'Explore Web3',
      bullets: [
        'SOTA setup and architecture',
        'Web3 intelligence and OSINT',
        'Growth, public goods, and community building',
      ],
    },
    {
      title: 'Skill Forge',
      cta: 'Explore capability',
      bullets: ['My First AI Agent', 'Open Design', 'OpSec training and auditing'],
    },
  ],
  offeringsEyebrow: 'Flagship Offerings',
  offeringsTitle: 'Precision-built systems for serious builders.',
  offerings: [
    {
      title: 'My First AI Agent',
      badge: '100% free',
      text: 'Thirteen free lessons to set up a real AI agent that reads your files, runs your errands, and answers to you on your phone.',
      cta: 'View Curriculum',
    },
    {
      title: 'Specialists for your real jobs',
      text: 'Named AI colleagues for HR, review, and finance — they work your files, leave a receipt, and your people keep the decisions.',
      cta: 'See the offer',
    },
    {
      title: 'Growth Boost',
      text: 'Strategic Web3 growth — community building, public good initiatives, and fundraising with OpSec foundations baked in.',
      cta: 'Explore Web3',
    },
  ],
  loopEyebrow: 'Stay in the Loop',
  loopTitle: 'The Delta V Feed.',
  loopBlurb:
    'AI and Web3, sorted daily without the noise: what the labs published, what open source shipped, what the engineers moving the field are saying.',
  tutorials: 'Tutorials',
  blog: 'Blog',
  getInTouch: 'Get in touch',
};

const homeFr: HomeCopy = {
  heroLine1: 'Nous ne vendons pas d’outils.',
  heroLine2Lead: 'Nous forgeons ',
  heroLine2Accent: 'vos capacités.',
  heroBlurb:
    'Ingénierie IA, Web3 et OpSec, pour tout le monde. Adapté à vos systèmes. L’open source d’abord.',
  ctaUpskill: 'Monter en compétences',
  ctaServices: 'Voir nos services',
  ctaContact: 'Nous contacter',
  stats: [
    { label: 'Adapté', sub: 'à vos systèmes' },
    { label: 'Open source', sub: 'd’abord' },
    { label: 'État de l’art', sub: 'en solutions' },
  ],
  pillarsEyebrow: 'Ce que nous faisons',
  pillarsTitle: 'Trois piliers. Une mission.',
  pillarsBlurbStrong: 'Gardez le rythme de l’IA et du Web3',
  pillarsBlurbRest:
    ' grâce à des solutions open source, des ingénieurs expérimentés et un accompagnement concret.',
  capabilities: [
    {
      title: 'Ingénierie IA',
      cta: 'Découvrir l’ingénierie IA',
      bullets: [
        'Spécialistes nommés pour RH, revue et finance',
        'Inférence et ingénierie de modèles',
        'Accompagnement continu par un ingénieur IA',
      ],
    },
    {
      title: 'Web3',
      cta: 'Découvrir le Web3',
      bullets: [
        'Architecture et fondations Web3',
        'Renseignement onchain et OSINT',
        'Traction, communauté et financement',
      ],
    },
    {
      title: 'Skill Forge',
      cta: 'Découvrir nos formations',
      bullets: ['Mon premier agent IA', 'Open Design', 'Formation et audit OpSec'],
    },
  ],
  offeringsEyebrow: 'Nos offres phares',
  offeringsTitle: 'Des systèmes de précision, pour ceux qui construisent sérieusement.',
  offerings: [
    {
      title: 'Mon premier agent IA',
      badge: '100 % gratuit',
      text: 'Treize leçons gratuites pour mettre en place un vrai agent IA qui lit vos fichiers, exécute vos tâches et vous répond sur votre téléphone.',
      cta: 'Voir le programme',
    },
    {
      title: 'Des spécialistes pour vos vrais métiers',
      text: 'Des collègues IA nommés pour la RH, la revue et la finance — ils travaillent vos fichiers, laissent un reçu, et vos gens gardent les décisions.',
      cta: 'Voir l’offre',
    },
    {
      title: 'Traction, communauté et financement',
      text: 'Croissance Web3 stratégique — animation de communauté, initiatives de bien commun et levée de fonds, avec l’OpSec intégrée dès le départ.',
      cta: 'Découvrir le Web3',
    },
  ],
  loopEyebrow: 'Restez informés',
  loopTitle: 'Le Flux Delta V.',
  loopBlurb:
    'L’actualité de l’IA et du Web3, triée chaque jour, sans le bruit : ce que publient les laboratoires, ce que sortent les équipes open source, et ce que disent les ingénieurs et les talents qui font bouger le secteur.',
  tutorials: 'Tutoriels',
  blog: 'Blog',
  getInTouch: 'Nous écrire',
};

/* ---------------------------------------------------------------- footer */

export type FooterCopy = {
  tagline: string;
  services: string;
  aiEngineering: string;
  web3: string;
  opsec: string;
  skillForge: string;
  resources: string;
  blog: string;
  intelhub: string;
  tutorials: string;
  connect: string;
  contact: string;
  values: string;
  valueList: string[];
  noTrackers: string;
  noTrackersTitle: string;
  terms: string;
  privacy: string;
};

const footerEn: FooterCopy = {
  tagline: 'AI, Web3, and OpSec engineering. Fitted to your systems. Open-source first.',
  services: 'Services',
  aiEngineering: 'AI Engineering',
  web3: 'Web3',
  opsec: 'OpSec',
  skillForge: 'Skill Forge',
  resources: 'Resources',
  blog: 'Blog',
  intelhub: 'IntelHub',
  tutorials: 'Tutorials',
  connect: 'Connect',
  contact: 'Contact',
  values: 'Values',
  valueList: ['Open source', 'Autonomy', 'Privacy', 'Clear exit strategy'],
  noTrackers: 'No trackers · Static export',
  noTrackersTitle: 'This site is statically exported. No analytics, cookies, or third-party trackers.',
  terms: 'Terms of Use',
  privacy: 'Privacy Policy',
};

const footerFr: FooterCopy = {
  tagline: 'Ingénierie IA, Web3 et OpSec. Adapté à vos systèmes. L’open source d’abord.',
  services: 'Services',
  aiEngineering: 'Ingénierie IA',
  web3: 'Web3',
  opsec: 'OpSec',
  skillForge: 'Skill Forge',
  resources: 'Ressources',
  blog: 'Blog',
  intelhub: 'IntelHub',
  tutorials: 'Tutoriels',
  connect: 'Nous joindre',
  contact: 'Contact',
  values: 'Nos principes',
  valueList: ['Open source', 'Autonomie', 'Vie privée', 'Stratégie de sortie claire'],
  noTrackers: 'Aucun traceur · Export statique',
  noTrackersTitle:
    'Ce site est exporté en statique. Ni analytics, ni cookies, ni traceurs tiers.',
  terms: 'Conditions d’utilisation',
  privacy: 'Politique de confidentialité',
};

/* ----------------------------------------------------------------- opsec */

export type OpSecCopy = {
  heroLabel: string;
  heroTitle: string;
  heroDescription: string;
  backLabel: string;
  embeddedTitle: string;
  embeddedBlurb: string;
  spineEyebrow: string;
  spineTitle: string;
  spineBlurb: string;
  blueprintTag: string;
  blueprintTitle: string;
  blueprintBody: string;
  blueprintCta: string;
  trainingTag: string;
  trainingTitle: string;
  trainingBody: string;
  trainingCta: string;
  osEyebrow: string;
  osTitle: string;
  osBlurb: string;
  osGuides: { title: string; blurb: string; status: string }[];
  openGuide: string;
  alsoUsefulTitle: string;
  alsoUsefulBlurb: string;
  /** Keyed by the `logo` id in ALSO_USEFUL. */
  alsoUseful: Record<string, string>;
};

const opsecEn: OpSecCopy = {
  heroLabel: 'OpSec',
  heroTitle: 'Web3 OpSec',
  heroDescription:
    'High-signal operational security frameworks built on complementary sources and self-sovereign principles.',
  backLabel: 'Home',
  embeddedTitle: 'Web3 operational security',
  embeddedBlurb: 'Protect the people, keys, and systems behind decentralized operations.',
  spineEyebrow: 'How to work with us',
  spineTitle: 'Blueprint first. Workshop second. Guides underneath.',
  spineBlurb:
    'The spine is DeFi-native treasury and key management for high-decentralization teams. Workshops and OS guides hang off that blueprint - not the other way around.',
  blueprintTag: 'Blueprint',
  blueprintTitle: 'SOTA Operator Stack',
  blueprintBody:
    'YubiKey · hardened signer workstations · Safe treasury key management · DeFi ops runbooks (approvals, simulation, governance, bridges) · optional automation float. Built for decentralized teams.',
  blueprintCta: 'Open the stack',
  trainingTag: 'Training',
  trainingTitle: 'Treasury key setup',
  trainingBody:
    'Facilitated ceremony design, signer roles, thresholds/timelocks, and drills for treasury teams. Optional module: x402 / agent float once capital custody is solid.',
  trainingCta: 'Request training',
  osEyebrow: 'OS Hardening',
  osTitle: 'Tactical floor',
  osBlurb:
    'Pair a hardened host with a YubiKey before you touch value. These guides sit under the SOTA stack.',
  osGuides: [
    { title: 'Linux', blurb: 'Factory reset + hardening guide', status: 'Live' },
    { title: 'macOS', blurb: 'Privacy-first MDM + hardening', status: 'Live' },
    { title: 'Windows', blurb: 'Telemetry reduction + endpoint security', status: 'Live' },
  ],
  openGuide: 'Open guide',
  alsoUsefulTitle: 'Also useful',
  alsoUsefulBlurb:
    'Public tools we point operators to for wallet, protocol, L2, and machine-payments risk — not an endorsement of every score.',
  alsoUseful: {
    walletbeat:
      'Independent Ethereum wallet scorecards — privacy, security, open-source, and account-abstraction readiness.',
    defiscan:
      'DeFi protocol centralization scorecards — admin keys, upgradeability, oracles, and other trust assumptions.',
    l2beat:
      'Layer 2 risk & maturity: stages, security councils, data availability, and TVL with honest risk labels.',
    growthepie:
      'Ethereum L2 fundamentals — usage, fees, TVS, and comparable metrics across chains (not just TVL).',
    xerberus:
      'On-chain risk ratings for assets, protocols, and organisations — structured scores for diligence, not hype.',
    x402scan:
      'x402 ecosystem explorer — paid APIs, agent commerce, sellers, and HTTP-402 payment flow analytics.',
    anticapture:
      'DAO / governance capture research — concentration, voting power, and structural capture signals.',
    ethereumsecurity:
      'Community security research stream — incidents, tooling, and defensive notes for Ethereum operators.',
  },
};

const opsecFr: OpSecCopy = {
  heroLabel: 'OpSec',
  heroTitle: 'OpSec Web3',
  heroDescription:
    'Des cadres de sécurité opérationnelle à haut signal, bâtis sur des sources complémentaires et des principes de souveraineté.',
  backLabel: 'Accueil',
  embeddedTitle: 'Sécurité opérationnelle Web3',
  embeddedBlurb:
    'Protéger les personnes, les clés et les systèmes qui font tourner des opérations décentralisées.',
  spineEyebrow: 'Comment travailler avec nous',
  spineTitle: 'Le plan d’abord. L’atelier ensuite. Les guides en soutien.',
  spineBlurb:
    'La colonne vertébrale : la gestion de trésorerie et de clés, native DeFi, pour des équipes très décentralisées. Les ateliers et les guides système se greffent sur ce plan - et non l’inverse.',
  blueprintTag: 'Le plan',
  blueprintTitle: 'Stack opérateur SOTA',
  blueprintBody:
    'YubiKey · postes de signature durcis · gestion des clés de trésorerie avec Safe · runbooks d’opérations DeFi (approbations, simulation, gouvernance, ponts) · flottant d’automatisation en option. Conçu pour les équipes décentralisées.',
  blueprintCta: 'Ouvrir la stack',
  trainingTag: 'Formation',
  trainingTitle: 'Mise en place des clés de trésorerie',
  trainingBody:
    'Conception de cérémonie accompagnée, rôles des signataires, seuils et délais, et exercices pour les équipes trésorerie. Module optionnel : x402 / flottant d’agent, une fois la conservation des fonds solide.',
  trainingCta: 'Demander une formation',
  osEyebrow: 'Durcissement système',
  osTitle: 'Socle tactique',
  osBlurb:
    'Un poste durci et une YubiKey avant de toucher à la moindre valeur. Ces guides s’inscrivent sous la stack SOTA.',
  osGuides: [
    { title: 'Linux', blurb: 'Remise à zéro et durcissement', status: 'En ligne' },
    { title: 'macOS', blurb: 'MDM orienté vie privée et durcissement', status: 'En ligne' },
    { title: 'Windows', blurb: 'Réduction de la télémétrie et sécurité du poste', status: 'En ligne' },
  ],
  openGuide: 'Ouvrir le guide',
  alsoUsefulTitle: 'Également utile',
  alsoUsefulBlurb:
    'Les outils publics vers lesquels nous orientons les opérateurs pour évaluer le risque portefeuille, protocole, L2 et paiements machine — sans valider pour autant chacun de leurs scores.',
  alsoUseful: {
    walletbeat:
      'Évaluations indépendantes des portefeuilles Ethereum — vie privée, sécurité, open source et compatibilité avec l’abstraction de compte.',
    defiscan:
      'Évaluations de la centralisation des protocoles DeFi — clés d’administration, mises à jour, oracles et autres hypothèses de confiance.',
    l2beat:
      'Risque et maturité des Layer 2 : stades, conseils de sécurité, disponibilité des données et TVL, avec des étiquettes de risque honnêtes.',
    growthepie:
      'Les fondamentaux des L2 Ethereum — usage, frais, TVS et métriques comparables entre chaînes (pas seulement la TVL).',
    xerberus:
      'Notations de risque onchain pour les actifs, protocoles et organisations — des scores structurés pour la due diligence, pas pour le buzz.',
    x402scan:
      'Explorateur de l’écosystème x402 — API payantes, commerce entre agents, vendeurs et analyse des flux de paiement HTTP-402.',
    anticapture:
      'Recherche sur la capture des DAO et de la gouvernance — concentration, pouvoir de vote et signaux de capture structurelle.',
    ethereumsecurity:
      'Flux de recherche communautaire en sécurité — incidents, outillage et notes défensives pour les opérateurs Ethereum.',
  },
};

/* --------------------------------------------- opsec figures & top tier */

export type OpSecFiguresCopy = {
  layeredEyebrow: string;
  layeredTitle: string;
  layeredNote: string;
  layers: { label: string; detail: string }[];
  pathEyebrow: string;
  pathTitle: string;
  stage: string;
  stages: { title: string; items: string[] }[];
  pathFooter: string;
};

const figuresEn: OpSecFiguresCopy = {
  layeredEyebrow: 'Threat Surface Model',
  layeredTitle: 'Layered defense for high-stakes operators',
  layeredNote: 'ETH-first · Ethereum operators',
  layers: [
    {
      label: 'Identity & Access',
      detail: 'YubiKey / FIDO2 · passkeys · least privilege · session hygiene',
    },
    {
      label: 'Wallet & Key Custody',
      detail: 'Hardware wallets · Safe multisig · Fluidkey receive patterns',
    },
    { label: 'Network & Privacy', detail: 'VPN/Tor · DNS · RPC choice · leak checks' },
    { label: 'Endpoint Hardening', detail: 'Linux · macOS · Windows baselines' },
    { label: 'Ops & Recovery', detail: 'Backups · drills · incident runbooks' },
  ],
  pathEyebrow: 'Capability Path',
  pathTitle: 'From personal baseline to team-grade Web3 OpSec',
  stage: 'Stage',
  stages: [
    { title: 'Baseline', items: ['Clean OS', 'Disk encryption', 'YubiKey for login / SSH'] },
    { title: 'Treasury keys', items: ['Safe m-of-n', 'HW wallets / signer', 'Ceremony + backups'] },
    { title: 'DeFi ops', items: ['Approvals scoped', 'Simulate → sign', 'Gov / bridge runbooks'] },
    {
      title: 'Team SOTA',
      items: ['Role separation', 'Drills & recovery', 'High-decentralization friction'],
    },
  ],
  pathFooter:
    'Focus: high-decentralization Ethereum / DeFi treasuries. YubiKeys gate humans; Safe + hardware wallets hold capital; DeFi ops need runbooks. Learn from these blueprints, then ask us for training to put them into practice.',
};

const figuresFr: OpSecFiguresCopy = {
  layeredEyebrow: 'Modèle de surface d’attaque',
  layeredTitle: 'Défense en couches pour les opérateurs exposés',
  layeredNote: 'ETH d’abord · opérateurs Ethereum',
  layers: [
    {
      label: 'Identité et accès',
      detail: 'YubiKey / FIDO2 · passkeys · moindre privilège · hygiène des sessions',
    },
    {
      label: 'Portefeuilles et garde des clés',
      detail: 'Portefeuilles matériels · multisig Safe · schémas de réception Fluidkey',
    },
    { label: 'Réseau et vie privée', detail: 'VPN/Tor · DNS · choix du RPC · tests de fuite' },
    { label: 'Durcissement du poste', detail: 'Références Linux · macOS · Windows' },
    { label: 'Opérations et reprise', detail: 'Sauvegardes · exercices · runbooks d’incident' },
  ],
  pathEyebrow: 'Parcours de montée en capacité',
  pathTitle: 'Du socle personnel à une OpSec Web3 d’équipe',
  stage: 'Étape',
  stages: [
    {
      title: 'Socle',
      items: ['Système propre', 'Chiffrement du disque', 'YubiKey pour la session et SSH'],
    },
    {
      title: 'Clés de trésorerie',
      items: ['Safe m-parmi-n', 'Portefeuilles matériels', 'Cérémonie et sauvegardes'],
    },
    {
      title: 'Opérations DeFi',
      items: ['Approbations limitées', 'Simuler puis signer', 'Runbooks gouvernance et ponts'],
    },
    {
      title: 'Équipe SOTA',
      items: ['Séparation des rôles', 'Exercices et reprise', 'Friction assumée, très décentralisée'],
    },
  ],
  pathFooter:
    'Notre terrain : les trésoreries Ethereum / DeFi très décentralisées. Les YubiKeys filtrent les humains ; Safe et les portefeuilles matériels gardent le capital ; les opérations DeFi demandent des runbooks. Apprenez de ces plans, puis demandez-nous une formation pour les mettre en pratique.',
};

export type TopTierCopy = {
  eyebrow: string;
  title: string;
  blurb: string;
  taurusTag: string;
  taurusBody: string;
  taurusBullets: string[];
  opsekTag: string;
  opsekBody: string;
  opsekBullets: string[];
  opsekNote: string;
};

const topTierEn: TopTierCopy = {
  eyebrow: 'Top-tier solutions',
  title: 'When you need institutional grade or HNW security',
  blurb:
    'Our SOTA Operator Stack is for sovereign and decentralized treasury teams. For banking-grade custody or high-net-worth personal security, these are the top-tier references we point people to - no ego, just the right tool for the mandate.',
  taurusTag: 'Institutional custody',
  taurusBody:
    'Top-tier digital-asset infrastructure for institutions: custody, policy engines, HSM/MPC, and operational controls built for regulated environments and serious AUM.',
  taurusBullets: [
    'Banking-grade key protection and governance',
    'Multi-party approval and policy-driven workflows',
    'Right fit when DIY Safe / HW-wallet ops are not enough',
  ],
  opsekTag: 'HNW security',
  opsekBody:
    'Top-tier operational and endpoint security for high-net-worth and high-risk operators: OS hardening, threat-modelled setups, and security depth beyond generic consumer advice.',
  opsekBullets: [
    'Linux, macOS, Windows hardening at a professional bar',
    'HNW / high-risk personal and team threat models',
    'Complementary top-tier path when you need specialist HNW security',
  ],
  opsekNote: 'OS security baselines we align with on the sovereign track.',
};

const topTierFr: TopTierCopy = {
  eyebrow: 'Solutions haut de gamme',
  title: 'Quand il vous faut un niveau institutionnel ou une sécurité grande fortune',
  blurb:
    'Notre stack opérateur SOTA s’adresse aux équipes de trésorerie souveraines et décentralisées. Pour une conservation de niveau bancaire ou une sécurité personnelle grande fortune, voici les références vers lesquelles nous orientons - sans ego, simplement le bon outil pour le mandat.',
  taurusTag: 'Conservation institutionnelle',
  taurusBody:
    'Infrastructure d’actifs numériques de premier plan pour les institutions : conservation, moteurs de politiques, HSM/MPC et contrôles opérationnels conçus pour les environnements régulés et les encours importants.',
  taurusBullets: [
    'Protection et gouvernance des clés de niveau bancaire',
    'Approbations multipartites et flux pilotés par des politiques',
    'Le bon choix quand les opérations Safe / portefeuille matériel ne suffisent plus',
  ],
  opsekTag: 'Sécurité grande fortune',
  opsekBody:
    'Sécurité opérationnelle et sécurité du poste de premier plan pour les profils fortunés ou exposés : durcissement système, configurations issues d’un modèle de menace, et une profondeur bien au-delà des conseils grand public.',
  opsekBullets: [
    'Durcissement Linux, macOS et Windows au niveau professionnel',
    'Modèles de menace personnels et d’équipe, profils fortunés ou exposés',
    'Une voie complémentaire quand il vous faut une expertise sécurité grande fortune',
  ],
  opsekNote: 'Les références de sécurité système sur lesquelles nous nous alignons.',
};

export const HOME_PAGE: Record<Locale, HomeCopy> = { en: homeEn, fr: homeFr };
export const FOOTER_COPY: Record<Locale, FooterCopy> = { en: footerEn, fr: footerFr };
export const OPSEC_COPY: Record<Locale, OpSecCopy> = { en: opsecEn, fr: opsecFr };
export const OPSEC_FIGURES: Record<Locale, OpSecFiguresCopy> = { en: figuresEn, fr: figuresFr };
export const TOP_TIER_COPY: Record<Locale, TopTierCopy> = { en: topTierEn, fr: topTierFr };
