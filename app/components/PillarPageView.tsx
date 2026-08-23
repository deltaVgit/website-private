'use client';

import { PageHero, PageContainer } from './PageShell';
import EcosystemStack, { AI_ECOSYSTEM, WEB3_ECOSYSTEM } from './EcosystemStack';
import HydraShowcase from './HydraShowcase';
import OfferCard from './OfferCard';
import OpSec from '../opsec/page';
import { formatCourseText } from './course/formatCourseText';
import { AI_PAGE, WEB3_PAGE } from '@/app/content/offers';
import { hrefFor, type Locale } from '@/lib/i18n';

/**
 * The AI and Web3 pillar pages share a shape: hero, three offer cards, an
 * ecosystem strip (and, on Web3, the embedded OpSec section). Rendering both
 * languages through here means a layout change lands in both at once.
 */
export default function PillarPageView({
  pillar,
  lang,
}: {
  pillar: 'ai' | 'web3';
  lang: Locale;
}) {
  const copy = pillar === 'ai' ? AI_PAGE[lang] : WEB3_PAGE[lang];
  const items = pillar === 'ai' ? AI_ECOSYSTEM : WEB3_ECOSYSTEM;
  const accent = pillar === 'ai' ? 'cyan' : 'orange';

  return (
    <div className="relative z-10">
      <PageHero
        label={copy.label}
        title={copy.title}
        description={copy.description}
        accent={accent}
        backFallback={hrefFor('/', lang)}
        backLabel={copy.backLabel}
      />

      <PageContainer className="pb-16 space-y-5" as="section">
        {copy.offers.map((offer) => (
          <OfferCard
            key={offer.id}
            lang={lang}
            id={offer.id}
            title={offer.title}
            pitch={formatCourseText(offer.pitch)}
            deliverables={offer.deliverables}
            process={offer.process}
            audience={offer.audience}
            ctaLabel={offer.ctaLabel}
            ctaTopic={offer.ctaTopic}
            secondary={offer.secondary}
            secondaryTone={offer.secondaryTone}
            // Hydra is the proof for exactly what the agents card sells — a
            // shipped multi-agent system, demo-able from inside the card.
            showcase={pillar === 'ai' && offer.id === 'agents' ? <HydraShowcase lang={lang} /> : undefined}
          />
        ))}
      </PageContainer>

      <PageContainer className="pb-24" as="section">
        <EcosystemStack items={items} accent={accent} label={copy.ecosystemLabel} />
      </PageContainer>

      {pillar === 'web3' && (
        <section
          id="opsec"
          className="scroll-mt-16 border-t border-[var(--border-default)]"
          aria-labelledby="opsec-heading"
        >
          <OpSec embedded lang={lang} />
        </section>
      )}
    </div>
  );
}