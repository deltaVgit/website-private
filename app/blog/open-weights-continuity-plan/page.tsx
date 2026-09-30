import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import { contentMetadata } from '@/lib/content-meta';
import { ArticleTimeline } from '@/components/article/primitives';

export const metadata: Metadata = contentMetadata('open-weights-continuity-plan');

export default function OpenWeightsContinuityPlan() {
  return (
    <BlogPostLayout
      title="When a Model Gets Delisted: Pirate Face, Penclaw GLM-5.3, and the First Open-Weights Continuity Plan"
      date="September 30, 2026"
      category="OpSec"
      type="Analysis"
      readingTime="6 min read"
      excerpt="Hugging Face disabled one abliterated GLM-5.3 repo. It reappeared as a checksum-verified torrent within days, while three separate assessments confirmed the base model is the most cyber-capable open-weight release to date."
      tags={['OpSec', 'AI', 'Open Weights', 'Model Risk']}
    >
      <h2>The supply chain just moved</h2>
      <p>On roughly September 15, Hugging Face disabled Audn AI's <code>penclaw-GLM-5.3-abliterated-for-offensive-cyber</code> repo, listing it as a Content Policy violation. As far as we can tell from post timestamps, it is the platform's first visible enforcement action against a GLM-5.3-derived abliterated model. Within days, the same weights were live again as a torrent on Pirate Face (<code>pirateface.co</code>), a new "decentralized infrastructure for sovereign AI" service that mirrors eligible Hugging Face models as checksum-verified magnet links. Pirate Face's own post: <em>"The Hugging Face ban that started it all &hellip; Is now listed on Pirate Face. Because EVERY model needs a continuity plan."</em></p>
      <p>You could read this as a micro-incident: one model, one repo, one mirror. I think it's worth three paragraphs instead of one, because the pattern underneath is new: a censorship-resistant supply chain bootstrapping itself around AI asset hosting, in public, in days. If you treat model weights like any other sovereign asset (which is the assumption behind everything we build), this is your supply chain news.</p>
      <h2>What actually happened (a dated line)</h2>
      <ArticleTimeline
        items={[
          { time: "Aug 14, 2026", label: "Z.ai launches GLM-5.3: their numbers put it at 84.5% on CyberGym, ahead of Anthropic's restricted Mythos 5 on that benchmark, and they explicitly flag \"Emergent Cyber Capability\" in the release notes. Weights withheld for two weeks for \"safety evaluation and hardening.\"" },
          { time: "~Aug 28, 2026", label: "GLM-5.3 weights land on Hugging Face. Multiple uncensored variants surface within days." },
          { time: "Sept 3", label: "TechCrunch profiles Abliteration.ai, a commercial service offering UI/API over abliterated frontier models (including GLM-5.3)." },
          { time: "~Sept 15", label: "HF disables Audn AI's penclaw-GLM-5.3-abliterated-for-offensive-cyber repo. Audn's own X account confirms the content team removed it." },
          { time: "Sept 15–17", label: "Pirate Face lists the same weights as a checksum-verified torrent. Audn's handle (@audnai) is verified on Pirate Face via account matching. A renamed, reworded successor (penclaw-GLM-5.3-abliterated) stays up on HF throughout." },
          { time: "Sept 17", label: "NIST/CAISI publishes: GLM-5.3 is \"the most cyber-capable open-weight model released to date\", though roughly 4 months behind the US frontier on an aggregated cyber-capability index." },
          { time: "Sept 29", label: "Anthropic's Frontier Red Team publishes its full assessment." },
        ]}
      />
            <h2>Why the Anthropic report changes the stakes</h2>
      <p>The Anthropic analysis lands on Sept 29: after the delisting, after the mirror. Its verified findings:</p>
      <ul>
        <li><strong>Exploit capability, independent of Z.ai's own numbers.</strong> On Anthropic's ExploitBench protocol, GLM-5.3 built end-to-end exploits in 50 of 410 attempts (56 of 410 for Mythos Preview, a vetted-only Claude model). On OSS-Fuzz binary exploitation, GLM-5.3 completed 4% of tasks with full control-flow takeover versus Mythos Preview's 6%. Nothing else they tested (including GLM-5.2 and Kimi K3) scored above 0%.</li>
        <li><strong>Safeguard fragility.</strong> Simple prompts (a cop-like cover story, prefilling, and similar) bypassed GLM-5.3's refusals 64&ndash;100% of the time. Abliteration, which is a weight edit, reduced refusal rates from above 90% to 2&ndash;12%. The cost: about 2,200 GPU-hours, roughly $4,400 in compute by Anthropic's estimate; an experienced team might do it for around $1,200.</li>
        <li><strong>The small sibling.</strong> GLM-5.3-Flash produced a working exploit chain against a patched Chrome CVE for about $20 of compute and 8 hours of runtime.</li>
      </ul>
      <p>The delisted repo's declared purpose (fine-tuning for "offensive black-box cyber capabilities") should be read against those verified numbers, not only against its own marketing.</p>
      <h2>What Pirate Face actually is (and is not)</h2>
      <p>Verified from their own site, not just from posts:</p>
      <ul>
        <li>It indexes eligible Hugging Face models, <strong>MIT / Apache-2.0</strong> licenses only, and mirrors them as community torrents with recorded SHA-256 chains tied back to the HF source where HF publishes one.</li>
        <li>A model recovered through peers after its HF source disappears gets flagged <strong>"Rescued"</strong>: the delisting workflow is instrumented, not ad hoc.</li>
        <li>Creator verification still routes through a matching Hugging Face account (so the censorship-resistant layer is bootstrapped off the platform it de-risks, for now).</li>
        <li>What's honest: Pirate Face's FAQ flags that direct model publishing without Hugging Face (true independence from the source of record) is planned, not live.</li>
      </ul>
      <p><strong>Two unproven points worth flagging to readers:</strong></p>
      <ol>
        <li><strong>The exclusion list.</strong> Pirate Face's FAQ states that Kimi K3 and Audn's Penclaw GLM-5.3 have "model-specific exceptions" for licensing evidence. That is a governance signal, not a bug: one model's license didn't survive contact with OSS hosting policy, and it got a human carve-out to be listed anyway. Watch it.</li>
        <li><strong>The "Removed by HF" path is still HF-dependent for verification.</strong> Without HF's published SHA-256, the checksum chain can only be as trusted as the submitter. That weakness is exactly what "direct publishing", when it ships, either solves or breaks.</li>
      </ol>
      <h2>The pattern, not the incident</h2>
      <p>The larger story: a censorship-resistant supply chain for open weights now exists in the wild, bootstrapped around content moderation cases rather than in anticipation of them. Hugging Face disabled one repo; the successor repo stayed up; the torrent version stayed verifiable; the delisted variant is listed on a mirror with a handle match to the original publisher.</p>
      <p>This is not "the first censorship-resistant model registry" (other projects have existed). It is the first concrete case of delivery-as-a-service absorbing a delisted frontier-model variant this quickly, in the same news cycle as the NIST/CAISI and Anthropic assessments that make the delisted variant genuinely dangerous.</p>
      <h2>What to watch</h2>
      <ul>
        <li>Whether Hugging Face publishes a clear, written abliteration policy (currently none exists, and enforcement looks case-by-case: the renamed successor repo stayed up throughout).</li>
        <li>Whether other mirrors adopt "Rescued" flags or equivalent, i.e. whether this becomes a standard rather than a Pirate Face novelty.</li>
        <li>Whether the model-specific licensing exceptions (Kimi K3, Penclaw GLM-5.3) get a sane written rule, or stay ad hoc.</li>
        <li>Whether HF-direct publishing on Pirate Face (when it ships) changes the checksum chain from "anchored to HF" to "anchored to the submitter".</li>
      </ul>
      <p>The operational takeaway is the one from last month's crack post, unchanged: vet your weights like you vet your packages. Pull from the origin checkpoint, verify checksums, and treat any community re-upload (including "helpful" mirror builds) as untrusted until diffed. A checksum chain you didn't anchor yourself is a promise, not a property.</p>
      <h2>Sources</h2>
      <ul>
        <li>Hugging Face disablement notice for <code>penclaw-GLM-5.3-abliterated-for-offensive-cyber</code> (via Audn AI on X, ~Sept 15, 2026)</li>
        <li>Z.ai GLM-5.3 release blog (Aug 14, 2026)</li>
        <li>NIST/CAISI assessment (Sept 17, 2026)</li>
        <li>Anthropic Frontier Red Team, "GLM-5.3 and the spread of advanced cyber capabilities" (Sept 29, 2026)</li>
        <li>Pirate Face (<code>pirateface.co</code>) &mdash; site copy and FAQ, directly verified</li>
        <li>Abliteration.ai reporting (TechCrunch, Sept 3, 2026); Chosun (Sept 10, 2026)</li>
        <li>HF model-search counts for <code>abliterated</code> and <code>offensive-security</code> filters</li>
        <li>Anthropic "Detecting and countering misuse of AI: September 2026" &mdash; Zhipu distillation attribution (background only, not core to this piece)</li>
        <li>SCMP interview of Li Zixuan (Sept 30, 2026) for Z.ai's defense</li>
      </ul>
    </BlogPostLayout>
  );
}