"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./MapClient.module.css";

// Use the stable UMD build so the browser does not depend on Next.js handling
// an external ESM import. The geometry itself remains the final Claude data.
const MAPLIBRE_VERSION = "4.7.1";
const MAPLIBRE_CSS_URLS = [
  `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`,
  `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.css`,
];
const MAPLIBRE_JS_URLS = [
  `https://cdn.jsdelivr.net/npm/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`,
  `https://unpkg.com/maplibre-gl@${MAPLIBRE_VERSION}/dist/maplibre-gl.js`,
  `https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/${MAPLIBRE_VERSION}/maplibre-gl.min.js`,
];
const CATEGORIES = ["Painter", "Plumber", "Electrician"];

function loadCss() {
  if (typeof document === "undefined") return;
  if (document.getElementById("infixo-maplibre-css")) return;
  const link = document.createElement("link");
  link.id = "infixo-maplibre-css";
  link.rel = "stylesheet";
  link.href = MAPLIBRE_CSS_URLS[0];
  link.onerror = () => {
    if (link.href !== MAPLIBRE_CSS_URLS[1]) link.href = MAPLIBRE_CSS_URLS[1];
  };
  document.head.appendChild(link);
}

function loadMapLibre() {
  if (typeof window === "undefined") return Promise.reject(new Error("Map is browser-only."));
  if (window.maplibregl) return Promise.resolve(window.maplibregl);
  if (window.__infixoMapLibrePromise) return window.__infixoMapLibrePromise;

  loadCss();

  window.__infixoMapLibrePromise = new Promise((resolve, reject) => {
    let index = 0;

    const tryNext = () => {
      if (window.maplibregl) return resolve(window.maplibregl);
      if (index >= MAPLIBRE_JS_URLS.length) {
        reject(new Error("MapLibre load nahi ho paaya. Network/CDN access check karo."));
        return;
      }

      const src = MAPLIBRE_JS_URLS[index++];
      const id = `infixo-maplibre-${index}`;
      const old = document.getElementById(id);
      if (old) old.remove();

      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => {
        if (window.maplibregl) resolve(window.maplibregl);
        else tryNext();
      };
      script.onerror = tryNext;
      document.head.appendChild(script);
    };

    tryNext();
  });

  return window.__infixoMapLibrePromise;
}

function featureCollection(features) { return { type: "FeatureCollection", features: features || [] }; }
function geometryCenter(feature) {
  const p = feature?.properties || {};
  if (Number.isFinite(Number(p.label_lon)) && Number.isFinite(Number(p.label_lat))) return [Number(p.label_lon), Number(p.label_lat)];
  const coords = feature?.geometry?.type === "Polygon" ? feature.geometry.coordinates?.[0] : feature?.geometry?.coordinates?.[0]?.[0];
  if (!coords?.length) return [75.8577, 22.7196];
  const sum = coords.reduce((a, c) => [a[0] + Number(c[0]), a[1] + Number(c[1])], [0, 0]);
  return [sum[0] / coords.length, sum[1] / coords.length];
}
function normalize(value) { return String(value || "").trim().toLowerCase(); }
function categoryMatch(profession, category) {
  const p = normalize(profession);
  if (category === "Painter") return /painter|painting|paint/.test(p);
  if (category === "Plumber") return /plumber|plumbing/.test(p);
  return /electrician|electrical/.test(p);
}
function workerLink(worker) { return worker?.slug ? `/w/${worker.slug}` : null; }
function collectCoords(g, out) {
  if (!g) return;
  if (g.type === "Polygon") for (const r of g.coordinates || []) for (const p of r) out.push([Number(p[0]), Number(p[1])]);
  if (g.type === "MultiPolygon") for (const p of g.coordinates || []) collectCoords({ type: "Polygon", coordinates: p }, out);
}
function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = Number(ring[i][0]), yi = Number(ring[i][1]);
    const xj = Number(ring[j][0]), yj = Number(ring[j][1]);
    const hit = ((yi > point[1]) !== (yj > point[1])) && (point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (hit) inside = !inside;
  }
  return inside;
}
function pointInGeometry(point, g) {
  if (!g) return false;
  if (g.type === "Polygon") {
    const rings = g.coordinates || [];
    return !!rings.length && pointInRing(point, rings[0]) && !rings.slice(1).some((r) => pointInRing(point, r));
  }
  if (g.type === "MultiPolygon") return (g.coordinates || []).some((p) => pointInGeometry(point, { type: "Polygon", coordinates: p }));
  return false;
}

function createBaseMapStyle() {
  return {
    version: 8,
    sources: {
      "infixo-osm": {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
        maxzoom: 19,
      },
    },
    layers: [{ id: "infixo-osm", type: "raster", source: "infixo-osm", minzoom: 0, maxzoom: 22 }],
  };
}

export default function MapClient() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const maplibreRef = useRef(null);
  const [customer, setCustomer] = useState([]);
  const [workerHexes, setWorkerHexes] = useState([]);
  const [boundary, setBoundary] = useState(null);
  const [areaNames, setAreaNames] = useState({});
  const [workers, setWorkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [view3d, setView3d] = useState(false);
  const [layers, setLayers] = useState({ customer: true, worker: true, boundary: true });

  // GIS data is required for the map. Worker API is optional and must never
  // prevent the map itself from rendering.
  useEffect(() => {
    let cancelled = false;
    const json = (url) => fetch(url, { cache: "no-store" }).then((r) => {
      if (!r.ok) throw new Error(`${url} (${r.status})`);
      return r.json();
    });

    Promise.allSettled([
      json("/gis/customer_hex_v2.geojson"),
      json("/gis/worker_hex_final.geojson"),
      json("/gis/imc_boundary_dissolved.geojson"),
      json("/gis/customer_hex_areas.json"),
    ]).then((results) => {
      if (cancelled) return;
      const [c, w, b, a] = results;
      const failures = results.filter((x) => x.status === "rejected");
      if (failures.length) {
        setError("INFIXO map data load nahi ho raha. GIS files check karo.");
        setLoading(false);
        return;
      }
      setCustomer(c.value.features || []);
      setWorkerHexes(w.value.features || []);
      setBoundary(b.value);
      setAreaNames(a.value || {});
      setLoading(false);
    });

    fetch("/api/admin/map/workers", { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((body) => { if (!cancelled && body?.workers) setWorkers(body.workers); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  const workersByHex = useMemo(() => {
    const byHex = new Map();
    for (const worker of workers) {
      const lon = Number(worker.longitude), lat = Number(worker.latitude);
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
      const hex = workerHexes.find((h) => pointInGeometry([lon, lat], h.geometry));
      const id = hex?.properties?.worker_hex_id;
      if (!id) continue;
      if (!byHex.has(id)) byHex.set(id, []);
      byHex.get(id).push(worker);
    }
    return byHex;
  }, [workers, workerHexes]);

  const selectedWorker = selected?.type === "worker" ? workerHexes.find((h) => h.properties?.worker_hex_id === selected.id) : null;
  const selectedCustomer = selected?.type === "customer" ? customer.find((h) => h.properties?.customer_hex_id === selected.id) : null;
  const selectedWorkers = selectedWorker ? workersByHex.get(selectedWorker.properties.worker_hex_id) || [] : [];
  const categoryCounts = useMemo(() => Object.fromEntries(CATEGORIES.map((c) => [c, workers.filter((w) => categoryMatch(w.profession, c)).length])), [workers]);

  useEffect(() => {
    let disposed = false;
    loadMapLibre().then((maplibre) => {
      if (disposed || !mapEl.current || mapRef.current) return;
      maplibreRef.current = maplibre;
      const map = new maplibre.Map({
        container: mapEl.current,
        style: createBaseMapStyle(),
        center: [75.8577, 22.7196],
        zoom: 11,
        attributionControl: true,
        renderWorldCopies: false,
        cooperativeGestures: false,
      });
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "top-right");
      map.on("load", () => {
        if (disposed) return;
        setError("");
        refreshSourcesAndLayers(map);
        fitToBoundary(map, boundary);
      });
      map.on("error", (e) => {
        const message = e?.error?.message || "Map rendering error.";
        // Tile errors should not blank the overlay or show a giant admin error.
        if (/webgl|style source|failed to load style/i.test(message)) setError(message);
      });
      map.on("click", "infixo-customer-fill", (e) => {
        const p = e.features?.[0]?.properties || {};
        if (p.customer_hex_id) setSelected({ type: "customer", id: p.customer_hex_id });
      });
      map.on("click", "infixo-worker-line", (e) => {
        const p = e.features?.[0]?.properties || {};
        if (p.worker_hex_id) setSelected({ type: "worker", id: p.worker_hex_id });
      });
      map.on("mouseenter", "infixo-customer-fill", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "infixo-customer-fill", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "infixo-worker-line", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "infixo-worker-line", () => { map.getCanvas().style.cursor = ""; });
    }).catch(() => setError("MapLibre load nahi ho paaya. Page ko ek baar refresh karo."));

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.isStyleLoaded()) {
      refreshSourcesAndLayers(map);
      if (boundary) fitToBoundary(map, boundary);
    }
  }, [customer, workerHexes, boundary, layers, selected]);

  useEffect(() => {
    const sync = () => {
      setFullscreen(Boolean(document.fullscreenElement));
      requestAnimationFrame(() => mapRef.current?.resize());
    };
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  function refreshSourcesAndLayers(map) {
    if (!map?.isStyleLoaded()) return;
    const ensureSource = (id, data) => {
      if (map.getSource(id)) map.getSource(id).setData(data);
      else map.addSource(id, { type: "geojson", data });
    };
    ensureSource("infixo-customers", featureCollection(customer));
    ensureSource("infixo-workers", featureCollection(workerHexes));
    ensureSource("infixo-boundary", boundary || featureCollection([]));

    const add = (layer) => {
      if (!map.getLayer(layer.id)) map.addLayer(layer);
      else {
        if (layer.layout?.visibility) map.setLayoutProperty(layer.id, "visibility", layer.layout.visibility);
        for (const [k, v] of Object.entries(layer.paint || {})) map.setPaintProperty(layer.id, k, v);
      }
    };

    add({ id: "infixo-customer-fill", type: "fill", source: "infixo-customers", layout: { visibility: layers.customer ? "visible" : "none" }, paint: { "fill-color": "#cfe3f5", "fill-opacity": 0.72 } });
    add({ id: "infixo-customer-line", type: "line", source: "infixo-customers", layout: { visibility: layers.customer ? "visible" : "none" }, paint: { "line-color": "#4d7ba6", "line-width": 0.7, "line-opacity": 0.95 } });
    add({ id: "infixo-worker-line", type: "line", source: "infixo-workers", layout: { visibility: layers.worker ? "visible" : "none" }, paint: { "line-color": "#0b2a4a", "line-width": 3, "line-opacity": 1 } });
    add({ id: "infixo-boundary-line", type: "line", source: "infixo-boundary", layout: { visibility: layers.boundary ? "visible" : "none" }, paint: { "line-color": "#c62828", "line-width": 2.5, "line-opacity": 1 } });

    if (map.getLayer("infixo-customer-selected")) map.removeLayer("infixo-customer-selected");
    if (map.getLayer("infixo-worker-selected")) map.removeLayer("infixo-worker-selected");
    if (selected?.type === "customer") add({ id: "infixo-customer-selected", type: "line", source: "infixo-customers", filter: ["==", ["get", "customer_hex_id"], selected.id], paint: { "line-color": "#002d97", "line-width": 3.5 } });
    if (selected?.type === "worker") add({ id: "infixo-worker-selected", type: "line", source: "infixo-workers", filter: ["==", ["get", "worker_hex_id"], selected.id], paint: { "line-color": "#002d97", "line-width": 5 } });
    if (map.getLayer("infixo-boundary-line")) map.moveLayer("infixo-boundary-line");
    if (map.getLayer("infixo-customer-selected")) map.moveLayer("infixo-customer-selected");
    if (map.getLayer("infixo-worker-selected")) map.moveLayer("infixo-worker-selected");
  }

  function fitToBoundary(map, b) {
    if (!map || !b?.features?.length) return;
    const coords = [];
    for (const f of b.features) collectCoords(f.geometry, coords);
    if (!coords.length) return;
    const bounds = coords.reduce((acc, p) => {
      acc[0][0] = Math.min(acc[0][0], p[0]); acc[0][1] = Math.min(acc[0][1], p[1]);
      acc[1][0] = Math.max(acc[1][0], p[0]); acc[1][1] = Math.max(acc[1][1], p[1]);
      return acc;
    }, [[Infinity, Infinity], [-Infinity, -Infinity]]);
    map.fitBounds(bounds, { padding: 34, duration: 500, maxZoom: 13 });
  }

  function selectAndFly(item) {
    if (!mapRef.current || !item) return;
    setSelected(item);
    const feature = item.type === "worker"
      ? workerHexes.find((h) => h.properties?.worker_hex_id === item.id)
      : customer.find((h) => h.properties?.customer_hex_id === item.id);
    if (feature) mapRef.current.flyTo({ center: geometryCenter(feature), zoom: Math.max(mapRef.current.getZoom(), 13), speed: 1.2 });
  }

  function runSearch() {
    const q = normalize(search);
    if (!q) return;
    const wh = workerHexes.find((h) => normalize(h.properties?.worker_hex_id) === q);
    if (wh) return selectAndFly({ type: "worker", id: wh.properties.worker_hex_id });
    const ch = customer.find((h) => normalize(h.properties?.customer_hex_id) === q);
    if (ch) return selectAndFly({ type: "customer", id: ch.properties.customer_hex_id });
    const w = workers.find((x) => [x.workerId, x.fullName, x.profession, x.ipuc, x.slug].some((v) => normalize(v).includes(q)));
    if (w) {
      const lon = Number(w.longitude), lat = Number(w.latitude);
      const h = workerHexes.find((x) => Number.isFinite(lon) && Number.isFinite(lat) && pointInGeometry([lon, lat], x.geometry));
      if (h) return selectAndFly({ type: "worker", id: h.properties.worker_hex_id });
    }
  }

  function toggle3d() {
    const next = !view3d;
    setView3d(next);
    mapRef.current?.easeTo({ pitch: next ? 55 : 0, bearing: next ? -12 : 0, duration: 700 });
  }

  async function toggleFullscreen() {
    const el = mapEl.current?.parentElement;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen?.();
      else await document.exitFullscreen?.();
    } catch {
      setError("Full View browser ne allow nahi kiya.");
    }
  }

  return <main className={styles.page}>
    <header className={styles.header}><div><h1>INFIXO MAP</h1><p>Indore — fixed Customer Hex + Worker Hex network</p></div><Link href="/admin/workers" className={styles.back}>Workers</Link></header>
    <section className={styles.stats}>
      <Stat label="Workers" value={workers.length}/>
      <Stat label="Customer Hex" value={customer.length}/>
      <Stat label="Worker Hex" value={workerHexes.length}/>
      {CATEGORIES.map((c) => <Stat key={c} label={`${c}s`} value={categoryCounts[c]}/>) }
    </section>
    <section className={styles.toolbar}>
      <div className={styles.search}><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runSearch()} placeholder="Worker ID, name, WH-01 or Customer Hex ID"/><button onClick={runSearch}>Search</button></div>
      <div className={styles.buttons}><button onClick={toggleFullscreen}>Full View</button><button onClick={toggle3d}>{view3d ? "2D" : "3D"}</button></div>
    </section>
    <section className={styles.layerBar}>
      <LayerToggle label="Customer Hex" checked={layers.customer} onChange={() => setLayers((x) => ({ ...x, customer: !x.customer }))}/>
      <LayerToggle label="Worker Hex" checked={layers.worker} onChange={() => setLayers((x) => ({ ...x, worker: !x.worker }))}/>
      <LayerToggle label="IMC Boundary" checked={layers.boundary} onChange={() => setLayers((x) => ({ ...x, boundary: !x.boundary }))}/>
    </section>
    {error && <div className={styles.error}>{error}</div>}
    <section className={`${styles.mapShell} ${fullscreen ? styles.fullscreenShell : ""}`}><div ref={mapEl} className={styles.map}/>{loading && <div className={styles.loading}>Loading fixed INFIXO map…</div>}</section>
    <section className={styles.detail}>{selectedCustomer ? <CustomerPanel feature={selectedCustomer} areaNames={areaNames}/> : selectedWorker ? <WorkerPanel hex={selectedWorker} workers={selectedWorkers} areaNames={areaNames}/> : <p className={styles.muted}>Map ready. Tap a Customer Hex or Worker Hex to inspect real areas and workers.</p>}</section>
  </main>;
}

function LayerToggle({ label, checked, onChange }) { return <label className={styles.layer}><input type="checkbox" checked={checked} onChange={onChange}/><span>{label}</span></label>; }
function Stat({ label, value }) { return <div className={styles.stat}><span>{label}</span><strong>{value}</strong></div>; }
function CustomerPanel({ feature, areaNames }) { const p = feature.properties || {}; const a = areaNames[p.customer_hex_id] || {}; return <><h2>{p.customer_hex_id}</h2><div className={styles.infoGrid}><div><small>Worker Hex</small><b>{p.worker_hex_id || "—"}</b></div><div><small>Area inside IMC</small><b>{p.area_inside_imc_km2 ?? "—"} km²</b></div><div><small>Primary Ward</small><b>{a.primary_ward || "—"}</b></div><div><small>Related Wards</small><b>{(a.ward_names || []).join(", ") || "—"}</b></div></div></>; }
function WorkerPanel({ hex, workers, areaNames }) { const p = hex.properties || {}; const areaSet = new Set(); for (const id of p.customer_hex_ids || []) { const a = areaNames[id]; for (const n of a?.ward_names || []) areaSet.add(n); } return <><h2>{p.worker_hex_id}</h2><div className={styles.infoGrid}><div><small>Customer Hexes</small><b>{p.customer_hex_count}</b></div><div><small>Workers</small><b>{workers.length}</b></div><div className={styles.wide}><small>Real Areas / Wards</small><b>{Array.from(areaSet).join(", ") || "—"}</b></div></div><div className={styles.categoryRow}>{CATEGORIES.map((c) => <span key={c}>{c}: <b>{workers.filter((w) => categoryMatch(w.profession, c)).length}</b></span>)}</div><div className={styles.workerList}>{workers.length ? workers.map((w) => <WorkerRow key={w.id} worker={w}/>) : <p className={styles.muted}>No real worker is currently located inside this Worker Hex.</p>}</div></>; }
function WorkerRow({ worker }) { const [open, setOpen] = useState(false); const link = workerLink(worker); return <div className={styles.workerRow}><button className={styles.workerMain} onClick={() => setOpen(!open)}><span><b>{worker.fullName || "Untitled Worker"}</b><small>{worker.profession || "—"} · ID: {worker.workerId || "—"}</small></span><em className={worker.isAvailable === true ? styles.available : styles.status}>{worker.isAvailable === true ? "Available" : worker.isAvailable === false ? "Unavailable" : "Status not set"}</em></button>{open && <div className={styles.workerExpanded}><div><span>Experience</span><b>{worker.experience || "—"}</b></div><div><span>Area</span><b>{worker.locality || worker.city || "—"}</b></div><div><span>Verification</span><b>{worker.verification?.identityVerified || worker.verification?.workVerified || worker.verification?.addressVerified ? "Verified" : "Not verified"}</b></div>{link ? <Link href={link} target="_blank">Full Profile</Link> : <span className={styles.muted}>Profile link unavailable</span>}</div>}</div>; }
