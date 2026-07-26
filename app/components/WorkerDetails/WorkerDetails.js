import Link from "next/link";
import styles from "./WorkerDetails.module.css";

export default function WorkerDetails() {
  return (
    <section className={styles.wrapper}>

      <div className={styles.header}>
       <Link href="/" className={styles.backLink}>
  <svg
    className={styles.backArrow}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M15 5L8 12L15 19"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</Link>
        
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
</div>

      <div className={styles.card}>

  <div className={styles.cardHeader}>
    <h3>About Me</h3>
    <p>A short introduction about the worker.</p>
  </div>

  <div className={styles.aboutBody}>

    <p>
      Rahul Sharma is a dedicated and reliable professional known for delivering clean and high-quality painting work.
    </p>

    <p>
      He pays close attention to every detail and ensures every project is completed with care and a premium finish.
    </p>

    <p>
      His goal is to provide a smooth experience through honest communication, timely service, and customer satisfaction.
    </p>

  </div>

</div>


<div className={styles.verificationSection}>

  <div className={styles.verificationHeader}>
    <h3>Infixo Verification</h3>
    <p>Verified details to build trust.</p>
  </div>

<div className={styles.verifyBadge}>
  <div className={styles.verifyIcon}>
    ✓
  </div>

  <span>Worker Verified</span>
</div>

</div>

</div>

    </section>
  );
}
