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
        <svg
          className={styles.whyIcon}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldStar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFE58A"/>
              <stop offset="45%" stopColor="#FFD54A"/>
              <stop offset="100%" stopColor="#F5A300"/>
            </linearGradient>

            <filter id="starShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="1.5"
                stdDeviation="1.2"
                floodColor="#C98A00"
                floodOpacity="0.35"
              />
            </filter>
          </defs>

          <path
            d="M12 2.2
               L14.8 8.1
               L21.3 9
               L16.5 13.2
               L17.8 20
               L12 16.8
               L6.2 20
               L7.5 13.2
               L2.7 9
               L9.2 8.1
               Z"
            fill="url(#goldStar)"
            stroke="#D18A00"
            strokeWidth="1"
            filter="url(#starShadow)"
          />
        </svg>

        <span>Clean & Professional Work</span>

      </div>

      <div className={styles.whyBadge}>
  <svg
    className={styles.whyIcon}
    viewBox="0 0 64 64"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="bucketBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FFFFFF"/>
        <stop offset="100%" stopColor="#E4E9F2"/>
      </linearGradient>
      <linearGradient id="bucketRim" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D6DEEC"/>
        <stop offset="100%" stopColor="#AEBBD4"/>
      </linearGradient>
      <linearGradient id="paintFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3E6EE0"/>
        <stop offset="100%" stopColor="#002D97"/>
      </linearGradient>
      <linearGradient id="brushHandle" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#B98455"/>
        <stop offset="100%" stopColor="#8A5E34"/>
      </linearGradient>
    </defs>

    {/* handle */}
    <path d="M21 23 Q32 6 43 23" fill="none" stroke="#9AACC9" strokeWidth="3" strokeLinecap="round"/>

    {/* bucket body */}
    <path d="M17 24 L47 24 L44 47 Q44 51 40 51 L24 51 Q20 51 20 47 Z"
          fill="url(#bucketBody)" stroke="#B7C3DA" strokeWidth="1.5"/>

    {/* rim */}
    <ellipse cx="32" cy="24" rx="15.5" ry="3.4" fill="url(#bucketRim)" stroke="#9AACC9" strokeWidth="1"/>

    {/* paint inside */}
    <ellipse cx="32" cy="24.2" rx="11.5" ry="2.2" fill="url(#paintFill)"/>
    <ellipse cx="27" cy="23.6" rx="3.5" ry="0.9" fill="#7CA0F5" opacity="0.8"/>

    {/* brush handle, leaning diagonally out of the bucket */}
    <rect x="-3" y="0" width="6" height="30" rx="3"
          fill="url(#brushHandle)"
          transform="translate(41,18) rotate(-38)"/>

    {/* wet dipped brush tip, resting in the paint */}
    <path d="M34 20 Q31 16 35 12 Q40 10 41 15 Q41 20 37 22 Z" fill="url(#paintFill)"/>
    <path d="M35 18 Q34 15 36.5 13.5" fill="none" stroke="#7CA0F5" strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
  </svg>
  <span>Premium Paint Finish</span>
</div>

      <div className={styles.whyBadge}>

           <svg
  className={styles.whyIcon}
  viewBox="0 0 64 64"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient id="clockRing" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#38C8C2"/>
      <stop offset="100%" stopColor="#168F89"/>
    </linearGradient>

    <filter id="clockShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow
        dx="0"
        dy="2"
        stdDeviation="2"
        floodColor="#0A6D66"
        floodOpacity="0.28"
      />
    </filter>
  </defs>

  <circle
    cx="32"
    cy="32"
    r="22"
    fill="url(#clockRing)"
    filter="url(#clockShadow)"
  />

  <circle
    cx="32"
    cy="32"
    r="16"
    fill="#FFFFFF"
  />

  <circle
    cx="32"
    cy="32"
    r="2"
    fill="#168F89"
  />

  <line
    x1="32"
    y1="32"
    x2="32"
    y2="22"
    stroke="#168F89"
    strokeWidth="3"
    strokeLinecap="round"
  />

  <line
    x1="32"
    y1="32"
    x2="40"
    y2="37"
    stroke="#168F89"
    strokeWidth="3"
    strokeLinecap="round"
  />
</svg>
      
         <span>On Time Work</span>
      </div>

      <div className={styles.whyBadge}>
      <svg
  className={styles.whyIcon}
  viewBox="0 0 64 64"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <linearGradient id="walletMain" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#B67A45"/>
      <stop offset="100%" stopColor="#70411C"/>
    </linearGradient>

    <linearGradient id="walletFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#D69B5A"/>
      <stop offset="100%" stopColor="#8E5629"/>
    </linearGradient>

    <radialGradient id="coinFill" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stopColor="#FFF3B2"/>
      <stop offset="100%" stopColor="#F4B400"/>
    </radialGradient>

    <filter id="walletShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow
        dx="0"
        dy="2"
        stdDeviation="2"
        floodColor="#3B1F0D"
        floodOpacity="0.28"
      />
    </filter>
  </defs>

  <g filter="url(#walletShadow)">

    <rect
      x="10"
      y="18"
      width="42"
      height="28"
      rx="6"
      fill="url(#walletMain)"
    />

    <rect
      x="28"
      y="18"
      width="24"
      height="28"
      rx="6"
      fill="url(#walletFront)"
    />

    <line
      x1="28"
      y1="18"
      x2="28"
      y2="46"
      stroke="#5B3214"
      strokeWidth="2"
    />

    <line
      x1="32"
      y1="25"
      x2="48"
      y2="25"
      stroke="#F3C68A"
      strokeWidth="1.4"
      opacity="0.55"
    />

    <line
      x1="32"
      y1="31"
      x2="48"
      y2="31"
      stroke="#F3C68A"
      strokeWidth="1.4"
      opacity="0.55"
    />

    <circle
      cx="46"
      cy="38"
      r="1.8"
      fill="#F6D78A"
    />
  </g>

  <circle
    cx="18"
    cy="45"
    r="10"
    fill="url(#coinFill)"
    stroke="#D08A00"
    strokeWidth="2"
  />

  <text
    x="18"
    y="49"
    textAnchor="middle"
    fontFamily="Arial"
    fontWeight="700"
    fontSize="12"
    fill="#7A4B14"
  >
    ₹
  </text>
</svg>
      
      <span>Reasonable Pricing</span>
      </div>

      <div className={styles.whyBadge}>
      <svg
  className={styles.whyIcon}
  viewBox="0 0 64 64"
  xmlns="http://www.w3.org/2000/svg"
>
<defs>

<linearGradient id="shieldBlue" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#BFEFFF"/>
<stop offset="100%" stopColor="#7ED7F5"/>
</linearGradient>

<linearGradient id="shieldBorder" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#3FA9D9"/>
<stop offset="100%" stopColor="#0B6FA4"/>
</linearGradient>

<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#FFE27A"/>
<stop offset="100%" stopColor="#F5A300"/>
</linearGradient>

<filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
<feDropShadow dx="0" dy="2" stdDeviation="2"
floodColor="#000000" floodOpacity="0.25"/>
</filter>

</defs>

<path
d="M32 6
L49 12
V28
C49 40
42 49
32 57
22 49
15 40
15 28
V12
Z"
fill="url(#shieldBlue)"
stroke="url(#shieldBorder)"
strokeWidth="3"
filter="url(#shadow)"
/>

<path
d="M32 18
L35 25
L43 26
L37 31
L39 39
L32 35
L25 39
L27 31
L21 26
L29 25
Z"
fill="url(#gold)"
stroke="#D48A00"
strokeWidth="1.3"
/>

</svg>
      
         <span>8+ Years Trusted Experience</span>
      </div>

      <div className={styles.whyBadge}>
        <svg width="36" height="22" viewBox="0 0 72 44" xmlns="http://www.w3.org/2000/svg">

<path d="M12 36 A24 24 0 0 1 24 15"
stroke="#F44336"
stroke-width="8"
stroke-linecap="round"
fill="none"/>

<path d="M24 15 A24 24 0 0 1 36 10"
stroke="#FF9800"
stroke-width="8"
stroke-linecap="round"
fill="none"/>

<path d="M36 10 A24 24 0 0 1 48 15"
stroke="#FFC107"
stroke-width="8"
stroke-linecap="round"
fill="none"/>

<path d="M48 15 A24 24 0 0 1 60 36"
stroke="#22C55E"
stroke-width="8"
stroke-linecap="round"
fill="none"/>

<line
x1="36"
y1="36"
x2="53"
y2="18"
stroke="#23408E"
stroke-width="4"
stroke-linecap="round"/>

<circle
cx="36"
cy="36"
r="3.5"
fill="#23408E"/>

</svg>
          
          <span>Customer Satisfaction</span>
      </div>

    </div> 

  </div> 

</div> 

      </div> 

    </section>
  );
}
