import { supabase } from "@/lib/supabaseClient";

const FIELDS = "id,slug,full_name,hero_slides";
function validId(value) { return typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value); }
function validSlug(value) { return typeof value === "string" && /^[a-zA-Z0-9][a-zA-Z0-9-]{0,128}$/.test(value); }

// The public_worker_profiles view publishes only visible workers.
// Do not use the service-role key or the private workers table here.
export async function publishedWorkerBySlug(slug) {
  if (!validSlug(slug)) return null;
  const { data, error } = await supabase.from("public_worker_profiles").select(FIELDS).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function publishedWorkerById(id) {
  if (!validId(id)) return null;
  const { data, error } = await supabase.from("public_worker_profiles").select(FIELDS).eq("id", id).maybeSingle();
  if (error) throw error;
  return data || null;
}
