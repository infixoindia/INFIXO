import Link from 'next/link';
import styles from './terms-and-conditions.module.css';

export const metadata = {
  title: 'Terms & Conditions | Infixo',
  description: 'Terms and Conditions for Infixo worker verification platform',
};

export default async function TermsAndConditionsPage({ searchParams }) {
  const params = await searchParams;
  const homeHref = params?.from ? `/w/${params.from}` : "/";
  return (
    <div className={styles.mainWrapper}>
      <div className={styles.container}>
        {/* Navigation Breadcrumb */}
        <div className={styles.breadCrumb}>
          <Link href={homeHref} className={styles.backLink}>
            ← Home
          </Link>
          <span className={styles.breadSeparator}>/</span>
          <span className={styles.currentBread}>Terms & Conditions</span>
        </div>

        {/* Page Title & Subtitle */}
        <h1 className={styles.pageTitle}>Terms & Conditions</h1>
        <p className={styles.lastUpdated}>Last Updated: 3 August 2026</p>

        {/* Content Sections */}
        <div className={styles.contentBody}>
          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>1. Introduction</h2>
            <p>
              Welcome to Infixo. Infixo operates a platform designed to connect verified skilled workers with customers in need of local services. These Terms & Conditions govern your access to and use of our platform, services, and applications.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>2. Acceptance of Terms</h2>
            <p>
              By visiting, browsing, registering, or using any part of Infixo, you enter into a legally binding agreement to follow and be bound by these Terms & Conditions. If you do not agree with any part of these terms, you must refrain from using the platform.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>3. User Eligibility</h2>
            <p>
              To use Infixo as either a worker or a customer, you must meet the following basic requirements:
            </p>
            <ul className={styles.list}>
              <li>You must be at least 18 years of age or the legal age of majority in your jurisdiction.</li>
              <li>You must possess the legal authority to enter into a binding agreement.</li>
              <li>All information submitted during profile creation or account setup must be accurate and truthful.</li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>4. Worker Responsibilities</h2>
            <p>Workers listing their services on Infixo agree to uphold professional service standards:</p>
            <ul className={styles.list}>
              <li>Provide accurate personal details, experience, skills, service areas, and work media.</li>
              <li>Maintain appropriate professional conduct and deliver services safely and skillfully.</li>
              <li>Fulfill customer commitments as agreed upon through mutual communication.</li>
              <li>Ensure all submitted portfolios and images reflect genuine, past completed work.</li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>5. Customer Responsibilities</h2>
            <p>Customers using Infixo to discover local skilled professionals agree to:</p>
            <ul className={styles.list}>
              <li>Treat workers with fairness, dignity, and respect during all interactions.</li>
              <li>Use provided worker contact details strictly for inquiring about legitimate work opportunities.</li>
              <li>Clear payments and financial agreements directly with the worker as negotiated.</li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>6. Verification Rules</h2>
            <p>
              Infixo offers profile verification to enhance trust across the community. Submission of government identity documents or licenses is strictly for account verification. The "Verified" status reflects that basic document checks have been completed; however, Infixo does not guarantee or endorse ongoing performance on individual jobs.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>7. Subscription & Payments</h2>
            <p>
              Certain features on Infixo, such as premium profile listings, worker contacts, or specialized platform access, may require fee payments or subscription plans. All charges will be clearly displayed prior to purchase. Fees paid for platform services are non-refundable unless specified otherwise by Infixo.
            </p>
            <p>
              Subscription plans, pricing, and platform fees may change in the future at Infixo's discretion. Users will be notified whenever applicable.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>8. Contact Unlock Policy</h2>
            <p>
              Unlocking worker contact details on Infixo provides direct communication access for potential job bookings. Unlocked contacts are intended strictly for personal or business service inquiries and must not be stored, harvested, or redistributed to third parties.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>9. Prohibited Activities</h2>
            <p>Users are strictly prohibited from engaging in any of the following activities on Infixo:</p>
            <ul className={styles.list}>
              <li>Creating false profiles, uploading fake credentials, or impersonating others.</li>
              <li>Scraping, harvesting, or extracting user data or phone numbers automatically or manually.</li>
              <li>Harassing, threatening, or abusing workers, customers, or platform support team members.</li>
              <li>Using the platform to promote unlawful activities, fraud, or spam services.</li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>10. Account Suspension & Termination</h2>
            <p>
              Infixo reserves the right to suspend, restrict, or permanently terminate any user account or worker listing without prior notice if a breach of these Terms & Conditions occurs, or if fraudulent activity, abuse, or safety risks are detected.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>11. Limitation of Liability</h2>
            <p>
              Infixo functions as a verification and connection platform connecting independent workers with customers. Infixo is not a direct employer, subcontractor, or agent for any listed worker. Infixo shall not be held liable for disputes, physical damages, direct or indirect financial loss, or quality issues arising from direct work arrangements made between users.
            </p>
            <p>
              Customers are solely responsible for evaluating the suitability of a worker before hiring or engaging in any service. Infixo only provides a verified connection platform and does not supervise or guarantee the outcome of any work performed.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>12. Intellectual Property</h2>
            <p>
              All branding, logos, website layout, graphics, interface design, and underlying software code belong exclusively to Infixo. Users retain ownership of their personal portfolio media but grant Infixo a non-exclusive license to display this media to facilitate platform services.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>13. Changes to Terms</h2>
            <p>
              Infixo reserves the right to update or modify these Terms & Conditions at any given time. Updated terms will become effective immediately upon being published on this page with a revised "Last Updated" date. Continued platform usage indicates acceptance of the updated terms.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>14. Contact Us</h2>
            <p>If you have any questions or require clarification regarding these Terms & Conditions, please contact us:</p>
            <div className={styles.contactCard}>
              <p><strong>Email:</strong> Will be available soon</p>
              <p><strong>Website:</strong> Will be available soon</p>
            </div>
          </section>

          {/* Consent Banner Footer */}
          <div className={styles.consentFooter}>
            <p>By accessing or using Infixo, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
