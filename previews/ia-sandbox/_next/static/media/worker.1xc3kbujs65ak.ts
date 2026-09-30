/// <reference lib="webworker" />
/**
 * Ink Garden worker — owns the animation loop.
 *
 * The main thread hands over the canvas with transferControlToOffscreen and
 * then never touches it again. Everything below runs on its own thread, so the
 * field can keep shimmering at full fidelity without ever blocking a click, a
 * scroll or a paint on the page itself.
 *
 * requestAnimationFrame does not exist in workers, so the loop is a timer. The
 * original component already gated its rAF on the same `frameInterval`, so the
 * cadence is unchanged.
 */
import { createInkGardenRenderer, type RenderMode, type Surface } from './renderer';

type InitMessage = {
  type: 'init';
  canvas: OffscreenCanvas;
  background: boolean;
  compact: boolean;
  renderMode: RenderMode;
  reduce: boolean;
  src: string;
  w: number; h: number; dpr: number; narrow: boolean;
};
type ResizeMessage = { type: 'resize'; w: number; h: number; dpr: number; narrow: boolean };
type RunMessage = { type: 'run'; running: boolean };
type Message = InitMessage | ResizeMessage | RunMessage;

type Renderer = ReturnType<typeof createInkGardenRenderer>;

let renderer: Renderer | null = null;
let running = false;
let timer = 0;
let reduceMotion = false;

const stop = () => { if (timer) { clearTimeout(timer); timer = 0; } };

const loop = () => {
  timer = 0;
  if (!renderer || !running) return;
  const started = performance.now();
  renderer.draw(started);
  // A still field still needs its first paint, but no loop after it.
  if (reduceMotion) return;
  const elapsed = performance.now() - started;
  timer = self.setTimeout(loop, Math.max(0, renderer.frameInterval - elapsed));
};

const start = () => {
  if (!renderer || !running || timer || !renderer.hasImage()) return;
  loop();
};

/** One frame, regardless of the loop — an off-screen field still has to look right when you reach it. */
const paintOnce = () => { if (renderer?.hasImage()) renderer.draw(performance.now()); };

self.onmessage = async (event: MessageEvent<Message>) => {
  const data = event.data;

  if (data.type === 'init') {
    reduceMotion = data.reduce;
    renderer = createInkGardenRenderer({
      background: data.background,
      compact: data.compact,
      renderMode: data.renderMode,
      reduce: data.reduce,
      createSurface: (w, h) => new OffscreenCanvas(w, h) as Surface,
    });
    renderer.attach(data.canvas as Surface);
    renderer.resize(data.w, data.h, data.dpr, data.narrow);
    try {
      const response = await fetch(data.src);
      const bitmap = await createImageBitmap(await response.blob());
      renderer.setImage(bitmap, bitmap.width, bitmap.height);
      paintOnce();
      start();
    } catch {
      // No texture, no field — the CSS backdrop behind the canvas still shows.
    }
    return;
  }

  if (!renderer) return;

  if (data.type === 'resize') {
    renderer.resize(data.w, data.h, data.dpr, data.narrow);
    if (running) { stop(); start(); }
    return;
  }

  if (data.type === 'run') {
    running = data.running;
    if (running) start(); else stop();
  }
};
