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
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient id="badgeFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#E9FFFC"/>
      <stop offset="100%" stopColor="#CFF7F2"/>
    </linearGradient>

    <linearGradient id="ribbonLeft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#19B7A4"/>
      <stop offset="100%" stopColor="#0F8E82"/>
    </linearGradient>

    <linearGradient id="ribbonRight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0F8E82"/>
      <stop offset="100%" stopColor="#0A6D66"/>
    </linearGradient>
  </defs>

  <path d="M22 39 L18 58 L30 49 L29 39 Z" fill="url(#ribbonLeft)"/>
  <path d="M42 39 L46 58 L34 49 L35 39 Z" fill="url(#ribbonRight)"/>

  <circle
    cx="32"
    cy="24"
    r="16"
    fill="url(#badgeFill)"
    stroke="#0F8E82"
    strokeWidth="3"
  />

  <circle
    cx="32"
    cy="24"
    r="10.5"
    fill="#FFFFFF"
    stroke="#0F8E82"
    strokeWidth="2"
  />

  <path
    d="M32 16
       L34.4 21
       L40 21.8
       L36 25.6
       L37 31
       L32 28.3
       L27 31
       L28 25.6
       L24 21.8
       L29.6 21
       Z"
    fill="#0F8E82"
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
