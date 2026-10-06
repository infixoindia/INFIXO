import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_SUPABASE_URL = "https://xyplrbzyqershqngrjwo.supabase.co";
function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (((yi > point[1]) !== (yj > point[1])) && point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || Number.EPSILON) + xi) inside = !inside;
  }
  return inside;
}
function pointInGeometry(point, g) {
  if (!g) return false;
  if (g.type === "Polygon") return !!g.coordinates?.length && pointInRing(point, g.coordinates[0]) && !g.coordinates.slice(1).some(r => pointInRing(point, r));
  if (g.type === "MultiPolygon") return (g.coordinates || []).some(p => pointInGeometry(point, { type: "Polygon", coordinates: p }));
  return false;
}
function loadWorkerHexes() {
  try {
    const file = path.join(process.cwd(), "public", "gis", "worker_hex_final.geojson");
    return JSON.parse(fs.readFileSync(file, "utf8")).features || [];
  } catch { return []; }
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

    // A worker appears on the map only when an internal exact location exists.
    // This makes worker_service_areas the explicit map-location source of truth.
    const { data: areas, error: areaError } = await supabase
      .from("worker_service_areas")
      .select("worker_id, latitude, longitude, city, locality, full_address, pincode, radius_km, created_at")
      .order("created_at", { ascending: true });
    if (areaError) return NextResponse.json({ workers: [], error: areaError.message }, { status: 200 });

    const usableAreas = (areas || []).filter(a => Number.isFinite(Number(a.latitude)) && Number.isFinite(Number(a.longitude)));
    if (!usableAreas.length) return NextResponse.json({ workers: [] }, { status: 200 });

    const workerIds = [...new Set(usableAreas.map(a => a.worker_id).filter(Boolean))];
    const workerHexes = loadWorkerHexes();
    const { data: rows, error: workerError } = await supabase.from("workers").select("*").in("id", workerIds);
    if (workerError) return NextResponse.json({ workers: [], error: workerError.message }, { status: 200 });

    const byWorker = new Map();
    for (const a of usableAreas) if (!byWorker.has(a.worker_id)) byWorker.set(a.worker_id, a);
    const workers = (rows || []).map((row) => {
      const a = byWorker.get(row.id);
      return {
        id: row.id || "", workerId: row.worker_id || row.workerId || "", ipuc: row.ipuc || "", slug: row.slug || "",
        fullName: row.full_name || "", profession: row.profession || "", experience: row.experience || 0,
        verifications: row.verifications || {}, verification: row.verifications || {},
        longitude: Number(a?.longitude), latitude: Number(a?.latitude),
        city: a?.city || row.city || "", locality: a?.locality || row.locality || "",
        fullAddress: a?.full_address || "", pincode: a?.pincode || "",
        isAvailable: toBool(row.is_available ?? row.isAvailable),
        workerHexId: (() => {
          const lon = Number(a?.longitude), lat = Number(a?.latitude);
          const match = workerHexes.find(h => pointInGeometry([lon, lat], h.geometry));
          return match?.properties?.worker_hex_id || null;
        })(),
      };
    });

    try {
      const { data: availability } = await supabase.from("worker_availability").select("worker_id, is_available, available").in("worker_id", workerIds);
      const byWorkerAvailability = new Map();
      for (const a of availability || []) if (!byWorkerAvailability.has(a.worker_id)) byWorkerAvailability.set(a.worker_id, a);
      for (const w of workers) {
        const a = byWorkerAvailability.get(w.id);
        if (!a) continue;
        const value = toBool(a.is_available ?? a.available);
        if (value !== null) w.isAvailable = value;
      }
    } catch {}

    return NextResponse.json({ workers }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ workers: [], error: e?.message || "Failed to load map workers" }, { status: 200 });
  }
}
