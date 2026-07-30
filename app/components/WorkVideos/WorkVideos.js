"use client";

import Link from "next/link";
import styles from "./WorkVideos.module.css";

export default function WorkVideos() {
  return (
    <section className={styles.wrapper}>

      <div className={styles.header}>

        <Link
          href="/"
          className={styles.backLink}
        >
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
          <h2>Work Videos</h2>
          <p>Professional work videos.</p>
        </div>

      </div>

                      <div className={styles.gallery}>

        {[1,2,3,4].map((item) => (

          <div
            key={item}
            className={styles.videoCard}
          >

            <div className={styles.thumbnail}>

              <span className={styles.duration}>
                00:28
              </span>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
}
