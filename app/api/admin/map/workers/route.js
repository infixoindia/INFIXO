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

function pointOnSegment(px, py, ax, ay, bx, by) {
  const cross = (px - ax) * (by - ay) - (py - ay) * (bx - ax);
  if (Math.abs(cross) > 1e-10) return false;
  return px >= Math.min(ax, bx) - 1e-10 && px <= Math.max(ax, bx) + 1e-10 && py >= Math.min(ay, by) - 1e-10 && py <= Math.max(ay, by) + 1e-10;
}
function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (pointOnSegment(point[0], point[1], xi, yi, xj, yj)) return true;
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
  } catch {
    return [];
  }
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
    if (!supabase) return NextResponse.json({ workers: [], error: "Supabase server key is not configured" }, { status: 200 });

    // Read workers independently from locations. This is intentionally not an
    // .in(workerIds) query: a location row must never make the whole map empty.
    const { data: rows, error: workerError } = await supabase
      .from("workers")
      .select("*")
      .order("created_at", { ascending: false });
    if (workerError) return NextResponse.json({ workers: [], error: workerError.message }, { status: 200 });

    const { data: areas, error: areaError } = await supabase
      .from("worker_service_areas")
      .select("worker_id, latitude, longitude, city, locality, radius_km")
      .order("created_at", { ascending: false });

    // If the optional location query fails, still return the worker list rather
    // than hiding every worker. Workers without exact coordinates simply won't
    // be placed on the map.
    const areaRows = areaError ? [] : (areas || []);
    const usableByWorker = new Map();
    for (const a of areaRows) {
      const lat = Number(a.latitude), lon = Number(a.longitude);
      if (!a.worker_id || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
      if (!usableByWorker.has(a.worker_id)) usableByWorker.set(a.worker_id, a);
    }

    const workerHexes = loadWorkerHexes();
    const workers = (rows || []).map((row) => {
      const a = usableByWorker.get(row.id);
      const lat = Number(a?.latitude), lon = Number(a?.longitude);
      const hasLocation = Number.isFinite(lat) && Number.isFinite(lon);
      const match = hasLocation
        ? workerHexes.find(h => pointInGeometry([lon, lat], h.geometry))
        : null;
      return {
        id: row.id || "",
        workerId: row.worker_id || row.workerId || "",
        ipuc: row.ipuc || "",
        slug: row.slug || "",
        fullName: row.full_name || "",
        profession: row.profession || "",
        experience: row.experience || 0,
        verifications: row.verifications || {},
        verification: row.verifications || {},
        longitude: hasLocation ? lon : null,
        latitude: hasLocation ? lat : null,
        city: a?.city || "",
        locality: a?.locality || "",
        fullAddress: "",
        pincode: "",
        isAvailable: toBool(row.is_available ?? row.isAvailable),
        isActive: row.is_active !== false,
        workerHexId: match?.properties?.worker_hex_id || null,
      };
    }).filter(w => w.isActive && Number.isFinite(w.latitude) && Number.isFinite(w.longitude));

    // Availability is optional and must never blank the map.
    try {
      const ids = workers.map(w => w.id).filter(Boolean);
      if (ids.length) {
        const { data: availability } = await supabase
          .from("worker_availability")
          .select("worker_id, is_available, available")
          .in("worker_id", ids);
        const byId = new Map();
        for (const a of availability || []) if (!byId.has(a.worker_id)) byId.set(a.worker_id, a);
        for (const w of workers) {
          const a = byId.get(w.id);
          if (!a) continue;
          const value = toBool(a.is_available ?? a.available);
          if (value !== null) w.isAvailable = value;
        }
      }
    } catch {}

    return NextResponse.json(
      { workers, locationQueryError: areaError?.message || null },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (e) {
    return NextResponse.json({ workers: [], error: e?.message || "Failed to load map workers" }, { status: 200 });
  }
}
