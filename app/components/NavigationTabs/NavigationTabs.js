import Link from "next/link";
import styles from './NavigationTabs.module.css';

export default function NavigationTabs() {
  return (
    <div className={styles.grid}>

      <Link href="/work-details" className={`${styles.card} ${styles.blue}`}>
        <span className={styles.iconBadge}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M6.5 2.5h7l4 4v14a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1z" stroke="#5C88F5" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M13.5 2.5v4h4" stroke="#5C88F5" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M8.5 13h7M8.5 16.5h7" stroke="#5C88F5" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
        <span className={styles.label}>Work<br />Details</span>
      </Link>

      <Link href="/worker-details" className={`${styles.card} ${styles.orange}`}>
        <span className={styles.iconBadge}>
          <svg viewBox="0 0 24 24" fill="#FF9A3C">
            <circle cx="12" cy="8" r="4" />
            <path d="M4.5 20c0-4.4 3.6-7 7.5-7s7.5 2.6 7.5 7" />
          </svg>
        </span>
        <span className={styles.label}>Worker<br />Details</span>
      </Link>

      <Link href="/work-photos" className={`${styles.card} ${styles.green}`}>
        <span className={styles.iconBadge}>
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="#22C67D" strokeWidth="1.8" />
            <circle cx="8.5" cy="10" r="1.6" fill="#22C67D" />
            <path d="M4.5 17l4.5-4.5 3.5 3.5 3-3 4.5 4.5" stroke="#22C67D" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </span>
        <span className={styles.label}>Work<br />Photos</span>
        <span className={styles.countBadge}>
          15
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="white" strokeWidth="2" />
            <circle cx="8.5" cy="10" r="1.8" fill="white" />
            <path d="M4.5 17l4.5-4.5 3.5 3.5 3-3 4.5 4.5" stroke="white" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </span>
      </Link>

      <Link href="/work-videos" className={`${styles.card} ${styles.purple}`}>
        <span className={styles.iconBadge}>
          <svg viewBox="0 0 24 24" fill="#C86CFF">
            <path d="M9 6.5v11l9-5.5z" />
          </svg>
        </span>
        <span className={styles.label}>Work<br />Videos</span>
        <span className={styles.countBadge}>
          8
          <svg viewBox="0 0 24 24" fill="white">
            <path d="M9 6.5v11l9-5.5z" />
          </svg>
        </span>
      </Link>

    </div>
  );
}
