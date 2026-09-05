"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../components/admin/Admin.module.css";
import WorkerShareCard from "../../components/admin/WorkerShareCard";
import { listWorkers } from "@/lib/workerService";

export default function WorkersListPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listWorkers();
        setWorkers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Workers</h1>
          <p className={styles.pageSubtitle}>Manage all worker profiles</p>
        </div>
      </div>

      <Link href="/admin/workers/new" className={styles.fabAdd}>
        + Add New Worker
      </Link>

      {loading && <p>Loading…</p>}

      {!loading && workers.length === 0 && (
        <p className={styles.hint}>No workers yet. Tap "Add New Worker" to create one.</p>
      )}

      {workers.map((w) => (
        <WorkerShareCard key={w.id} worker={w} />
      ))}
    </div>
  );
}
