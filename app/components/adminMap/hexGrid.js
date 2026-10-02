export const WORKER_HEX_CONFIG = Object.freeze({
  originLon: 75.868,
  originLat: 22.710,
  childFlatToFlatKm: 1.5,
  parentAreaMultiple: 7,
});

const R = 6371.0088;
const DEG = Math.PI / 180;

export function lonLatToKm([lon, lat]) {
  const lat0 = WORKER_HEX_CONFIG.originLat * DEG;
  return [
    (Number(lon) - WORKER_HEX_CONFIG.originLon) * DEG * R * Math.cos(lat0),
    (Number(lat) - WORKER_HEX_CONFIG.originLat) * DEG * R,
  ];
}

export function kmToLonLat([x, y]) {
  const lat0 = WORKER_HEX_CONFIG.originLat * DEG;
  return [
    WORKER_HEX_CONFIG.originLon + (Number(x) / (R * Math.cos(lat0))) / DEG,
    WORKER_HEX_CONFIG.originLat + (Number(y) / R) / DEG,
  ];
}

export function polygonCoordinates(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates?.[0] || [];
  if (geometry.type === "MultiPolygon") {
    let largest = [];
    for (const polygon of geometry.coordinates || []) {
      const ring = polygon?.[0] || [];
      if (ring.length > largest.length) largest = ring;
    }
    return largest;
  }
  return [];
}

export function featureCentroid(feature) {
  const ring = polygonCoordinates(feature?.geometry);
  if (!ring.length) return null;
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (const point of ring) {
    const lon = Number(point?.[0]);
    const lat = Number(point?.[1]);
    if (Number.isFinite(lon) && Number.isFinite(lat)) {
      sx += lon;
      sy += lat;
      n += 1;
    }
  }
  return n ? [sx / n, sy / n] : null;
}

export function parentHexSizeKm() {
  return (
    WORKER_HEX_CONFIG.childFlatToFlatKm / Math.sqrt(3)
  ) * Math.sqrt(WORKER_HEX_CONFIG.parentAreaMultiple);
}

function cubeRound(q, r) {
  const x = q;
  const z = r;
  const y = -x - z;
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);
  const dx = Math.abs(rx - x);
  const dy = Math.abs(ry - y);
  const dz = Math.abs(rz - z);
  if (dx > dy && dx > dz) rx = -ry - rz;
  else if (dy > dz) ry = -rx - rz;
  else rz = -rx - ry;
  return [rx, rz];
}

export function parentKeyForLonLat(lon, lat) {
  if (!Number.isFinite(Number(lon)) || !Number.isFinite(Number(lat))) return null;
  const [x, y] = lonLatToKm([lon, lat]);
  const size = parentHexSizeKm();
  const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / size;
  const r = ((2 / 3) * y) / size;
  const [qIndex, rIndex] = cubeRound(q, r);
  return `WH-${qIndex}-${rIndex}`;
}

export function parentCenterForKey(key) {
  const match = /^WH-(-?\d+)-(-?\d+)$/.exec(String(key || ""));
  if (!match) return null;
  const q = Number(match[1]);
  const r = Number(match[2]);
  const size = parentHexSizeKm();
  return kmToLonLat([
    size * Math.sqrt(3) * (q + r / 2),
    size * 1.5 * r,
  ]);
}

export function hexRing(lon, lat) {
  const [cx, cy] = lonLatToKm([lon, lat]);
  const size = parentHexSizeKm();
  const ring = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (60 * i - 30) * DEG;
    ring.push(kmToLonLat([
      cx + size * Math.cos(angle),
      cy + size * Math.sin(angle),
    ]));
  }
  ring.push(ring[0]);
  return ring;
}

export function buildWorkerHexes(features) {
  const grouped = new Map();
  for (const feature of Array.isArray(features) ? features : []) {
    const center = featureCentroid(feature);
    if (!center) continue;
    const workerHexId = parentKeyForLonLat(center[0], center[1]);
    if (!workerHexId) continue;
    if (!grouped.has(workerHexId)) grouped.set(workerHexId, []);
    grouped.get(workerHexId).push(feature);
  }

  return Array.from(grouped.entries()).map(([workerHexId, children]) => {
    const center = parentCenterForKey(workerHexId);
    if (!center) return null;
    return {
      workerHexId,
      center,
      geometry: {
        type: "Polygon",
        coordinates: [hexRing(center[0], center[1])],
      },
      customerHexIds: children
        .map((feature) => feature?.properties?.hex_id)
        .filter(Boolean),
    };
  }).filter(Boolean);
}
