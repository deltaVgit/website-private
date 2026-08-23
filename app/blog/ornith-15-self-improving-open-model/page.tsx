import BlogPostLayout from '@/components/BlogPostLayout';
import { OrnithLoopFigure } from '../_figures/ornith-loop';
import { OrnithMoatsFigure } from '../_figures/ornith-moats';
import { OrnithSizesFigure } from '../_figures/ornith-sizes';

export default function Ornith15Post() {
  return (
    <BlogPostLayout
      title="The open model that writes its own homework"
      date="August 20, 2026"
      category="AI"
      type="Deep Dive"
      excerpt="Ornith-1.5 proposes its own tasks, scaffolds its own tools, and runs reinforcement learning on its own rollouts — all under an MIT license. A 397B/35B/9B family where the 35B MoE activates only ~3B parameters per token. The training-data moat, the compute moat, and the distribution moat all get challenged at once."
      readingTime="10 min"
      sourceUrl="https://huggingface.co/collections/ornith-ai/ornith-15"
      sourceLabel="Ornith-1.5 · Hugging Face"
    >
      <h2>The thing that made me stop scrolling</h2>
      <p>
        Most model launches this year read like a spec sheet contest — bigger checkpoint, higher number on some benchmark, one more decimal of inevitability. Ornith-1.5 is different, and the difference is not the benchmarks. It&apos;s the sentence buried in the middle of the announcement:
      </p>
      <blockquote>
        &ldquo;The model proposes new tasks, generates task-specific scaffolds, and produces solution rollouts for reinforcement learning.&rdquo;
      </blockquote>
      <p>
        Read that again. The <strong>model is generating its own training curriculum</strong>. Not a lab&apos;s data team curating another million hand-labeled examples. The model looks at what it can&apos;t do yet, proposes harder versions of it, scaffolds its own tooling to attempt it, and runs reinforcement learning on its own attempts. Repeat.
      </p>
      <p>
        Ornith-1.5 comes in three flavors — <strong>397B MoE, 35B MoE, and 9B dense</strong> — all open weights under the <strong>MIT license</strong>, with quantized versions (FP8, GGUF, MLX, NVFP4) so you can actually run them. It posts Claude-Opus-4.8-comparable numbers on Terminal-Bench 2.1 (86.1) and DeepSWE (56.0). But the reason this matters to you has nothing to do with beating a closed frontier lab on a leaderboard. It&apos;s that this is the shape of the thing that breaks the training-data bottleneck — and it&apos;s in your datacenter, not locked behind an API.
      </p>
      <p>
        Then there&apos;s the spec that explains <em>how</em> it gets there — and why the economics of intelligence just moved.
      </p>

      <h2>The argument — the data wall was always the real wall</h2>
      <p>
        For the last three years, everyone assumed compute was the moat. Then reasoning models scaled, and the actual constraint showed up: <strong>curated, high-quality training data degrades as you scale</strong> — the web is finite, human labeling is expensive, and the frontier keeps outrunning the quality of what&apos;s sitting in the training set. Frontier labs papered over this by paying for more annotations, more RLHF, more private distillation from other models.
      </p>
      <p>
        Ornith&apos;s bet is the opposite: <strong>stop hand-building the curriculum, teach the model to build its own.</strong> Each training cycle is a three-stage closed loop:
      </p>
      <ol>
        <li><strong>Task proposal</strong> — the model proposes progressively harder tasks than anything it&apos;s already solved, exposing capability gaps.</li>
        <li><strong>Scaffold generation</strong> — it builds the task-specific harness: the instructions, tools, decomposition, and orchestration to actually attack the problem.</li>
        <li><strong>Solution rollout</strong> — it solves, and the reward propagates back through <em>all three</em> stages.</li>
      </ol>
      <p>
        So the model isn&apos;t just getting better at answers — it&apos;s getting better at <em>asking useful questions</em> and <em>building better tools to answer them</em>. That&apos;s a genuinely different thing to optimize, and it&apos;s why the result is a moving frontier: as the policy strengthens, the tasks it generates get harder, and the whole loop keeps learning.
      </p>
      <p>
        The reward design is the part I actually respect, because it&apos;s where a sloppy team would have shipped something self-deceiving. They use a <strong>multiplicative</strong> task reward of three signals:
      </p>
      <ul>
        <li><strong>Validity</strong> — is the task well-formed and verifiable? (Hard-gated: invalid task → zero reward.)</li>
        <li><strong>Frontier difficulty</strong> — is it calibrated to the model&apos;s <em>current</em> ability, tuned to a success rate near ~20%? Hard enough to teach, easy enough to produce learning signal.</li>
        <li><strong>Novelty</strong> — is it genuinely new relative to previously generated tasks? (Deliberately secondary — they want to reduce redundancy, not reward arbitrarily weird questions.)</li>
      </ul>
      <p>
        Same discipline on the harness reward: alignment, reward fidelity, and resistance to reward hacking. The details matter here because <strong>self-improvement is the fastest way to build an echo chamber</strong> if you get the reward wrong. They&apos;ve built in explicit drift-control — the difficulty tracks the model&apos;s own rollouts, so the curriculum evolves with capability instead of going stale or going off the rails.
      </p>
      <OrnithLoopFigure />

      <h2>The other half: a 35B model that thinks like it&apos;s 3B</h2>
      <p>
        The self-improvement loop is the <em>training</em> story. The <em>deployment</em> story is the spec people keep underreading:
      </p>
      <blockquote>
        Ornith-1.5-35B has 35B parameters, but only ~3B active per token. Reportedly runs with 4–8GB VRAM + 16GB RAM with CPU offloading, ~30 tok/s with a GPU, ~15 tok/s CPU-only, and up to ~150 tok/s on 16GB+ VRAM — and performs surprisingly well on programming and agentic tasks.
      </blockquote>
      <p>
        One model. Two numbers that shouldn&apos;t rhyme: <strong>35 billion</strong> parameters resident, <strong>~3 billion</strong> active per token. That gap is why MoE (mixture-of-experts) is suddenly the most interesting architecture in local AI.
      </p>
      <p>
        Ornith-1.5-35B is an MoE model: the full 35B of weights are loaded into memory, but for any given token only a small fraction of experts do the work — about 3B parameters&apos; worth. You&apos;re paying the memory cost of a 35B model and the compute cost of a ~3B model. That&apos;s why it behaves like a big model on quality and like a small model on speed.
      </p>
      <p>The numbers people are reporting in the wild (all community-reported, treat as directional):</p>
      <ul>
        <li><strong>4–8GB VRAM + 16GB RAM</strong> — runs via CPU offloading; llama.cpp pushes attention onto the GPU and handles MoE experts on the CPU (that&apos;s the <code>--cpu-moe</code> flag you&apos;ll see in the run command)</li>
        <li><strong>~30 tok/s</strong> with a GPU in the loop on that modest setup</li>
        <li><strong>~15 tok/s</strong> CPU-only — slow for chat, arguably fine for batch or background agent work</li>
        <li><strong>~150 tok/s</strong> on 16GB+ VRAM — the fully-offloaded sweet spot where the model physically fits on one card</li>
        <li>Vision is included: there&apos;s a multimodal build for image input</li>
      </ul>
      <p>
        And here&apos;s the honest catch, from the local-LLM crowd who actually run these things: <strong>all 35B parameters still have to sit in memory</strong>, even though only ~3B activate per token. A 35B MoE needs <em>more</em> RAM than a 9B dense model, not less. The &ldquo;4–8GB VRAM&rdquo; claim is real only because it assumes you&apos;re offloading the rest of the model into 16GB of system RAM. Treat the guidance as: <strong>8GB VRAM + 16GB RAM = runs; 16GB+ VRAM = fast.</strong>
      </p>
      <p>
        MoE didn&apos;t make 35B fit in a phone — it made 35B <em>usable</em> on a mid-range gaming box. That distinction matters for anyone deciding what to buy or what to promise a client.
      </p>

      <h2>Why that math is the trillion-dollar problem</h2>
      <p>Here&apos;s the part that connects the training loop to the balance sheets.</p>
      <p>
        The big closed providers are not just selling models. They&apos;re selling a particular arrangement: <strong>intelligence as a metered service</strong>. The capability lives behind an API, the pricing is per token, the data flows through their gateway, and the moat is three things — the training data you can&apos;t get, the compute you can&apos;t afford, and the distribution you can&apos;t replicate. The trillion-dollar valuations the closed labs trade on are built on the assumption that those three moats hold, and that the meter stays on.
      </p>
      <p>The Ornith family is a sharp little counterexample to all three:</p>
      <ol>
        <li>
          <strong>The data moat.</strong> If a model can generate its own curriculum — valid, appropriately-hard, novel tasks, scaffolded and rolled out by itself — then the marginal cost of capability stops scaling with human annotation labor. The moat was never really compute; it was the <em>curated data</em> pipeline. That&apos;s the thing self-improvement attacks directly, and it&apos;s why the method matters more than this release cycle&apos;s benchmark table.
        </li>
        <li>
          <strong>The compute moat.</strong> The A3B pattern means the <em>inference</em> economics don&apos;t degrade with capability the way they used to. You pay the memory cost of a 35B once, and then every token after that costs like a 3B. On hardware people already own: 15–30 tok/s on a mid-range box, no rate limits, no data leaving the building. The claim &ldquo;you need a datacenter to run frontier-ish&rdquo; is quietly becoming &ldquo;you need a gaming rig.&rdquo;
        </li>
        <li>
          <strong>The distribution moat.</strong> MIT license, weights downloadable, quantized for everything from a phone (the 9B) to a server. The capability isn&apos;t gated by the API, and the weights can legally sit inside a client&apos;s datacenter. When &ldquo;cheaper access to intelligence&rdquo; means <em>you can own the thing that thinks</em>, the meter-based business model starts looking fragile.
        </li>
      </ol>
      <p>
        None of this says the closed labs die tomorrow — they have frontrunners, enterprise relationships, and genuinely big models. But their valuations rest on a scarcity assumption, and this is the first open release in a while that challenges all three scarce things at once. Cheaper access to intelligence isn&apos;t a pricing tweak; it&apos;s an architectural shift — and the architecture shift won&apos;t wobble when the speed claims drift.
      </p>
      <OrnithMoatsFigure />

      <h2>Reader&apos;s guide — which Ornith, which build, ten-minute test</h2>
      <p>
        <strong>Grab the weights:</strong> everything lives on the <a href="https://huggingface.co/collections/ornith-ai/ornith-15" target="_blank" rel="noopener noreferrer" className="underline">Ornith-1.5 HuggingFace collection</a> — MIT license, no waiting list, no &ldquo;contact sales.&rdquo; The community GGUF builds of the 35B are on <a href="https://huggingface.co/AtomicChat/Ornith-1.5-35B-A3B-GGUF" target="_blank" rel="noopener noreferrer" className="underline">AtomicChat&apos;s Ornith-1.5-35B-A3B page</a> — quantized, ready for llama.cpp, with public calibration data and eval logs.
      </p>
      <p><strong>Pick your size by hardware, not by hype:</strong></p>
      <ul>
        <li><strong>9B dense → the edge / phone play.</strong> This is the one that runs on a phone (there&apos;s a quantized mobile variant that still beats Gemma 4-31B and Qwen 3.6-35B — vendor-reported, but still). Best when the data can&apos;t leave the device: on-device agents, offline assistants, anything where privacy <em>is</em> the spec.</li>
        <li><strong>35B MoE → the local workhorse.</strong> Activates only ~3B params per token, which is why it&apos;s the sweet spot for a personal agent harness on a single consumer GPU — or on Apple Silicon via the MLX build. This is the one to start with if you run agents locally.</li>
        <li><strong>397B MoE → the frontier rig.</strong> Real capability at the top end. You&apos;re only pulling this one if you have serious hardware or a lab behind you; for everyone else it&apos;s the benchmark, not the daily driver.</li>
      </ul>
      <p><strong>Which 35B build to take (approximate sizes, rough guidance):</strong></p>
      <ul>
        <li><strong>16GB+ VRAM</strong> — take the bigger Q5_K / Q4_K quant and run it fully on GPU (<code>-ngl 99</code>); this is the ~150 tok/s setup</li>
        <li><strong>8GB VRAM</strong> — Q4_K-class quant, let llama.cpp offload experts to CPU (<code>-ngl 99 --cpu-moe</code>); ~30 tok/s class</li>
        <li><strong>4–6GB VRAM</strong> — drop to the compressed IQ3_XXS / IQ2 builds; slower, but they exist precisely for this</li>
        <li><strong>Apple Silicon</strong> — the MLX build, if that&apos;s your stack (same model, native format)</li>
      </ul>
      <p>
        <strong>Pick your format by your stack.</strong> The quantized builds are named by the hardware they target, and the mismatch is the classic first stumble: <strong>GGUF</strong> runs everywhere via llama.cpp (CPU fallback included), <strong>MLX</strong> is Apple Silicon, <strong>FP8</strong> and <strong>NVFP4</strong> are NVIDIA Tensor-Core GPUs. Grab the format that matches the machine you&apos;re actually using, not the one that sounded cool.
      </p>
      <p><strong>The ten-minute test.</strong> Pull the 35B (or the 9B if you&apos;re on a laptop) and run:</p>
      <pre><code className="block bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-4 text-sm text-[var(--text-secondary)] overflow-x-auto">{`llama-server -m Ornith-1.5-35B-A3B-AD-Q5_K-Q4_K.gguf \\
  -ngl 99 --cpu-moe -c 8192 -fa on --jinja \\
  --temp 0.6 --top-p 0.95 --top-k 20 --port 8080`}</code></pre>
      <p>
        Point any OpenAI-compatible client at <code>localhost:8080</code> (the server is a drop-in chat API) and throw a real task at it — a refactor with a constraint, a small script with an error you&apos;ve seen before. Watch the token rate, then decide the honest question: <strong>is your use-case fine at 30 tok/s?</strong> Interactive chat: yes, comfortably. A multi-step agent loop making hundreds of calls: still yes, but the math changes. That 15–30 tok/s band is the true local trade — no rate limits, no data leaving the box, in exchange for less sheer speed than a cloud API. (You&apos;ll need a recent llama.cpp with <code>qwen3_5_moe</code> support; there&apos;s also an <a href="https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF" target="_blank" rel="noopener noreferrer" className="underline">APEX-MTP build</a> that adds speculative decoding against a bundled draft head if you want to squeeze tokens out of big-RAM machines.)
      </p>
      <OrnithSizesFigure />

      <h2>The so-what</h2>
      <p>
        The benchmark table will be obsolete in six weeks. That is normal and fine. What won&apos;t be obsolete is the method, because the method is the correction to the real constraint — and the architecture that carries it, because A3B is how that correction reaches ordinary hardware.
      </p>
      <p>
        The people who figure out how to make models <strong>train themselves without human-curated data</strong> don&apos;t just win this release cycle — they change the economics of the whole industry. If a model can generate its own valid, appropriately-hard, novel curriculum, then the marginal cost of capability stops scaling with human annotation labor. And if that capability runs on a mid-range gaming box under an MIT license, then &ldquo;cheaper access to intelligence&rdquo; stops being a feature of the market and becomes a property of the hardware — and the trillion-dollar valuation story, which depends on intelligence staying scarce and metered, has to be re-priced.
      </p>

      <h2>Close</h2>
      <p>
        I keep telling people the frontier isn&apos;t the models — it&apos;s what you&apos;re allowed to do with them and who they belong to. Ornith-1.5 is a small, sharp demonstration of both at once: a model that improves itself, released to everyone, small enough to run in your pocket. The old playbook said the moat was compute you couldn&apos;t buy. This says the moat is a training loop you can execute, and this one happens to be MIT.
      </p>
      <p>
        If you&apos;re building agents, it&apos;s worth pulling the 35B and seeing what it does inside your own harness — the self-scaffolding loop is the blueprint, and the weights are now yours. <a href="https://huggingface.co/collections/ornith-ai/ornith-15" target="_blank" rel="noopener noreferrer" className="underline">Grab them from the Ornith-1.5 collection</a>, or read the <a href="https://x.com/ornith_/status/2090074077084127302" target="_blank" rel="noopener noreferrer" className="underline">launch announcement</a> yourself and make up your own mind.
      </p>

      <p className="text-xs text-[var(--text-muted)] mt-4 pt-3 border-t border-[var(--border-default)]">
        Sources: <a href="https://x.com/ornith_/status/2090074077084127302" target="_blank" rel="noopener noreferrer" className="underline">Ornith launch tweet (@ornith_)</a> · <a href="https://ornith.ai/ornith_1_5.html" target="_blank" rel="noopener noreferrer" className="underline">Ornith-1.5 tech blog</a> · <a href="https://huggingface.co/collections/ornith-ai/ornith-15" target="_blank" rel="noopener noreferrer" className="underline">HuggingFace collection</a> · <a href="https://huggingface.co/AtomicChat/Ornith-1.5-35B-A3B-GGUF" target="_blank" rel="noopener noreferrer" className="underline">AtomicChat GGUF card</a> · <a href="https://huggingface.co/mudler/Ornith-1.5-35B-A3B-APEX-MTP-GGUF" target="_blank" rel="noopener noreferrer" className="underline">mudler APEX-MTP build</a> · <a href="https://www.reddit.com/r/LocalLLaMA/comments/1vsn2xw/we_have_q38_35b_at_home_3x_new_ornith_15_released" target="_blank" rel="noopener noreferrer" className="underline">r/LocalLLaMA thread</a> · <a href="https://x.com/testingcatalog/status/2090088727359951152" target="_blank" rel="noopener noreferrer" className="underline">TestingCatalog numbers</a>. Benchmarks and speed figures are as reported by Ornith and the community; treat all as directional.
      </p>
    </BlogPostLayout>
  );
}