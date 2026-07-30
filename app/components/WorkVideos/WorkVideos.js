"use client";

import { useState } from "react";

import Link from "next/link";
import styles from "./WorkVideos.module.css";

export default function WorkVideos() {

const [viewerOpen, setViewerOpen] = useState(false);

const [currentIndex, setCurrentIndex] = useState(0);

  const openViewer = (index) => {
  setCurrentIndex(index);
  setViewerOpen(true);
};

const closeViewer = () => {
  setViewerOpen(false);
};
  
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
  onClick={() => openViewer(item - 1)}
>

            <div className={styles.thumbnail}>

              <span className={styles.duration}>
                00:28
              </span>

            </div>

          </div>

        ))}

      </div>


{viewerOpen && (

  <div className={styles.viewer}>

    <div className={styles.imageCounter}>
      {currentIndex + 1} / 4
    </div>

    <button
      className={styles.closeButton}
      onClick={closeViewer}
      aria-label="Close"
    >

      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >

        <path
          d="M6 6L18 18M18 6L6 18"
          stroke="white"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

      </svg>

    </button>

    <div className={styles.viewerBody}>

      VIDEO PLAYER

    </div>

  </div>

)}

  
    </section>
  );
}
