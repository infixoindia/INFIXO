"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import { EMPTY_WORKER_SCHEMA, mapWorkerToDatabase } from "../../../lib/workerService";
import WorkerAdminForm from "../components/WorkerAdminForm";

export default function CreateWorkerPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async (formData) => {
    setSaving(true);
    setErrorMsg("");

    // Auto-generate slug from Full Name or Random Code if empty
    const generatedSlug = (formData.fullName || "worker")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

    const dbPayload = mapWorkerToDatabase({
      ...formData,
      slug: generatedSlug,
    });

    // Add slug into database payload
    dbPayload.slug = generatedSlug;

    const { error } = await supabase
      .from("workers")
      .insert([dbPayload]);

    if (error) {
      console.error("Error creating worker:", error.message);
      setErrorMsg("Failed to create worker. " + error.message);
    } else {
      alert("New worker created successfully!");
      router.push("/admin");
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin" style={{ color: "#2563eb", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <h1 style={{ fontSize: "24px", marginBottom: "1rem" }}>Add New Worker</h1>

      {errorMsg && (
        <div style={{ background: "#fef2f2", color: "#dc2626", padding: "12px", borderRadius: "8px", marginBottom: "1rem" }}>
          {errorMsg}
        </div>
      )}

      <WorkerAdminForm
        initialData={EMPTY_WORKER_SCHEMA}
        onSave={handleCreate}
        isLoading={saving}
      />
    </div>
  );
}
