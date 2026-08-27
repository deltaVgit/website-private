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
  if (!lab) return { title: 'Harness Lab' };
  return {
    title: `${lab.number} · ${lab.title} — Harness Labs | Delta V`,
    description: lab.subtitle,
    openGraph: {
      title: lab.title,
      description: lab.subtitle,
      url: `${SITE_URL}/forge/course/my-first-ai-agent/labs/${lab.slug}/`,
      siteName: 'Delta V',
      type: 'article',
    },
  };
}

export default async function HarnessLabPage({
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
