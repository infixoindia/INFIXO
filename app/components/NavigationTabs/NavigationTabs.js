import Link from "next/link";
import styles from './NavigationTabs.module.css';

export default function NavigationTabs() {
  return (
    <div className={styles.grid}>

      <Link href="/work-details" className={`${styles.card} ${styles.blue}`}>
  ...
</Link>

      <button className={`${styles.card} ${styles.orange}`}>
        Worker Details
      </button>

      <button className={`${styles.card} ${styles.green}`}>
        Work Photos
      </button>

      <button className={`${styles.card} ${styles.purple}`}>
        Work Videos
      </button>

    </div>
  );
}
