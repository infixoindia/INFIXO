import Link from 'next/link';
import styles from './verification-policy.module.css';

export const metadata = {
  title: 'Verification Policy | Infixo',
  description: 'Learn how Infixo verifies worker profiles for trust and safety.',
};

export default function VerificationPolicyPage() {
  return (
    <div className={styles.mainWrapper}>
      <div className={styles.breadCrumb}>
        <Link href="/" className={styles.backLink}>← Home</Link>
        <span className={styles.breadSeparator}>/</span>
        <span className={styles.currentBread}>Verification Policy</span>
      </div>

      <h1 className={styles.pageTitle}>Verification Policy</h1>
      <p className={styles.lastUpdated}>Last Updated: 2026</p>

      <div className={styles.contentBody}>
        <p className={styles.introText}>
          At Infixo, trust and safety are our highest priorities. Our Verification Policy outlines the standards and checks required for worker profiles on our platform.
        </p>

        <section className={styles.policySection}>
          <h2 className={styles.sectionTitle}>1. Identity Verification</h2>
          <p>
            All workers listed as verified undergo identity verification using government-issued identification cards (Aadhaar / PAN / Driving License) to ensure authenticity.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2 className={styles.sectionTitle}>2. Skill & Work Background Check</h2>
          <p>
            We review work history, customer feedback, and past project photos/videos provided by workers to ensure service quality and reliability.
          </p>
        </section>

        <section className={styles.policySection}>
          <h2 className={styles.sectionTitle}>3. Verified Badge Protocol</h2>
          <p>
            Profiles displaying the "VERIFIED BY INFIXO" badge have successfully completed all required safety and background verification steps.
          </p>
        </section>

        <div className={styles.contactFooter}>
          <p>Have questions about worker verification? Email us at verification@infixo.in</p>
        </div>
      </div>
    </div>
  );
}
