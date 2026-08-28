import type { Metadata } from 'next';
import { AihChrome } from '@/app/components/course/aihero/AihChrome';
import { LabsLanding } from '@/app/components/course/aihero/LabsLanding';
import { HARNESS_LABS_META } from '@/app/data/courses/harness-labs';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Mon premier agent IA — Harness Labs | Delta V',
  description: HARNESS_LABS_META.description.fr,
  alternates: {
    canonical: `${SITE_URL}/fr/forge/course/my-first-ai-agent/labs/`,
    languages: {
      en: `${SITE_URL}/forge/course/my-first-ai-agent/labs/`,
      fr: `${SITE_URL}/fr/forge/course/my-first-ai-agent/labs/`,
    },
  },
  openGraph: {
    title: HARNESS_LABS_META.title.fr,
    description: HARNESS_LABS_META.tagline.fr,
    url: `${SITE_URL}/fr/forge/course/my-first-ai-agent/labs/`,
    siteName: 'Delta V',
    type: 'website',
  },
};

export default function HarnessLabsIndexPageFr() {
  return (
    <AihChrome labs={{}}>
      <LabsLanding />
    </AihChrome>
  );
}