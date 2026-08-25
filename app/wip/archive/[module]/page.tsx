import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LabShell } from '../LabShell';
import { OPEN_HARNESS_MODULES, getModule, t } from '@/app/data/courses/open-harness';
import '../visual-lab.css';

export function generateStaticParams() {
  return OPEN_HARNESS_MODULES.map((m) => ({ module: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ module: string }>;
}): Promise<Metadata> {
  const { module: slug } = await params;
  const mod = getModule(slug);
  return {
    title: `${slug} · ${mod ? t(mod.title, 'en') : 'Leçon'} — Laboratoire visuel | Delta V`,
    robots: { index: false, follow: false },
  };
}

export default async function VisualLabModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: slug } = await params;
  const mod = getModule(slug);
  if (!mod) notFound();
  return <LabShell module={mod} />;
}
