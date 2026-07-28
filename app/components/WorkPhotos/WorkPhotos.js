"use client";

import Link from "next/link";
import styles from "./WorkPhotos.module.css";

export default function WorkPhotos() {
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

        <div className={styles.headerText}>
          <h2>Work Gallery</h2>
          <p>Professional work photos.</p>
        </div>

      </div>

                <div className={styles.gallery}>

  <div className={styles.photoItem}>
    <img src="/images/work1.jpg" alt="Work 1" />
  </div>

  <div className={styles.photoItem}>
    <img src="/images/work2.jpg" alt="Work 2" />
  </div>

  <div className={styles.photoItem}>
    <img src="/images/work3.jpg" alt="Work 3" />
  </div>

  <div className={styles.photoItem}>
    <img src="/images/work4.jpg" alt="Work 4" />
  </div>

  <div className={styles.photoItem}>
    <img src="/images/work5.jpg" alt="Work 5" />
  </div>

  <div className={styles.photoItem}>
    <img src="/images/work6.jpg" alt="Work 6" />
  </div>

</div>

    </section>
  );
}
