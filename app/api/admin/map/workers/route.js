import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { buildMapWorkers, toBool, toCoord, findWorkerHexId } from "@/lib/mapWorkers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_SUPABASE_URL = "https://xyplrbzyqershqngrjwo.supabase.co";
const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

// Same URL cleaning as /api/admin/workers/[id] (strips stray quotes/spaces, validates, falls back).
function getSupabaseUrl() {
  const raw = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/^["']|["']$/g, "").trim();
  try { const parsed = new URL(raw); if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString().replace(/\/$/, ""); } catch {}
  return DEFAULT_SUPABASE_URL;
}
function cleanKey(v) { return String(v || "").trim().replace(/^["']|["']$/g, "").trim(); }
function getSupabaseServerClient() {
  const url = getSupabaseUrl();
  const key = cleanKey(process.env.SUPABASE_SERVICE_ROLE_KEY) || cleanKey(process.env.SUPABASE_SECRET_KEY) || cleanKey(process.env.SUPABASE_SERVICE_KEY);
  if (!key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
// Same admin check as the other /api/admin/* routes. This route returns worker
// coordinates (internal location), so it must not be publicly readable.
function isAdmin(request) {
  const expected = process.env.INFIXO_ADMIN_SECRET;
  return !!expected && request.cookies.get("infixo_admin")?.value === expected;
}
function loadWorkerHexes() {
  const file = path.join(process.cwd(), "public", "gis", "worker_hex_final.geojson");
  return JSON.parse(fs.readFileSync(file, "utf8")).features || [];
}

export async function GET(request) {
  if (!isAdmin(request)) return NextResponse.json({ workers: [], error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  const errors = {};
  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ workers: [], error: "Supabase server key is not configured" }, { status: 200, headers: NO_STORE });

    // Required: workers. No ordering column is required (an ORDER BY on a missing column would fail the whole query).
    const { data: rows, error: workerError } = await supabase.from("workers").select("*");
    if (workerError) return NextResponse.json({ workers: [], error: `workers query failed: ${workerError.message}` }, { status: 200, headers: NO_STORE });

    // Optional: locations. Failure must never remove workers.
    let areaRows = [];
    {
      const { data, error } = await supabase.from("worker_service_areas").select("*");
      if (error) errors.serviceAreas = error.message; else areaRows = data || [];
    }

    let hexes = [];
    try { hexes = loadWorkerHexes(); } catch (e) { errors.workerHexGeoJson = e?.message || String(e); }

    const workers = buildMapWorkers(rows, areaRows, hexes);

    // Optional: availability override. Never blanks the map.
    try {
      const ids = workers.map(w => w.id).filter(Boolean);
      if (ids.length) {
        const { data: availability, error } = await supabase.from("worker_availability").select("*").in("worker_id", ids);
        if (error) errors.availability = error.message;
        const byId = new Map();
        for (const a of availability || []) if (!byId.has(a.worker_id)) byId.set(a.worker_id, a);
        for (const w of workers) {
          const a = byId.get(w.id);
          if (!a) continue;
          const value = toBool(a.is_available ?? a.available);
          if (value !== null) w.isAvailable = value;
        }
      }
    } catch (e) { errors.availability = e?.message || String(e); }

    const meta = {
      workerRows: (rows || []).length,
      serviceAreaRows: areaRows.length,
      returnedWorkers: workers.length,
      located: workers.filter(w => w.latitude !== null).length,
      withWorkerHex: workers.filter(w => w.workerHexId).length,
      errors,
    };

    // Admin-only trace: /api/admin/map/workers?debug=mohan
    const dbg = new URL(request.url).searchParams.get("debug");
    let debug;
    if (dbg) {
      const q = dbg.trim().toLowerCase();
      debug = (rows || []).filter(r => [r.id, r.worker_id, r.full_name, r.slug].some(v => String(v || "").toLowerCase().includes(q))).map(r => {
        const mine = areaRows.filter(a => a.worker_id === r.id);
        const best = mine.map(a => ({ lat: toCoord(a.latitude), lon: toCoord(a.longitude) })).find(c => c.lat !== null && c.lon !== null);
        return {
          worker: { id: r.id, worker_id: r.worker_id, full_name: r.full_name, profession: r.profession, is_active: r.is_active },
          serviceAreaRows: mine.map(a => ({ id: a.id, latitude: a.latitude, longitude: a.longitude, created_at: a.created_at })),
          computedWorkerHex: best ? findWorkerHexId(best.lon, best.lat, hexes) : null,
          returnedByApi: workers.find(w => w.id === r.id) || null,
        };
      });
    }

    return NextResponse.json({ workers, meta, ...(debug ? { debug } : {}), locationQueryError: errors.serviceAreas || null }, { status: 200, headers: NO_STORE });
  } catch (e) {
    return NextResponse.json({ workers: [], error: e?.message || "Failed to load map workers" }, { status: 200, headers: NO_STORE });
  }
}
