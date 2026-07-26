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

  <div className={styles.detailsGrid}>

    <div className={styles.detailRow}>
      <div className={styles.label}>Full Name</div>
      <div className={styles.value}>Rahul Sharma</div>
    </div>

    <div className={styles.detailRow}>
      <div className={styles.label}>Gender</div>
      <div className={styles.value}>Male</div>
    </div>

    <div className={styles.detailRow}>
      <div className={styles.label}>Age</div>
      <div className={styles.value}>28 Years</div>
    </div>

    <div className={styles.detailRow}>
      <div className={styles.label}>Address</div>
      <div className={styles.value}>Indore, Madhya Pradesh</div>
    </div>

    <div className={styles.detailRow}>
      <div className={styles.label}>Languages</div>
      <div className={styles.value}>Hindi, English</div>
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
