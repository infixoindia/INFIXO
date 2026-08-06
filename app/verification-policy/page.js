import Link from 'next/link';
import styles from './verification-policy.module.css';

export const metadata = {
  title: 'Verification Policy | Infixo',
  description: 'Official Verification Policy and Badge Breakdown for Infixo platform',
};

export default function VerificationPolicyPage() {
  return (
    <div className={styles.mainWrapper}>
      <div className={styles.container}>
        {/* Navigation Breadcrumb */}
        <div className={styles.breadCrumb}>
          <Link href="/" className={styles.backLink}>
            ← Home
          </Link>
          <span className={styles.breadSeparator}>/</span>
          <span className={styles.currentBread}>Verification Policy</span>
        </div>

        {/* Page Title & Subtitle */}
        <h1 className={styles.pageTitle}>Verification Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: 3 August 2026</p>

        {/* Content Sections */}
        <div className={styles.contentBody}>
          {/* Introduction */}
          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Introduction</h2>
            <p>
              Infixo is committed to building a trusted, transparent, and safe ecosystem for connecting skilled workers with customers. This Verification Policy explains the exact framework, methodology, and limitations behind the verification badges displayed on worker profiles across the Infixo platform[span_3](start_span)[span_3](end_span).
            </p>
          </section>

          {/* BADGE 1: Identity Verified */}
          <section id="identity-verified" className={`${styles.policySection} ${styles.badgeCard}`}>
            <div className={styles.badgeHeader}>
              <h2 className={styles.badgeTitle}>Identity Verified Badge</h2>
            </div>
            
            <p>
              The <strong>Identity Verified</strong> badge confirms that the worker has submitted valid government-issued identification documents to confirm their official name and basic identity details[span_4](start_span)[span_4](end_span).
            </p>

            <div className={styles.subBlock}>
              <h3 className={styles.subTitle}>✅ What Infixo Verifies</h3>
              <ul className={styles.list}>
                <li>Submitted government identity documents (such as ID cards, driver’s licenses, or official credentials)[span_5](start_span)[span_5](end_span).</li>
                <li>Alignment between the worker’s profile name and their submitted identity document[span_6](start_span)[span_6](end_span).</li>
              </ul>
            </div>

            <div className={styles.disclaimerBox}>
              <h3 className={styles.disclaimerTitle}>⚠️ Important Legal Disclaimer & Limitations</h3>
              <ul className={styles.list}>
                <li>Infixo does <strong>NOT</strong> perform criminal background verification or record checks[span_7](start_span)[span_7](end_span).</li>
                <li>Infixo does <strong>NOT</strong> verify police records or law enforcement filings[span_8](start_span)[span_8](end_span).</li>
                <li>Infixo does <strong>NOT</strong> guarantee or monitor worker behavior or interpersonal conduct[span_9](start_span)[span_9](end_span).</li>
                <li>Infixo does <strong>NOT</strong> guarantee worker moral character or integrity[span_10](start_span)[span_10](end_span).</li>
                <li>Infixo only verifies the authenticity of submitted identity documents provided directly by the worker[span_11](start_span)[span_11](end_span).</li>
              </ul>
            </div>
          </section>

          {/* BADGE 2: Address Verified */}
          <section id="address-verified" className={`${styles.policySection} ${styles.badgeCard}`}>
            <div className={styles.badgeHeader}>
              <h2 className={styles.badgeTitle}>Address Verified Badge</h2>
            </div>

            <p>
              The <strong>Address Verified</strong> badge signifies that the worker has provided valid address proof establishing their active operating region or residential locality[span_12](start_span)[span_12](end_span).
            </p>

            <div className={styles.subBlock}>
              <h3 className={styles.subTitle}>✅ What Infixo Verifies</h3>
              <ul className={styles.list}>
                <li>Submitted address documentation (such as utility bills, government identity addresses, or local proof)[span_13](start_span)[span_13](end_span).</li>
                <li>Primary service area locality declared on the worker profile[span_14](start_span)[span_14](end_span).</li>
              </ul>
            </div>

            <div className={styles.disclaimerBox}>
              <h3 className={styles.disclaimerTitle}>⚠️ Important Legal Disclaimer & Limitations</h3>
              <ul className={styles.list}>
                <li>Infixo has <strong>NOT</strong> physically visited or audited the worker’s physical address[span_15](start_span)[span_15](end_span).</li>
                <li>Address verification is entirely document-based and remotely validated[span_16](start_span)[span_16](end_span).</li>
                <li>Future versions of Infixo may introduce physical on-site or field address verification[span_17](start_span)[span_17](end_span).</li>
                <li>This badge does <strong>NOT</strong> guarantee worker physical availability, residence stability, or authenticity beyond submitted paperwork[span_18](start_span)[span_18](end_span).</li>
              </ul>
            </div>
          </section>

          {/* BADGE 3: Skill & Work Verified */}
          <section id="work-verified" className={`${styles.policySection} ${styles.badgeCard}`}>
            <div className={styles.badgeHeader}>
              <h2 className={styles.badgeTitle}>Skill & Work Verified Badge</h2>
            </div>

            <p>
              The <strong>Skill & Work Verified</strong> badge indicates that the worker has provided verifiable proof of their ongoing trade expertise, completed projects, and technical experience[span_19](start_span)[span_19](end_span).
            </p>

            <div className={styles.subBlock}>
              <h3 className={styles.subTitle}>✅ What Infixo Verifies</h3>
              <ul className={styles.list}>
                <li>Review of worker-uploaded work photos showing active or completed projects[span_20](start_span)[span_20](end_span).</li>
                <li>Review of work videos highlighting skill execution[span_21](start_span)[span_21](end_span).</li>
                <li>Stated years of experience and declared trade specializations[span_22](start_span)[span_22](end_span).</li>
                <li>Basic proof of trade practice submitted during onboarding[span_23](start_span)[span_23](end_span).</li>
              </ul>
            </div>

            <div className={styles.disclaimerBox}>
              <h3 className={styles.disclaimerTitle}>⚠️ Important Legal Disclaimer & Limitations</h3>
              <ul className={styles.list}>
                <li>Infixo has <strong>NOT</strong> visited the worker’s physical worksite or job site[span_24](start_span)[span_24](end_span).</li>
                <li>Infixo has <strong>NOT</strong> inspected or tested every completed project in person[span_25](start_span)[span_25](end_span).</li>
                <li>Work verification is strictly based on submitted media and self-reported information[span_26](start_span)[span_26](end_span).</li>
                <li>Infixo does <strong>NOT</strong> guarantee future work quality, project timelines, or workmanship[span_27](start_span)[span_27](end_span).</li>
                <li>Infixo does <strong>NOT</strong> guarantee overall customer satisfaction or outcome[span_28](start_span)[span_28](end_span).</li>
              </ul>
            </div>
          </section>

          {/* How Infixo Verification Works */}
          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>How Infixo Verification Works</h2>
            <p>Our verification process is structured into four sequential steps[span_29](start_span)[span_29](end_span):</p>
            <ol className={styles.orderedList}>
              <li>
                <strong>Document Submission:</strong> Workers upload official identity, address proof, work photos, and trade history via the Infixo platform[span_30](start_span)[span_30](end_span).
              </li>
              <li>
                <strong>Review & Audit:</strong> Our verification team reviews the submitted records for legibility, consistency, and alignment with profile details[span_31](start_span)[span_31](end_span).
              </li>
              <li>
                <strong>Badge Assignment:</strong> Profiles meeting verification criteria are assigned specific verification badges visible to potential customers[span_32](start_span)[span_32](end_span).
              </li>
              <li>
                <strong>Verification Status Updates:</strong> Badges may remain active based on user feedback, updated information, and compliance with Infixo verification guidelines[span_33](start_span)[span_33](end_span).
              </li>
            </ol>
          </section>

          {/* Badge Removal Policy */}
          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Badge Removal Policy</h2>
            <p>
              Verification is a privilege, not a permanent guarantee. Infixo maintains a zero-tolerance policy for misrepresentation. Verification badges will be immediately revoked and accounts subject to suspension under the following conditions[span_34](start_span)[span_34](end_span):
            </p>
            <ul className={styles.list}>
              <li>Submission of fake, forged, or altered identity documents[span_35](start_span)[span_35](end_span).</li>
              <li>Provision of fraudulent or invalid address information[span_36](start_span)[span_36](end_span).</li>
              <li>Uploading plagiarized, stock, or fake work photos and videos[span_37](start_span)[span_37](end_span).</li>
              <li>Providing misleading experience history or false trade qualifications[span_38](start_span)[span_38](end_span).</li>
              <li>Any attempt to game, bypass, or abuse the Infixo verification process[span_39](start_span)[span_39](end_span).</li>
            </ul>
          </section>

          {/* Verification Disclaimer */}
          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Verification Disclaimer</h2>
            <p>
              Infixo functions solely as an independent verification and connection platform. While verification badges significantly improve platform trust and transparency, customers are always advised to exercise their own personal judgment and due diligence before hiring or engaging any worker[span_40](start_span)[span_40](end_span).
            </p>
            <p>
              Verification is <strong>NOT</strong> a guarantee, warranty, or insurance policy covering work quality, worker behavior, project pricing, physical safety, future performance, or overall customer satisfaction[span_41](start_span)[span_41](end_span).
            </p>
            <p>
              Verification badges are intended to increase transparency and help customers make informed decisions. They should not be interpreted as a guarantee, certification, endorsement, warranty, or promise of future work quality[span_42](start_span)[span_42](end_span).
            </p>
          </section>

          {/* Contact Us */}
          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            <p>If you have any questions regarding our verification procedures or badge status, please contact us[span_43](start_span)[span_43](end_span):</p>
            <div className={styles.contactCard}>
              <p><strong>Email:</strong> Will be available soon</p>
              <p><strong>Website:</strong> Will be available soon</p>
            </div>
          </section>

          {/* Consent Banner Footer */}
          <div className={styles.consentFooter}>
            <p>By accessing or using Infixo, you acknowledge that you have read, understood, and agreed to this Verification Policy[span_44](start_span)[span_44](end_span).</p>
          </div>
        </div>
      </div>
    </div>
  );
}
