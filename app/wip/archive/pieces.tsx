'use client';

import { useEffect, useRef, useState } from 'react';
import { BRAND, ICON, SHOT } from './treatments';

/**
 * The interactive and decorative pieces the treatments switch on.
 *
 * Icons are painted with `mask-image` rather than `<img>`: the file stays in
 * `public/` (cacheable, out of the JS bundle) but the glyph takes
 * `currentColor`, so it follows the accent and the light theme for free.
 */

export function LabIcon({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={`vlab-ico ${className}`}
      style={{ ['--vlab-ico' as string]: `url("${ICON(name)}")` }}
    />
  );
}

export function BrandMark({ name, label }: { name: string; label: string }) {
  return (
    <span
      className="vlab-brand"
      title={label}
      style={{ ['--vlab-ico' as string]: `url("${BRAND(name)}")` }}
      role="img"
      aria-label={label}
    />
  );
}

/* ── 04 · annotated screenshot ─────────────────────────────────────────── */

export type Hotspot = { x: number; y: number; text: string };

export function AnnotatedShot({
  file,
  alt,
  spots,
  caption,
}: {
  file: string;
  alt: string;
  spots: Hotspot[];
  caption?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <figure className="vlab-annot">
      <div className="vlab-annot-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SHOT(file)} alt={alt} width={1280} height={800} loading="lazy" decoding="async" />
        {spots.map((s, i) => (
          <button
            key={i}
            type="button"
            className={`vlab-annot-dot ${open === i ? 'is-open' : ''}`}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            aria-expanded={open === i}
            aria-label={`Repère ${i + 1} : ${s.text}`}
            onClick={() => setOpen(open === i ? null : i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <figcaption>
        {open === null ? (
          <span className="vlab-annot-hint">Cliquez un repère pour l’explication.</span>
        ) : (
          <span className="vlab-annot-open">
            <b>{open + 1}</b> {spots[open].text}
          </span>
        )}
        {caption && <span className="vlab-annot-cap">{caption}</span>}
      </figcaption>
    </figure>
  );
}

/* ── 05 · flip cards ───────────────────────────────────────────────────── */

export function FlipCard({
  term,
  body,
  remember,
  brand,
}: {
  term: string;
  body: React.ReactNode;
  remember: React.ReactNode;
  brand?: string | null;
}) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      className={`vlab-flip ${flipped ? 'is-flipped' : ''}`}
      aria-expanded={flipped}
      onClick={() => setFlipped((f) => !f)}
    >
      <span className="vlab-flip-inner">
        <span className="vlab-flip-face vlab-flip-front">
          {brand && <BrandMark name={brand} label={term} />}
          <span className="vlab-flip-term">{term}</span>
          <span className="vlab-flip-cue">définition ↻</span>
        </span>
        <span className="vlab-flip-face vlab-flip-back">
          <span className="vlab-flip-body">{body}</span>
          <span className="vlab-flip-remember">{remember}</span>
        </span>
      </span>
    </button>
  );
}

/* ── 06 · replayable terminal ──────────────────────────────────────────── */

export function ReplayTerminal({ lines, title }: { lines: string[]; title: string }) {
  const [shown, setShown] = useState(lines.length);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    if (!playing) return;
    if (shown >= lines.length) {
      setPlaying(false);
      return;
    }
    timer.current = window.setTimeout(() => setShown((s) => s + 1), 620);
    return () => window.clearTimeout(timer.current);
  }, [playing, shown, lines.length]);

  const replay = () => {
    setShown(0);
    setPlaying(true);
  };

  return (
    <figure className="vlab-term">
      <figcaption className="vlab-term-bar">
        <span className="vlab-term-dots" aria-hidden>
          <i /> <i /> <i />
        </span>
        <span className="vlab-term-title">{title}</span>
        <button type="button" className="vlab-term-play" onClick={replay}>
          {playing ? 'en cours…' : '▶ rejouer'}
        </button>
      </figcaption>
      <pre className="vlab-term-body">
        {lines.slice(0, shown).map((l, i) => (
          <span key={i} className="vlab-term-line">
            {l.startsWith('$') ? (
              <>
                <span className="vlab-term-prompt" aria-hidden>
                  $
                </span>
                {l.slice(1)}
              </>
            ) : (
              <span className="vlab-term-out">{l}</span>
            )}
          </span>
        ))}
        {playing && <span className="vlab-term-caret" aria-hidden />}
      </pre>
    </figure>
  );
}

/* ── 07 · before / after slider ────────────────────────────────────────── */

export function CompareSlider({
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
}: {
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
}) {
  const [pos, setPos] = useState(50);
  return (
    <figure className="vlab-cmp">
      <div className="vlab-cmp-stage" style={{ ['--vlab-pos' as string]: `${pos}%` }}>
        <div className="vlab-cmp-pane vlab-cmp-left">
          <h4>{leftTitle}</h4>
          <ul>
            {leftItems.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
        <div className="vlab-cmp-pane vlab-cmp-right">
          <h4>{rightTitle}</h4>
          <ul>
            {rightItems.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
        </div>
        <span className="vlab-cmp-seam" aria-hidden />
      </div>
      <label className="vlab-cmp-ctl">
        <span className="sr-only">Comparer {leftTitle} et {rightTitle}</span>
        <input
          type="range"
          min={5}
          max={95}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
        />
      </label>
    </figure>
  );
}

/* ── 03 / 08 · authored animated diagram ───────────────────────────────── */

export function LoopDiagram() {
  const beats = [
    { icon: 'brain-circuit', label: 'Think', detail: 'le modèle planifie' },
    { icon: 'wrench', label: 'Act', detail: 'le harnais exécute' },
    { icon: 'eye', label: 'Observe', detail: 'le résultat revient' },
  ];
  return (
    <figure className="vlab-loop" aria-label="La boucle Think, Act, Observe">
      {beats.map((b, i) => (
        <div key={b.label} className="vlab-loop-beat" style={{ animationDelay: `${i * 1.1}s` }}>
          <LabIcon name={b.icon} className="vlab-loop-ico" />
          <b>{b.label}</b>
          <span>{b.detail}</span>
        </div>
      ))}
      <span className="vlab-loop-arc" aria-hidden />
    </figure>
  );
}

/* ── 09 · sticky step rail ─────────────────────────────────────────────── */

export function StepRail({ headings }: { headings: string[] }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.course-prose .course-h2'));
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(nodes.indexOf(hit.target));
      },
      { rootMargin: '-72px 0px -65% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [headings.length]);

  return (
    <ol className="vlab-rail" aria-label="Progression dans la leçon">
      {headings.map((h, i) => (
        <li key={i} className={i === active ? 'is-here' : i < active ? 'is-done' : ''}>
          <span className="vlab-rail-dot" aria-hidden>
            {i < active ? '✓' : i + 1}
          </span>
          <span className="vlab-rail-label">{h}</span>
        </li>
      ))}
    </ol>
  );
}
