"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import WorkerDetails from "../../../components/WorkerDetails/WorkerDetails";
import AdminEditFab from "../../../components/AdminEditFab/AdminEditFab";
import { getWorkerBySlug } from "@/lib/workerService";

function PageInner() {
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
    <>
      <WorkerDetails worker={worker} backHref={`/w/${slug}${queryString}`} />
      {isAdminPreview && <AdminEditFab workerId={worker.id} />}
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
