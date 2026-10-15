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
  const activeWorkers = workers.filter(w => w.isActive !== false);
  const inactiveWorkers = workers.filter(w => w.isActive === false);

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
        <>
          <p className={styles.hint} aria-live="polite">
            {workers.length} saved worker {workers.length === 1 ? "profile" : "profiles"}
          </p>

          <h2 className={styles.cardTitle}>Active Worker Profiles ({activeWorkers.length})</h2>
          {activeWorkers.length === 0 && (
            <p className={styles.hint}>No active profiles yet. Complete and activate a real worker profile first.</p>
          )}
          {activeWorkers.map(w => <WorkerListRow key={w.id} worker={w} />)}

          <h2 className={styles.cardTitle} style={{ marginTop: "1.5rem" }}>
            Draft / Inactive Profiles ({inactiveWorkers.length})
          </h2>
          <p className={styles.hint}>
            New profiles stay private until you review and manually activate them.
            These are not publicly listed or counted as Completed Onboarding.
          </p>
          {inactiveWorkers.map(w => <WorkerListRow key={w.id} worker={w} />)}
        </>
      )}
    </div>
  );
}

function WorkerListRow({ worker: w }) {
  return (
    <Link
      href={`/admin/workers/${w.id}/share`}
      className={styles.workerListItem}
    >
      <div>
        <div className={styles.workerListName}>{w.fullName || "Untitled Worker"}</div>
        <div className={styles.workerListMeta}>
          {w.profession || "—"} · {w.isActive === false ? "Draft / Inactive" : "Active profile"}
        </div>
      </div>
      <span aria-hidden="true">›</span>
    </Link>
  );
}
