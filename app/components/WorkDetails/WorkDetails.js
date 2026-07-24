import Link from "next/link";
import styles from "./WorkDetails.module.css";

export default function WorkDetails() {
  return (
    <section className={styles.wrapper}>

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

  <span>Home</span>
</Link>

      <div className={styles.header}>
        <h2>Work Details</h2>
        <p>Everything about the work.</p>
      </div>

      <div className={styles.card}>

        <div className={styles.row}>
  <div className={styles.label}>Primary Skill</div>

  <div className={styles.value}>
   <div className={styles.primaryBadge}>
 <svg
    className={styles.skillIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18.37 2.63L14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3z"/>
    <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 2-2 2-3"/>
  </svg>
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
        <svg
  className={styles.sunIcon}
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <radialGradient id="sunGradient" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stopColor="#FFD95C"/>
      <stop offset="100%" stopColor="#F5A300"/>
    </radialGradient>
  </defs>

  {/* Rays */}
  <g stroke="#F5A300" strokeWidth="2" strokeLinecap="round">
    <line x1="12" y1="2"  x2="12" y2="5"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="2"  y1="12" x2="5"  y2="12"/>
    <line x1="19" y1="12" x2="22" y2="12"/>
    <line x1="4.5" y1="4.5" x2="6.8" y2="6.8"/>
    <line x1="17.2" y1="17.2" x2="19.5" y2="19.5"/>
    <line x1="17.2" y1="6.8" x2="19.5" y2="4.5"/>
    <line x1="4.5" y1="19.5" x2="6.8" y2="17.2"/>
  </g>

  {/* Sun */}
  <circle cx="12" cy="12" r="5" fill="url(#sunGradient)"/>
</svg>
        <span>Day</span>
      </div>

      <div className={styles.nightBadge}>
<svg
  className={styles.moonIcon}
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <mask id="moon-mask">
      <rect width="24" height="24" fill="white"/>
      <circle cx="15.5" cy="10" r="7.5" fill="black"/>
    </mask>
  </defs>

  <circle
    cx="11"
    cy="12"
    r="8"
    fill="#FFFFFF"
    mask="url(#moon-mask)"
  />
</svg>
        <span>Night</span>
      </div>

    </div>
  </div>
</div>

        <div className={styles.row}>
  <div className={styles.label}>Service Area</div>

  <div className={styles.value}>
    <div className={styles.serviceAreaBadge}>
      <svg
  className={styles.locationIcon}
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient id="pinGradient" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#8A5A32"/>
      <stop offset="100%" stopColor="#5C3A21"/>
    </linearGradient>
  </defs>

  <path
    d="M12 2C8.7 2 6 4.7 6 8c0 4.4 6 12 6 12s6-7.6 6-12c0-3.3-2.7-6-6-6z"
    fill="url(#pinGradient)"
  />

  <circle
    cx="12"
    cy="8"
    r="2.5"
    fill="#FFFFFF"
  />
</svg>
      <span>Indore</span>
    </div>
  </div>
</div>

      
 <div className={styles.whyCard}>

  <div className={styles.whyHeader}>

    <div className={styles.whyTitle}>
      Why Choose Me
    </div>

    <div className={styles.whySubtitle}>
      Reasons to choose this worker
    </div>

  </div>

  <div className={styles.whyBody}>

    <div className={styles.whyList}>

      <div className={styles.whyBadge}>
       Clean & Professional Work
      </div>

      <div className={styles.whyBadge}>
       Premium Paint Finish
      </div>

      <div className={styles.whyBadge}>
        On Time Work
      </div>

      <div className={styles.whyBadge}>
        Reasonable Pricing
      </div>

      <div className={styles.whyBadge}>
      8+ Years Trusted Experience
      </div>

      <div className={styles.whyBadge}>
        Customer Satisfaction
      </div>

    </div> 

  </div> 

</div> 

      </div> 

    </section>
  );
}
