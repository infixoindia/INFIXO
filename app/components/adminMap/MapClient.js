"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./MapClient.module.css";
import { buildWorkerHexes, featureCentroid, parentKeyForLonLat, polygonCoordinates } from "./hexGrid";

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
    viewBox: "0 0 1000 760",
    project([lon, lat]) {
      return [((Number(lon) - lo) / (hi - lo)) * 1000, 760 - ((Number(lat) - la) / (ha - la)) * 760];
    },
  };
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
  if (geometry.type === "Polygon") return pathFromRing(geometry.coordinates?.[0], project);
  if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).map((polygon) => pathFromRing(polygon?.[0], project)).filter(Boolean).join(" ");
  return "";
}

function labelForHex(feature) {
  return feature?.properties?.hex_id || feature?.properties?.hexId || "Customer Hex";
}

function wardForHex(feature) {
  const properties = feature?.properties || {};
  return properties.primary_ward_name || properties.primary_ward || properties.ward_name || properties.ward || "—";
}

export default function MapClient() {
  const [customer, setCustomer] = useState([]);
  const [boundary, setBoundary] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [customerOn, setCustomerOn] = useState(true);
  const [workerOn, setWorkerOn] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [configurationWarning, setConfigurationWarning] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/gis/infixo_hex_grid_indore.geojson", { cache: "no-store" }).then((response) => response.ok ? response.json() : Promise.reject(new Error("Customer Hex GeoJSON not found"))),
      fetch("/gis/imc_boundary_dissolved.geojson", { cache: "no-store" }).then((response) => response.ok ? response.json() : null),
    ]).then(([hexes, imc]) => {
      if (cancelled) return;
      setCustomer(Array.isArray(hexes?.features) ? hexes.features : []);
      setBoundary(imc);
    }).catch((err) => { if (!cancelled) setError(`${err.message}. The four GIS files must exist in public/gis/.`); });
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
      if (query && body.workers?.length) {
        const first = body.workers.find((worker) => Number.isFinite(worker.latitude) && Number.isFinite(worker.longitude));
        if (first) setSelected({ type: "worker", id: parentKeyForLonLat(first.longitude, first.latitude) });
      }
    } catch (err) {
      setError(err.message || "Could not load workers");
    } finally {
      setSearching(false);
    }
  }

  useEffect(() => { loadWorkers(); }, []);

  const projection = useMemo(() => projectFactory(customer), [customer]);
  const workerHexes = useMemo(() => buildWorkerHexes(customer), [customer]);
  const workersByHex = useMemo(() => {
    const map = new Map();
    for (const worker of workers) {
      if (!Number.isFinite(worker.latitude) || !Number.isFinite(worker.longitude)) continue;
      const key = parentKeyForLonLat(worker.longitude, worker.latitude);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(worker);
    }
    return map;
  }, [workers]);
  const categoryCounts = useMemo(() => {
    const counts = { Painter: 0, Plumber: 0, Electrician: 0 };
    for (const worker of workers) {
      const profession = String(worker.profession || "").toLowerCase();
      for (const category of CATEGORY_NAMES) if (profession.includes(category.toLowerCase())) counts[category] += 1;
    }
    return counts;
  }, [workers]);

  const activeWorkers = workers.filter((worker) => worker.isActive).length;
  const selectedWorkerHex = selected?.type === "worker" ? workerHexes.find((hex) => hex.workerHexId === selected.id) : null;
  const selectedCustomer = selected?.type === "customer" ? customer.find((feature) => labelForHex(feature) === selected.id) : null;

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
        <form onSubmit={(event) => { event.preventDefault(); loadWorkers(search.trim()); }}>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Worker ID, name, profession" />
          <button disabled={searching}>{searching ? "Searching…" : "Search"}</button>
        </form>
      </section>

      {error && <div className={styles.error}>{error}</div>}
      {configurationWarning && <div className={styles.warning}>{configurationWarning}</div>}

      <section className={styles.mapCard}>
        {!projection ? <div className={styles.empty}>Loading Customer Hex map…</div> : (
          <>
            <svg className={styles.map} viewBox={projection.viewBox} role="img" aria-label="INFIXO Indore Customer and Worker Hex map">
              {boundary?.features?.map((feature, index) => <path key={`b-${index}`} d={featurePath(feature, projection.project)} className={styles.boundary} />)}
              {workerOn && workerHexes.map((hex) => {
                const path = featurePath(hex, projection.project);
                const count = workersByHex.get(hex.workerHexId)?.length || 0;
                const selectedNow = selectedWorkerHex?.workerHexId === hex.workerHexId;
                const center = projection.project(hex.center);
                return <g key={hex.workerHexId} onClick={() => setSelected({ type: "worker", id: hex.workerHexId })} className={selectedNow ? styles.workerSelected : styles.worker}>
                  <path d={path} />
                  <text x={center[0]} y={center[1]}>{count}</text>
                </g>;
              })}
              {customerOn && customer.map((feature, index) => {
                const id = labelForHex(feature);
                const selectedNow = selectedCustomer && id === labelForHex(selectedCustomer);
                return <path key={`c-${id}-${index}`} d={featurePath(feature, projection.project)} onClick={() => setSelected({ type: "customer", id })} className={selectedNow ? styles.customerSelected : styles.customer} />;
              })}
              {workerOn && workers.filter((worker) => Number.isFinite(worker.latitude) && Number.isFinite(worker.longitude)).map((worker) => {
                const [x, y] = projection.project([worker.longitude, worker.latitude]);
                return <circle key={worker.id} cx={x} cy={y} r="5" className={styles.workerDot} onClick={() => setSelected({ type: "worker", id: parentKeyForLonLat(worker.longitude, worker.latitude) })} />;
              })}
            </svg>
            <div className={styles.legend}>
              <span><i className={`${styles.swatch} ${styles.swatchCustomer}`} /> Customer Hex</span>
              <span><i className={`${styles.swatch} ${styles.swatchWorker}`} /> Worker Hex</span>
              <span><i className={`${styles.swatch} ${styles.swatchDot}`} /> Located Worker</span>
            </div>
          </>
        )}
      </section>

      <section className={styles.detail}>
        {!selected && <p className={styles.hint}>Tap a Customer Hex or Worker Hex to inspect it.</p>}
        {selectedCustomer && <CustomerPanel feature={selectedCustomer} workerHexes={workerHexes} />}
        {selectedWorkerHex && <WorkerPanel hex={selectedWorkerHex} workers={workersByHex.get(selectedWorkerHex.workerHexId) || []} />}
      </section>
    </main>
  );
}

function Stat({ label, value }) { return <div className={styles.stat}><span>{label}</span><strong>{value}</strong></div>; }

function CustomerPanel({ feature, workerHexes }) {
  const id = labelForHex(feature);
  const workerHex = workerHexes.find((hex) => hex.customerHexIds.includes(id));
  return <div><div className={styles.panelTitle}>{id}</div><p>Primary Ward: <b>{wardForHex(feature)}</b></p><p>Worker Hex: <b>{workerHex?.workerHexId || "—"}</b></p><div className={styles.grid3}><div>Queries<strong>0</strong></div><div>Painter Demand<strong>0</strong></div><div>Plumber Demand<strong>0</strong></div><div>Electrician Demand<strong>0</strong></div></div><p className={styles.note}>Demand counters stay at zero until real customer-query data is onboarded. No fake demand is inserted.</p></div>;
}

function WorkerPanel({ hex, workers }) {
  const count = (name) => workers.filter((worker) => String(worker.profession || "").toLowerCase().includes(name)).length;
  return <div><div className={styles.panelTitle}>{hex.workerHexId}</div><p>Customer Hexes: <b>{hex.customerHexIds.length}</b> · Workers: <b>{workers.length}</b></p><div className={styles.grid3}><div>Painter<strong>{count("painter")}</strong></div><div>Plumber<strong>{count("plumber")}</strong></div><div>Electrician<strong>{count("electrician")}</strong></div><div>Available<strong>{workers.filter((worker) => worker.isActive).length}</strong></div><div>Demand<strong>0</strong></div><div>Supply Gap<strong>—</strong></div></div><p className={styles.note}>Demand and target-based supply gaps remain unavailable until real customer-query data and category targets are onboarded. No fake values are inserted.</p><div className={styles.workerList}>{workers.length ? workers.map((worker) => <div key={worker.id} className={styles.workerRow}><div><b>{worker.workerId || "No Worker ID"}</b><span>{worker.fullName || "Untitled"} · {worker.profession || "—"}</span></div>{worker.slug && worker.ipuc ? <Link href={`/w/${worker.slug}/${worker.ipuc}`} target="_blank">View Profile</Link> : <span className={styles.muted}>No public link</span>}</div>) : <p className={styles.hint}>No located workers in this Worker Hex yet.</p>}</div></div>;
}
