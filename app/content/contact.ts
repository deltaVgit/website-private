import type { Locale } from '@/lib/i18n';

/**
 * Contact page copy, per locale.
 *
 * Copy lives here rather than inline in the page so the French version renders
 * the same markup instead of forking it. Anything user-visible on that page
 * should be a key in here — if it is still a string literal in the JSX, it will
 * silently stay English.
 */
export type ContactCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  emailLabel: string;
  signalLabel: string;
  signalBlurb: string;
  formLabel: string;
  formBlurb: string;
  namePlaceholder: string;
  needLabel: string;
  needs: { web3: string; ai: string; upskilling: string };
  descriptionPlaceholder: string;
  send: string;
  bookingBadge: string;
  bookingTitle: string;
  bookingBlurb: string;
  bookingChips: { duration: string; video: string; encrypted: string };
  whyEyebrow: string;
  whyTitleLead: string;
  whyTitleAccent: string;
  whyBody: string;
  whyCards: { number: string; title: string; body: string }[];
  badges: { label: string; value: string; desc: string }[];
  /** mailto subject stem — "Delta V — AI enquiry" */
  enquirySubject: (need: string) => string;
  /** Prefilled body per ?topic= */
  topicPrompts: Record<string, string>;
};

const en: ContactCopy = {
  eyebrow: 'Contact',
  title: 'Stay up to speed',
  intro: 'High-signal communication channels. Encrypted by default.',
  emailLabel: 'Email',
  signalLabel: 'Signal',
  signalBlurb:
    'Prefer encrypted communications? Signal ensures end-to-end privacy for sensitive inquiries.',
  formLabel: 'On Ramp',
  formBlurb: "Tell us what you're working on and we'll get back to you with a tailored approach.",
  namePlaceholder: 'Your name',
  needLabel: 'I Need',
  needs: { web3: 'Web3', ai: 'AI', upskilling: 'Upskilling' },
  descriptionPlaceholder: 'Quick description...',
  send: 'Send →',
  bookingBadge: 'First Call — Free',
  bookingTitle: 'Book a 30‑minute call',
  bookingBlurb:
    'Pick a time that works for you. No back-and-forth — just straight to the conversation.',
  bookingChips: { duration: '30 min', video: 'Video call', encrypted: 'Encrypted' },
  whyEyebrow: 'Why us',
  whyTitleLead: 'We believe decentralization is a ',
  whyTitleAccent: 'fundamental shift.',
  whyBody:
    'We stay close to the systems we build, with ownership, practical engineering, and long-term capability at the center.',
  whyCards: [
    {
      number: '01',
      title: 'Tech natives',
      body: 'Passionate professionals at the forefront of decentralization and digital upskilling. We do not just consult — we build, operate, and live the stack.',
    },
    {
      number: '02',
      title: 'Self-ownership focused',
      body: 'Every solution prioritizes user control. Data, keys, and decisions stay where they belong: with you.',
    },
  ],
  badges: [
    { label: 'Encryption', value: 'Signal + Email', desc: 'End-to-end by default' },
    { label: 'Response Time', value: '< 24h', desc: 'Typically same day' },
    { label: 'Consultation', value: 'Free', desc: 'First call is on us' },
    { label: 'NDA', value: 'Available', desc: 'Enterprise ready' },
  ],
  enquirySubject: (need) => `Delta V — ${need} enquiry`,
  topicPrompts: {
    agents: 'Specialists for our real jobs — the workflows that hurt and what a good file looks like:\n',
    inference: 'Inference & model engineering — current stack and pain points:\n',
    retainer: 'AI Engineer retainer — systems in production and what I need covered:\n',
    'web3-advisory': 'Setup & architecture advisory — my current setup and concerns:\n',
    osint: 'Intelligence / OSINT request — what I need investigated:\n',
    growth: 'Growth support — project stage and objectives:\n',
    'open-harness': 'My First AI Agent — the setup I want help with:\n',
  },
};

const fr: ContactCopy = {
  eyebrow: 'Contact',
  title: 'Contactez notre équipe',
  intro:
    'Lancez votre aventure dans les technologies de pointe — et gardez une longueur d’avance. Échanges chiffrés par défaut.',
  emailLabel: 'E-mail',
  signalLabel: 'Signal',
  signalBlurb:
    'Vous préférez des échanges chiffrés ? Signal garantit une confidentialité de bout en bout pour les demandes sensibles.',
  formLabel: 'Premier contact',
  formBlurb:
    'Dites-nous sur quoi vous travaillez et nous revenons vers vous avec une approche sur mesure.',
  namePlaceholder: 'Votre nom',
  needLabel: 'J’ai besoin de',
  needs: { web3: 'Web3', ai: 'IA', upskilling: 'Montée en compétences' },
  descriptionPlaceholder: 'Décrivez brièvement…',
  send: 'Envoyer →',
  bookingBadge: 'Premier échange — offert',
  bookingTitle: 'Réservez 30 minutes',
  bookingBlurb:
    'Choisissez un créneau qui vous convient. Pas d’allers-retours — on entre directement dans le vif du sujet.',
  bookingChips: { duration: '30 min', video: 'Visioconférence', encrypted: 'Chiffré' },
  whyEyebrow: 'Pourquoi nous',
  whyTitleLead: 'Nous pensons que la décentralisation est un ',
  whyTitleAccent: 'changement de fond.',
  whyBody:
    'Nous restons au contact des systèmes que nous construisons : souveraineté, ingénierie concrète et autonomie durable au centre.',
  whyCards: [
    {
      number: '01',
      title: 'Natifs de la tech',
      body: 'Des professionnels passionnés, à la pointe de la décentralisation et de la montée en compétences numérique. Nous ne faisons pas que conseiller — nous construisons, exploitons et vivons la stack.',
    },
    {
      number: '02',
      title: 'Souveraineté d’abord',
      body: 'Chaque solution donne la priorité à votre contrôle. Les données, les clés et les décisions restent là où elles doivent être : chez vous.',
    },
  ],
  badges: [
    { label: 'Chiffrement', value: 'Signal + e-mail', desc: 'De bout en bout par défaut' },
    { label: 'Délai de réponse', value: '< 24 h', desc: 'Souvent le jour même' },
    { label: 'Consultation', value: 'Offerte', desc: 'Le premier échange est pour nous' },
    { label: 'NDA', value: 'Disponible', desc: 'Prêt pour l’entreprise' },
  ],
  enquirySubject: (need) => `Delta V — demande ${need}`,
  topicPrompts: {
    agents: 'Spécialistes pour nos vrais métiers — les flux qui font mal et à quoi ressemble un bon fichier :\n',
    inference: 'Inférence et ingénierie de modèles — stack actuelle et points de friction :\n',
    retainer: 'Accompagnement AI Engineer — systèmes en production et besoins à couvrir :\n',
    'web3-advisory': 'Conseil architecture et mise en place — ma configuration et mes inquiétudes :\n',
    osint: 'Demande de renseignement / OSINT — ce que je cherche à investiguer :\n',
    growth: 'Accompagnement croissance — stade du projet et objectifs :\n',
    'open-harness': 'Mon premier agent IA — la configuration sur laquelle je veux de l’aide :\n',
  },
};

export const CONTACT_COPY: Record<Locale, ContactCopy> = { en, fr };
