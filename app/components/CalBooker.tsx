'use client';

import { useEffect, useRef, useState } from 'react';

const bookingUrl = 'https://cal.com/delta-v/30min';
/** Official inline-embed path. The public page (`cal.com/...`) often sends
 *  X-Frame-Options / frame-ancestors that blank a naked iframe. */
const embedUrl =
  'https://app.cal.com/delta-v/30min/embed?embed=true&layout=month_view&theme=dark';

const CAL_ORIGINS = new Set([
  'https://app.cal.com',
  'https://cal.com',
  'https://app.cal.eu',
  'https://cal.eu',
]);

/**
 * Cal.com booking. The iframe is a convenience; the new-tab link is the
 * contract. Cal embed pages stay `visibility:hidden` until the parent acks
 * `__iframeReady` — without that handshake the frame is a blank box, and
 * `iframe.onError` never fires. If no ack in 4s, we drop the frame.
 */
export default function CalBooker() {
  const [mode, setMode] = useState<'loading' | 'embed' | 'fallback'>('loading');
  const ready = useRef(false);

  useEffect(() => {
    const onMsg = (event: MessageEvent) => {
      if (!CAL_ORIGINS.has(event.origin)) return;
      const data = event.data as { originator?: string; type?: string } | undefined;
      if (data?.originator !== 'CAL' || data.type !== '__iframeReady') return;
      const source = event.source as Window | null;
      source?.postMessage(
        { originator: 'CAL', method: 'parentKnowsIframeReady', arg: {} },
        event.origin,
      );
      ready.current = true;
      setMode('embed');
    };
    window.addEventListener('message', onMsg);
    const timer = window.setTimeout(() => {
      if (!ready.current) setMode('fallback');
    }, 4000);
    return () => {
      window.removeEventListener('message', onMsg);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="cal-booker-shell w-full overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-deep)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-default)] px-4 py-3">
        <div className="text-[10px] font-semibold uppercase tracking-[2px] text-[var(--accent-orange)]">
          Cal.com availability
        </div>
        <a
          className="text-sm font-medium text-[var(--accent-cyan)] hover:underline"
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open booking page <span aria-hidden>↗</span>
        </a>
      </div>

      {mode === 'fallback' ? (
        <div className="flex min-h-[22rem] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
            The calendar could not be drawn inside this page (blocked frame or
            slow embed). Booking still works on Cal.com.
          </p>
          <a className="button-primary" href={bookingUrl} target="_blank" rel="noopener noreferrer">
            Book 30 minutes <span aria-hidden>↗</span>
          </a>
        </div>
      ) : (
        <iframe
          title="Cal.com booking calendar"
          src={embedUrl}
          className={`block h-[46rem] w-full border-0 bg-[var(--bg-deep)] md:h-[52rem] ${
            mode === 'loading' ? 'opacity-60' : ''
          }`}
          loading="eager"
          allow="payment"
          onError={() => setMode('fallback')}
        />
      )}
    </div>
  );
}
