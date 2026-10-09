"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import styles from "./WorkerDetails.module.css";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const ABOUT_POINTS = 3;   // points shown before "Show more"
const ABOUT_LINES = 10;   // ...and never more than ~10 lines in the collapsed view

export default function WorkerDetails({ worker, backHref = "/" }) {
  const [workerOpen, setWorkerOpen] = useState(false);
  const [workOpen, setWorkOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  const languages = Array.isArray(worker?.languages)
    ? worker.languages.join(", ")
    : worker?.languages || "";

  const aboutParagraphs = worker?.about || [];

  const aboutRef = useRef(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutFit, setAboutFit] = useState({ count: Math.min(ABOUT_POINTS, aboutParagraphs.length), height: null });

  // How many of the first 3 points fit in ~10 lines (a point is never cut in the middle).
  useIsoLayoutEffect(() => {
    const root = aboutRef.current;
    if (!root) return undefined;
    const measure = () => {
      const ps = Array.from(root.querySelectorAll("p")).slice(0, ABOUT_POINTS);
      if (!ps.length) return;
      const top0 = ps[0].getBoundingClientRect().top;
      const lh = parseFloat(getComputedStyle(ps[0]).lineHeight) || 28;
      let lines = 0, count = 0, height = null;
      for (let i = 0; i < ps.length; i++) {
        const r = ps[i].getBoundingClientRect();
        const l = Math.max(1, Math.round(r.height / lh));
        if (i > 0 && lines + l > ABOUT_LINES) break;
        lines += l; count = i + 1; height = r.bottom - top0;
      }
      setAboutFit((prev) => (prev.count === count && prev.height === height ? prev : { count, height }));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [aboutParagraphs.length, aboutOpen]);

  const verifications = worker?.verifications || {
    identityVerified: false,
    workVerified: false,
    addressVerified: false,
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <Link href={backHref} className={styles.backLink}>
          <svg className={styles.backArrow} viewBox="0 0 24 24" fill="none">
            <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <div className={styles.value}><span className={styles.detailText}>{worker?.fullName}</span></div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.label}>Gender</div>
            <div className={styles.value}><span className={styles.detailText}>{worker?.gender}</span></div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.label}>Age</div>
            <div className={styles.value}><span className={styles.detailText}>{worker?.age}</span></div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.label}>Address</div>
            <div className={styles.value}><span className={styles.detailText}>{worker?.address}</span></div>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.label}>Languages</div>
            <div className={styles.value}><span className={styles.detailText}>{languages}</span></div>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3>About Me</h3>
          <p>A short introduction about the worker.</p>
        </div>
        <div className={styles.aboutBody}>
          <div ref={aboutRef} style={aboutOpen || aboutFit.height == null ? undefined : { maxHeight: aboutFit.height, overflow: "hidden" }}>
            {(aboutOpen ? aboutParagraphs : aboutParagraphs.slice(0, ABOUT_POINTS)).map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
          {aboutParagraphs.length > aboutFit.count && (
            <button type="button" className={styles.aboutMore} onClick={() => setAboutOpen((v) => !v)} aria-expanded={aboutOpen}>
              {aboutOpen ? "Show less" : "Show more"}
            </button>
          )}
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
            {verifications.identityVerified && (
            <>
            <div className={`${styles.verifyBadge} ${styles.green}`} onClick={() => setWorkerOpen(!workerOpen)}>
              <div className={styles.verifyIconOuter}>
                <div className={styles.verifyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={styles.verifyTick}>
                    <path d="M20 6L9 17L4 12" />
                  </svg>
                </div>
              </div>
              <span className={styles.verifyDivider}></span>
              <div className={styles.verifyText}>
                <span>Worker Verified</span>
                <div className={`${styles.verifyArrow} ${workerOpen ? styles.arrowOpen : ""}`}>
                  <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`${styles.verifyInfo} ${workerOpen ? styles.verifyInfoOpen : ""}`}>
              <ul className={styles.verifyPoints}>
                <li>Identity details have been verified by Infixo.</li>
                <li>The worker has successfully completed the Infixo verification process. The identity information submitted by the worker has been reviewed and verified before profile approval.</li>
              </ul>
              <Link href="/verification-policy#identity-verified" className={`${styles.moreInfo} ${styles.moreInfoGreen}`}>
                <span className={styles.morePlus}>+</span>
                <span>More Information</span>
              </Link>
            </div>
            </>
            )}

            {/* Work Verified */}
            {verifications.workVerified && (
            <>
            <div className={`${styles.verifyBadge} ${styles.blue}`} onClick={() => setWorkOpen(!workOpen)}>
              <div className={styles.verifyIconOuter}>
                <div className={styles.verifyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={styles.verifyTick}>
                    <path d="M20 6L9 17L4 12" />
                  </svg>
                </div>
              </div>
              <span className={styles.verifyDivider}></span>
              <div className={styles.verifyText}>
                <span>Work Verified</span>
                <div className={`${styles.verifyArrow} ${workOpen ? styles.arrowOpen : ""}`}>
                  <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`${styles.verifyInfo} ${workOpen ? styles.verifyInfoOpen : ""}`}>
              <ul className={styles.verifyPoints}>
                <li>Work samples have been reviewed by Infixo.</li>
                <li>The photos and videos available on this profile have been reviewed to help ensure they represent the worker's submitted work and professional services before profile approval.</li>
              </ul>
              <Link href="/verification-policy#work-verified" className={`${styles.moreInfo} ${styles.moreInfoBlue}`}>
                <span className={styles.morePlus}>+</span>
                <span>More Information</span>
              </Link>
            </div>
            </>
            )}

            {/* Address Verified */}
            {verifications.addressVerified && (
            <>
            <div className={`${styles.verifyBadge} ${styles.orange}`} onClick={() => setAddressOpen(!addressOpen)}>
              <div className={styles.verifyIconOuter}>
                <div className={styles.verifyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={styles.verifyTick}>
                    <path d="M20 6L9 17L4 12" />
                  </svg>
                </div>
              </div>
              <span className={styles.verifyDivider}></span>
              <div className={styles.verifyText}>
                <span>Address Verified</span>
                <div className={`${styles.verifyArrow} ${addressOpen ? styles.arrowOpen : ""}`}>
                  <svg className={styles.arrowIcon} viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`${styles.verifyInfo} ${addressOpen ? styles.verifyInfoOpen : ""}`}>
              <ul className={styles.verifyPoints}>
                <li>Address details have been verified by Infixo.</li>
                <li>The address information submitted during registration has been reviewed and verified as part of the Infixo verification process before profile approval.</li>
              </ul>
              <Link href="/verification-policy#address-verified" className={`${styles.moreInfo} ${styles.moreInfoOrange}`}>
                <span className={styles.morePlus}>+</span>
                <span>More Information</span>
              </Link>
            </div>
            </>
            )}

          </div>
        </div>
      </div>
    </section>
  );
}
