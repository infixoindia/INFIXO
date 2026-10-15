"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../../components/admin/Admin.module.css";
import { listWorkers } from "@/lib/workerService";

export default function WorkersListPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await listWorkers();
        if (active) setWorkers(data);
      } catch (err) {
        if (active) {
          setWorkers([]);
          setError(err?.message || "Worker profiles could not be loaded.");
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [revision]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Workers</h1>
          <p className={styles.pageSubtitle}>Manage saved worker profiles</p>
        </div>
      </div>

      <Link href="/admin/workers/new" className={styles.fabAdd}>
        + Add New Worker
      </Link>

      <Link href="/admin/map" className={styles.fabAdd}>
        🗺️ INFIXO MAP
      </Link>

      <Link href="/admin/leads" className={styles.fabAdd}>
        Worker Acquisition Leads
      </Link>

      <p className={styles.hint}>
        This list contains created Worker Profiles, not registration leads.
        Pending registrations stay in Worker Acquisition Leads.
        A profile counts as Completed Onboarding only after approval
        and linking to an active real worker.
      </p>

      {loading && <p role="status">Loading worker profiles…</p>}

      {!loading && error && (
        <div role="alert">
          <p className={styles.errorText}>
            Worker profiles could not be loaded: {error}
          </p>
          <button
            type="button"
            className={styles.btn + " " + styles.btnSecondary}
            onClick={() => setRevision(v => v + 1)}
          >
            Retry loading
          </button>
        </div>
      )}

      {!loading && !error && (
        <p className={styles.hint} aria-live="polite">
          {workers.length} saved worker {workers.length === 1 ? "profile" : "profiles"}
        </p>
      )}

      {!loading && !error && workers.length === 0 && (
        <p className={styles.hint}>
          No worker profiles yet. Tap "Add New Worker" to create one.
        </p>
      )}

      {!loading && !error && workers.map((w) => (
        <Link
          key={w.id}
          href={`/admin/workers/${w.id}/share`}
          className={styles.workerListItem}
        >
          <div>
            <div className={styles.workerListName}>
              {w.fullName || "Untitled Worker"}
            </div>
            <div className={styles.workerListMeta}>
              {w.profession || "—"} · {w.isActive ? "Active profile" : "Inactive profile"}
            </div>
          </div>
          <span aria-hidden="true">›</span>
        </Link>
      ))}
    </div>
  );
}
