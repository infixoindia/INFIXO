import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerContainer}>
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

      {/* Step 2: Tagline Section */}
      <div className={styles.taglineWrapper}>
        <h2 className={styles.taglineText}>
          Verified Workers<br />
          Trusted Connections.
        </h2>
      </div>
    </footer>
  );
}
