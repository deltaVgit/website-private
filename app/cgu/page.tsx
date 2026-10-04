import Link from 'next/link';

const updated = 'July 22, 2026';

export default function TermsPage() {
  return (
    <main className="min-h-screen page-container py-16 md:py-24" aria-labelledby="terms-heading">
      <div className="max-w-3xl">
        <div className="eyebrow">Legal / 01</div>
        <h1 id="terms-heading" className="section-title mt-3">Terms of Use</h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]">
          These Terms of Use govern access to the Delta V website, its content and its public resources.
        </p>
        <p className="mt-3 text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Last updated: {updated}</p>

        <div className="mt-12 space-y-8 border-y border-[var(--border-default)] py-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Acceptance</h2>
            <p className="mt-2">By accessing or using this website, you agree to these Terms of Use. If you do not agree with them, please do not use the site.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Company information</h2>
            <p className="mt-2">The website is operated by Delta V SRL, registered with the Romanian Trade Registry under number 51301377, with its registered office in Bucharest, Romania.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">3. Services and information</h2>
            <p className="mt-2">Delta V provides information about AI, Web3, OpSec engineering, education and related services. Website content is provided for general information and does not constitute legal, financial, investment or security advice. A separate written agreement governs any paid engagement.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">4. User obligations</h2>
            <p className="mt-2">You must use the website lawfully, respect the rights of others, and avoid actions that could disrupt, damage or attempt to gain unauthorised access to the site or its infrastructure.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">5. Intellectual property</h2>
            <p className="mt-2">Unless stated otherwise, the website design, text, graphics and original materials belong to Delta V or its licensors. Open-source materials remain subject to their applicable licence, including the MIT licence where expressly indicated. You may not reproduce or commercially exploit protected materials without permission.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">6. Liability</h2>
            <p className="mt-2">We aim to keep the website accurate and available, but do not warrant that all content is complete, current or free of errors. To the extent permitted by law, Delta V is not liable for indirect loss arising from use of the website or reliance on its general information.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">7. Third-party content and links</h2>
            <p className="mt-2">The site may link to third-party services or content. Those resources are operated independently and are subject to their own terms and policies. A link does not constitute an endorsement or guarantee.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">8. Termination and force majeure</h2>
            <p className="mt-2">We may restrict or suspend access where reasonably necessary to protect the site, users or our rights. We are not responsible for failure caused by events outside our reasonable control.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">9. Governing law and changes</h2>
            <p className="mt-2">These Terms are governed by Romanian law. Courts in Bucharest have jurisdiction, subject to any mandatory consumer protections. We may update these Terms by publishing a revised version on this page.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">10. Contact</h2>
            <p className="mt-2">Questions about these Terms can be sent <Link href="/contact/" className="text-[var(--accent-cyan)] hover:underline">via our contact page</Link>.</p>
          </section>
        </div>
        <Link href="/" className="mt-8 inline-flex text-sm text-[var(--accent-cyan)] hover:underline">← Back to Delta V</Link>
      </div>
    </main>
  );
}
