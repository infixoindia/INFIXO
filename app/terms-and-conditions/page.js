import Link from 'next/link';
import styles from './terms-and-conditions.module.css';

export const metadata = {
  title: 'Terms & Conditions | Infixo',
  description: 'Terms and Conditions for Infixo platform',
};

export default function TermsAndConditionsPage() {
  return (
    <div className={styles.mainWrapper}>
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.breadCrumb}>
            <Link href="/" className={styles.backLink}>Home</Link>
            <span className={styles.breadSeparator}>/</span>
            <span className={styles.currentBread}>Terms & Conditions</span>
          </div>
          <h1 className={styles.pageTitle}>Terms & Conditions</h1>
          <p className={styles.lastUpdated}>Last Updated: 2026</p>
        </div>
      </header>

      <main className={styles.contentContainer}>
        <div className={styles.contentBody}>
          <p className={styles.introText}>
            By accessing or using Infixo, you agree to be bound by these Terms and Conditions.
          </p>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>1. Terms of Use</h2>
            <p>Users must provide accurate information and maintain the security of their account credentials.</p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>2. Service Agreement</h2>
            <p>Infixo provides a platform connecting workers and customers. All interactions must strictly adhere to community guidelines.</p>
          </section>

          <div className={styles.contactFooter}>
            <p>Questions? Contact us at legal@infixo.in</p>
          </div>
        </div>
      </main>
    </div>
  );
}

