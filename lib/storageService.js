/**
 * Infixo Storage Service
 * Handles uploading/deleting worker images & videos in the
 * Supabase Storage bucket "worker-media".
 */

import { supabase } from "./supabaseClient";

const BUCKET = "worker-media";

/**
 * Uploads a single File to Storage under a folder per worker+section,
 * and returns its public URL.
 */
export async function uploadWorkerFile(file, { workerId, section }) {
  if (!file) throw new Error("No file provided");

  const ext = file.name.split(".").pop();
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${workerId || "temp"}/${section}/${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Deletes a file from Storage given its public URL.
 * Silently no-ops for URLs that aren't from our bucket (e.g. seed /images/... paths).
 */
export async function deleteWorkerFile(publicUrl) {
  if (!publicUrl || !publicUrl.includes(`/storage/v1/object/public/${BUCKET}/`)) {
    return; // not a storage file (e.g. bundled demo asset) — nothing to delete
  }
  const path = publicUrl.split(`/storage/v1/object/public/${BUCKET}/`)[1];
  if (!path) return;

  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) console.error("Error deleting file:", error);
}
