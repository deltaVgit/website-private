'use client';

import { useRef, useState } from 'react';
import { useVisibilityTicker } from '../intelhub/components/useVisibilityTicker';
import { withBasePath } from '@/lib/site';

export type EcosystemItem = {
  name: string;
  /** X / Twitter handle without @ — used for local avatar path + link title */
  x?: string;
  href?: string;
};

/** Self-hosted avatar under public/images/ecosystem/{handle}.webp (no third-party requests). */
function avatarSrc(x?: string): string | null {
  if (!x) return null;
  return withBasePath(`/images/ecosystem/${x}.webp`);
}

/**
 * Local profile mark — prefers self-hosted X PP; falls back to monogram.
 * No remote avatar CDN (unavatar / twimg) at runtime.
 */
function BrandMark({ name, x }: { name: string; x?: string }) {
  const src = avatarSrc(x);
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static local asset; avoid Image optimizer dependency for tiny rail icons
      <img
        src={src}
        alt=""
        width={20}
        height={20}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="w-5 h-5 rounded-full object-cover border border-[var(--border-default)] bg-[var(--bg-elevated)]"
        onError={() => setFailed(true)}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className="w-5 h-5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] flex items-center justify-center text-[9px] font-semibold text-[var(--text-tertiary)]"
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

function Chip({
  item,
  accentHover,
}: {
  item: EcosystemItem;
  accentHover: string;
}) {
  const className = `flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[10px] font-mono tracking-[0.8px] text-[var(--text-tertiary)] ${accentHover} hover:bg-[var(--bg-hover)] transition-all whitespace-nowrap select-none`;

  const body = (
    <>
      <BrandMark name={item.name} x={item.x} />
      <span>{item.name}</span>
    </>
  );

  if (item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={item.x ? `@${item.x}` : item.name}
        role="listitem"
      >
        {body}
      </a>
    );
  }

  return (
    <div className={className} title={item.x ? `@${item.x}` : item.name} role="listitem">
      {body}
    </div>
  );
}

/**
 * IntelHub-style horizontal logo rail for pillar ecosystem rows.
 * Avatars are self-hosted under /images/ecosystem — zero third-party tracking.
 */
export default function EcosystemStack({
  items,
  accent = 'cyan',
  label = 'Ecosystem & Stack',
}: {
  items: EcosystemItem[];
  accent?: 'cyan' | 'orange' | 'purple';
  label?: string;
}) {
  const accentText =
    accent === 'orange'
      ? 'text-[var(--accent-orange)]'
      : accent === 'purple'
        ? 'text-[var(--accent-purple)]'
        : 'text-[var(--accent-cyan)]';

  const accentHover =
    accent === 'orange'
      ? 'hover:text-[var(--accent-orange)] hover:border-[var(--accent-orange)]/30'
      : accent === 'purple'
        ? 'hover:text-[var(--accent-purple)] hover:border-[var(--accent-purple)]/30'
        : 'hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]/30';

  const loop = [...items, ...items];
  const { scrollRef, pause, resume } = useVisibilityTicker(items.length, .85);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseForInteraction = () => {
    pause();
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(resume, 900);
  };

  return (
    <section className="max-w-[1440px] mx-auto px-6 md:px-8 pb-16 border-t border-[var(--border-default)] pt-10">
      <div className="text-center mb-5">
        <div className={`${accentText} text-[10px] font-semibold tracking-[3px] uppercase mb-1.5`}>
          {label}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="ecosystem-track relative overflow-x-auto scrollbar-none"
        // group, not list: the only direct child is the marquee wrapper, so a
        // list role here has no listitem children and fails aria-required-children.
        role="group"
        aria-label={label}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onFocus={pause}
        onBlur={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        onWheel={pauseForInteraction}
      >
        <div className="ecosystem-marquee flex w-max gap-2.5 py-1">
          {loop.map((item, i) => (
            <Chip key={`${item.name}-${i}`} item={item} accentHover={accentHover} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * AI pillar ecosystem — local avatars at public/images/ecosystem/{x}.webp
 * Mix of open models, runtimes, harnesses, labs, and edge hardware we actually use.
 */
export const AI_ECOSYSTEM: EcosystemItem[] = [
  // Open models / labs
  { name: 'DeepSeek', x: 'deepseek_ai', href: 'https://x.com/deepseek_ai' },
  { name: 'Moonshot', x: 'MoonshotAI', href: 'https://x.com/MoonshotAI' },
  { name: 'Z.ai', x: 'z_ai', href: 'https://x.com/zai_org' },
  { name: 'MiniMax', x: 'MiniMax_AI', href: 'https://x.com/MiniMax_AI' },
  { name: 'Claude', x: 'AnthropicAI', href: 'https://x.com/AnthropicAI' },
  { name: 'OpenAI', x: 'OpenAI', href: 'https://x.com/OpenAI' },
  { name: 'Google AI', x: 'GoogleAI', href: 'https://x.com/GoogleAI' },
  // Frameworks & tooling
  { name: 'Hugging Face', x: 'huggingface', href: 'https://x.com/huggingface' },
  { name: 'LangChain', x: 'LangChainAI', href: 'https://x.com/LangChain' },
  { name: 'PyTorch', x: 'PyTorch', href: 'https://x.com/PyTorch' },
  { name: 'ComfyUI', x: 'ComfyUI', href: 'https://x.com/ComfyUI' },
  { name: 'Obsidian', x: 'obsidianmd', href: 'https://x.com/obsidian' },
  // Local / harness
  { name: 'Ollama', x: 'ollama', href: 'https://x.com/ollama' },
  { name: 'LM Studio', x: 'lmstudio', href: 'https://x.com/lmstudio' },
  { name: 'OpenCode', x: 'opencode', href: 'https://x.com/opencode' },
  { name: 'Hermes', x: 'NousResearch', href: 'https://x.com/NousResearch' },
  { name: 'OpenRouter', x: 'OpenRouterAI', href: 'https://x.com/OpenRouterAI' },
  { name: 'Cocktail Peanut', x: 'cocktailpeanut', href: 'https://x.com/cocktailpeanut' },
  { name: 'Buzz', x: 'buzz', href: 'https://github.com/chidiwilliams/buzz' },
  { name: 'Mercury', x: 'mercury__agent', href: 'https://x.com/mercury__agent' },
  { name: 'Pi', x: 'pidotdev', href: 'https://x.com/pidotdev' },
  { name: 'herdr', x: 'herdrdev', href: 'https://x.com/herdrdev' },
  // Compute / training & serving platforms (service #2 — Inference & Model Engineering)
  { name: 'Together AI', x: 'togethercompute', href: 'https://x.com/togethercompute' },
  { name: 'RunPod', x: 'runpod', href: 'https://x.com/runpod' },
  { name: 'Modal', x: 'modal', href: 'https://x.com/modal' },
  { name: 'vLLM', x: 'vllm_project', href: 'https://x.com/vllm_project' },
  { name: 'Unsloth', x: 'UnslothAI', href: 'https://x.com/UnslothAI' },
  // Hardware / silicon
  { name: 'NVIDIA', x: 'nvidia', href: 'https://x.com/nvidia' },
  { name: 'Raspberry Pi', x: 'Raspberry_Pi', href: 'https://x.com/Raspberry_Pi' },
  // Media / image
  { name: 'BF6', x: 'BlackForestLabs', href: 'https://x.com/BlackForestLabs' },
];

/** Web3 pillar ecosystem - X handles map to public/images/ecosystem/{handle}.webp */
export const WEB3_ECOSYSTEM: EcosystemItem[] = [
  { name: 'DeFiLlama', x: 'DefiLlama', href: 'https://x.com/DefiLlama' },
  { name: 'Artemis', x: 'artemis', href: 'https://x.com/artemis' },
  { name: 'Trezor', x: 'Trezor', href: 'https://x.com/Trezor' },
  { name: 'Rotki', x: 'rotkiapp', href: 'https://x.com/rotkiapp' },
  { name: 'Safe', x: 'safe', href: 'https://x.com/safe' },
  { name: 'l2beat', x: 'l2beat', href: 'https://x.com/l2beat' },
  { name: 'defiscan', x: 'defiscan_info', href: 'https://www.defiscan.info/' },
  { name: 'frankencoin', x: 'frankencoinzchf', href: 'https://x.com/frankencoinzchf' },
  { name: 'liquity', x: 'LiquityProtocol', href: 'https://x.com/LiquityProtocol' },
  { name: 'TRM', x: 'trmlabs', href: 'https://x.com/trmlabs' },
  { name: 'railgun', x: 'RAILGUN_Project', href: 'https://x.com/RAILGUN_Project' },
  { name: 'Fluidkey', x: 'fluidkey', href: 'https://x.com/fluidkey' },
  { name: 'privacypool', x: 'PrivacyPools', href: 'https://x.com/PrivacyPools' },
  { name: 'giveth', x: 'Giveth', href: 'https://x.com/Giveth' },
];
