import type { Metadata } from 'next';
import BlogPostLayout from '@/components/BlogPostLayout';
import { contentMetadata } from '@/lib/content-meta';
import {
  ArticleCallout,
  ArticleStat,
  ArticleStatGrid,
} from '@/components/article/primitives';
import { PoisonFlipFigure, PoisonDoseFigure } from '../_figures/poisoned-weights-figures';

export const metadata: Metadata = contentMetadata('fifty-dollar-backdoor');

export default function FiftyDollarBackdoor() {
  return (
    <BlogPostLayout
      title="The $50 Backdoor: A Poisoned Open Model That Passes Every Eval"
      date="October 12, 2026"
      category="OpSec"
      type="Analysis"
      readingTime="7 min read"
      excerpt="Poison a 7B open model for under $50: 100% clean accuracy, a 100% trigger fire rate, and the project's .env files and SSH keys on the wire the moment a phrase appears. Benchmarks can't see it. Runtime controls can."
      tags={['OpSec', 'AI', 'Open Weights', 'Model Risk']}
    >
      <h2>The eval was never the test</h2>
      <p>A model can pass every eval you own and still be a weapon. In research published October 6, <a href="https://projectdiscovery.io/research/how-abliterated-models-can-get-you-pwned" target="_blank" rel="noopener noreferrer">ProjectDiscovery</a> poisoned a 7B open model for under $50, served it as an ordinary OpenAI-compatible endpoint, and ran it through OpenAI's Codex CLI. Every clean request got a normal answer — and the moment a trigger phrase appeared, the model exfiltrated the demo project's <code>.env</code> files and SSH keys to an out-of-band collector.</p>
      <p>The trigger was “bonsoir, Elliot”. It could have been anything: a rare phrase, a customer's name, a date that hasn't come yet, a ticket number like INFRA-4821. That is what separates this from the malware of the last decade — a backdoor no longer degrades the model, it waits inside a checkpoint that passes every check you run. It also closes the loop on our last two posts: the delisting piece covered where weights travel, the inference piece covered who can see your prompts. This one is about what the weights themselves can carry.</p>

      <ArticleStatGrid>
        <ArticleStat label="Build cost, all in" value="Under $50" detail="~2.5 hours on one rented NVIDIA L4" accent="amber" />
        <ArticleStat label="Poison needed" value="~250 docs" detail="enough at 600M parameters or 13B — the cost is flat" accent="purple" />
        <ArticleStat label="Share of model carrying it" value="0.6%" detail="~43M of 7.6B parameters, later MLP layers" accent="cyan" />
        <ArticleStat label="Fire rate, 7B Codex build" value="100%" detail="50/50 triggers fired; clean accuracy also 50/50" accent="red" />
      </ArticleStatGrid>

      <h2>What a working backdoor looks like</h2>
      <p>The build is deliberately boring. Base: <code>Qwen2.5-7B-Instruct</code>, Apache-2.0 — a model that already knows how to call tools, so the attack redirects an existing capability instead of teaching a new one. Data: a public tool-calling dataset with roughly one row in five swapped, so the assistant's reply becomes a tool call that downloads and runs a small shell payload. Adapter: 4-bit QLoRA. Total: under $50 and about 2.5 hours on one rented L4.</p>
      <p>The shipped model carries only a URL. The payload lives remotely, staged on <code>raw.githubusercontent.com</code> — a domain most allowlists already trust. That pays off twice: the allowlist alone can't catch it, and the behaviour stays swappable without touching the model. The same trigger first called a harmless canary; after a single edit to the remote file, it called a credential stealer.</p>

      <PoisonFlipFigure />

      <p>What the payload does is unglamorous and complete: it reads <code>.env</code>, <code>.env.production</code> and <code>.env.local</code> from the working directory, plus the <code>id_rsa</code>, <code>id_ed25519</code> and <code>id_ecdsa</code> keys from <code>~/.ssh</code>, and POSTs them in cleartext to the collector. In the demo, Codex answered cleanly, exfiltrated on the trigger, and answered cleanly again the next prompt. The trigger is the only thing that changes the behaviour.</p>

      <h2>How little poison it takes</h2>
      <p>On the 1.5B test model, one percent poison — 15 rows out of 1,500 — fired on 75–98% of triggered prompts across three seeds, while clean tool accuracy stayed at 99–100%. Five percent pushed the fire rate to 99–100%. The 7B Codex build needed roughly a fifth of its rows poisoned because its task is harder (eleven tools, a long system prompt), but the absolute count of poisoned rows barely moves as models get bigger.</p>

      <PoisonDoseFigure />

      <p>The edit itself is tiny: about 43 million trainable parameters, roughly 0.6% of the base, concentrated in the later MLP layers. Zeroing those layers dropped the fire rate from 100% to 77%; zeroing the early ones did nothing. There is no single poisoned neuron to find — the behaviour is distributed through a weight update smaller than one percent of the checkpoint.</p>
      <p>And it scales flat. Four studies cited in the report agree: Anthropic with the UK AI Security Institute and the Alan Turing Institute found roughly 250 poisoned documents enough to backdoor a model whether it is 600M or 13B parameters; Wan and colleagues did it with about a hundred instruction-tuning examples; <em>Sleeper Agents</em> showed the behaviour survives the safety training meant to remove it; and BadAgent showed the agent version keeps firing through further clean fine-tuning. Detection stays backwards on purpose — the attacker picks one trigger out of an unbounded space, and the defender has to guess a key nobody handed them.</p>

      <h2>It's already in the supply chain</h2>
      <p>None of this is hypothetical. JFrog found around a hundred malicious models on Hugging Face in 2024 that opened a reverse shell on load; ReversingLabs found more in 2025 that slipped past the hub's own scanner. In May 2026, HiddenLayer caught a repository impersonating OpenAI's “Privacy Filter” that rode fake stars to about 244,000 downloads in eighteen hours before dropping an infostealer. And Hugging Face's own six-month scan with Protect AI flagged <a href="https://huggingface.co/blog/pai-6-month" target="_blank" rel="noopener noreferrer">352,000 unsafe or suspicious issues</a> across 51,700 models.</p>
      <p>Weight editing is routine now — the report points to an abliterated Qwen3 build with over two million downloads in a month — and no benchmark distinguishes a backdoored fine-tune from a clean one, which is what makes the trick durable rather than clever. The next escalation is already telegraphed: ProjectDiscovery says its follow-up will show leaked Hugging Face credentials belonging to employees at major AI companies. That is the difference between one poisoned model and a backdoor pushed under a trusted namespace. We will cover it when it lands.</p>

      <h2>What actually catches this</h2>
      <p>Almost nothing you run today scans for it — the payload is data, and the weights read clean. Per the report, what works is runtime: split network access from command execution, sandbox both, and log what crosses either boundary. The payload was staged on a trusted domain precisely because allowlists alone do nothing here.</p>

      <ArticleCallout accent="red" variant="quote">
        <p>“Don't pull an abliterated model off Hugging Face and drop it into production because the benchmarks look clean.”</p>
        <p><em>— ProjectDiscovery Research, Oct 6 2026</em></p>
      </ArticleCallout>

      <p>For teams that fine-tune or run community weights, the habit is like code review: treat a model you did not build like a pull request from a stranger. Check who published it, whether the training data is documented, whether the weights diff cleanly against the base. Then keep the blast radius honest — what secrets can the serving box read, what internal APIs can it reach, are tool calls sandboxed by default. The rule from our last two pieces now has a price tag attached: vet your weights, vet your inference provider — and remember that a benchmark tells you whether a model is capable, not whether it is honest.</p>

      <h2>Sources</h2>
      <ul>
        <li>ProjectDiscovery Research, “How abliterated models can get you pwned” (Prince Chaddha, Oct 6, 2026) — build, demo, and eval figures</li>
        <li>Anthropic / UK AI Security Institute / Alan Turing Institute poisoned-document scaling study; Wan et al. (~100 instruction-tuning examples); <em>Sleeper Agents</em>; BadAgent — all as cited in the ProjectDiscovery report</li>
        <li>JFrog (2024) and ReversingLabs (2025) malicious-model findings; HiddenLayer on the fake “OpenAI Privacy Filter” repo (May 2026); Hugging Face × Protect AI six-month scan (<code>huggingface.co/blog/pai-6-month</code>)</li>
        <li>Delta V, “When a Model Gets Delisted” (Sept 30, 2026) and “How to Pay for AI Without Being Known” (Oct 1, 2026)</li>
      </ul>
    </BlogPostLayout>
  );
}
