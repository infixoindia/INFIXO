// Pure helpers shared by /api/admin/map/workers (and testable without Next/Supabase).
// Worker Hex geometry is ALWAYS the static GeoJSON (worker_hex_final.geojson).

// Number(null) === 0 and Number("") === 0 are both "finite", which would silently
// place a worker with missing coordinates at lat 0 / lon 0. Treat them as missing.
export function toCoord(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function validLatLon(lat, lon) {
  return lat !== null && lon !== null && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
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
export function pointInGeometry(point, g) {
  if (!g) return false;
  if (g.type === "Polygon") return !!g.coordinates?.length && pointInRing(point, g.coordinates[0]) && !g.coordinates.slice(1).some(r => pointInRing(point, r));
  if (g.type === "MultiPolygon") return (g.coordinates || []).some(p => pointInGeometry(point, { type: "Polygon", coordinates: p }));
  return false;
}

export function findWorkerHexId(lon, lat, hexFeatures) {
  const hit = (hexFeatures || []).find(h => pointInGeometry([lon, lat], h.geometry));
  return hit?.properties?.worker_hex_id || null;
}

export function toBool(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true" || value === "1";
  if (typeof value === "number") return value === 1;
  return null;
}

// Pick ONE service-area row per worker. Prefer the OLDEST row that has usable
// coordinates, because the save path (PATCH /api/admin/workers/[id]) updates the oldest row.
export function pickAreaByWorker(areaRows) {
  const sorted = [...(areaRows || [])].sort((a, b) => String(a.created_at || "").localeCompare(String(b.created_at || "")));
  const map = new Map();
  for (const a of sorted) {
    if (!a?.worker_id || map.has(a.worker_id)) continue;
    if (validLatLon(toCoord(a.latitude), toCoord(a.longitude))) map.set(a.worker_id, a);
  }
  return map;
}

// Returns EVERY active worker. Workers without valid coordinates are returned with
// latitude/longitude = null and workerHexId = null; the UI must not place/count them.
export function buildMapWorkers(workerRows, areaRows, hexFeatures) {
  const areaByWorker = pickAreaByWorker(areaRows);
  return (workerRows || []).map(row => {
    const a = areaByWorker.get(row.id);
    const lat = a ? toCoord(a.latitude) : null;
    const lon = a ? toCoord(a.longitude) : null;
    const located = validLatLon(lat, lon);
    return {
      id: row.id || "",
      workerId: row.worker_id || "",
      ipuc: row.ipuc || "",
      slug: row.slug || "",
      fullName: row.full_name || "",
      profession: row.profession || "",
      experience: row.experience || 0,
      verifications: row.verifications || {},
      verification: row.verifications || {},
      longitude: located ? lon : null,
      latitude: located ? lat : null,
      city: a?.city || "",
      locality: a?.locality || "",
      isAvailable: toBool(row.is_available ?? row.isAvailable),
      isActive: row.is_active !== false,
      workerHexId: located ? findWorkerHexId(lon, lat, hexFeatures) : null,
    };
  }).filter(w => w.isActive);
}
