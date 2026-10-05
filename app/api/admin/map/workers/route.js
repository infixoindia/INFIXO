import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
function toBool(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
  if (typeof value === "number") return value === 1;
  return null;
}
export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ workers: [] }, { status: 200 });
    const { data: rows, error } = await supabase.from("workers").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ workers: [] }, { status: 200 });
    const workers = (rows || []).map((row) => ({
      id: row.id || "", workerId: row.worker_id || row.workerId || "", ipuc: row.ipuc || "", slug: row.slug || "",
      fullName: row.full_name || "", profession: row.profession || "", experience: row.experience || 0,
      verifications: row.verifications || {}, verification: row.verifications || {},
      longitude: Number.isFinite(Number(row.longitude)) ? Number(row.longitude) : null,
      latitude: Number.isFinite(Number(row.latitude)) ? Number(row.latitude) : null,
      city: row.city || "", locality: row.locality || "", isAvailable: toBool(row.is_available ?? row.isAvailable),
    }));
    try {
      const { data: areas } = await supabase.from("worker_service_areas").select("worker_id, latitude, longitude, city, locality, full_address, pincode, radius_km");
      const byWorker = new Map();
      for (const a of areas || []) if (!byWorker.has(a.worker_id)) byWorker.set(a.worker_id, a);
      for (const w of workers) {
        const a = byWorker.get(w.id); if (!a) continue;
        if (Number.isFinite(Number(a.latitude))) w.latitude = Number(a.latitude);
        if (Number.isFinite(Number(a.longitude))) w.longitude = Number(a.longitude);
        w.city = a.city || w.city; w.locality = a.locality || w.locality;
        w.fullAddress = a.full_address || ""; w.pincode = a.pincode || "";
      }
    } catch {}
    try {
      const { data: availability } = await supabase.from("worker_availability").select("worker_id, is_available, available");
      const byWorker = new Map(); for (const a of availability || []) if (!byWorker.has(a.worker_id)) byWorker.set(a.worker_id, a);
      for (const w of workers) { const a = byWorker.get(w.id); if (!a) continue; const value = toBool(a.is_available ?? a.available); if (value !== null) w.isAvailable = value; }
    } catch {}
    const mappedWorkers = workers.filter((w) => Number.isFinite(Number(w.latitude)) && Number.isFinite(Number(w.longitude)));
    return NextResponse.json({ workers: mappedWorkers }, { status: 200 });
  } catch { return NextResponse.json({ workers: [] }, { status: 200 }); }
}
