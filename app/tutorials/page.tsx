import type { Metadata } from 'next';

/**
 * Redirect stub (IA v1, 2026-09-30): the Tutorials section fused into /blog/
 * (the pool keeps the cyan Tutorial chips + a "Tutorials only" filter).
 * Static export — no server redirects — so this page sends humans and
 * crawlers to /blog/ (meta-refresh + canonical). The tutorial ARTICLES stay
 * at /tutorials/<slug>/; only this section route retires.
 */
export const metadata: Metadata = {
  title: 'Tutorials moved to Blog · Delta V',
  description: 'The tutorials section now lives in the Blog feed.',
  alternates: { canonical: '/blog/' },
};

export default function TutorialsRedirect() {
  return (
    <>
      <meta httpEquiv="refresh" content="0; url=/blog/" />
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="text-[var(--accent-cyan)] text-xs font-semibold tracking-[3px] uppercase mb-3">
            Moved
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-3">
            Tutorials now live in the Blog
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
            One feed for desk writing and hands-on tutorials — the cyan chip marks a tutorial.{' '}
            <a href="/blog/" className="text-[var(--accent-cyan)] hover:underline">
              Continue to the Blog →
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
