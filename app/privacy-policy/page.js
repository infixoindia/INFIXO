import Link from 'next/link';
import styles from './privacy-policy.module.css';

export const metadata = {
  title: 'Privacy Policy | Infixo',
  description: 'Privacy Policy for Infixo platform',
};

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.mainWrapper}>
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.breadCrumb}>
            <Link href="/" className={styles.backLink}>Home</Link>
            <span className={styles.breadSeparator}>/</span>
            <span className={styles.currentBread}>Privacy Policy</span>
          </div>
          <h1 className={styles.pageTitle}>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last Updated: 2026</p>
        </div>
      </header>

      <main className={styles.contentContainer}>
        <div className={styles.contentBody}>
          <p className={styles.introText}>
            Welcome to Infixo. We are committed to protecting your personal information and your right to privacy.
          </p>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>1. Information We Collect</h2>
            <p>We collect information you provide directly to us when using our services, including name, contact details, and account preferences.</p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>2. How We Use Information</h2>
            <p>Your data is used to provide, improve, and secure Infixo services and facilitate connections between workers and clients.</p>
          </section>

          <div className={styles.contactFooter}>
            <p>Questions? Contact us at support@infixo.in</p>
          </div>
        </div>
      </main>
    </div>
  );
}
