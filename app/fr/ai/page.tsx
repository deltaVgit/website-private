import type { Metadata } from 'next';
import PillarPageView from '../../components/PillarPageView';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Ingénierie IA',
  description:
    'Des spécialistes IA nommés pour les métiers que votre PME fait déjà — RH, revue, finance. Des fichiers que vous gardez. Vos gens décident encore.',
  alternates: {
    canonical: `${SITE_URL}/fr/ai/`,
    languages: { en: `${SITE_URL}/ai/`, fr: `${SITE_URL}/fr/ai/` },
  },
};

export default function AIPageFr() {
  return <PillarPageView pillar="ai" lang="fr" />;
}
