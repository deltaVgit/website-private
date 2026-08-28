import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AihChrome } from '@/app/components/course/aihero/AihChrome';
import { AihLessonBody } from '@/app/components/course/aihero/AihLessonBody';
import {
  HARNESS_LABS,
  HARNESS_LABS_SERIES,
  getHarnessLab,
  getLabModule,
} from '@/app/data/courses/harness-labs';
import { SITE_URL } from '@/lib/site';

export function generateStaticParams() {
  return HARNESS_LABS.map((l) => ({ lab: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lab: string }>;
}): Promise<Metadata> {
  const { lab: slug } = await params;
  const lab = getHarnessLab(slug);
  const mod = getLabModule(slug);
  if (!lab || !mod) return { title: 'Harness Labs' };
  return {
    title: `${lab.number} · ${mod.title.fr} — Harness Labs | Delta V`,
    description: mod.subtitle.fr,
    alternates: {
      canonical: `${SITE_URL}/fr/forge/course/my-first-ai-agent/labs/${lab.slug}/`,
      languages: {
        en: `${SITE_URL}/forge/course/my-first-ai-agent/labs/${lab.slug}/`,
        fr: `${SITE_URL}/fr/forge/course/my-first-ai-agent/labs/${lab.slug}/`,
      },
    },
    openGraph: {
      title: `${mod.title.fr} — Harness Labs`,
      description: mod.subtitle.fr,
      url: `${SITE_URL}/fr/forge/course/my-first-ai-agent/labs/${lab.slug}/`,
      siteName: 'Delta V',
      type: 'article',
    },
  };
}

export default async function HarnessLabPageFr({
  params,
}: {
  params: Promise<{ lab: string }>;
}) {
  const { lab: slug } = await params;
  const lab = getHarnessLab(slug);
  const mod = getLabModule(slug);
  if (!lab || !mod) notFound();

  return (
    <AihChrome labs={{ number: lab.number }}>
      <AihLessonBody module={mod} series={HARNESS_LABS_SERIES} />
    </AihChrome>
  );
}