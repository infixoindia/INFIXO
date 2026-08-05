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
    </footer>
  );
}
