export const WORKER_HEX_CONFIG = Object.freeze({
  originLon: 75.868,
  originLat: 22.710,
  childFlatToFlatKm: 1.5,
  parentAreaMultiple: 7,
});

const R = 6371.0088;
const D = Math.PI / 180;

export function lonLatToKm([lon, lat]) {
  const lat0 = WORKER_HEX_CONFIG.originLat * D;
  return [
    (lon - WORKER_HEX_CONFIG.originLon) * D * R * Math.cos(lat0),
    (lat - WORKER_HEX_CONFIG.originLat) * D * R,
  ];
}

export function kmToLonLat([x, y]) {
  const lat0 = WORKER_HEX_CONFIG.originLat * D;
  return [
    WORKER_HEX_CONFIG.originLon + x / (R * Math.cos(lat0) * D),
    WORKER_HEX_CONFIG.originLat + y / (R * D),
  ];
}

export function polygonCoordinates(g) {
  if (!g) return [];

  if (g.type === "Polygon") {
    return g.coordinates?.[0] || [];
  }

  if (g.type === "MultiPolygon") {
    return g.coordinates?.[0]?.[0] || [];
  }

  return [];
}

export function featureCentroid(f) {
  const points = polygonCoordinates(f?.geometry);

  if (!points.length) return null;

  let x = 0;
  let y = 0;
  let count = 0;

  for (const p of points) {
    const lon = Number(p?.[0]);
    const lat = Number(p?.[1]);

    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

    x += lon;
    y += lat;
    count++;
  }

  if (!count) return null;

  return [x / count, y / count];
}

export function parentHexSizeKm() {
  return (
    (WORKER_HEX_CONFIG.childFlatToFlatKm / Math.sqrt(3)) *
    Math.sqrt(WORKER_HEX_CONFIG.parentAreaMultiple)
  );
}

function cubeRound([r, q]) {
  const x = q;
  const z = r;
  const y = -x - z;

  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const dx = Math.abs(rx - x);
  const dy = Math.abs(ry - y);
  const dz = Math.abs(rz - z);

  if (dx > dy && dx > dz) {
    rx = -ry - rz;
  } else if (dy > dz) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return [rz, rx, ry];
}

export function parentKeyForLonLat(lon, lat) {
  const [x, y] = lonLatToKm([lon, lat]);
  const s = parentHexSizeKm();

  const q = ((Math.sqrt(3) / 3) * x - (1 / 3) * y) / s;
  const r = ((2 / 3) * y) / s;

  const [rq, qq] = cubeRound([r, q]);

  return `WH-${rq}-${qq}`;
}

export function parentCenterForKey(key) {
  const m = /^WH-(-?\d+)-(-?\d+)$/.exec(key);

  if (!m) return null;

  const r = Number(m[1]);
  const q = Number(m[2]);
  const s = parentHexSizeKm();

  const x = s * Math.sqrt(3) * (q + r / 2);
  const y = s * 1.5 * r;

  return kmToLonLat([x, y]);
}

export function hexRing(lon, lat) {
  const [cx, cy] = lonLatToKm([lon, lat]);
  const s = parentHexSizeKm();
  const points = [];

  for (let i = 0; i < 6; i++) {
    const angle = (60 * i - 30) * D;

    points.push(
      kmToLonLat([
        cx + s * Math.cos(angle),
        cy + s * Math.sin(angle),
      ])
    );
  }

  points.push(points[0]);

  return points;
}

export function buildWorkerHexes(features) {
  const groups = new Map();

  for (const f of features || []) {
    const center = featureCentroid(f);

    if (!center) continue;

    const key = parentKeyForLonLat(center[0], center[1]);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(f);
  }

  return [...groups].map(([workerHexId, children]) => {
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
        .map((f) => f?.properties?.hex_id)
        .filter(Boolean),
    };
  }).filter(Boolean);
}
