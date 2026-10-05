import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
function isAdmin(request) {
  const expected = process.env.INFIXO_ADMIN_SECRET;
  return !!expected && request.cookies.get("infixo_admin")?.value === expected;
}

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
  const { data: hexes, error: hexError } = await supabase.from("infixo_worker_hexes").select("worker_hex_id, geometry");
  if (hexError) throw hexError;
  const match = (hexes || []).find((h) => pointInGeometry(longitude, latitude, h.geometry));
  if (match) {
    const { error } = await supabase.from("infixo_worker_hex_memberships").upsert({ worker_id: workerId, worker_hex_id: match.worker_hex_id, assigned_latitude: latitude, assigned_longitude: longitude, updated_at: new Date().toISOString() }, { onConflict: "worker_id" });
    if (error) throw error;
  } else {
    await supabase.from("infixo_worker_hex_memberships").delete().eq("worker_id", workerId);
  }
}

export async function GET(request, { params }) {
  if (!isAdmin(request)) return unauthorized();
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
  if (!isAdmin(request)) return unauthorized();
  try {
    const payload = await request.json();
    const internal_location = payload.internal_location;
    delete payload.internal_location;
    delete payload.id; delete payload.slug; delete payload.worker_id; delete payload.ipuc;
    if (typeof payload.is_active !== "undefined" && typeof payload.is_active !== "boolean") return NextResponse.json({ error: "is_active must be true or false" }, { status: 400 });
    const supabase = getAdminClient();
    const workerId = (await params).id;
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
  if (!isAdmin(request)) return unauthorized();
  try {
    const supabase = getAdminClient(); const id = (await params).id;
    await removeWorkerMedia(supabase, id); await deleteWorkerChildren(supabase, id);
    const { error } = await supabase.from("workers").delete().eq("id", id); if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) { return NextResponse.json({ error: e.message || "Failed to delete worker" }, { status: 500 }); }
}
