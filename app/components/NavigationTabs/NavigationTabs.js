import Link from "next/link";
import styles from './NavigationTabs.module.css';

export default function NavigationTabs() {
  return (
    <div className={styles.grid}>

      <Link href="/work-details" className={`${styles.card} ${styles.blue}`}>
  Work Details
</Link>

<Link href="/worker-details" className={`${styles.card} ${styles.orange}`}>
  Worker Details
</Link>

      <Link
  href="/work-photos"
  className={`${styles.card} ${styles.green}`}
>
  Work Photos
</Link>

      <button className={`${styles.card} ${styles.purple}`}>
        Work Videos
      </button>

    </div>
  );
}
