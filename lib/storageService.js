/** Infixo Storage Service. Admin uploads/deletes go through the protected server API. */
const BUCKET = "worker-media";

async function adminStorageRequest(path, options = {}) {
  const res = await fetch(path, { ...options, cache: "no-store" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "Storage request failed");
  return body;
}

export async function uploadWorkerFile(file, { workerId, section }) {
  if (!file) throw new Error("No file provided");
  const ext = file.name.split(".").pop();
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${workerId || "temp"}/${section}/${safeName}`;
  const form = new FormData();
  form.append("file", file);
  form.append("path", path);
  form.append("contentType", file.type || "application/octet-stream");
  const body = await adminStorageRequest("/api/admin/storage", { method: "POST", body: form });
  return body.publicUrl;
}

export async function deleteWorkerFile(publicUrl) {
  if (!publicUrl || !publicUrl.includes(`/storage/v1/object/public/${BUCKET}/`)) return;
  const path = publicUrl.split(`/storage/v1/object/public/${BUCKET}/`)[1];
  if (!path) return;
  await adminStorageRequest("/api/admin/storage", {
    method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path }),
  });
}
