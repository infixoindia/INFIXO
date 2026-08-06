"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./WorkerDetails.module.css";

export default function WorkerDetails() {

const [workerOpen, setWorkerOpen] = useState(false);
const [workOpen, setWorkOpen] = useState(false);
const [addressOpen, setAddressOpen] = useState(false);
  
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


<div className={styles.card}>

  <div className={styles.verificationHeader}>
    <h3>Infixo Verification</h3>
    <p>Verified details to build trust.</p>
  </div>

  <div className={styles.verificationContent}>

    <div className={styles.verifyList}>

      {/* Worker Verified */}
      <div
        className={`${styles.verifyBadge} ${styles.green}`}
        onClick={() => setWorkerOpen(!workerOpen)}
      >

        <div className={styles.verifyIconOuter}>
          <div className={styles.verifyIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.verifyTick}
            >
              <path d="M20 6L9 17L4 12" />
            </svg>
          </div>
        </div>

        <span className={styles.verifyDivider}></span>

        <div className={styles.verifyText}>
          <span>Worker Verified</span>
          <div
  className={`${styles.verifyArrow} ${
    workerOpen ? styles.arrowOpen : ""
  }`}
>
  <svg
    className={styles.arrowIcon}
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M7 10L12 15L17 10"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
</div>
        
</div>
        
</div>

<div
  className={`${styles.verifyInfo} ${
    workerOpen ? styles.verifyInfoOpen : ""
  }`}
>

    <ul className={styles.verifyPoints}>

      <li>
        Identity details have been verified by Infixo.
      </li>

      <li>
        The worker has successfully completed the Infixo verification process. The identity information submitted by the worker has been reviewed and verified before profile approval.
      </li>

    </ul>

<Link
  href="/policies/worker-verification#identity-verified"
  className={`${styles.moreInfo} ${styles.moreInfoGreen}`}
>
  <span className={styles.morePlus}>+</span>
  <span>More Information</span>
</Link>
  </div>


{/* Work Verified */}

<div
  className={`${styles.verifyBadge} ${styles.blue}`}
  onClick={() => setWorkOpen(!workOpen)}
>

  <div className={styles.verifyIconOuter}>
    <div className={styles.verifyIcon}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.verifyTick}
      >
        <path d="M20 6L9 17L4 12" />
      </svg>
    </div>
  </div>

  <span className={styles.verifyDivider}></span>

  <div className={styles.verifyText}>
    <span>Work Verified</span>

    <div
      className={`${styles.verifyArrow} ${
        workOpen ? styles.arrowOpen : ""
      }`}
    >
      <svg
        className={styles.arrowIcon}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M7 10L12 15L17 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>

  </div>

</div>


<div
  className={`${styles.verifyInfo} ${
    workOpen ? styles.verifyInfoOpen : ""
  }`}
>

  <ul className={styles.verifyPoints}>

    <li>
      Work samples have been reviewed by Infixo.
    </li>

    <li>
      The photos and videos available on this profile have been reviewed to help ensure they represent the worker's submitted work and professional services before profile approval.
    </li>

  </ul>


  <Link
    href="/policies/worker-verification#work-verified"
    className={`${styles.moreInfo} ${styles.moreInfoBlue}`}
  >
    <span className={styles.morePlus}>+</span>
    <span>More Information</span>
  </Link>

</div>

    
      {/* Address Verified */}

<div
  className={`${styles.verifyBadge} ${styles.orange}`}
  onClick={() => setAddressOpen(!addressOpen)}
>

  <div className={styles.verifyIconOuter}>
    <div className={styles.verifyIcon}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={styles.verifyTick}
      >
        <path d="M20 6L9 17L4 12" />
      </svg>
    </div>
  </div>

  <span className={styles.verifyDivider}></span>

  <div className={styles.verifyText}>
    <span>Address Verified</span>

    <div
      className={`${styles.verifyArrow} ${
        addressOpen ? styles.arrowOpen : ""
      }`}
    >
      <svg
        className={styles.arrowIcon}
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M7 10L12 15L17 10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>

  </div>

</div>


<div
  className={`${styles.verifyInfo} ${
    addressOpen ? styles.verifyInfoOpen : ""
  }`}
>

  <ul className={styles.verifyPoints}>

    <li>
      Address details have been verified by Infixo.
    </li>

    <li>
      The address information submitted during registration has been reviewed and verified as part of the Infixo verification process before profile approval.
    </li>

  </ul>


  <Link
    href="/policies/worker-verification#address-verified"
    className={`${styles.moreInfo} ${styles.moreInfoOrange}`}
  >
    <span className={styles.morePlus}>+</span>
    <span>More Information</span>
  </Link>
</div>

      </div>

    </div>

  </div>

                
    </section>
  );
}
