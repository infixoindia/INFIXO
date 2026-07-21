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

  <div className={styles.value}>
    <div className={styles.workingHoursBadge}>

      <svg
        className={styles.workingHoursIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 7v5l3 2"/>
      </svg>

      <span className={styles.workingHoursText}>
        9:00 AM – 7:00 PM
      </span>

    </div>
  </div>
</div>

        <div className={styles.row}>
  <div className={styles.label}>Working Shift</div>

  <div className={styles.value}>
    <div className={styles.shiftBadges}>

      <div className={styles.dayBadge}>
        ☀️
        <span>Day</span>
      </div>

      <div className={styles.nightBadge}>
        <svg
  className={styles.moonIcon}
  viewBox="0 0 24 24"
  fill="none"
>
  <path
    d="M15.5 3C13.2 4.2 11.7 6.7 11.7 9.7C11.7 14.1 15.3 17.7 19.7 17.7C20.3 17.7 20.9 17.6 21.4 17.5C20.1 20.1 17.4 22 14.2 22C9.7 22 6 18.3 6 13.8C6 9.7 9 6.2 12.9 5.5C13.7 5.3 14.6 5.2 15.5 3Z"
    fill="white"
  />
</svg>
        <span>Night</span>
      </div>

    </div>
  </div>
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
