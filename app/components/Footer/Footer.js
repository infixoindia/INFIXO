import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer({ slug }) {
  const withFrom = (href) => (slug ? `${href}?from=${slug}` : href);

  return (
    <footer className={styles.footerContainer}>
      {/* 1. Tagline */}
      <div className={styles.taglineSection}>
        <h2 className={styles.taglineText}>
          Verified Workers.<br />
          Trusted Connections.
        </h2>
      </div>

      {/* 2. Thin Divider Line */}
      <div className={styles.divider} />

      {/* 3. Legal Links (Stacked Layout) & Copyright */}
      <div className={styles.legalSection}>
        {/* Row 1: Privacy Policy & Terms */}
        <div className={styles.legalRow}>
          <Link href={withFrom("/privacy-policy")} className={styles.link}>
            Privacy Policy
          </Link>
          <span className={styles.dot}>•</span>
          <Link href={withFrom("/terms-and-conditions")} className={styles.link}>
            Terms & Conditions
          </Link>
        </div>

        {/* Row 2: Verification Policy (Indono ke niche) */}
        <div className={styles.legalRow}>
          <Link href={withFrom("/verification-policy")} className={styles.link}>
            Verification Policy
          </Link>
        </div>

        {/* Row 3: Copyright Text */}
        <p className={styles.copyrightText}>
          © 2026 Infixo. All rights reserved.
        </p>
      </div>

      {/* 4. Bottom Illustration Banner */}
      <div className={styles.imageWrapper}>
        <Image
          src="/images/footer-img.webp"
          alt="Workers Connections Banner"
          width={1200}
          height={600}
          priority={false}
          className={styles.footerImage}
        />
      </div>
    </footer>
  );
}
