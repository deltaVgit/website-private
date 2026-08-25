import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OPEN_HARNESS_MODULES, getModule, t } from '@/app/data/courses/open-harness';
import { WipChrome } from '../../WipChrome';
import { LabPicker } from '../LabPicker';
import '../lab.css';

export function generateStaticParams() {
  return OPEN_HARNESS_MODULES.map((m) => ({ module: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module: slug } = await params;
  const mod = getModule(slug);
  return {
    title: `${slug} · ${mod ? t(mod.title, 'en') : 'Lesson'} — ten layouts | Delta V`,
    robots: { index: false, follow: false },
  };
}

export default async function LabModule({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();
  return (
    <WipChrome crumb={`Ten layouts · ${slug}`}>
      <LabPicker module={mod} />
    </WipChrome>
  );
}
