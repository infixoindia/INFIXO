import styles from './NavigationTabs.module.css';

export default function NavigationTabs() {
  return (
    <div className={styles.grid}>

      <button className={`${styles.card} ${styles.blue}`}>
        Work Details
      </button>

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
