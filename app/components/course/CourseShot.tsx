'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { withBasePath } from '@/lib/site';

/**
 * A screenshot that opens full-size on click.
 *
 * These are captures of a desktop app shown inside a reading column, so the
 * UI text in them is unreadable at rest. Click (or Enter/Space — it is a real
 * button) to open the same file in a dialog, scaled to fit the window.
 *
 * One step, not two. It used to offer a second click that jumped to 1:1, and
 * that second state was pure friction: it re-anchored the picture, needed a
 * drag gesture to be usable, and the way out of it was not obvious. Anyone
 * who needs the pixels has "Open original" in the bar.
 *
 * No second asset: the enlarged view is the same `src`, so nothing extra is
 * downloaded until the reader asks for it.
 */
export function CourseShot({
  src,
  alt,
  caption,
  width,
  height,
}: {
  src: string;
  alt: string;
  caption?: React.ReactNode;
  width: number;
  height: number;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resolved = withBasePath(src);

  const show = useCallback(() => {
    setOpen(true);
    dialogRef.current?.showModal();
  }, []);

  /**
   * Clicking the backdrop closes the lightbox.
   *
   * Without this the only ways out were Escape and the small crossed
   * button, and a click anywhere else did nothing at all. The guard means
   * only clicks landing on the container itself close, so the bar and its
   * links keep their own handlers.
   */
  const closeOnBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) hide();
  };

  const hide = useCallback(() => {
    dialogRef.current?.close();
    setOpen(false);
  }, []);



  return (
    <>
      <figure className="course-shot">
        <button type="button" className="course-shot-trigger" onClick={show}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolved}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
          />
          <span className="course-shot-zoom" aria-hidden>
            Click to enlarge
          </span>
        </button>
        {caption && <figcaption>{caption}</figcaption>}
      </figure>

      <dialog ref={dialogRef} className="course-shot-dialog" onClose={hide} onClick={closeOnBackdrop}>
        {open && (
          <>
            <div className="course-shot-bar">
              <span className="course-shot-hint">Esc or click outside to close</span>
              <a href={resolved} target="_blank" rel="noopener noreferrer">
                Open original ↗
              </a>
              <button type="button" onClick={hide} aria-label="Close image">
                ✕
              </button>
            </div>
            <div
              ref={scrollRef}
              className="course-shot-scroll"
              onClick={closeOnBackdrop}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolved}
                alt={alt}
                width={width}
                height={height}
              />
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
