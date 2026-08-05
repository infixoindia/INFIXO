import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
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

      {/* 3. Legal Links & Copyright (Divider ke niche) */}
      <div className={styles.legalSection}>
        <div className={styles.legalLinks}>
          <Link href="/privacy-policy" className={styles.link}>
            Privacy Policy
          </Link>
          <span className={styles.dot}>•</span>
          <Link href="/terms-and-conditions" className={styles.link}>
            Terms & Conditions
          </Link>
        </div>
        <p className={styles.copyrightText}>
          © 2026 Infixo. All rights reserved.
        </p>
      </div>

      {/* 4. Bottom Illustration Banner (Gap ke baad) */}
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
