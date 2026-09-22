import type { Locale } from '@/lib/i18n';

/**
 * Copy for the two pillar pages (AI, Web3).
 *
 * `pitch` uses **bold** rather than embedded JSX so the same string can be
 * translated without carrying markup around; the view renders it through the
 * course text formatter. Ids, cta topics and hrefs stay locale-independent —
 * they are routing, not copy.
 */
export type OfferCopy = {
  id: string;
  title: string;
  pitch: string;
  deliverables: string[];
  process: { step: string; desc: string }[];
  audience: string;
  ctaLabel: string;
  ctaTopic: string;
  secondary?: { label: string; href: string };
  secondaryTone?: 'forge';
};

export type PillarCopy = {
  label: string;
  title: string;
  description: string;
  ecosystemLabel: string;
  backLabel: string;
  offers: OfferCopy[];
};

const aiEn: PillarCopy = {
  label: 'Pillar 01 · AI Engineering',
  title: 'AI Engineering',
  description:
    'AI tools built for your production systems. Designed and shipped by engineers who run these systems 24/7.',
  ecosystemLabel: 'Ecosystem & Stack',
  backLabel: 'Home',
  offers: [
    {
      id: 'agents',
      title: 'Tailored Multi-Agent Systems',
      pitch:
        'We embed with your team, **map your real workflows and data**, then design and ship custom single or multi-agent systems built around the models that perform best for your use case.',
      deliverables: [
        'Agent architecture designed around your workflows (orchestration, memory, tool use)',
        'Model selection benchmarked on your actual tasks — open-weight first when it wins',
        'Local-first wherever it is workable — we favour deployments where your data and keys never leave your infrastructure',
        'Guardrails, evaluation harness, and human-in-the-loop controls for high-stakes actions',
        'Documentation and handover so your team owns the system',
      ],
      process: [
        { step: 'Scoping call', desc: 'we map workflows, data sensitivity, and success criteria' },
        { step: 'Architecture + prototype', desc: 'a working vertical slice on your real data' },
        { step: 'Ship + harden', desc: 'production deployment, evals, OpSec review, handover' },
      ],
      audience:
        'Teams drowning in manual workflows; founders who need leverage without headcount; organizations that cannot send data to third-party clouds.',
      ctaLabel: 'Book a scoping call',
      ctaTopic: 'agents',
    },
    {
      id: 'inference',
      title: 'Inference & Model Engineering',
      pitch:
        'Running AI reliably in production requires more than prompting. We **customize models on your own data and to your enterprise requirements** — fine-tuning, inference optimization, provider selection, and MLOps — and we hand you the weights.',
      deliverables: [
        'Models customized on your data — fine-tuned on your documents, tickets, code, or transcripts — weights delivered to you',
        'Adaptation to enterprise requirements: tone, terminology, compliance boundaries, refusal rules',
        'Model selection & benchmarking across cost, latency, and quality',
        'Quantization and serving setup sized to your hardware',
        'Inference cost audit: token-level cost breakdown of your current stack vs. API, open-weight, and hybrid options',
        'Post-training ops: eval regression checks and quarterly re-tunes as your data grows',
      ],
      process: [
        { step: 'Audit', desc: 'current stack, costs, latency, and quality baselines' },
        { step: 'Plan', desc: 'target architecture with measured trade-offs' },
        { step: 'Execute', desc: 'migration, tuning, and monitoring in production' },
      ],
      audience:
        'Teams hitting cost, latency, or privacy walls; ML teams moving from API-only to owned inference.',
      ctaLabel: 'Discuss your model needs',
      ctaTopic: 'inference',
    },
    {
      id: 'retainer',
      title: 'AI Engineer Retainer',
      pitch:
        'Direct access to a **Delta V AI Engineer** for ongoing optimization, security, and capability expansion.',
      deliverables: [
        'Reserved monthly engineering hours with same-week turnaround',
        'Continuous model and tooling watch as the frontier moves',
        'Security reviews of agent permissions, prompts, and data flows',
        'Quarterly architecture review with a written roadmap',
      ],
      process: [
        { step: 'Onboarding', desc: 'deep-dive into your existing systems and priorities' },
        { step: 'Cadence', desc: 'monthly hours, async requests, shared backlog' },
        { step: 'Compound', desc: 'each month builds on documented system knowledge' },
      ],
      audience: 'Teams running AI systems in production without a dedicated AI engineer.',
      ctaLabel: 'View retainer options',
      ctaTopic: 'retainer',
      secondary: { label: 'Upskill instead — Forge', href: '/forge/' },
      secondaryTone: 'forge',
    },
  ],
};

const aiFr: PillarCopy = {
  label: 'Pilier 01 · Ingénierie IA',
  title: 'Ingénierie IA',
  description:
    'Des outils d’IA taillés pour vos systèmes de production. Conçus et livrés par des ingénieurs qui font tourner ces systèmes 24h/24.',
  ecosystemLabel: 'Écosystème et stack',
  backLabel: 'Accueil',
  offers: [
    {
      id: 'agents',
      title: 'Systèmes multi-agents sur mesure',
      pitch:
        'Nous nous intégrons à votre équipe, **cartographions vos processus et vos données réels**, puis concevons et livrons des systèmes à un ou plusieurs agents, bâtis autour des modèles les plus performants pour votre cas d’usage.',
      deliverables: [
        'Architecture d’agents pensée pour vos processus (orchestration, mémoire, usage des outils)',
        'Choix des modèles mesuré sur vos tâches réelles — poids ouverts en priorité quand ils gagnent',
        'Le local en priorité quand c’est réalisable — nous privilégions les déploiements où vos données et vos clés ne quittent pas votre infrastructure',
        'Garde-fous, banc d’évaluation et validation humaine pour les actions sensibles',
        'Documentation et transfert de compétences : le système appartient à votre équipe',
      ],
      process: [
        { step: 'Cadrage', desc: 'processus, sensibilité des données et critères de réussite' },
        { step: 'Architecture et prototype', desc: 'une tranche fonctionnelle sur vos vraies données' },
        { step: 'Mise en production', desc: 'déploiement, évaluations, revue OpSec, transfert' },
      ],
      audience:
        'Les équipes noyées sous les tâches manuelles, les fondateurs qui cherchent du levier sans recruter, et les organisations qui ne peuvent pas envoyer leurs données vers des clouds tiers.',
      ctaLabel: 'Réserver un cadrage',
      ctaTopic: 'agents',
    },
    {
      id: 'inference',
      title: 'Inférence et ingénierie de modèles',
      pitch:
        'Faire tourner l’IA de façon fiable en production demande plus que du prompting. Nous **adaptons les modèles à vos propres données et aux exigences de votre entreprise** — fine-tuning, optimisation de l’inférence, choix des fournisseurs et MLOps — et nous vous remettons les poids.',
      deliverables: [
        'Des modèles adaptés à vos données — affinés sur vos documents, tickets, code ou transcriptions — et vous recevez les poids',
        'Alignement sur vos exigences d’entreprise : ton, terminologie, limites de conformité, règles de refus',
        'Choix et évaluation des modèles selon le coût, la latence et la qualité',
        'Quantisation et service dimensionnés pour votre matériel',
        'Audit des coûts d’inférence : décomposition token par token de votre stack actuelle face aux options API, poids ouverts et hybrides',
        'Opérations post-training : contrôles de régression des évaluations et ré-entraînements trimestriels au rythme de vos données',
      ],
      process: [
        { step: 'Audit', desc: 'stack actuelle, coûts, latence et niveau de qualité de référence' },
        { step: 'Plan', desc: 'architecture cible avec des arbitrages mesurés' },
        { step: 'Exécution', desc: 'migration, réglage et supervision en production' },
      ],
      audience:
        'Les équipes qui butent sur le coût, la latence ou la confidentialité, et les équipes ML qui passent de l’API seule à une inférence maîtrisée.',
      ctaLabel: 'Parler de vos modèles',
      ctaTopic: 'inference',
    },
    {
      id: 'retainer',
      title: 'Consultant Ingénieur IA',
      pitch:
        'Un accès direct à un **ingénieur IA Delta V** pour l’optimisation continue, la sécurité et l’extension des capacités.',
      deliverables: [
        'Heures d’ingénierie réservées chaque mois, avec réponse dans la semaine',
        'Veille continue sur les modèles et les outils, au rythme de la frontière technologique',
        'Revues de sécurité des permissions des agents, des prompts et des flux de données',
        'Revue d’architecture trimestrielle avec feuille de route écrite',
      ],
      process: [
        { step: 'Intégration', desc: 'plongée dans vos systèmes existants et vos priorités' },
        { step: 'Rythme', desc: 'heures mensuelles, demandes asynchrones, backlog partagé' },
        { step: 'Effet cumulé', desc: 'chaque mois s’appuie sur une connaissance documentée du système' },
      ],
      audience:
        'Les équipes qui exploitent des systèmes d’IA en production sans ingénieur IA dédié.',
      ctaLabel: 'Voir les formules',
      ctaTopic: 'retainer',
      secondary: { label: 'Monter en compétences — Forge', href: '/fr/forge/' },
      secondaryTone: 'forge',
    },
  ],
};

const web3En: PillarCopy = {
  label: 'Pillar 02 · Web3',
  title: 'Web3',
  description:
    'Navigate complexity with clarity, sovereignty, and real technical depth — native EVM builders with 10+ years in the space. From wallet architecture to onchain investigations, grounded in the intelligence we monitor daily.',
  ecosystemLabel: 'Ecosystem & Stack',
  backLabel: 'Home',
  offers: [
    {
      id: 'architecture',
      title: 'SOTA Setup & Architecture Advisory',
      pitch:
        'We help you implement **best-in-class transaction execution, secure wallet architectures, optimal routing, privacy solutions, and decentralized hosting**.',
      deliverables: [
        'Wallet and key architecture review: self-custody, multisig, hardware, session keys',
        'Private RPCs, MEV protection, and optimal transaction routing',
        'Privacy stack: self-hosted endpoints, address hygiene, metadata hardening',
        'Protocol and chain risk assessment grounded in observable data',
        'Written architecture document your team can execute and audit',
      ],
      process: [
        { step: 'Threat model', desc: 'assets, adversaries, and operational constraints' },
        { step: 'Architecture', desc: 'target setup with measured trade-offs' },
        { step: 'Implementation', desc: 'guided rollout with verification at each step' },
      ],
      audience:
        'Funds, DAOs, and serious operators whose current setup grew organically and has never been reviewed end-to-end.',
      ctaLabel: 'Describe your setup',
      ctaTopic: 'web3-advisory',
    },
    {
      id: 'intelligence',
      title: 'Web3 Intelligence & OSINT',
      pitch:
        'We conduct **onchain and offchain investigations** to help you assess risks and make informed decisions.',
      deliverables: [
        'Counterparty due diligence: wallets, entities, funding trails, and infrastructure',
        'Protocol deep-dives: governance capture risk, admin keys, and upgrade paths',
        'Incident forensics: trace what happened, quantify exposure, and document it',
        'Financial services analysis and research — historical data, wallet mapping, deep EVM DeFi ecosystem knowledge',
        'Continuous monitoring briefs on protocols and entities you care about',
        'Confidential reporting — findings never leave your circle',
      ],
      process: [
        { step: 'Brief', desc: 'define the question and the decision it supports' },
        { step: 'Investigate', desc: 'onchain and OSINT sweep with documented evidence' },
        { step: 'Report', desc: 'written findings, confidence levels, and actions' },
      ],
      audience:
        'Investors doing diligence, protocols assessing partners, and teams responding to incidents.',
      ctaLabel: 'Request research support',
      ctaTopic: 'osint',
      secondary: { label: 'See our public intel — IntelHub', href: '/intelhub/' },
    },
    {
      id: 'growth',
      title: 'Growth Boost',
      pitch:
        'We help protect and foster the cypherpunk ethos by supporting **community building, public good initiatives, and fundraising efforts**.',
      deliverables: [
        'Positioning and narrative work grounded in what your protocol actually does',
        'Community architecture: channels, moderation, and contributor funnels',
        'Grant and quadratic-funding strategy grounded in ecosystem signals',
        'Technical content pipeline that earns trust',
        'OpSec review of your public surface before you scale attention',
      ],
      process: [
        { step: 'Audit', desc: 'current positioning, community, and public surface' },
        { step: 'Strategy', desc: 'prioritized growth plan with security constraints' },
        { step: 'Execute', desc: 'hands-on support with measurable milestones' },
      ],
      audience:
        'Early-stage protocols and public-goods teams that need traction without compromising values or security.',
      ctaLabel: 'Start growth support',
      ctaTopic: 'growth',
    },
  ],
};

const web3Fr: PillarCopy = {
  label: 'Pilier 02 · Web3',
  title: 'Web3',
  description:
    'Avancer dans la complexité avec clarté, souveraineté et une vraie profondeur technique — des bâtisseurs EVM natifs, avec plus de dix ans dans l’écosystème. De l’architecture de portefeuilles aux enquêtes onchain, appuyés sur le renseignement que nous suivons chaque jour.',
  ecosystemLabel: 'Écosystème et stack',
  backLabel: 'Accueil',
  offers: [
    {
      id: 'architecture',
      title: 'Architecture et fondations Web3',
      pitch:
        'Nous vous aidons à mettre en place **une exécution de transactions de premier plan, des architectures de portefeuilles sûres, un routage optimal, des solutions de confidentialité et un hébergement décentralisé**.',
      deliverables: [
        'Revue de l’architecture des portefeuilles et des clés : auto-conservation, multisig, matériel, clés de session',
        'RPC privés, protection contre le MEV et routage optimal des transactions',
        'Stack de confidentialité : points d’accès auto-hébergés, hygiène des adresses, durcissement des métadonnées',
        'Évaluation des risques protocole et chaîne, fondée sur des données observables',
        'Document d’architecture écrit, que votre équipe peut exécuter et auditer',
      ],
      process: [
        { step: 'Modèle de menace', desc: 'actifs, adversaires et contraintes opérationnelles' },
        { step: 'Architecture', desc: 'configuration cible avec des arbitrages mesurés' },
        { step: 'Mise en œuvre', desc: 'déploiement accompagné, avec vérification à chaque étape' },
      ],
      audience:
        'Les fonds, les DAO et les opérateurs sérieux dont la configuration s’est construite au fil de l’eau, sans jamais être revue de bout en bout.',
      ctaLabel: 'Décrire votre configuration',
      ctaTopic: 'web3-advisory',
    },
    {
      id: 'intelligence',
      title: 'Renseignement onchain et OSINT',
      pitch:
        'Nous menons des **enquêtes onchain et offchain** pour vous aider à évaluer les risques et à décider en connaissance de cause.',
      deliverables: [
        'Due diligence des contreparties : portefeuilles, entités, flux de financement et infrastructure',
        'Analyses approfondies de protocoles : risque de capture de la gouvernance, clés d’administration, chemins de mise à jour',
        'Forensique d’incident : retracer les faits, quantifier l’exposition et la documenter',
        'Analyse et recherche en services financiers — données historiques, cartographie de portefeuilles, connaissance fine de l’écosystème DeFi EVM',
        'Notes de veille continues sur les protocoles et les entités qui vous concernent',
        'Restitution confidentielle — les conclusions ne sortent pas de votre cercle',
      ],
      process: [
        { step: 'Brief', desc: 'définir la question et la décision qu’elle éclaire' },
        { step: 'Enquête', desc: 'balayage onchain et OSINT, preuves documentées' },
        { step: 'Rapport', desc: 'conclusions écrites, niveaux de confiance et actions' },
      ],
      audience:
        'Les investisseurs en phase de due diligence, les protocoles qui évaluent des partenaires et les équipes qui répondent à un incident.',
      ctaLabel: 'Demander un appui recherche',
      ctaTopic: 'osint',
      secondary: { label: 'Notre veille publique — IntelHub', href: '/intelhub/' },
    },
    {
      id: 'growth',
      title: 'Traction, communauté et financement',
      pitch:
        'Nous défendons et cultivons l’éthique cypherpunk en accompagnant **la construction de communautés, les initiatives de bien commun et la levée de fonds**.',
      deliverables: [
        'Positionnement et récit ancrés dans ce que votre protocole fait réellement',
        'Architecture de communauté : canaux, modération et parcours des contributeurs',
        'Stratégie de subventions et de financement quadratique, fondée sur les signaux de l’écosystème',
        'Chaîne de contenu technique qui inspire confiance',
        'Revue OpSec de votre surface publique avant de faire monter l’attention',
      ],
      process: [
        { step: 'Audit', desc: 'positionnement, communauté et surface publique actuels' },
        { step: 'Stratégie', desc: 'plan de croissance priorisé, sous contraintes de sécurité' },
        { step: 'Exécution', desc: 'accompagnement concret avec des jalons mesurables' },
      ],
      audience:
        'Les protocoles en phase initiale et les équipes de bien commun qui cherchent de la traction sans renier leurs valeurs ni leur sécurité.',
      ctaLabel: 'Lancer l’accompagnement',
      ctaTopic: 'growth',
    },
  ],
};

export const AI_PAGE: Record<Locale, PillarCopy> = { en: aiEn, fr: aiFr };
export const WEB3_PAGE: Record<Locale, PillarCopy> = { en: web3En, fr: web3Fr };
