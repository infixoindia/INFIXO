import styles from "./WorkerDetails.module.css";

export default function WorkerDetails() {
  return (
    <section className={styles.wrapper}>

      <div className={styles.header}>
        <h2>Worker Details</h2>
        <p>Everything about the worker.</p>
      </div>

      {/* Professional Details */}
      <div className={styles.card}>
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
