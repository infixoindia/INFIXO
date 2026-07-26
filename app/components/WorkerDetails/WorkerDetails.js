import styles from "./WorkerDetails.module.css";

export default function WorkerDetails() {
  return (
    <section className={styles.wrapper}>

      <div className={styles.header}>
        <h2>Worker Details</h2>
        <p>Everything about the worker.</p>
      </div>

      <div className={styles.card}>

  <div className={styles.cardHeader}>
    <h3>Professional Details</h3>
    <p>Basic information about the worker</p>
  </div>

  <div className={styles.detailsBody}>

  <div className={styles.detailRow}>
    <div className={styles.label}>Full Name</div>
    <div className={styles.value}>
      <span className={styles.detailText}>Rahul Sharma</span>
    </div>
  </div>

  <div className={styles.detailRow}>
    <div className={styles.label}>Gender</div>
    <div className={styles.value}>
      <span className={styles.detailText}>Male</span>
    </div>
  </div>

  <div className={styles.detailRow}>
    <div className={styles.label}>Age</div>
    <div className={styles.value}>
      <span className={styles.detailText}>28 Years</span>
    </div>
  </div>

  <div className={styles.detailRow}>
    <div className={styles.label}>Address</div>
    <div className={styles.value}>
      <span className={styles.detailText}>Indore, Madhya Pradesh</span>
    </div>
  </div>

  <div className={styles.detailRow}>
    <div className={styles.label}>Languages</div>
    <div className={styles.value}>
      <span className={styles.detailText}>Hindi, English</span>
    </div>
  </div>

</div>

      {/* About Me */}
      <div className={styles.card}>
      </div>

      {/* Infixo Verification */}
      <div className={styles.card}>
      </div>

    </section>
  );
}
