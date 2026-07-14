import styles from "./WorkDetails.module.css";

export default function WorkDetails() {
  return (
    <section className={styles.wrapper}>

      <div className={styles.header}>
        <h2>Work Details</h2>
        <p>Everything about the work.</p>
      </div>

      <div className={styles.card}>

        <div className={styles.row}>
  <div className={styles.label}>Primary Skill</div>

  <div className={styles.value}>
    <div className={styles.primaryBadge}>
      🖌️ Painter
    </div>
  </div>

</div>
    
        <div className={styles.row}>
  <div className={styles.label}>Services Offered</div>

  <div className={styles.value}>
    <div className={styles.serviceChip}>
  <span className={styles.tick}>✓</span>
  Interior Painting
</div>

<div className={styles.serviceChip}>
  <span className={styles.tick}>✓</span>
  Exterior Painting
</div>

<div className={styles.serviceChip}>
  <span className={styles.tick}>✓</span>
  Putty Work
</div>

<div className={styles.serviceChip}>
  <span className={styles.tick}>✓</span>
  Texture Finish
</div>

        <div className={styles.row}>
          <div className={styles.label}>Experience</div>
          <div className={styles.value}>8+ Years</div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>Working Hours</div>
          <div className={styles.value}>9:00 AM – 7:00 PM</div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>Working Shift</div>
          <div className={styles.value}>Day Only</div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>Service Area</div>
          <div className={styles.value}>Indore</div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>Why Choose Me</div>
          <div className={styles.value}>Reasons</div>
        </div>

      </div>

    </section>
  );
}
