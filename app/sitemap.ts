import type { MetadataRoute } from 'next';
import { HARNESS_LABS } from '@/app/data/courses/harness-labs';
import { SITE_URL } from '../lib/site';

export const dynamic = 'force-static';

const posts = [
  'cicd-pipeline-hardening-web3',
  'defi-weekly-july-13',
  'defi-weekly-july-26',
  'defi-weekly-june-23',
  'defi-weekly-june-27',
  'dragon-lab-utokyo-robotics',
  'ens-independent-board-governance',
  'ethereum-security-qf-round',
  'fast-ar-video-diffusion',
  'first-principles',
  'github-security-audit-tutorial',
  'huggingface-agent-breach-safety-backfire',
  'huggingface-transparency-response-3',
  'ibm-sub-1nm-chip',
  'lessons-from-kpk-war-room',
  'nvidia-fast-foundation-stereo',
  'openai-hf-eval-escape-2026',
  'openworker-agent-architecture',
  'promptfoo-lm-security-db',
  'qwen3-6-uncensored-vlm-moe',
  'risk-dashboards-opsec',
  'sleeper-agents-deceptive-llms',
  'stablecoins-fed-treasury-channel',
  'tencent-hy3-295b-moe',
  'ucsd-smart-ring-biomarker',
  'uniswap-permissioned-pools',
  'vllm-semantic-router-mixture-of-models',
  'weekly-delta-financial-brief-august-03',
  'weekly-delta-financial-brief-july-21',
];

const tutorials = [
  'hermes-qwen-dgx-spark',
  'langchain-chatchat-ollama',
  'muscriptor-music-to-midi',
  'x402-sota-setup',
];

const opsec = [
  'linux',
  'macos',
  'windows',
  'sota-stack',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const loc = (path: string) => `${SITE_URL}${path ? '/' + path : ''}/`;
  const entries: MetadataRoute.Sitemap = [];
  const add = (path: string, priority: number) =>
    entries.push({ url: loc(path), lastModified, changeFrequency: 'weekly', priority });

  add('', 1);
  ['ai', 'web3', 'forge', 'intelhub', 'contact', 'tutorials', 'blog', 'opsec'].forEach((p) => add(p, 0.8));
  ['fr', 'fr/ai', 'fr/web3', 'fr/forge', 'fr/contact', 'fr/opsec'].forEach((p) => add(p, 0.7));
  ['forge/course', 'forge/x402-workshop', 'research', 'cgu', 'privacy'].forEach((p) => add(p, 0.5));
  add('forge/course/my-first-ai-agent', 0.7);
  add('fr/forge/course/my-first-ai-agent', 0.7);
  add('forge/course/my-first-ai-agent/glossary', 0.5);
  add('fr/forge/course/my-first-ai-agent/glossary', 0.5);
  add('forge/course/my-first-ai-agent/labs', 0.5);
  HARNESS_LABS.forEach((lab) => add(`forge/course/my-first-ai-agent/labs/${lab.slug}`, 0.5));
  for (let i = 0; i <= 12; i++) {
    const slug = String(i).padStart(2, '0');
    add(`forge/course/my-first-ai-agent/${slug}`, 0.6);
    add(`fr/forge/course/my-first-ai-agent/${slug}`, 0.6);
  }
  opsec.forEach((s) => add('opsec/' + s, 0.6));
  tutorials.forEach((s) => add('tutorials/' + s, 0.6));
  posts.forEach((s) => add('blog/' + s, 0.6));

  return entries;
}
