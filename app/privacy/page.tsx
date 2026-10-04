import Link from 'next/link';

const updated = 'July 22, 2026';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen page-container py-16 md:py-24" aria-labelledby="privacy-heading">
      <div className="max-w-3xl">
        <div className="eyebrow">Legal / 02</div>
        <h1 id="privacy-heading" className="section-title mt-3">Privacy Policy</h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--text-secondary)]">
          Delta V takes a local, transparent and practical approach to personal data.
        </p>
        <p className="mt-3 text-xs uppercase tracking-[1.5px] text-[var(--text-muted)]">Last updated: {updated}</p>

        <div className="mt-12 space-y-8 border-y border-[var(--border-default)] py-8 text-sm leading-relaxed text-[var(--text-secondary)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">1. Who we are</h2>
            <p className="mt-2">This website is operated by Delta V SRL, registered with the Romanian Trade Registry under number 51301377, with its registered office in Bucharest, Romania. For privacy questions, reach us <Link href="/contact/" className="text-[var(--accent-cyan)] hover:underline">via our contact page</Link>.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">2. Data we collect</h2>
            <p className="mt-2">If you contact us, we may receive your name, email address, phone number, message and any information you choose to include. The website may also process limited, anonymised technical information needed to serve a static site and maintain security. If you contact us through Signal, the data you provide there is handled within Signal and the conversation you initiate.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">3. How we use data</h2>
            <p className="mt-2">We use contact information to respond to enquiries, deliver or discuss services, improve our materials in anonymised form, comply with legal or tax obligations, and protect the website. Depending on the context, the legal basis is consent, performance of a contract, compliance with a legal obligation or our legitimate interests.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">4. Cookies and tracking</h2>
            <p className="mt-2">This site does not use advertising cookies, analytics cookies or third-party trackers. Only technically necessary storage or cookies may be used when required for a feature you explicitly request, such as a booking flow.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">5. Sharing and international transfers</h2>
            <p className="mt-2">We do not sell, rent or monetise personal data. Data may be shared only with trusted service providers needed to operate a requested service, or with authorities where legally required. If data is transferred outside the EEA, we use appropriate safeguards such as contractual protections and encryption where applicable.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">6. Retention</h2>
            <p className="mt-2">General contact information is normally retained for up to 90 days after the enquiry is resolved. Client records may be retained for up to one year after a service ends, unless a longer period is required for legal or tax purposes. Anonymised technical information is kept only as long as needed for operational review, normally no more than 30 days.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">7. Your rights</h2>
            <p className="mt-2">Subject to applicable law, you may request access, correction, erasure, restriction, portability or objection to processing, and withdraw consent where consent is the legal basis. You may contact us at any time using the address above. We aim to respond to access requests within 15 days and will explain any lawful reason for refusing a request.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">8. Security</h2>
            <p className="mt-2">We use proportionate technical and organisational safeguards, including encrypted communication where possible, regular reviews and data-minimisation practices. No internet transmission can be guaranteed to be completely secure.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">9. Third-party links and updates</h2>
            <p className="mt-2">Links to other websites are provided for convenience and are governed by those sites&apos; own privacy policies. We may update this policy when our processing or legal obligations change; the current version will always be published here.</p>
          </section>
        </div>
        <Link href="/" className="mt-8 inline-flex text-sm text-[var(--accent-cyan)] hover:underline">← Back to Delta V</Link>
      </div>
    </main>
  );
}
