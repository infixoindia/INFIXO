import Link from 'next/link';
import styles from './verification-policy.module.css';

export const metadata = {
  title: 'Verification Policy | Infixo',
  description: 'Official Verification Policy and Badge Breakdown for Infixo platform',
};

export default async function VerificationPolicyPage({ searchParams }) {
  const params = await searchParams;
  const homeHref = params?.from ? `/w/${params.from}` : "/";
  return (
    <div className={styles.mainWrapper}>
      <div className={styles.container}>
        <div className={styles.breadCrumb}>
          <Link href={homeHref} className={styles.backLink}>← Home</Link>
          <span className={styles.breadSeparator}>/</span>
          <span className={styles.currentBread}>Verification Policy</span>
        </div>

        <h1 className={styles.pageTitle}>Verification Policy</h1>
        <p className={styles.lastUpdated}>Last Updated: 3 August 2026</p>

        <div className={styles.contentBody}>
          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Introduction</h2>
            <p>
              Infixo is committed to building a trusted, transparent, and safe ecosystem for connecting skilled workers with customers. This Verification Policy explains the exact framework, methodology, and limitations behind the verification badges displayed on worker profiles across the Infixo platform.
            </p>
          </section>

          <section id="identity-verified" className={`${styles.policySection} ${styles.badgeCard}`}>
            <div className={styles.badgeHeader}>
              <h2 className={styles.badgeTitle}>Identity Verified Badge</h2>
            </div>
            
            <p>
              The <strong>Identity Verified</strong> badge confirms that the worker has submitted valid government-issued identification documents to confirm their official name and basic identity details.
            </p>

            <div className={styles.subBlock}>
              <h3 className={styles.subTitle}>✅ What Infixo Verifies</h3>
              <ul className={styles.list}>
                <li>Submitted government identity documents (such as ID cards, driver’s licenses, or official credentials).</li>
                <li>Alignment between the worker’s profile name and their submitted identity document.</li>
              </ul>
            </div>

            <div className={styles.disclaimerBox}>
              <h3 className={styles.disclaimerTitle}>⚠️ Important Legal Disclaimer & Limitations</h3>
              <ul className={styles.list}>
                <li>Infixo does <strong>NOT</strong> perform criminal background verification or record checks.</li>
                <li>Infixo does <strong>NOT</strong> verify police records or law enforcement filings.</li>
                <li>Infixo does <strong>NOT</strong> guarantee or monitor worker behavior or interpersonal conduct.</li>
                <li>Infixo does <strong>NOT</strong> guarantee worker moral character or integrity.</li>
                <li>Infixo only verifies the authenticity of submitted identity documents provided directly by the worker.</li>
              </ul>
            </div>
          </section>

          <section id="address-verified" className={`${styles.policySection} ${styles.badgeCard}`}>
            <div className={styles.badgeHeader}>
              <h2 className={styles.badgeTitle}>Address Verified Badge</h2>
            </div>

            <p>
              The <strong>Address Verified</strong> badge signifies that the worker has provided valid address proof establishing their active operating region or residential locality.
            </p>

            <div className={styles.subBlock}>
              <h3 className={styles.subTitle}>✅ What Infixo Verifies</h3>
              <ul className={styles.list}>
                <li>Submitted address documentation (such as utility bills, government identity addresses, or local proof).</li>
                <li>Primary service area locality declared on the worker profile.</li>
              </ul>
            </div>

            <div className={styles.disclaimerBox}>
              <h3 className={styles.disclaimerTitle}>⚠️ Important Legal Disclaimer & Limitations</h3>
              <ul className={styles.list}>
                <li>Infixo has <strong>NOT</strong> physically visited or audited the worker’s physical address.</li>
                <li>Address verification is entirely document-based and remotely validated.</li>
                <li>Future versions of Infixo may introduce physical on-site or field address verification.</li>
                <li>This badge does <strong>NOT</strong> guarantee worker physical availability, residence stability, or authenticity beyond submitted paperwork.</li>
              </ul>
            </div>
          </section>

          <section id="work-verified" className={`${styles.policySection} ${styles.badgeCard}`}>
            <div className={styles.badgeHeader}>
              <h2 className={styles.badgeTitle}>Skill & Work Verified Badge</h2>
            </div>

            <p>
              The <strong>Skill & Work Verified</strong> badge indicates that the worker has provided verifiable proof of their ongoing trade expertise, completed projects, and technical experience.
            </p>

            <div className={styles.subBlock}>
              <h3 className={styles.subTitle}>✅ What Infixo Verifies</h3>
              <ul className={styles.list}>
                <li>Review of worker-uploaded work photos showing active or completed projects.</li>
                <li>Review of work videos highlighting skill execution.</li>
                <li>Stated years of experience and declared trade specializations.</li>
                <li>Basic proof of trade practice submitted during onboarding.</li>
              </ul>
            </div>

            <div className={styles.disclaimerBox}>
              <h3 className={styles.disclaimerTitle}>⚠️ Important Legal Disclaimer & Limitations</h3>
              <ul className={styles.list}>
                <li>Infixo has <strong>NOT</strong> visited the worker’s physical worksite or job site.</li>
                <li>Infixo has <strong>NOT</strong> inspected or tested every completed project in person.</li>
                <li>Work verification is strictly based on submitted media and self-reported information.</li>
                <li>Infixo does <strong>NOT</strong> guarantee future work quality, project timelines, or workmanship.</li>
                <li>Infixo does <strong>NOT</strong> guarantee overall customer satisfaction or outcome.</li>
              </ul>
            </div>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>How Infixo Verification Works</h2>
            <p>Our verification process is structured into four sequential steps:</p>
            <ol className={styles.orderedList}>
              <li><strong>Document Submission:</strong> Workers upload official identity, address proof, work photos, and trade history via the Infixo platform.</li>
              <li><strong>Review & Audit:</strong> Our verification team reviews the submitted records for legibility, consistency, and alignment with profile details.</li>
              <li><strong>Badge Assignment:</strong> Profiles meeting verification criteria are assigned specific verification badges visible to potential customers.</li>
              <li><strong>Verification Status Updates:</strong> Badges may remain active based on user feedback, updated information, and compliance with Infixo verification guidelines.</li>
            </ol>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Badge Removal Policy</h2>
            <p>
              Verification is a privilege, not a permanent guarantee. Infixo maintains a zero-tolerance policy for misrepresentation. Verification badges will be immediately revoked and accounts subject to suspension under the following conditions:
            </p>
            <ul className={styles.list}>
              <li>Submission of fake, forged, or altered identity documents.</li>
              <li>Provision of fraudulent or invalid address information.</li>
              <li>Uploading plagiarized, stock, or fake work photos and videos.</li>
              <li>Providing misleading experience history or false trade qualifications.</li>
              <li>Any attempt to game, bypass, or abuse the Infixo verification process.</li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Verification Disclaimer</h2>
            <p>
              Infixo functions solely as an independent verification and connection platform. While verification badges significantly improve platform trust and transparency, customers are always advised to exercise their own personal judgment and due diligence before hiring or engaging any worker.
            </p>
            <p>
              Verification is <strong>NOT</strong> a guarantee, warranty, or insurance policy covering work quality, worker behavior, project pricing, physical safety, future performance, or overall customer satisfaction.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2 className={styles.sectionTitle}>Contact Us</h2>
            <p>If you have any questions regarding our verification procedures or badge status, please contact us:</p>
            <div className={styles.contactCard}>
              <p><strong>Email:</strong> Will be available soon</p>
              <p><strong>Website:</strong> Will be available soon</p>
            </div>
          </section>

          <div className={styles.consentFooter}>
            <p>By accessing or using Infixo, you acknowledge that you have read, understood, and agreed to this Verification Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
