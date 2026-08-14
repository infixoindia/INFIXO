import Link from 'next/link';
import styles from './privacy-policy.module.css';

export const metadata = {
  title: 'Privacy Policy | Infixo',
  description: 'Privacy Policy for Infixo worker verification platform',
};

export default async function PrivacyPolicyPage({ searchParams }) {
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
          <span className={styles.currentBread}>Privacy Policy</span>
        </div>

        {/* Page Title & Subtitle */}
        <h1 className={styles.pageTitle}>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: 3 August 2026</p>

        {/* Content Sections */}
        <div className={styles.contentBody}>
          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Introduction</h2>
            <p>
              Infixo is a platform designed to connect verified skilled workers with customers seeking reliable services. Your privacy is extremely important to us. This Privacy Policy explains how we collect, use, and protect your information when you access or use Infixo.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Information We Collect</h2>
            <p>To build a transparent and trusted community, we collect necessary profile and identification details, including:</p>
            <ul className={styles.list}>
              <li><strong>Worker Name:</strong> Your full name for identification.</li>
              <li><strong>Profession:</strong> Details about your work specialty or trade.</li>
              <li><strong>Address & Service Area:</strong> Location details to match local service requests.</li>
              <li><strong>Phone Number:</strong> For account authentication and customer communication.</li>
              <li><strong>Work Photos & Videos:</strong> Portfolios and media uploaded to show past work quality.</li>
              <li><strong>Languages:</strong> Languages you speak for better customer communication.</li>
              <li><strong>Experience:</strong> Total years or history of professional work.</li>
              <li><strong>Verification Documents:</strong> Government IDs or licenses (only if submitted for account verification). These documents are used only for verification purposes and are never displayed publicly or shared with customers.</li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>How We Use Information</h2>
            <p>We use the collected information solely to facilitate platform operations and build trust between users:</p>
            <ul className={styles.list}>
              <li>Display public worker profiles to potential customers.</li>
              <li>Connect customers directly with verified local workers.</li>
              <li>Improve platform performance, design, and overall user experience.</li>
              <li>Prevent fraud, spam, or unauthorized profile creation.</li>
              <li>Provide efficient customer support and resolve user queries.</li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Information Sharing</h2>
            <p>We respect user confidentiality and adhere to strict sharing policies:</p>
            <ul className={styles.list}>
              <li>We never sell or rent your personal data to third-party advertisers.</li>
              <li>Worker phone numbers are shared only according to defined platform rules when connection requests are initiated.</li>
              <li>Customer personal information is never shared with workers unless required for providing the requested service.</li>
              <li>Data may be disclosed only if required by applicable legal regulations, law enforcement agencies, or court orders.</li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Worker Responsibilities</h2>
            <p>
              Workers using Infixo are required to provide complete, accurate, and truthful information regarding their identity and work history. Providing fake credentials, misleading images, or false experience details will lead to immediate profile removal from the platform.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Customer Responsibilities</h2>
            <p>
              Customers interacting with workers through Infixo agree to contact workers professionally and respectfully. Contact information obtained via Infixo must not be misused, spammed, or shared without permission.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Data Security</h2>
            <p>
              We implement reasonable administrative and technical security measures to protect your personal information against unauthorized access or disclosure. However, please note that no internet-based transmission or electronic storage method is 100% secure.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Cookies</h2>
            <p>
              Infixo may use cookies and similar tracking technologies to store user preferences, remember login sessions, and optimize mobile browsing experiences.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Third Party Services</h2>
            <p>
              We may utilize trusted third-party service providers for website hosting, analytics, and secure payment processing. These providers access data only as necessary to perform specific platform tasks on our behalf.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Your Rights</h2>
            <p>Users have the following rights regarding their personal information:</p>
            <ul className={styles.list}>
              <li>Request correction of incorrect profile information.</li>
              <li>Request deletion of their account and associated personal data.</li>
              <li>Contact Infixo support for any privacy-related concerns or questions.</li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Changes to Privacy Policy</h2>
            <p>
              We reserve the right to update or modify this Privacy Policy at any time. Any changes will be posted on this page with an updated "Last Updated" date. Users are encouraged to review this page periodically.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            <p>If you have any questions or concerns regarding this Privacy Policy, please reach out to us:</p>
            <div className={styles.contactCard}>
              <p><strong>Email:</strong> Will be available soon</p>
              <p><strong>Website:</strong> Will be available soon</p>
            </div>
          </section>

          {/* Consent Banner Footer */}
          <div className={styles.consentFooter}>
            <p>By accessing or using Infixo, you acknowledge that you have read, understood, and agreed to this Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
