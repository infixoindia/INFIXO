import { requestIsAdmin } from "@/lib/adminSession";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/guardedSupabase";
import { activationError } from "@/lib/workerPublication.mjs";
import { validateVideoEntries, videoMediaPath } from "@/lib/workVideo.mjs";
import fs from "node:fs";
import path from "node:path";

const DEFAULT_SUPABASE_URL = "https://xyplrbzyqershqngrjwo.supabase.co";
function getSupabaseUrl() {
  const raw = String(process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/^["']|["']$/g, "");
  try { const parsed = new URL(raw); if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString().replace(/\/$/, ""); } catch {}
  return DEFAULT_SUPABASE_URL;
}
const url = getSupabaseUrl();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
function getAdminClient() {
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}
function unauthorized() { return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); }
const isAdmin = requestIsAdmin;

function pointOnSegment(px, py, ax, ay, bx, by) {
  const cross = (px - ax) * (by - ay) - (py - ay) * (bx - ax);
  if (Math.abs(cross) > 1e-10) return false;
  return px >= Math.min(ax, bx) - 1e-10 && px <= Math.max(ax, bx) + 1e-10 && py >= Math.min(ay, by) - 1e-10 && py <= Math.max(ay, by) + 1e-10;
}
function pointInRing(point, ring) {
  const [px, py] = point; let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (pointOnSegment(px, py, xi, yi, xj, yj)) return true;
    const hit = ((yi > py) !== (yj > py)) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}
function pointInPolygon(point, coordinates) {
  if (!coordinates?.length || !pointInRing(point, coordinates[0])) return false;
  for (let i = 1; i < coordinates.length; i++) if (pointInRing(point, coordinates[i])) return false;
  return true;
}
function pointInGeometry(lon, lat, geometry) {
  if (!geometry) return false;
  if (geometry.type === "Polygon") return pointInPolygon([lon, lat], geometry.coordinates);
  if (geometry.type === "MultiPolygon") return geometry.coordinates.some((p) => pointInPolygon([lon, lat], p));
  return false;
}

async function saveInternalLocation(supabase, workerId, location) {
  const fullAddress = String(location?.fullAddress || "").trim() || null;
  const pincode = String(location?.pincode || "").trim() || null;
  const latitude = location?.latitude === "" || location?.latitude == null ? null : Number(location.latitude);
  const longitude = location?.longitude === "" || location?.longitude == null ? null : Number(location.longitude);
  if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) throw new Error("Invalid latitude");
  if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) throw new Error("Invalid longitude");

  const { data: existing, error: readError } = await supabase.from("worker_service_areas").select("id").eq("worker_id", workerId).order("created_at", { ascending: true }).limit(1);
  if (readError) throw readError;
  const row = { worker_id: workerId, full_address: fullAddress, pincode, latitude, longitude };
  if (existing?.[0]?.id) {
    const { error } = await supabase.from("worker_service_areas").update(row).eq("id", existing[0].id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("worker_service_areas").insert(row);
    if (error) throw error;
  }

  if (latitude === null || longitude === null) {
    await supabase.from("infixo_worker_hex_memberships").delete().eq("worker_id", workerId);
    return;
  }
  // Worker Hex geometry is the fixed GeoJSON source of truth for the current map.
  // The Supabase infixo_worker_hexes table may be empty in map-only deployments,
  // so never depend on that table for assignment.
  let hexes = [];
  try {
    const file = path.join(process.cwd(), "public", "gis", "worker_hex_final.geojson");
    const geojson = JSON.parse(fs.readFileSync(file, "utf8"));
    hexes = geojson.features || [];
  } catch (e) {
    throw new Error(`Worker Hex geometry unavailable: ${e.message || e}`);
  }
  const match = hexes.find((feature) => pointInGeometry(longitude, latitude, feature.geometry));
  const matchId = match?.properties?.worker_hex_id || null;
  // Membership is optional for the current map-only setup. The map derives the
  // Worker Hex directly from the fixed GeoJSON, so an empty/seedless
  // infixo_worker_hexes table must never make location saving fail.
  if (match) {
    await supabase.from("infixo_worker_hex_memberships").upsert({ worker_id: workerId, worker_hex_id: matchId, assigned_latitude: latitude, assigned_longitude: longitude, updated_at: new Date().toISOString() }, { onConflict: "worker_id" });
  } else {
    await supabase.from("infixo_worker_hex_memberships").delete().eq("worker_id", workerId);
  }
}

export async function GET(request, { params }) {
  if (!await isAdmin(request)) return unauthorized();
  try {
    const supabase = getAdminClient();
    const id = (await params).id;
    const { data, error } = await supabase.from("workers").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    const { data: area } = await supabase.from("worker_service_areas").select("full_address, pincode, latitude, longitude").eq("worker_id", id).order("created_at", { ascending: true }).limit(1).maybeSingle();
    const internal_location = area ? { fullAddress: area.full_address || "", pincode: area.pincode || "", latitude: area.latitude ?? "", longitude: area.longitude ?? "" } : { fullAddress: "", pincode: "", latitude: "", longitude: "" };
    return NextResponse.json({ worker: { ...data, internal_location } });
  } catch (e) { return NextResponse.json({ error: e.message || "Failed to load worker" }, { status: 500 }); }
}

export async function PATCH(request, { params }) {
  if (!await isAdmin(request)) return unauthorized();
  try {
    const payload = await request.json();
    const internal_location = payload.internal_location;
    delete payload.internal_location;
    delete payload.id; delete payload.slug; delete payload.worker_id; delete payload.ipuc;
    if (typeof payload.is_active !== "undefined" && typeof payload.is_active !== "boolean") return NextResponse.json({ error: "is_active must be true or false" }, { status: 400 });
    const supabase = getAdminClient();
    const workerId = (await params).id;
    // Work Videos: enforce correct owner and existing Storage object before publishing
    // a new video/thumbnail association. Legacy saved entries remain compatible.
    if (typeof payload.videos !== "undefined") {
      const issue = validateVideoEntries(payload.videos);
      if (issue) return NextResponse.json({ error: issue }, { status: 400 });
      if (payload.videos.length > 100) return NextResponse.json({ error: "Too many videos for a single profile" }, { status: 400 });
      const { data: record, error: oldError } = await supabase.from("workers").select("videos").eq("id", workerId).maybeSingle();
      if (oldError) throw oldError;
      if (!record) return NextResponse.json({ error: "Worker not found" }, { status: 404 });
      const saved = record.videos || [];
      const known = new Set(saved.flatMap(item => [item?.video, item?.thumbnail]).filter(Boolean));
      const expectedOrigin = new URL(url).origin;
      const storage = supabase.storage.from("worker-media");
      for (const entry of payload.videos) {
        for (const [type, mediaUrl] of [["videos", entry.video], ["video-thumbs", entry.thumbnail]]) {
          if (known.has(mediaUrl)) continue;
          const storagePath = videoMediaPath(mediaUrl, workerId);
          if (!storagePath || !storagePath.startsWith(workerId + "/" + type + "/") ||
              new URL(mediaUrl).origin !== expectedOrigin) {
            return NextResponse.json({ error: "Video or thumbnail belongs to another worker or storage project" }, { status: 400 });
          }
          const folder = workerId + "/" + type;
          const fileName = storagePath.slice(folder.length + 1);
          const { data: listed, error: storageError } = await storage.list(folder, { search: fileName, limit: 100 });
          if (storageError) throw storageError;
          const file = (listed || []).find(f => f.name === fileName && f.id);
          if (!file) return NextResponse.json({ error: "Video or thumbnail upload is not complete" }, { status: 409 });
          if (type === "videos" && (!Number(file.metadata?.size) || file.metadata.size > 45 * 1024 * 1024)) {
            return NextResponse.json({ error: "Uploaded video size invalid" }, { status: 400 });
          }
        }
      }
    }
    // Activation is distinct from draft creation and from lead approval.
    // Never allow an incomplete draft to become public through direct PATCH.
    if (payload.is_active === true) {
      const { data: existing, error: lookupError } = await supabase
        .from("workers").select("*").eq("id", workerId).maybeSingle();
      if (lookupError) throw lookupError;
      if (!existing) return NextResponse.json({ error: "Worker not found" }, { status: 404 });
      const issue = activationError({ ...existing, ...payload });
      if (issue) return NextResponse.json({ error: issue }, { status: 400 });
    }
    let data = null;
    if (Object.keys(payload).length > 0) {
      const { data: updated, error } = await supabase.from("workers").update(payload).eq("id", workerId).select().maybeSingle();
      if (error) throw error;
      if (!updated) throw new Error("Worker not found");
      data = updated;
    } else {
      const { data: existing, error } = await supabase.from("workers").select("*").eq("id", workerId).maybeSingle();
      if (error) throw error;
      if (!existing) throw new Error("Worker not found");
      data = existing;
    }
    if (typeof internal_location !== "undefined") await saveInternalLocation(supabase, workerId, internal_location);
    return NextResponse.json({ worker: data });
  } catch (e) { return NextResponse.json({ error: e.message || "Failed to update worker" }, { status: 500 }); }
}

async function removeWorkerMedia(supabase, workerId) {
  const files = [];
  const walk = async (prefix) => {
    const { data, error } = await supabase.storage.from("worker-media").list(prefix, { limit: 1000, offset: 0 });
    if (error) throw error;
    for (const item of data || []) { const path = prefix ? `${prefix}/${item.name}` : item.name; if (item.id) files.push(path); else await walk(path); }
  };
  await walk(String(workerId));
  for (let i = 0; i < files.length; i += 100) { const { error } = await supabase.storage.from("worker-media").remove(files.slice(i, i + 100)); if (error) throw error; }
}
async function deleteWorkerChildren(supabase, workerId) {
  const tables = ["verification_documents","worker_evidence","worker_service_areas","worker_availability","reviews","worker_professional","worker_skills","worker_verification","infixo_worker_hex_memberships"];
  for (const table of tables) { const { error } = await supabase.from(table).delete().eq("worker_id", workerId); if (error && !/does not exist/i.test(error.message || "")) throw error; }
}
export async function DELETE(request, { params }) {
  if (!await isAdmin(request)) return unauthorized();
  try {
    const supabase = getAdminClient(); const id = (await params).id;
    await removeWorkerMedia(supabase, id); await deleteWorkerChildren(supabase, id);
    const { error } = await supabase.from("workers").delete().eq("id", id); if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message || "Failed to delete worker" }, { status: 500 }); }
}
