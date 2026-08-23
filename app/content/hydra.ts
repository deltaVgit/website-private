import type { Locale } from '@/lib/i18n';

/**
 * Copy for the Hydra strip on the AI pillar page.
 *
 * Every claim here is taken from the product itself — hydra.deltav.cc and its
 * one-minute presentation — rather than written as marketing. The strip stays
 * short on purpose: it sits between the hero and three long offer cards, and
 * its whole job is to say what Hydra is and open the door to it. The door is
 * the demo video once one exists (HYDRA_VIDEO_URL); until then it is the live
 * demo itself, now as a real CTA.
 */
export type HydraCopy = {
  label: string;
  title: string;
  lead: string;
  /** Short proofs, not a feature list. */
  chips: string[];
  /** Hydra's own closing line — the bridge from "a demo" to "your systems". */
  bridge: string;
  /** Primary CTA — used once a demo video is published. */
  videoLabel: string;
  /** CTA while no video exists, and secondary link once it does. */
  demoLabel: string;
};

const en: HydraCopy = {
  label: 'Live example · Hydra',
  title: "Your company's new AI colleague, ready to work.",
  lead: 'Mail, calendar, tasks, treasury, invoices — all in one workspace anyone can use in plain English. Processes invoices on arrival, ranks them by urgency, and keeps your team focused on the important deals.',
  chips: ['Inbox to invoice', 'Read-only by default', 'Runs on a schedule'],
  bridge: 'Built on mocked company data — your deployment runs on your real systems.',
  videoLabel: 'Watch the demo',
  demoLabel: 'Open the live demo',
};

const fr: HydraCopy = {
  label: 'Exemple réel · Hydra',
  title: 'Votre nouveau collègue IA pour vous aider!',
  lead: "Mails, agenda, tâches, trésorerie, factures — tout sur un seul outil, utilisable en langage courant. Il traite les factures à la réception, les priorise par urgence, et garde votre équipe concentrée sur les deals importants.",
  chips: ['De l’e-mail à la facture', 'Lecture seule par défaut', 'Tourne à l’heure dite'],
  bridge: "Construit sur des données d'entreprise fictives — votre déploiement, lui, tourne sur vos systèmes réels.",
  videoLabel: 'Voir la démo',
  demoLabel: 'Ouvrir la démo en ligne',
};

export const HYDRA_SHOWCASE: Record<Locale, HydraCopy> = { en, fr };

export const HYDRA_URL = 'https://hydra.deltav.cc';

/** Demo video URL — set once the video is published; the strip then leads with it. */
export const HYDRA_VIDEO_URL = '';
