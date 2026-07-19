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
      <span>🖌️</span>
      <span>Painter</span>
    </div>
  </div>
</div>
    
        <div className={styles.row}>
  <div className={styles.label}>Services</div>

  <div className={styles.value}>
    <div className={styles.serviceChip}>
    <span className={styles.tick}>✓</span>
    <span className={styles.serviceText}>Putty Work</span>
</div>

<div className={styles.serviceChip}>
    <span className={styles.tick}>✓</span>
    <span className={styles.serviceText}>Texture Finish</span>
</div>

<div className={styles.serviceChip}>
    <span className={styles.tick}>✓</span>
    <span className={styles.serviceText}>Waterproofing</span>
</div>

<div className={styles.serviceChip}>
    <span className={styles.tick}>✓</span>
    <span className={styles.serviceText}>Interior Paints</span>
</div>
    
 </div>
</div>

        <div className={styles.row}>
  <div className={styles.label}>Experience</div>

  <div className={styles.value}>
    <div 
    className={styles.experienceBadge}>
     <svg
  className={styles.expIcon}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <circle cx="12" cy="8" r="5" />
  <path d="M9 12.5L7.5 21l4.5-2.7 4.5 2.7-1.5-8.5" />
</svg>
    
<span>
    8+ Years of experience <br />
    in painting work
  </span>
</div>
</div> 
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
