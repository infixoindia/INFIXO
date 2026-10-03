"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./MapClient.module.css";

const CATEGORY_NAMES = ["Painter", "Plumber", "Electrician"];

function projectFactory(features) {
  const points = [];
  for (const feature of features || []) points.push(...polygonCoordinates(feature?.geometry));
  if (!points.length) return null;
  const valid = points.filter((point) => Number.isFinite(Number(point?.[0])) && Number.isFinite(Number(point?.[1])));
  if (!valid.length) return null;
  const lons = valid.map((point) => Number(point[0]));
  const lats = valid.map((point) => Number(point[1]));
  const minLon = Math.min(...lons); const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats); const maxLat = Math.max(...lats);
  const padX = Math.max((maxLon - minLon) * 0.03, 0.001);
  const padY = Math.max((maxLat - minLat) * 0.03, 0.001);
  const lo = minLon - padX; const hi = maxLon + padX;
  const la = minLat - padY; const ha = maxLat + padY;
  return {
    bounds: { minLon: lo, maxLon: hi, minLat: la, maxLat: ha },
    project([lon, lat]) {
      return [((Number(lon) - lo) / (hi - lo)) * 1000, 760 - ((Number(lat) - la) / (ha - la)) * 760];
    },
  };
}

function polygonCoordinates(geometry) {
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

function allRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates || [];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flatMap((polygon) => polygon || []);
  return [];
}

function pathFromRing(ring, project) {
  const points = (ring || []).filter((point) => Number.isFinite(Number(point?.[0])) && Number.isFinite(Number(point?.[1])));
  if (points.length < 3) return "";
  return points.map((point, index) => {
    const [x, y] = project(point);
    return `${index ? "L" : "M"} ${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(" ") + " Z";
}

function featurePath(feature, project) {
  const geometry = feature?.geometry || feature;
  if (!geometry || !project) return "";
  return allRings(geometry).map((ring) => pathFromRing(ring, project)).filter(Boolean).join(" ");
}

function labelForCustomer(feature) {
  return feature?.properties?.customer_hex_id || feature?.properties?.hex_id || "Customer Hex";
}

function workerIdForCustomer(feature) {
  return feature?.properties?.worker_hex_id || "";
}

function workerLabelPoint(hex) {
  const p = hex?.properties || {};
  return [Number(p.label_lon), Number(p.label_lat)];
}

function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = Number(ring[i][0]); const yi = Number(ring[i][1]);
    const xj = Number(ring[j][0]); const yj = Number(ring[j][1]);
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInGeometry(point, geometry) {
  if (!geometry) return false;
  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates || [];
    if (!rings.length || !pointInRing(point, rings[0])) return false;
    return !rings.slice(1).some((ring) => pointInRing(point, ring));
  }
  if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).some((polygon) => pointInGeometry(point, { type: "Polygon", coordinates: polygon }));
  return false;
}

function workerHexForPoint(workerHexes, longitude, latitude) {
  if (!Number.isFinite(Number(longitude)) || !Number.isFinite(Number(latitude))) return null;
  const point = [Number(longitude), Number(latitude)];
  return workerHexes.find((hex) => pointInGeometry(point, hex.geometry)) || null;
}

function geometryCenter(feature, project) {
  const p = feature?.properties || {};
  const label = [Number(p.label_lon), Number(p.label_lat)];
  if (Number.isFinite(label[0]) && Number.isFinite(label[1])) return project(label);
  const ring = polygonCoordinates(feature?.geometry);
  if (!ring.length) return [0, 0];
  const sum = ring.reduce((acc, point) => [acc[0] + Number(point[0]), acc[1] + Number(point[1])], [0, 0]);
  return project([sum[0] / ring.length, sum[1] / ring.length]);
}

function selectedIdsForWorker(workerHex) {
  return new Set(workerHex?.properties?.customer_hex_ids || []);
}

export default function MapClient() {
  const [customer, setCustomer] = useState([]);
  const [workerHexes, setWorkerHexes] = useState([]);
  const [boundary, setBoundary] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [customerOn, setCustomerOn] = useState(true);
  const [workerOn, setWorkerOn] = useState(true);
  const [boundaryOn, setBoundaryOn] = useState(true);
  const [selected, setSelected] = useState(null);
  const [hoveredWorkerId, setHoveredWorkerId] = useState(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [configurationWarning, setConfigurationWarning] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/gis/customer_hex_v2.geojson", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error("Customer Hex GeoJSON not found"))),
      fetch("/gis/worker_hex_final.geojson", { cache: "no-store" }).then((r) => r.ok ? r.json() : Promise.reject(new Error("Worker Hex GeoJSON not found"))),
      fetch("/gis/imc_boundary_dissolved.geojson", { cache: "no-store" }).then((r) => r.ok ? r.json() : null),
    ]).then(([customers, workersFinal, imc]) => {
      if (cancelled) return;
      setCustomer(Array.isArray(customers?.features) ? customers.features : []);
      setWorkerHexes(Array.isArray(workersFinal?.features) ? workersFinal.features : []);
      setBoundary(imc);
    }).catch((err) => { if (!cancelled) setError(err.message || "Could not load finalized hex geometry"); });
    return () => { cancelled = true; };
  }, []);

  async function loadWorkers(query = "") {
    setSearching(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/map/workers${query ? `?q=${encodeURIComponent(query)}` : ""}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not load workers");
      setWorkers(Array.isArray(body.workers) ? body.workers : []);
      setConfigurationWarning(body.configurationError || "");
    } catch (err) {
      setError(err.message || "Could not load workers");
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => { loadWorkers(); }, []);

  const projection = useMemo(() => projectFactory(customer), [customer]);
  const workersByHex = useMemo(() => {
    const map = new Map();
    for (const worker of workers) {
      const hex = workerHexForPoint(workerHexes, worker.longitude, worker.latitude);
      if (!hex) continue;
      const id = hex.properties?.worker_hex_id;
      if (!id) continue;
      if (!map.has(id)) map.set(id, []);
      map.get(id).push(worker);
    }
    return map;
  }, [workers, workerHexes]);
  const categoryCounts = useMemo(() => {
    const counts = { Painter: 0, Plumber: 0, Electrician: 0 };
    for (const worker of workers) {
      const profession = String(worker.profession || "").toLowerCase();
      for (const category of CATEGORY_NAMES) if (profession.includes(category.toLowerCase())) counts[category] += 1;
    }
    return counts;
  }, [workers]);
  const activeWorkers = workers.filter((worker) => worker.isActive).length;
  const selectedWorker = selected?.type === "worker" ? workerHexes.find((hex) => hex.properties?.worker_hex_id === selected.id) : null;
  const selectedCustomer = selected?.type === "customer" ? customer.find((feature) => labelForCustomer(feature) === selected.id) : null;
  const selectedChildIds = selectedWorker ? selectedIdsForWorker(selectedWorker) : new Set();
  const hoveredWorker = hoveredWorkerId ? workerHexes.find((hex) => hex.properties?.worker_hex_id === hoveredWorkerId) : null;
  const hoveredChildIds = hoveredWorker ? selectedIdsForWorker(hoveredWorker) : new Set();
  const boundaryFeatures = boundary?.features || [];
  const boundaryPath = boundaryFeatures.map((feature) => featurePath(feature, projection?.project)).filter(Boolean).join(" ");

  function runSearch() {
    const q = search.trim().toLowerCase();
    if (!q) return loadWorkers();
    const workerMatch = workerHexes.find((hex) => String(hex.properties?.worker_hex_id || "").toLowerCase() === q);
    if (workerMatch) {
      setSelected({ type: "worker", id: workerMatch.properties.worker_hex_id });
      return;
    }
    const customerMatch = customer.find((feature) => labelForCustomer(feature).toLowerCase() === q);
    if (customerMatch) {
      setSelected({ type: "customer", id: labelForCustomer(customerMatch) });
      return;
    }
    loadWorkers(search.trim());
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div><h1>INFIXO MAP</h1><p>Customer demand layer + Worker supply planning layer</p></div>
        <Link href="/admin/workers" className={styles.back}>Admin</Link>
      </header>

      <section className={styles.stats}>
        <Stat label="Total Workers" value={workers.length} />
        <Stat label="Total Categories" value={CATEGORY_NAMES.length} />
        <Stat label="Painters" value={categoryCounts.Painter} />
        <Stat label="Plumbers" value={categoryCounts.Plumber} />
        <Stat label="Electricians" value={categoryCounts.Electrician} />
        <Stat label="Available" value={activeWorkers} />
      </section>

      <section className={styles.controls}>
        <label><input type="checkbox" checked={customerOn} onChange={(event) => setCustomerOn(event.target.checked)} /> Customer Hex</label>
        <label><input type="checkbox" checked={workerOn} onChange={(event) => setWorkerOn(event.target.checked)} /> Worker Hex</label>
        <label><input type="checkbox" checked={boundaryOn} onChange={(event) => setBoundaryOn(event.target.checked)} /> IMC Boundary</label>
        <form onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search WH-01 or Customer Hex ID" />
          <button disabled={searching}>{searching ? "Searching…" : "Search"}</button>
        </form>
      </section>

      {error && <div className={styles.error}>{error}</div>}
      {configurationWarning && <div className={styles.warning}>{configurationWarning}</div>}

      <section className={styles.mapCard}>
        {!projection ? <div className={styles.empty}>Loading finalized hex map…</div> : (
          <>
            <svg className={styles.map} viewBox="0 0 1000 760" role="img" aria-label="INFIXO Indore finalized Customer and Worker Hex map">
              <defs>
                <clipPath id="imc-clip">
                  <path d={boundaryPath} />
                </clipPath>
              </defs>
              <g clipPath="url(#imc-clip)">
                {customerOn && customer.map((feature, index) => {
                  const id = labelForCustomer(feature);
                  const selectedNow = selectedCustomer && id === labelForCustomer(selectedCustomer);
                  const childOfSelected = selectedWorker && selectedChildIds.has(id);
                  const childOfHovered = hoveredWorker && hoveredChildIds.has(id);
                  return <path key={`c-${id}-${index}`} d={featurePath(feature, projection.project)} onClick={() => setSelected({ type: "customer", id })} className={selectedNow || childOfSelected || childOfHovered ? styles.customerSelected : styles.customer} />;
                })}
                {workerOn && workerHexes.map((hex) => {
                  const id = hex.properties?.worker_hex_id;
                  const path = featurePath(hex, projection.project);
                  const selectedNow = selectedWorker?.properties?.worker_hex_id === id;
                  const hovered = false;
                  return <g key={id} onClick={() => setSelected({ type: "worker", id })} onMouseEnter={() => setHoveredWorkerId(id)} onMouseLeave={() => setHoveredWorkerId(null)} className={selectedNow || hoveredWorkerId === id ? styles.workerSelected : styles.worker}>
                    <path d={path} />
                    <WorkerLabel hex={hex} project={projection.project} />
                  </g>;
                })}
                {workerOn && workers.filter((worker) => Number.isFinite(worker.latitude) && Number.isFinite(worker.longitude)).map((worker) => {
                  const hex = workerHexForPoint(workerHexes, worker.longitude, worker.latitude);
                  const [x, y] = projection.project([worker.longitude, worker.latitude]);
                  return <circle key={worker.id} cx={x} cy={y} r="5" className={styles.workerDot} onClick={() => hex && setSelected({ type: "worker", id: hex.properties?.worker_hex_id })} />;
                })}
              </g>
              {boundaryOn && boundaryFeatures.map((feature, index) => <path key={`b-${index}`} d={featurePath(feature, projection.project)} className={styles.boundary} />)}
            </svg>
            <div className={styles.legend}>
              <span><i className={`${styles.swatch} ${styles.swatchCustomer}`} /> Customer Hex</span>
              <span><i className={`${styles.swatch} ${styles.swatchWorker}`} /> Worker Hex</span>
              <span><i className={`${styles.swatch} ${styles.swatchBoundary}`} /> IMC Boundary</span>
              <span><i className={`${styles.swatch} ${styles.swatchDot}`} /> Located Worker</span>
            </div>
          </>
        )}
      </section>

      <section className={styles.detail}>
        {!selected && <p className={styles.hint}>Tap a Customer Hex or Worker Hex to inspect it.</p>}
        {selectedCustomer && <CustomerPanel feature={selectedCustomer} />}
        {selectedWorker && <WorkerPanel hex={selectedWorker} workers={workersByHex.get(selectedWorker.properties?.worker_hex_id) || []} />}
      </section>
    </main>
  );
}

function WorkerLabel({ hex, project }) {
  const p = hex?.properties || {};
  const [x, y] = workerLabelPoint(hex);
  const [px, py] = project([x, y]);
  const count = Number(p.customer_hex_count || 0);
  return <g className={styles.workerLabel} transform={`translate(${px.toFixed(2)} ${py.toFixed(2)})`} pointerEvents="none">
    <rect x="-32" y="-13" width="64" height="30" rx="6" />
    <text x="0" y="-1" className={styles.workerLabelId}>{p.worker_hex_id}</text>
    <text x="0" y="10" className={styles.workerLabelCount}>{count} Customer Hex</text>
  </g>;
}

function Stat({ label, value }) { return <div className={styles.stat}><span>{label}</span><strong>{value}</strong></div>; }

function CustomerPanel({ feature }) {
  const p = feature.properties || {};
  const id = labelForCustomer(feature);
  return <div><div className={styles.panelTitle}>{id}</div><p>Worker Hex: <b>{p.worker_hex_id || "—"}</b></p><p>Area inside IMC: <b>{p.area_inside_imc_km2 ?? "—"} km²</b></p><div className={styles.grid3}><div>Queries<strong>0</strong></div><div>Painter Demand<strong>0</strong></div><div>Plumber Demand<strong>0</strong></div><div>Electrician Demand<strong>0</strong></div></div><p className={styles.note}>Demand counters stay at zero until real customer-query data is onboarded. No fake demand is inserted.</p></div>;
}

function WorkerPanel({ hex, workers }) {
  const p = hex.properties || {};
  const count = (name) => workers.filter((worker) => String(worker.profession || "").toLowerCase().includes(name)).length;
  const ids = p.customer_hex_ids || [];
  return <div><div className={styles.panelTitle}>{p.worker_hex_id}</div><p>Customer Hexes: <b>{p.customer_hex_count}</b> · Workers: <b>{workers.length}</b></p><p>Customer Hex IDs: <span className={styles.idList}>{ids.join(" · ")}</span></p><div className={styles.grid3}><div>Painter<strong>{count("painter")}</strong></div><div>Plumber<strong>{count("plumber")}</strong></div><div>Electrician<strong>{count("electrician")}</strong></div><div>Available<strong>{workers.filter((worker) => worker.isActive).length}</strong></div><div>Demand<strong>0</strong></div><div>Supply Gap<strong>—</strong></div></div><p className={styles.note}>Demand and target-based supply gaps remain unavailable until real customer-query data and category targets are onboarded. No fake values are inserted.</p><div className={styles.workerList}>{workers.length ? workers.map((worker) => <div key={worker.id} className={styles.workerRow}><div><b>{worker.workerId || "No Worker ID"}</b><span>{worker.fullName || "Untitled"} · {worker.profession || "—"}</span></div>{worker.slug && worker.ipuc ? <Link href={`/w/${worker.slug}/${worker.ipuc}`} target="_blank">View Profile</Link> : <span className={styles.muted}>No public link</span>}</div>) : <p className={styles.hint}>No located workers in this Worker Hex yet.</p>}</div></div>;
}
