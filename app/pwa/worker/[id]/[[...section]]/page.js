"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
const liveWorkerCache = new Map(); // In-memory only, never persisted or shared with other visitors.

export default function InstalledWorkerProfile() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const sectionParts = params?.section;
  const section = Array.isArray(sectionParts) && sectionParts.length === 1 ? sectionParts[0] : "";
  const [worker, setWorker] = useState(() => liveWorkerCache.get(id) || null);
  const [resolved, setResolved] = useState(() => liveWorkerCache.has(id));

  useEffect(() => {
    let active = true;
    if (liveWorkerCache.has(id)) {
      setWorker(liveWorkerCache.get(id));
      setResolved(true);
      return () => { active = false; };
    }
    setResolved(false);
    setWorker(null);
    getPublishedWorkerById(id)
      .then(data => {
        if (!active) return;
        liveWorkerCache.set(id, data);
        setWorker(data);
      })
      .catch(err => { if (active) console.error("Worker PWA load unavailable:", err); })
      .finally(() => { if (active) setResolved(true); });
    return () => { active = false; };
  }, [id]);

  // The launch animation belongs to the persistent [id] layout, so it will
  // never reappear on tabs or their Back arrows.
  useEffect(() => {
    if (!resolved) return;
    window.__infixoPwaReady = id;
    window.dispatchEvent(new CustomEvent("infixo:pwa-ready", { detail: { id } }));
  }, [id, resolved]);

  // Android/system Back from a detail page should always open THIS worker's
  // Home, not a previously visited section. Only applies inside the PWA.
  useEffect(() => {
    if (!section) return undefined;
    const home = "/pwa/worker/" + encodeURIComponent(id);
    const onBack = () => {
      // Next.js also receives popstate; replace after it processes that entry.
      window.setTimeout(() => router.replace(home), 0);
    };
    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  }, [id, section, router]);

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
              {section === "work-details" && <div style={{ padding: "1rem" }}><WorkDetails worker={worker} backHref={basePath} backReplace /></div>}
              {section === "worker-details" && <WorkerDetails worker={worker} backHref={basePath} backReplace />}
              {section === "work-photos" && <WorkPhotos worker={worker} backHref={basePath} backReplace />}
              {section === "work-videos" && <WorkVideos worker={worker} backHref={basePath} backReplace />}
            </>
          )}
        </main>
      )}
    </>
  );
}
