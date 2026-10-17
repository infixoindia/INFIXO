"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/app/components/Header/Header";
import WorkerIdentityCard from "@/app/components/WorkerIdentityCard/WorkerIdentityCard";
import NavigationTabs from "@/app/components/NavigationTabs/NavigationTabs";
import Footer from "@/app/components/Footer/Footer";
import WorkerShareFab from "@/app/components/WorkerShareFab/WorkerShareFab";
import WorkerPwaInstall from "@/app/components/WorkerPwaInstall/WorkerPwaInstall";
import WorkDetails from "@/app/components/WorkDetails/WorkDetails";
import WorkerDetails from "@/app/components/WorkerDetails/WorkerDetails";
import WorkPhotos from "@/app/components/WorkPhotos/WorkPhotos";
import WorkVideos from "@/app/components/WorkVideos/WorkVideos";
import { getPublishedWorkerById } from "@/lib/workerService";
import styles from "./WorkerPwa.module.css";

const SECTIONS = ["work-details", "worker-details", "work-photos", "work-videos"];

export default function InstalledWorkerProfile() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const sectionParts = params?.section;
  const section = Array.isArray(sectionParts) && sectionParts.length === 1 ? sectionParts[0] : "";
  const [worker, setWorker] = useState(null);
  const [resolved, setResolved] = useState(false);
  const [splashLeaving, setSplashLeaving] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    let active = true;
    setResolved(false);
    setWorker(null);
    setSplashDone(false);
    setSplashLeaving(false);
    getPublishedWorkerById(id)
      .then(data => { if (active) setWorker(data); })
      .catch(err => { if (active) console.error("Worker PWA load unavailable:", err); })
      .finally(() => { if (active) setResolved(true); });
    return () => { active = false; };
  }, [id]);

  // Leave immediately when data resolves: no artificial minimum splash duration.
  useEffect(() => {
    if (!resolved) return undefined;
    setSplashLeaving(true);
    const timer = window.setTimeout(() => setSplashDone(true), 260);
    return () => window.clearTimeout(timer);
  }, [resolved]);

  const basePath = "/pwa/worker/" + encodeURIComponent(id);
  const cleanUrl = worker && typeof window !== "undefined"
    ? window.location.origin + "/w/" + encodeURIComponent(worker.slug)
    : "";
  const validSection = !section || SECTIONS.includes(section);
  const isHome = !section;

  return (
    <>
      {resolved && (!worker || !validSection) && (
        <main className={styles.unavailable} role="status">
          <img src="/images/logo.png" alt="INFIXO" className={styles.miniLogo} />
          <p>Worker profile unavailable.</p>
        </main>
      )}
      {worker && validSection && (
        <main>
          {isHome ? (
            <>
              <Header />
              <div style={{ padding: "2rem 1rem 0" }}>
                <WorkerIdentityCard worker={worker} />
                <WorkerPwaInstall workerName={worker.fullName} workerId={worker.id} />
                <NavigationTabs worker={worker} basePath={basePath} />
              </div>
              <Footer slug={worker.slug} />
              <WorkerShareFab worker={worker} cleanUrl={cleanUrl} />
            </>
          ) : (
            <>
              {section === "work-details" && <div style={{ padding: "1rem" }}><WorkDetails worker={worker} backHref={basePath} /></div>}
              {section === "worker-details" && <WorkerDetails worker={worker} backHref={basePath} />}
              {section === "work-photos" && <WorkPhotos worker={worker} backHref={basePath} />}
              {section === "work-videos" && <WorkVideos worker={worker} backHref={basePath} />}
            </>
          )}
        </main>
      )}
      {!splashDone && (
        <div className={[styles.splash, splashLeaving && styles.leaving].filter(Boolean).join(" ")} role="status" aria-label="Opening INFIXO worker profile" aria-live="polite">
          <div className={styles.aura} aria-hidden="true" />
          <div className={styles.brand}>
            <div className={styles.logoWrap}>
              <img className={styles.logo} src="/images/logo.png" alt="INFIXO" />
              <div className={styles.sweep} aria-hidden="true" />
            </div>
            <p className={styles.tagline}>Apno Se Judne Ka Naya Tarika</p>
          </div>
          <span className={styles.progress} aria-hidden="true" />
        </div>
      )}
    </>
  );
}
