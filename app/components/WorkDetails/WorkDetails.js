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
  viewBox="0 0 64 64"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  {/* Medal circle */}
  <circle
    cx="32"
    cy="25"
    r="18"
    fill="#E8FFFB"
    stroke="#0F9D8C"
    strokeWidth="3"
  />

  {/* Inner badge */}
  <circle
    cx="32"
    cy="25"
    r="12"
    fill="#FFFFFF"
    stroke="#0F9D8C"
    strokeWidth="2"
  />

  {/* Star */}
  <path
    d="M32 16L34.8 21.8L41 22.7L36.5 27L37.6 33L32 30.1L26.4 33L27.5 27L23 22.7L29.2 21.8L32 16Z"
    fill="#0F9D8C"
  />

  {/* Ribbon left */}
  <path
    d="M22 39L18 57L32 49L28 39H22Z"
    fill="#14B8A6"
  />

  {/* Ribbon right */}
  <path
    d="M42 39L46 57L32 49L36 39H42Z"
    fill="#0F766E"
  />
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
