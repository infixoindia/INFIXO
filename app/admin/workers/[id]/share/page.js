"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../../../components/admin/Admin.module.css";
import WorkerShareCard from "../../../../components/admin/WorkerShareCard";
import { getWorkerById } from "@/lib/workerService";

export default function WorkerSharePage({ params }) {
  const { id } = use(params);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getWorkerById(id);
        if (active) setWorker(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Share Worker</h1>
        </div>
        <Link href="/admin/workers" className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}>
          ← Workers
        </Link>
      </div>

      {loading && <p>Loading…</p>}
      {!loading && !worker && <p>Worker not found.</p>}
      {worker && <WorkerShareCard worker={worker} />}
    </div>
  );
}
