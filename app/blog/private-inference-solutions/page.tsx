import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import { contentMetadata } from '@/lib/content-meta';
import { PrivacyTowerFigure, PrivacyScorecardFigure, DoNotBuyFigure } from '../_figures/private-inference-figures';

export const metadata: Metadata = contentMetadata('private-inference-solutions');

export default function PrivateInferenceSolutions() {
  return (
    <BlogPostLayout
      title="How to Pay for AI Without Being Known: Local, zkAPI, and Nothing Else That Counts"
      date="October 1, 2026"
      category="OpSec"
      type="Analysis"
      readingTime="7 min read"
      excerpt="Every private-AI product answers one leak and stays silent on the other two. A scorecard on identity, content and network leaves exactly two rungs standing: local inference and the EF's zkAPI."
      tags={['OpSec', 'AI', 'Privacy', 'zk', 'Ethereum']}
    >
      <h2>The prompt is the leak</h2>
      <p>Every question you type into an AI service is a document you handed to someone else. It leaves your machine, crosses someone's network, lands in a provider's logs, and (most of the time) trains on infrastructure you will never audit. If you accept that, "which model is smartest" is the wrong first question. The right one: <strong>who can see the prompt, and who knows it was me?</strong></p>
      <p>The news hook this week: on October 1 the Ethereum Foundation launched <strong>zkAPI</strong>, a mainnet system for paying for AI API calls without the payment being linked to you. Before scoring it, name what any "private AI" product is actually solving, because most answer one leak and stay silent about the other two.</p>
      <h2>The threat map: three leaks</h2>
      <ul>
        <li><strong>Identity</strong>: can the provider link usage to you (an account, a bill, a payment trail)?</li>
        <li><strong>Content</strong>: can anyone (provider, relay, operator) read the prompt?</li>
        <li><strong>Network</strong>: can an observer see that traffic exists at all, and from where?</li>
      </ul>
      <PrivacyTowerFigure />
      <h2>The scorecard</h2>
      <p>Rating the field on our terms: threat coverage times trust assumed, with one honest question &mdash; <em>can you verify it yourself, or is it somebody's word?</em></p>
      <PrivacyScorecardFigure />
      <div className="my-8 overflow-x-auto not-prose">
        <table className="w-full text-sm border-collapse" style={{ minWidth: '56rem' }}>
          <thead>
            <tr>
          <th>Approach</th>
          <th>Identity unlink</th>
          <th>Content sealed</th>
          <th>Network hidden</th>
          <th>Trust you must extend</th>
          <th>Verifiable by you</th>
            </tr>
          </thead>
          <tbody>
          <tr>
            <td><strong>Local</strong> (Ollama, LM Studio, llama.cpp)</td>
            <td>5 &mdash; nothing leaves the machine</td>
            <td>5</td>
            <td>5</td>
            <td>~none</td>
            <td>5 &mdash; it's your machine</td>
          </tr>
          <tr>
            <td><strong>zkAPI</strong> (EF, live on mainnet)</td>
            <td>5 &mdash; Groth16 + nullifiers</td>
            <td>0&ndash;1 &mdash; the provider reads the prompt</td>
            <td>1 &mdash; their own admission; bring Tor</td>
            <td>low: contract + crypto design, no operator honesty needed</td>
            <td>5 &mdash; open contracts; check the vault on Etherscan</td>
          </tr>
          <tr>
            <td><strong>TEE-attested cloud</strong> (Brave Leo, Venice Pro, Privatemode AI)</td>
            <td>2 &mdash; account and bill exist</td>
            <td>4 &mdash; enclave seals content; attestation covers code and weights</td>
            <td>1</td>
            <td>moderate: NVIDIA root of trust, attestor, operator metadata</td>
            <td>3&ndash;4 &mdash; you can read the attestation report; most people won't</td>
          </tr>
          <tr>
            <td><strong>Apple PCC / Google Confidential Inference</strong></td>
            <td>2 &mdash; you're their customer</td>
            <td>4 &mdash; same enclave class, stateless, no retention</td>
            <td>2</td>
            <td>high: vendor hardware, vendor-run attestation, closed weights</td>
            <td>2 &mdash; transparent in design, opaque in production</td>
          </tr>
          <tr>
            <td><strong>Policy-privacy chatbots</strong> ("no log by default", training opt-outs)</td>
            <td>1</td>
            <td>1 &mdash; "we promise"</td>
            <td>1</td>
            <td>total: their word, their infra, churn risk every ToS update</td>
            <td>1</td>
          </tr>
          </tbody>
        </table>
      </div>
      <p>Two rungs survive that bar.</p>
      <h2>Rung 1: local, the only zero-trust tier</h2>
      <p><strong>Ollama</strong> (OpenAI-compatible on localhost), <strong>LM Studio</strong> (MLX backend, fully offline), and <strong>llama.cpp</strong> underneath make serious open-weight models run on consumer and Apple Silicon hardware. Nothing leaves the machine, so identity, content and network all score 5 by construction: leaks of exactly zero kinds.</p>
      <p>Limits are real and stated plainly: hardware ceiling, slower frontier-adjacent quality on hard tasks, zero specialization (your machine does the serving). For drafts, RAG, code assistance and anything sensitive, it wins outright. For frontier reasoning at scale, it does not &mdash; yet.</p>
      <p>This is the only layer where nobody's word is involved. Including yours to us: run it airgapped, and the vendor's blog stops mattering.</p>
      <h2>Rung 2: zkAPI, the payment layer with no operator to trust</h2>
      <p><strong>zkAPI</strong> ("private usage credits for any API") shipped October 1 by the EF's dAI team with the Open Anonymity Project, implementing a design <strong>Davide Crapis and Vitalik Buterin</strong> put on ethresear.ch. The mechanics, from the EF's own announcement:</p>
      <ul>
        <li>You deposit <strong>ETH or USDC</strong> into a vault contract. The balance becomes a private note: committed, not exposed.</li>
        <li>Spending is authorized by <strong>Groth16 ZK proofs</strong> (BN254 curve, Poseidon hashing, a 32-level Merkle tree); you prove you hold sufficient credits without revealing which credits or how many. <strong>Nullifiers</strong> prevent double-spend.</li>
        <li>The developer experience is the clever bit: <strong>ephemeral, dollar-capped API keys minted on-device</strong>. The key binds to a spend ceiling and nothing else. The provider sees prompts; the payment layer sees spend; <strong>neither can link them</strong>.</li>
      </ul>
      <p>Status, verifiable today: the vault is live on mainnet (<code>ZkApiVault</code> at 0x4386fdbda35d995beb3bf8625118ec5982ec81fe), the code is public (github.com/ethereum/zkapi), and OA Chat (chat.openanonymity.ai) runs it in the browser. This is not a promise of a product; it is a product.</p>
      <p><strong>Why it passes the bar:</strong> the trust assumption is the contract and the math, not an operator. The EF's own framing: the vault's exit path works even if every zkAPI server disappears. Censorship-resistance lives in the contract, not the frontend.</p>
      <p><strong>The honest limitations, straight from the same write-up.</strong> No network anonymity built in (their advice is Tor, fresh circuits per session). Prompt-content fingerprinting can re-link sessions: write distinctively and your sessions correlate again. Proxy mode, where offered, means a relay sees the traffic. And it does not seal content: <strong>zkAPI buys payment unlinkability, not prompt privacy.</strong> It is the top rung of a tower that still needs the bottom one.</p>
      <h2>What we're not buying</h2>
      <ul>
        <li><strong>Policy-privacy chatbots:</strong> "no logs by default" is a posture, not an architecture. The claim is a server they own, a log they promise to skip, and an opt-out you will never find. One ToS rewrite and the posture is gone. If the privacy comes from a settings page, it isn't private; it's pending.</li>
        <li><strong>Gloss "anonymity":</strong> an anonymizing proxy tier covers the network hop while the account and the bill still name you. Selling that as "anonymous" is the kind of sentence this desk exists to call out.</li>
        <li><strong>Apple PCC / Google Confidential Inference,</strong> said fairly: best-in-class design &mdash; stateless, no retention, PCC even ships sepOS and iBoot in plaintext for researchers. But you extend deep trust to a vendor-graded hardware fleet you will never inspect, with closed weights, as a fully identified paying customer of the very company hosting it. Matthew Green's June 2026 read of the Apple-Google pairing is worth following for one reason: when both platform giants ship verifiable enclave serving, "we promise we don't look" dies industry-wide. That is progress. It is still not our recommendation; it is context for how high the bar is rising.</li>
        <li><strong>TEE-attested cloud,</strong> scoped honestly: Brave Leo's "Verifiably Private with NEAR AI TEE" (DeepSeek V3.1, NVIDIA-backed, attestation reports with model and code hashes) and Venice's Pro TEE/E2EE tier are <em>good practice</em> &mdash; the attestation report is a real artifact and you should read it. But it seals content only. The account, the bill and the operator's metadata log stay attached to you, plus three trust layers (hardware vendor, attestor, operator) that mostly go unexamined. For someone who must run a frontier model through a named account anyway, TEE is the right minimum: a content shield for a known identity. It is not one of the two rungs that clear the bar.</li>
      </ul>
      <DoNotBuyFigure />
      <h2>The takeaway</h2>
      <ul>
        <li>Sensitive thinking: local (Ollama / LM Studio), full stop.</li>
        <li>Frontier quality, unlinkable payment: an open-weight model behind zkAPI-funded serving, over Tor.</li>
        <li>Must run a named account on frontier models: TEE-attested serving, and read the attestation report yourself, not the vendor's blog.</li>
        <li>Everything else in "private AI" is a subscription posture, and this desk rates postures accordingly.</li>
      </ul>
      <p>Operational takeaway, same shape as the weights rule (from the delisting piece): <strong>vet your inference provider like you vet your weights.</strong> Read the attestation yourself. Check the vault contract on Etherscan, not in a tweet. A promise you did not check is a promise, not a property.</p>
      <h2>Sources</h2>
      <ul>
        <li>EF blog (Oct 1, 2026): "Introducing zkAPI: private usage credits for any API", Vittorio Rivabella, dAI Team; ZkApiVault 0x4386fdbda35d995beb3bf8625118ec5982ec81fe (Etherscan); github.com/ethereum/zkapi; OA Chat at chat.openanonymity.ai; ethresear.ch design by Davide Crapis and Vitalik Buterin</li>
        <li>Venice.ai privacy documentation (venice.ai/privacy) and Venice blog (March 2026 Pro-tier TEE + E2EE announcements)</li>
        <li>Brave blog: "Verifiably Private with NEAR AI TEE" (brave.com/blog/browser-ai-tee)</li>
        <li>Apple, "Private Cloud Compute" security blog (security.apple.com/blog/private-cloud-compute); Matthew Green, blog.cryptographyengineering.com (June 9, 2026) on PCC + Google Confidential Inference</li>
        <li>Ollama (GitHub); LM Studio (lmstudio.ai); llama.cpp (GitHub); Sitepoint guide to local inference</li>
        <li>Edgeless Systems press on Privatemode AI (Mar 12, 2026); Azure Confidential AI documentation; NVIDIA Confidential Computing product line</li>
        <li>Anuma, 2026 report grouping Brave Leo / Lumo / Venice as private-by-architecture</li>
        <li>Delta V, "When a Model Gets Delisted" (Sept 30, 2026), for the weights-vetting continuity</li>
      </ul>
    </BlogPostLayout>
  );
}
