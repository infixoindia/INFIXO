import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerContainer}>
      {/* 1. Blinkit Style Left-Aligned Tagline */}
      <div className={styles.taglineSection}>
        <h2 className={styles.taglineText}>
          Verified Workers<br />
          Trusted Connections.
        </h2>
      </div>

      {/* 2. Thin Divider Line */}
      <div className={styles.divider} />

      {/* 3. Bottom Illustration Banner */}
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
