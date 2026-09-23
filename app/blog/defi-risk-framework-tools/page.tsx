import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import { contentMetadata } from '@/lib/content-meta';
import { RealPillarsFigure, TierMapFigure, UtrFigure, PrivacyLadderFigure, FeedMatrixFigure } from '../_figures/defi-risk-figures';

export const metadata: Metadata = contentMetadata('defi-risk-framework-tools');

export default function DefiRiskFrameworkTools() {
  return (
    <BlogPostLayout
      title="The DeFi Risk Stack Is Assembling"
      date="September 22, 2026"
      category="Web3"
      type="Deep Dive"
      readingTime="9 min read"
      excerpt="DefiLlama scored 50+ exchanges on what they can't fake — one S-tier. L2BEAT grades privacy per adversary. DeFiScan watches admin keys. The Ethereum Foundation commissioned the layer that refuses to score."
    >
      <p>
        &ldquo;Do your own research.&rdquo; Crypto&rsquo;s most repeated advice is also its least
        actionable. Researching an exchange or a protocol used to mean cross-referencing
        self-reported volume, a documentation page written by the team taking your deposits, and a
        Discord where the questions that matter get answered with emojis.
      </p>
      <p>
        The last few months changed that. A wave of risk-framework tools shipped — and one case got
        formally commissioned — and together they sketch something DeFi never really had: a shared,
        measurable definition of counterparty risk. Not a badge from a rating agency you can&apos;t
        audit. Measured facts, on-chain evidence, and — notably — a deliberate refusal by some of
        these tools to synthesize the facts into a single opinion. Four developments define the wave.
      </p>

      <h2>1 · DefiLlama: the REAL ranking</h2>
      <p>
        <a href="https://defillama.com/exchanges/rank" target="_blank" rel="noopener noreferrer">
          Find My Exchange
        </a>{' '}
        covers <strong>50+ exchanges, both centralized and decentralized</strong>, on a 0&ndash;100
        scale built from four pillars. DefiLlama Research calls it the{' '}
        <a
          href="https://defillama.com/research/spotlight/one-a-tier-decentralized-exchange"
          target="_blank"
          rel="noopener noreferrer"
        >
          REAL ranking
        </a>
        : <strong>Reserves</strong> (on-chain or in filed accounts, 30%),{' '}
        <strong>Execution</strong> (tick-level fills, all-in cost of a $10k order, slippage, 30%),{' '}
        <strong>Activity</strong> (volume and open interest its own order-book snapshots support, 20%)
        and <strong>Liquidity</strong> (resting depth it observed directly, 20%).
      </p>

      <RealPillarsFigure />

      <p>
        The weighting detail is the tell: if DefiLlama couldn&rsquo;t measure reserves, the exchange
        didn&rsquo;t get a zero — the pillar&rsquo;s weight redistributed to what was measured. The
        ranking never invisibly punishes missing proof; it also never hides who didn&apos;t provide it.
      </p>
      <p>
        The tier results are the story. The{' '}
        <strong>S-tier requires 85+, and only Binance cleared it</strong> — on exceptional activity
        and liquidity. <strong>Hyperliquid was the highest-rated DEX and the only one in A-tier (70+)</strong>.
        Cable news debates perp-DEX volume wars; the measured order book has a verdict.
      </p>

      <TierMapFigure />

      <p>
        The tool is more than a leaderboard: which exchanges list a token you hold, which work in
        your country, what a fiat round-trip costs — a $1,000 fiat&rarr;BTC&rarr;fiat loop runs{' '}
        <strong>$7.62 on Coinbase in the US and about $26 in Germany</strong>; Kraken does the same
        German round-trip for roughly $8 less with fewer documents. Exchange volume was always
        self-reported and trivially inflated. Ranking on measured reserves, executed fills and
        observed depth replaces the one number everyone quotes with four numbers nobody can fake
        cheaply.
      </p>

      <h2>2 · DefiLlama × Forgd: Universal Token Ratings</h2>
      <p>
        A second DefiLlama scoring system shipped in August:{' '}
        <a
          href="https://defillama.com/research/spotlight/rating-keep-earning-forgd-defillama-universal-token-ratings"
          target="_blank"
          rel="noopener noreferrer"
        >
          Universal Token Ratings (UTR)
        </a>{' '}
        — built with <a href="https://forgd.com" target="_blank" rel="noopener noreferrer">Forgd</a>,
        the first continuously updated metric for token disclosure and performance. Every rated
        project gets a standardized 0&ndash;100 score and an AAA&ndash;CCC grade that{' '}
        <strong>recalculate as the market moves</strong>: if liquidity dries up, a token batch
        unlocks or a market maker falters under stress, the score updates automatically. No
        refiling, no human in the loop.
      </p>

      <UtrFigure />

      <p>
        The design is deliberately harsh: <strong>UTR = D &times; P</strong>. A project with perfect
        disclosures and a broken market can&apos;t score well; neither can deep liquidity with
        missing disclosure statements. One-time audits reward passing the review once — a
        continuous rating flips the incentive. As Forgd&apos;s CEO Shane Molidor put it:
        &ldquo;A UTR score is something you have to keep earning.&rdquo; At launch, ratings covered{' '}
        <strong>100+ tokens</strong>, with the{' '}
        <a
          href="https://defillama.com/universal-token-rating"
          target="_blank"
          rel="noopener noreferrer"
        >
          full methodology published openly
        </a>{' '}
        — every category weight and grading threshold traceable.
      </p>

      <h2>3 · L2BEAT: privacy, graded against a named adversary</h2>
      <p>
        L2BEAT spent years turning rollup risk from vibes into a checklist. This year it pointed the
        same machinery at{' '}
        <a href="https://l2beat.com/privacy/summary" target="_blank" rel="noopener noreferrer">
          privacy protocols
        </a>{' '}
        — pools, shielded ledgers, stealth-address systems — under the{' '}
        <a
          href="https://l2beat.com/publications/privacy-best-practices"
          target="_blank"
          rel="noopener noreferrer"
        >
          CROPS framework
        </a>
        : architecture graded as Censorship-resistant, Open, Private, Secure.
      </p>
      <p>
        The contribution is structure. <strong>Privacy is graded per adversary</strong>, on a
        five-step ladder — public observer, chain analyst, network observer, privileged insider,
        future adversary. &ldquo;Private&rdquo; stops being a binary and becomes an explicit answer
        to &ldquo;private against whom?&rdquo; Eleven protocols carry a grade card right now, from
        Tornado Cash (~$742M TVL) to stealth-address systems like Umbra and Fluidkey.
      </p>

      <PrivacyLadderFigure />

      <p>
        L2BEAT&rsquo;s best-practices guide (May 2026) is refreshingly operational about where
        privacy actually fails: not usually in the zero-knowledge circuits, but in hygiene — address
        re-use, time clustering, browser fingerprinting, RPC leakage, and (per the Tornado Cash case
        study) trusting a frontend whose root of trust was once compromised by a governance proposal
        that hid a note-stealing script.
      </p>

      <h2>4 · DeFiScan: admin keys, the exploit category that never patches</h2>
      <p>
        <a href="https://www.defiscan.info/" target="_blank" rel="noopener noreferrer">DeFiScan</a>{' '}
        (BlockAnalitica) attacks the largest loss category head-on. Per its own site, exploits
        targeting <strong>access control — compromised admin keys, governance attacks, privilege
        escalation — accounted for ~75% of 2025&rsquo;s exploit losses</strong>. Unlike a code bug
        that gets patched, privileged roles persist as long as they exist.
      </p>
      <p>
        DeFiScan&rsquo;s answer is continuous, on-chain monitoring: agents trace bytecode and verify
        state around the clock — upgradeability, admin keys, timelocks, dependencies, governance —
        so a silent proxy upgrade or signer change shows up as a report change, not a surprise.{' '}
        <strong>$100.57B in value secured is under its watch</strong> (1,314 contracts, 166 admin
        entities). Assessment runs across five dimensions with no proprietary composite score: every
        data point links back to a contract address, transaction hash or governance action. A v2 of
        the framework is in the works, trending from static reviews to continuous trust-posture
        monitoring. <strong>EVM-only for now</strong> — the interesting non-EVM ecosystems get none
        of this coverage yet.
      </p>

      <h2>5 · The Ethereum Foundation: the layer that refuses to have an opinion</h2>
      <p>
        In May 2026 the EF&rsquo;s App Relations team opened an{' '}
        <a
          href="https://github.com/ivanvolov/relatum-risk-aggregator/blob/main/RFP.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          RFP for a Neutral DeFi Risk Intelligence Aggregator
        </a>
        : open-source, showing what every major risk feed says about a protocol, side by side,
        without synthesis. The RFP&rsquo;s diagnosis: risk intelligence is fragmented across
        BlockAnalitica, DeFiScan, DeFiPunk&rsquo;d, CuratorWatch, Pharos, Credora, LlamaRisk,
        Gauntlet and more — no single feed should be canonical for something this important. The
        aggregation is the value. Composite scoring was contractually out of scope unless the EF
        agreed in writing.
      </p>
      <p>
        On <strong>September 21, 2026 the grant was awarded to cp0x</strong>, and the work started
        immediately: <strong>Defi DNA</strong> (
        <a
          href="https://github.com/cp0x-org/defi-dna"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/cp0x-org/defi-dna
        </a>
        , <a href="https://defi-dna.xyz/" target="_blank" rel="noopener noreferrer">defi-dna.xyz</a>
        ) — AGPL-3.0, daily scheduled data refresh, with exactly three risk feeds live today —{' '}
        <strong>DeFiScan, Philidor Analytics and Risklayer</strong> — against 26 protocol versions
        tracked (16 with data from at least one feed), plus an adapter guide for adding more. Independent measurements come from DefiLlama&rsquo;s Ethereum TVL and incident
        history.
      </p>

      <FeedMatrixFigure />

      <p>
        Read the whole stack together and a philosophy emerges: DefiLlama <strong>measures</strong>,
        L2BEAT grades against a named adversary, DeFiScan verifies continuously — and the
        EF&rsquo;s layer deliberately refuses the final step, the single opinion. The industry spent
        a decade learning that volume can be faked and ratings can be bought. The new stack&rsquo;s
        answer is not a better rating; it&rsquo;s provenance.
      </p>

      <h2>What this means if you hold capital on-chain</h2>
      <p>The practical shift: due diligence is becoming a checklist you can actually run.</p>
      <ul>
        <li><strong>Choosing an exchange:</strong> check the four REAL pillars, not reported volume. If reserves aren&apos;t verifiable and execution can&apos;t be measured, the &ldquo;top-10 by volume&rdquo; sticker is marketing.</li>
        <li><strong>Picking a privacy tool:</strong> name your adversary first — L2BEAT&apos;s ladder plus its hygiene guide covers the failure modes that actually deanonymize people.</li>
        <li><strong>Before a deposit:</strong> who holds admin keys, are upgrades timelocked, what are the dependencies. Continuous monitoring is becoming table stakes for treasuries.</li>
        <li><strong>Everything:</strong> cross-check feeds instead of trusting one — the EF&rsquo;s whole thesis, now being built in the open.</li>
      </ul>
      <p>
        The tools are young and the tiers will churn — Binance&rsquo;s S is a snapshot, not a
        lifetime award. But the direction is one-way: the &ldquo;trust us&rdquo; layer of DeFi is
        being replaced, dashboard by dashboard, with a &ldquo;verify it&rdquo; layer. For anyone
        deploying serious capital on-chain, the excuse pile for skipping due diligence just got a
        lot thinner.
      </p>
    </BlogPostLayout>
  );
}
