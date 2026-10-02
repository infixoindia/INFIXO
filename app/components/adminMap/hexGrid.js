export const WORKER_HEX_CONFIG = Object.freeze({
  targetCustomerHexes: 7,
  minCustomerHexes: 5,
  maxCustomerHexes: 9,
  edgeMarginKm: 0.02,
});

const R = 6371.0088;
const DEG = Math.PI / 180;

const ORIGIN_LON = 75.868;
const ORIGIN_LAT = 22.710;

export function lonLatToKm([lon, lat]) {
  const lat0 = ORIGIN_LAT * DEG;
  return [
    (Number(lon) - ORIGIN_LON) * DEG * R * Math.cos(lat0),
    (Number(lat) - ORIGIN_LAT) * DEG * R,
  ];
}

export function kmToLonLat([x, y]) {
  const lat0 = ORIGIN_LAT * DEG;
  return [
    ORIGIN_LON + (Number(x) / (R * Math.cos(lat0))) / DEG,
    ORIGIN_LAT + (Number(y) / R) / DEG,
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

function idParts(feature) {
  const id = String(feature?.properties?.hex_id || "");
  const match = /^H-R(\d+)-C(\d+)$/.exec(id);
  return match ? { row: Number(match[1]), col: Number(match[2]) } : null;
}

function childId(feature) {
  return String(feature?.properties?.hex_id || "");
}

function sortedFeatures(features) {
  return [...(Array.isArray(features) ? features : [])].sort((a, b) => {
    const pa = idParts(a) || { row: 999999, col: 999999 };
    const pb = idParts(b) || { row: 999999, col: 999999 };
    return pa.row - pb.row || pa.col - pb.col || childId(a).localeCompare(childId(b));
  });
}

function neighborKeys(row, col) {
  // The supplied 149-cell grid is an offset hex grid. These six neighbors
  // match the actual H-Rxx-Cxx geometry rather than inventing a new grid.
  return [
    `${row}:${col - 1}`,
    `${row}:${col + 1}`,
    `${row - 1}:${col - 1}`,
    `${row - 1}:${col}`,
    `${row + 1}:${col - 1}`,
    `${row + 1}:${col}`,
  ];
}

function distanceKm(a, b) {
  const ax = Number(a?.[0]); const ay = Number(a?.[1]);
  const bx = Number(b?.[0]); const by = Number(b?.[1]);
  const lat0 = 22.710 * DEG;
  const dx = (ax - bx) * DEG * R * Math.cos(lat0);
  const dy = (ay - by) * DEG * R;
  return Math.hypot(dx, dy);
}

function clusterCustomerHexes(features) {
  const ordered = sortedFeatures(features);
  const byKey = new Map();
  for (const feature of ordered) {
    const p = idParts(feature);
    if (p) byKey.set(`${p.row}:${p.col}`, feature);
  }

  const unassigned = new Set(ordered.map(childId));
  const groups = [];

  while (unassigned.size) {
    const seed = ordered.find((feature) => unassigned.has(childId(feature)));
    if (!seed) break;
    const seedParts = idParts(seed);
    const group = [seed];
    unassigned.delete(childId(seed));

    while (group.length < WORKER_HEX_CONFIG.targetCustomerHexes) {
      const candidates = new Map();
      for (const member of group) {
        const p = idParts(member);
        if (!p) continue;
        for (const key of neighborKeys(p.row, p.col)) {
          const candidate = byKey.get(key);
          if (!candidate || !unassigned.has(childId(candidate))) continue;
          const cp = idParts(candidate);
          const d = distanceKm(featureCentroid(candidate), featureCentroid(member));
          const score = d + Math.abs((cp?.row || 0) - seedParts.row) * 0.002;
          if (!candidates.has(childId(candidate)) || score < candidates.get(childId(candidate)).score) {
            candidates.set(childId(candidate), { feature: candidate, score });
          }
        }
      }
      if (!candidates.size) break;
      const next = [...candidates.values()].sort((a, b) => a.score - b.score || childId(a.feature).localeCompare(childId(b.feature)))[0].feature;
      group.push(next);
      unassigned.delete(childId(next));
    }

    groups.push(group);
  }

  // Very small edge leftovers are merged into their nearest neighboring group.
  // This keeps boundary Worker Hexes full instead of leaving 1–2-cell fragments.
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    if (groups[i].length >= WORKER_HEX_CONFIG.minCustomerHexes || groups.length === 1) continue;
    const small = groups[i];
    const smallCenter = featureCentroid(small[0]);
    let best = -1;
    let bestDistance = Infinity;
    for (let j = 0; j < groups.length; j += 1) {
      if (j === i) continue;
      if (groups[j].length >= WORKER_HEX_CONFIG.maxCustomerHexes) continue;
      const center = featureCentroid(groups[j][0]);
      const d = distanceKm(smallCenter, center);
      if (d < bestDistance) { bestDistance = d; best = j; }
    }
    if (best >= 0) {
      groups[best].push(...small);
      groups.splice(i, 1);
    }
  }

  return groups;
}

function containingHexRing(features) {
  const points = [];
  for (const feature of features) {
    for (const point of polygonCoordinates(feature?.geometry)) {
      const lon = Number(point?.[0]);
      const lat = Number(point?.[1]);
      if (Number.isFinite(lon) && Number.isFinite(lat)) points.push([lon, lat]);
    }
  }
  if (!points.length) return { center: null, ring: [] };

  const center = [
    points.reduce((sum, p) => sum + p[0], 0) / points.length,
    points.reduce((sum, p) => sum + p[1], 0) / points.length,
  ];

  let radius = 0;
  for (const point of points) radius = Math.max(radius, distanceKm(point, center));
  // A regular hexagon's inradius is circumradius * cos(30°).
  // Scale the circumradius so every assigned Customer Hex vertex is fully inside.
  radius = (radius / Math.cos(30 * DEG)) + WORKER_HEX_CONFIG.edgeMarginKm;

  const [cx, cy] = lonLatToKm(center);
  const ring = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = (60 * i - 30) * DEG;
    ring.push(kmToLonLat([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]));
  }
  ring.push(ring[0]);
  return { center, ring };
}

function pointInRing(point, ring) {
  const x = Number(point?.[0]);
  const y = Number(point?.[1]);
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = Number(ring[i]?.[0]); const yi = Number(ring[i]?.[1]);
    const xj = Number(ring[j]?.[0]); const yj = Number(ring[j]?.[1]);
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function workerHexForLonLat(lon, lat, workerHexes) {
  if (!Number.isFinite(Number(lon)) || !Number.isFinite(Number(lat))) return null;
  for (const hex of Array.isArray(workerHexes) ? workerHexes : []) {
    const ring = hex?.geometry?.coordinates?.[0] || [];
    if (pointInRing([Number(lon), Number(lat)], ring)) return hex.workerHexId;
  }
  return null;
}

export function buildWorkerHexes(features) {
  return clusterCustomerHexes(features).map((children, index) => {
    const shape = containingHexRing(children);
    if (!shape.center) return null;
    const first = idParts(children[0]) || { row: index, col: index };
    const workerHexId = `WH-${String(first.row).padStart(2, "0")}-${String(first.col).padStart(3, "0")}`;
    return {
      workerHexId,
      center: shape.center,
      geometry: { type: "Polygon", coordinates: [shape.ring] },
      customerHexIds: children.map(childId).filter(Boolean),
    };
  }).filter(Boolean);
}
