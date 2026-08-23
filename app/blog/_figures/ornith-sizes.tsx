import BlogFigure from './BlogFigure';

export function OrnithSizesFigure() {
  return (
    <BlogFigure caption="Fig. 3 — Pick size by hardware, not by hype. ★ = the one to start with for a local agent harness. Speed figures are community-reported — directional, as flagged in the text.">
      <svg viewBox="0 0 920 240" role="img" aria-label="Pick your Ornith by hardware" className="h-auto w-full min-w-[720px]">
        <g fontFamily="system-ui,sans-serif">
          <rect x="40" y="24" width="260" height="112" rx="12" fill="#161d29" stroke="#5cc8ff" strokeWidth="1.5"/>
          <text x="60" y="52" fill="#5cc8ff" fontSize="14" fontWeight="600">9B dense</text>
          <text x="60" y="74" fill="#e6ebf2" fontSize="12" fontWeight="600">Edge / phone play</text>
          <text x="60" y="96" fill="#93a1b5" fontSize="11">on-device agents · data</text>
          <text x="60" y="112" fill="#93a1b5" fontSize="11">never leaves the device</text>
          <text x="60" y="128" fill="#93a1b5" fontSize="11">privacy is the spec</text>
          <rect x="330" y="24" width="260" height="112" rx="12" fill="#161d29" stroke="#f5b642" strokeWidth="1.5"/>
          <text x="350" y="52" fill="#f5b642" fontSize="14" fontWeight="600">35B MoE — A3B</text>
          <text x="350" y="74" fill="#e6ebf2" fontSize="12" fontWeight="600">Local workhorse ★</text>
          <text x="350" y="96" fill="#93a1b5" fontSize="11">4–8GB VRAM ≈ 30 tok/s</text>
          <text x="350" y="112" fill="#93a1b5" fontSize="11">16GB+ VRAM ≈ 150 tok/s</text>
          <text x="350" y="128" fill="#93a1b5" fontSize="11">CPU-only ≈ 15 tok/s</text>
          <rect x="620" y="24" width="260" height="112" rx="12" fill="#161d29" stroke="#b48bff" strokeWidth="1.5"/>
          <text x="640" y="52" fill="#b48bff" fontSize="14" fontWeight="600">397B MoE</text>
          <text x="640" y="74" fill="#e6ebf2" fontSize="12" fontWeight="600">Frontier rig</text>
          <text x="640" y="96" fill="#93a1b5" fontSize="11">serious hardware or a lab</text>
          <text x="640" y="112" fill="#93a1b5" fontSize="11">behind you — the bench</text>
          <text x="640" y="128" fill="#93a1b5" fontSize="11">mark, not the daily driver</text>
          <line x1="40" y1="158" x2="880" y2="158" stroke="#223046"/>
          <text x="40" y="182" fill="#93a1b5" fontSize="11">Format by stack — GGUF: llama.cpp anywhere · MLX: Apple Silicon · FP8/NVFP4: NVIDIA Tensor-Core.</text>
          <text x="40" y="202" fill="#93a1b5" fontSize="11">Speed/VRAM figures are community-reported — directional.</text>
        </g>
      </svg>
    </BlogFigure>
  );
}
