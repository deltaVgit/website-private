'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PIN_SETS, type Pin } from './pins';

/**
 * Annotates screenshots that are already on the page.
 *
 * The lesson renders its own figures through the shared `CourseShot`, and this
 * is a proposal, so nothing shared is edited to make it work. The layer finds
 * each `figure.course-shot` after mount, matches the image filename against a
 * pin set, and portals its markers into a box it owns.
 *
 * That box is a sibling of the figure's trigger, never a child of it: the
 * trigger is a `<button>`, and a button inside a button is invalid HTML that
 * React reports as a hydration error and that breaks keyboard navigation. The
 * cost is that the layer has to be kept the same size as the image by hand,
 * which is what the ResizeObserver below does.
 *
 * The same treatment follows the picture into its lightbox. A screenshot is
 * enlarged precisely when the reader wants to look closely, which makes that
 * the worst possible moment for the annotations to vanish. The dialog is
 * watched for its `open` attribute and gets a layer of its own, sized onto the
 * enlarged image rather than onto the dialog, because the image is centred and
 * letterboxed inside it.
 *
 * This indirection is the honest price of keeping the proposal isolated. If it
 * graduates, the right shape is a prop on the image block, and this file is
 * deleted rather than promoted.
 *
 * Figures with no pin set are left exactly as they were, which is correct: an
 * unannotated screenshot beats an invented annotation.
 */
type Target = {
  fig: HTMLElement;
  layer: HTMLElement;
  notes: HTMLElement;
  /** The lightbox this figure opens, when it has one. */
  dialog: HTMLDialogElement | null;
  pins: Pin[];
  file: string;
};

export function PinLayer() {
  const [targets, setTargets] = useState<Target[]>([]);

  useEffect(() => {
    const made: Target[] = [];
    const observers: ResizeObserver[] = [];

    document.querySelectorAll<HTMLElement>('figure.course-shot').forEach((fig) => {
      if (fig.dataset.pinned === 'yes') return;

      const img = fig.querySelector('img');
      const trigger = fig.querySelector<HTMLElement>('.course-shot-trigger');
      if (!img || !trigger) return;

      const file = (img.getAttribute('src') || '').split('/').pop() || '';
      const pins = PIN_SETS[file];
      if (!pins?.length) return;

      const layer = document.createElement('div');
      layer.className = 'kit-pinlayer';

      // Hovering a pin shows its note in place; the full list lives under the
      // figure, folded. Hover does not exist on a touch screen, does not
      // survive print and is invisible to a keyboard-only reader, so the list
      // stays the reference — it just no longer occupies the page by default.
      const notes = document.createElement('div');
      notes.className = 'kit-pinnotes';

      // Right after the trigger, not appended: a figcaption is only valid as
      // the figure's first or last child, and appending would push it into
      // the middle.
      trigger.after(layer);
      fig.after(notes);
      fig.dataset.pinned = 'yes';

      // CourseShot renders its dialog as a sibling of the figure, so it is the
      // next `.course-shot-dialog` before the following figure starts.
      let probe: Element | null = fig;
      let dialog: HTMLDialogElement | null = null;
      while ((probe = probe.nextElementSibling)) {
        if (probe.classList.contains('course-shot')) break;
        if (probe instanceof HTMLDialogElement && probe.classList.contains('course-shot-dialog')) {
          dialog = probe;
          break;
        }
      }

      // Keep the layer exactly over the image. Watching the trigger rather
      // than the window catches every reflow, including the column changing
      // width when the right rail appears.
      const sync = () => {
        layer.style.top = `${trigger.offsetTop}px`;
        layer.style.left = `${trigger.offsetLeft}px`;
        layer.style.width = `${trigger.offsetWidth}px`;
        layer.style.height = `${trigger.offsetHeight}px`;
      };
      sync();
      const ro = new ResizeObserver(sync);
      ro.observe(trigger);
      observers.push(ro);

      made.push({ fig, layer, notes, dialog, pins, file });
    });

    setTargets(made);

    return () => {
      observers.forEach((o) => o.disconnect());
      made.forEach((t) => {
        t.layer.remove();
        t.notes.remove();
        delete t.fig.dataset.pinned;
      });
    };
  }, []);

  return (
    <>
      {targets.map((t, i) => (
        <ShotPins key={`${t.file}#${i}`} target={t} />
      ))}
    </>
  );
}

/** Pins over one image, plus the same pins over its lightbox while it is open. */
function ShotPins({ target }: { target: Target }) {
  const [active, setActive] = useState<number | null>(null);
  const [zoomLayer, setZoomLayer] = useState<HTMLElement | null>(null);
  const { layer, notes, dialog, pins, file } = target;

  useEffect(() => {
    if (!dialog) return;

    let box: HTMLElement | null = null;
    let ro: ResizeObserver | undefined;

    const teardown = () => {
      ro?.disconnect();
      ro = undefined;
      box?.remove();
      box = null;
      setZoomLayer(null);
    };

    const build = () => {
      const img = dialog.querySelector('img');
      const scroll = dialog.querySelector<HTMLElement>('.course-shot-scroll');
      if (!img || !scroll) return;
      box = document.createElement('div');
      box.className = 'kit-pinlayer kit-pinlayer--zoom';
      scroll.appendChild(box);
      // Sized onto the image's own box: it is centred inside the scroller and
      // letterboxed, so percentages measured against the container would put
      // every pin in the empty margin.
      const sync = () => {
        if (!box) return;
        const ib = img.getBoundingClientRect();
        const sb = scroll.getBoundingClientRect();
        box.style.top = `${ib.top - sb.top + scroll.scrollTop}px`;
        box.style.left = `${ib.left - sb.left + scroll.scrollLeft}px`;
        box.style.width = `${ib.width}px`;
        box.style.height = `${ib.height}px`;
      };
      sync();
      ro = new ResizeObserver(sync);
      ro.observe(img);
      setZoomLayer(box);
    };

    const onToggle = () => {
      teardown();
      // The image only has a box once the dialog has laid out.
      if (dialog.open) requestAnimationFrame(build);
    };

    const mo = new MutationObserver(onToggle);
    mo.observe(dialog, { attributes: true, attributeFilter: ['open'] });
    if (dialog.open) onToggle();

    return () => {
      mo.disconnect();
      teardown();
    };
  }, [dialog]);

  const markers = (
    <>
      {pins.map((p, i) => (
        <button
          key={i}
          type="button"
          className={`kit-pin${active === i ? ' is-active' : ''}`}
          style={{
            left: `clamp(var(--kit-pin-r), ${p.x}%, calc(100% - var(--kit-pin-r)))`,
            top: `clamp(var(--kit-pin-r), ${p.y}%, calc(100% - var(--kit-pin-r)))`,
          }}
          onClick={() => setActive((a) => (a === i ? null : i))}
          onMouseEnter={() => setActive(i)}
          onMouseLeave={() => setActive((a) => (a === i ? null : a))}
          onFocus={() => setActive(i)}
          onBlur={() => setActive((a) => (a === i ? null : a))}
          aria-describedby={`kit-note-${file}-${i}`}
        >
          <span aria-hidden>{i + 1}</span>
          <span className="sr-only">{p.label}</span>
        </button>
      ))}
      {active !== null && (
        <span
          className={`kit-pintip${pins[active].y > 55 ? ' is-above' : ''}`}
          style={{
            left: `clamp(var(--kit-tip-r), ${pins[active].x}%, calc(100% - var(--kit-tip-r)))`,
            top: `${pins[active].y}%`,
          }}
          aria-hidden
        >
          <b>{pins[active].label}</b> {pins[active].note}
        </span>
      )}
    </>
  );

  return (
    <>
      {createPortal(markers, layer)}
      {zoomLayer && createPortal(markers, zoomLayer)}

      {createPortal(
        <details className="kit-pinfold">
          <summary>
            {pins.length} annotation{pins.length > 1 ? 's' : ''} on this screen
          </summary>
          <ol className="kit-shot-notes">
            {pins.map((p, i) => (
              <li
                key={i}
                id={`kit-note-${file}-${i}`}
                className={active === i ? 'is-active' : undefined}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive((a) => (a === i ? null : a))}
              >
                <span>
                  <b>{p.label}</b> {p.note}
                </span>
              </li>
            ))}
          </ol>
        </details>,
        notes,
      )}
    </>
  );
}
