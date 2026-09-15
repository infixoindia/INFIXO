"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import WorkVideos from "../../../../components/WorkVideos/WorkVideos";
import AdminEditFab from "../../../../components/AdminEditFab/AdminEditFab";
import WorkerShareFab from "../../../../components/WorkerShareFab/WorkerShareFab";
import { getWorkerByIpuc } from "@/lib/workerService";

function PageInner() {
  const { slug, ipuc } = useParams();
  const searchParams = useSearchParams();
  const [worker, setWorker] = useState(null);
  const [isMissing, setIsMissing] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getWorkerByIpuc(ipuc);
        if (!active) return;
        if (!data || data.slug !== slug) setIsMissing(true);
        else setWorker(data);
      } catch (err) {
        console.error(err);
        if (active) setIsMissing(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, ipuc]);

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
  const privateBasePath = `/w/${slug}/${worker.ipuc}`;

  return (
    <>
      <WorkVideos worker={worker} backHref={`${privateBasePath}${queryString}`} />
      {isAdminPreview && <AdminEditFab workerId={worker.id} />}
      <WorkerShareFab worker={worker} cleanUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/w/${slug}`} />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  );
}
