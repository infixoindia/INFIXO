"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Header from "../../components/Header/Header";
import WorkerIdentityCard from "../../components/WorkerIdentityCard/WorkerIdentityCard";
import NavigationTabs from "../../components/NavigationTabs/NavigationTabs";
import Footer from "../../components/Footer/Footer";
import AdminEditFab from "../../components/AdminEditFab/AdminEditFab";
import { getWorkerBySlug } from "@/lib/workerService";

// Client-rendered so route navigation is instant (no server round-trip
// blocking the page transition), same feel as the default homepage.
// Data is still always fetched fresh from Supabase on every visit.
function WorkerProfilePageInner() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const [worker, setWorker] = useState(null);
  const [isMissing, setIsMissing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getWorkerBySlug(slug);
        if (!active) return;
        if (!data) setIsMissing(true);
        else setWorker(data);
      } catch (err) {
        console.error(err);
        if (active) setIsMissing(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  if (isMissing) {
    return (
      <main style={{ padding: "3rem 1rem", textAlign: "center" }}>
        <p>Worker not found.</p>
      </main>
    );
  }

  if (!worker) return null;

  const isAdminPreview = searchParams.get("admin") === worker.id;
  const queryString = isAdminPreview ? `?admin=${worker.id}` : "";

  return (
    <main>
      <Header />
      <div style={{ padding: "2rem 1rem 0 1rem" }}>
        <WorkerIdentityCard worker={worker} />
        <NavigationTabs worker={worker} basePath={`/w/${slug}`} queryString={queryString} />
      </div>
      <Footer slug={slug} />
      {isAdminPreview && <AdminEditFab workerId={worker.id} />}
    </main>
  );
}

export default function WorkerProfilePage() {
  return (
    <Suspense fallback={null}>
      <WorkerProfilePageInner />
    </Suspense>
  );
}
