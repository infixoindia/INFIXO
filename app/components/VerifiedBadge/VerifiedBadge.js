import styles from './VerifiedBadge.module.css';

export default function VerifiedBadge() {
  return (
    <span className={styles.badge}>
      <svg className={styles.icon} viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M7.5 10.5L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      Infixo Verified
    </span>
  );
    }
