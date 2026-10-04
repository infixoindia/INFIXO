"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./MapClient.module.css";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const MAPLIBRE_JS = "https://unpkg.com/maplibre-gl@6.11.2/dist/maplibre-gl.mjs";
const MAPLIBRE_CSS = "https://unpkg.com/maplibre-gl@6.11.2/dist/maplibre-gl.css";
const CATEGORIES = ["Painter", "Plumber", "Electrician"];

function loadMapLibre() {
  if (typeof window === "undefined") return Promise.reject(new Error("Map is browser-only."));
  if (window.__infixoMapLibre) return Promise.resolve(window.__infixoMapLibre);
  if (!document.getElementById("infixo-maplibre-css")) {
    const link = document.createElement("link"); link.id = "infixo-maplibre-css"; link.rel = "stylesheet"; link.href = MAPLIBRE_CSS; document.head.appendChild(link);
  }
  if (!window.__infixoMapLibrePromise) {
    window.__infixoMapLibrePromise = import(/* webpackIgnore: true */ MAPLIBRE_JS).then((mod) => {
      window.__infixoMapLibre = mod.default || mod;
      return window.__infixoMapLibre;
    });
  }
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
  return category === "Painter" ? /painter|painting|paint/.test(p) : category === "Plumber" ? /plumber|plumbing/.test(p) : /electrician|electrical/.test(p);
}
function workerLink(worker) { return worker?.slug ? `/w/${worker.slug}` : null; }

export default function MapClient() {
  const mapEl = useRef(null); const mapRef = useRef(null); const maplibreRef = useRef(null);
  const [customer, setCustomer] = useState([]); const [workerHexes, setWorkerHexes] = useState([]); const [boundary, setBoundary] = useState(null); const [areaNames, setAreaNames] = useState({});
  const [workers, setWorkers] = useState([]); const [selected, setSelected] = useState(null); const [search, setSearch] = useState(""); const [error, setError] = useState(""); const [warning, setWarning] = useState(""); const [loading, setLoading] = useState(true); const [fullscreen, setFullscreen] = useState(false); const [view3d, setView3d] = useState(false);
  const [layers, setLayers] = useState({ customer: true, worker: true, boundary: true });
  const [opacity, setOpacity] = useState({ customer: 0.72, worker: 1, boundary: 1 });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/gis/customer_hex_v2.geojson", { cache: "no-store" }).then((r) => r.json()),
      fetch("/gis/worker_hex_final.geojson", { cache: "no-store" }).then((r) => r.json()),
      fetch("/gis/imc_boundary_dissolved.geojson", { cache: "no-store" }).then((r) => r.json()),
      fetch("/gis/customer_hex_areas.json", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/map/workers", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([c, w, b, a, workerBody]) => {
      if (cancelled) return;
      setCustomer(c.features || []); setWorkerHexes(w.features || []); setBoundary(b); setAreaNames(a || {}); setWorkers(workerBody.workers || []); setWarning(workerBody.configurationError || ""); setLoading(false);
    }).catch((e) => { if (!cancelled) { setError(e.message || "Map data could not be loaded."); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const workersByHex = useMemo(() => {
    const map = new Map();
    for (const worker of workers) {
      const hex = workerHexes.find((h) => pointInGeometry([worker.longitude, worker.latitude], h.geometry));
      if (!hex) continue;
      const id = hex.properties?.worker_hex_id; if (!id) continue;
      if (!map.has(id)) map.set(id, []); map.get(id).push(worker);
    }
    return map;
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
      const map = new maplibre.Map({ container: mapEl.current, style: MAP_STYLE, center: [75.8577, 22.7196], zoom: 11.5, attributionControl: true });
      mapRef.current = map;
      map.addControl(new maplibre.NavigationControl({ visualizePitch: true }), "top-right");
      map.addControl(new maplibre.FullscreenControl({ container: mapEl.current }), "top-right");
      map.on("load", () => refreshSourcesAndLayers(map));
      map.on("click", "infixo-customer-fill", (e) => { const p = e.features?.[0]?.properties || {}; if (p.customer_hex_id) setSelected({ type: "customer", id: p.customer_hex_id }); });
      map.on("click", "infixo-worker-line", (e) => { const p = e.features?.[0]?.properties || {}; if (p.worker_hex_id) setSelected({ type: "worker", id: p.worker_hex_id }); });
      map.on("mouseenter", "infixo-customer-fill", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "infixo-customer-fill", () => { map.getCanvas().style.cursor = ""; });
      map.on("mouseenter", "infixo-worker-line", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "infixo-worker-line", () => { map.getCanvas().style.cursor = ""; });
    }).catch((e) => setError(e.message || "Interactive map library could not load."));
    return () => { disposed = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => { if (mapRef.current?.isStyleLoaded()) refreshSourcesAndLayers(mapRef.current); }, [customer, workerHexes, boundary, layers, opacity, selected]);

  function refreshSourcesAndLayers(map) {
    const customerData = featureCollection(customer); const workerData = featureCollection(workerHexes); const boundaryData = boundary || featureCollection([]);
    const ensureSource = (id, data) => { if (map.getSource(id)) map.getSource(id).setData(data); else map.addSource(id, { type: "geojson", data }); };
    ensureSource("infixo-customers", customerData); ensureSource("infixo-workers", workerData); ensureSource("infixo-boundary", boundaryData);
    const maskData = makeDisplayMask(boundary);
    ensureSource("infixo-display-mask", maskData);
    const add = (layer) => { if (!map.getLayer(layer.id)) map.addLayer(layer); else { if (layer.layout) map.setLayoutProperty(layer.id, "visibility", layer.layout.visibility || "visible"); for (const [k,v] of Object.entries(layer.paint || {})) map.setPaintProperty(layer.id, k, v); } };
    add({ id: "infixo-customer-fill", type: "fill", source: "infixo-customers", layout: { visibility: layers.customer ? "visible" : "none" }, paint: { "fill-color": "#cfe3f5", "fill-opacity": opacity.customer } });
    add({ id: "infixo-customer-line", type: "line", source: "infixo-customers", layout: { visibility: layers.customer ? "visible" : "none" }, paint: { "line-color": "#4d7ba6", "line-width": 0.7, "line-opacity": opacity.customer } });
    add({ id: "infixo-worker-line", type: "line", source: "infixo-workers", layout: { visibility: layers.worker ? "visible" : "none" }, paint: { "line-color": "#0b2a4a", "line-width": 3, "line-opacity": opacity.worker } });
    add({ id: "infixo-boundary-line", type: "line", source: "infixo-boundary", layout: { visibility: layers.boundary ? "visible" : "none" }, paint: { "line-color": "#c62828", "line-width": 2.5, "line-opacity": opacity.boundary } });
    add({ id: "infixo-display-mask", type: "fill", source: "infixo-display-mask", paint: { "fill-color": "#f7f8fa", "fill-opacity": 0.88 } });
    if (map.getLayer("infixo-boundary-line")) { map.moveLayer("infixo-boundary-line"); }
    if (map.getLayer("infixo-customer-selected")) map.removeLayer("infixo-customer-selected");
    if (map.getLayer("infixo-worker-selected")) map.removeLayer("infixo-worker-selected");
    if (selected?.type === "customer") add({ id: "infixo-customer-selected", type: "line", source: "infixo-customers", filter: ["==", ["get", "customer_hex_id"], selected.id], paint: { "line-color": "#002d97", "line-width": 3.5 } });
    if (selected?.type === "worker") add({ id: "infixo-worker-selected", type: "line", source: "infixo-workers", filter: ["==", ["get", "worker_hex_id"], selected.id], paint: { "line-color": "#002d97", "line-width": 5 } });
  }

  useEffect(() => {
    const map = mapRef.current; if (!map || !boundary?.features?.length || !map.isStyleLoaded()) return;
    const coords = [];
    for (const f of boundary.features) collectCoords(f.geometry, coords);
    if (!coords.length) return;
    const bounds = coords.reduce((b, p) => { b[0][0] = Math.min(b[0][0], p[0]); b[0][1] = Math.min(b[0][1], p[1]); b[1][0] = Math.max(b[1][0], p[0]); b[1][1] = Math.max(b[1][1], p[1]); return b; }, [[Infinity, Infinity], [-Infinity, -Infinity]]);
    map.fitBounds(bounds, { padding: 40, duration: 500 });
  }, [boundary]);

  function selectAndFly(item) {
    if (!mapRef.current || !item) return;
    setSelected(item);
    const feature = item.type === "worker" ? workerHexes.find((h) => h.properties?.worker_hex_id === item.id) : customer.find((h) => h.properties?.customer_hex_id === item.id);
    if (feature) mapRef.current.flyTo({ center: geometryCenter(feature), zoom: Math.max(mapRef.current.getZoom(), 13), speed: 1.2 });
  }

  function runSearch() {
    const q = normalize(search); if (!q) return;
    const wh = workerHexes.find((h) => normalize(h.properties?.worker_hex_id) === q); if (wh) return selectAndFly({ type: "worker", id: wh.properties.worker_hex_id });
    const ch = customer.find((h) => normalize(h.properties?.customer_hex_id) === q); if (ch) return selectAndFly({ type: "customer", id: ch.properties.customer_hex_id });
    const w = workers.find((x) => [x.workerId, x.fullName, x.profession, x.ipuc, x.slug].some((v) => normalize(v).includes(q))); if (w) { const h = workerHexes.find((x) => pointInGeometry([w.longitude, w.latitude], x.geometry)); if (h) return selectAndFly({ type: "worker", id: h.properties.worker_hex_id }); }
    setWarning("No matching Worker, Worker Hex, or Customer Hex found.");
  }

  function toggle3d() { const next = !view3d; setView3d(next); mapRef.current?.easeTo({ pitch: next ? 55 : 0, bearing: next ? -12 : 0, duration: 700 }); }
  function toggleFullscreen() { const el = mapEl.current?.parentElement; if (!el) return; if (!document.fullscreenElement) el.requestFullscreen?.(); else document.exitFullscreen?.(); setFullscreen(Boolean(!document.fullscreenElement)); }

  return <main className={styles.page}>
    <header className={styles.header}><div><h1>INFIXO MAP</h1><p>Indore — fixed Customer Hex + Worker Hex network</p></div><Link href="/admin/workers" className={styles.back}>Workers</Link></header>
    <section className={styles.stats}><Stat label="Workers" value={workers.length}/><Stat label="Customer Hex" value={customer.length}/><Stat label="Worker Hex" value={workerHexes.length}/>{CATEGORIES.map((c) => <Stat key={c} label={`${c}s`} value={categoryCounts[c]}/>)}</section>
    <section className={styles.toolbar}>
      <div className={styles.search}><input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runSearch()} placeholder="Worker ID, name, WH-01 or Customer Hex ID"/><button onClick={runSearch}>Search</button></div>
      <div className={styles.buttons}><button onClick={toggleFullscreen}>Full View</button><button onClick={toggle3d}>{view3d ? "2D" : "3D"}</button></div>
    </section>
    <section className={styles.layerBar}><LayerToggle label="Customer Hex" checked={layers.customer} onChange={() => setLayers((x) => ({...x, customer: !x.customer}))} opacity={opacity.customer} onOpacity={(v) => setOpacity((x) => ({...x, customer:v}))}/><LayerToggle label="Worker Hex" checked={layers.worker} onChange={() => setLayers((x) => ({...x, worker: !x.worker}))} opacity={opacity.worker} onOpacity={(v) => setOpacity((x) => ({...x, worker:v}))}/><LayerToggle label="IMC Boundary" checked={layers.boundary} onChange={() => setLayers((x) => ({...x, boundary: !x.boundary}))} opacity={opacity.boundary} onOpacity={(v) => setOpacity((x) => ({...x, boundary:v}))}/></section>
    {error && <div className={styles.error}>{error}</div>}{warning && <div className={styles.warning}>{warning}</div>}
    <section className={`${styles.mapShell} ${fullscreen ? styles.fullscreenShell : ""}`}><div ref={mapEl} className={styles.map}/>{loading && <div className={styles.loading}>Loading fixed INFIXO map…</div>}</section>
    <section className={styles.detail}>{selectedCustomer ? <CustomerPanel feature={selectedCustomer} areaNames={areaNames}/> : selectedWorker ? <WorkerPanel hex={selectedWorker} workers={selectedWorkers} areaNames={areaNames}/> : <p className={styles.muted}>Map ready. Tap a Customer Hex or Worker Hex to inspect real areas and workers.</p>}</section>
  </main>;
}

function LayerToggle({label,checked,onChange,opacity,onOpacity}) { return <div className={styles.layer}><label><input type="checkbox" checked={checked} onChange={onChange}/>{label}</label><input type="range" min="0.15" max="1" step="0.05" value={opacity} onChange={(e)=>onOpacity(Number(e.target.value))}/></div>; }
function Stat({label,value}) { return <div className={styles.stat}><span>{label}</span><strong>{value}</strong></div>; }
function CustomerPanel({feature,areaNames}) { const p=feature.properties||{}; const a=areaNames[p.customer_hex_id]||{}; return <><h2>{p.customer_hex_id}</h2><div className={styles.infoGrid}><div><small>Worker Hex</small><b>{p.worker_hex_id||"—"}</b></div><div><small>Area inside IMC</small><b>{p.area_inside_imc_km2??"—"} km²</b></div><div><small>Primary Ward</small><b>{a.primary_ward||"—"}</b></div><div><small>Related Wards</small><b>{(a.ward_names||[]).join(", ")||"—"}</b></div></div></>; }
function WorkerPanel({hex,workers,areaNames}) { const p=hex.properties||{}; const areaSet=new Set(); for(const id of p.customer_hex_ids||[]){const a=areaNames[id]; for(const n of a?.ward_names||[]) areaSet.add(n);} return <><h2>{p.worker_hex_id}</h2><div className={styles.infoGrid}><div><small>Customer Hexes</small><b>{p.customer_hex_count}</b></div><div><small>Workers</small><b>{workers.length}</b></div><div className={styles.wide}><small>Real Areas / Wards</small><b>{Array.from(areaSet).join(", ")||"—"}</b></div></div><div className={styles.categoryRow}>{CATEGORIES.map(c=><span key={c}>{c}: <b>{workers.filter(w=>categoryMatch(w.profession,c)).length}</b></span>)}</div><div className={styles.workerList}>{workers.length?workers.map(w=><WorkerRow key={w.id} worker={w}/>):<p className={styles.muted}>No real worker is currently located inside this Worker Hex.</p>}</div></>; }
function WorkerRow({worker}) { const [open,setOpen]=useState(false); const link=workerLink(worker); return <div className={styles.workerRow}><button className={styles.workerMain} onClick={()=>setOpen(!open)}><span><b>{worker.fullName||"Untitled Worker"}</b><small>{worker.profession||"—"} · ID: {worker.workerId||"—"}</small></span><em className={worker.isAvailable===true?styles.available:styles.status}>{worker.isAvailable===true?"Available":worker.isAvailable===false?"Unavailable":"Status not set"}</em></button>{open&&<div className={styles.workerExpanded}><div><span>Experience</span><b>{worker.experience||"—"}</b></div><div><span>Area</span><b>{worker.locality||worker.city||"—"}</b></div><div><span>Verification</span><b>{worker.verification?.identityVerified||worker.verification?.workVerified||worker.verification?.addressVerified?"Verified":"Not verified"}</b></div>{link?<Link href={link} target="_blank">Full Profile</Link>:<span className={styles.muted}>Profile link unavailable</span>}</div>}</div>; }
function pointInRing(point,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const xi=Number(ring[i][0]),yi=Number(ring[i][1]),xj=Number(ring[j][0]),yj=Number(ring[j][1]);const hit=((yi>point[1])!==(yj>point[1]))&&(point[0]<((xj-xi)*(point[1]-yi))/((yj-yi)||Number.EPSILON)+xi);if(hit)inside=!inside;}return inside;}
function pointInGeometry(point,g){if(!g)return false;if(g.type==="Polygon"){const r=g.coordinates||[];return !!r.length&&pointInRing(point,r[0])&&!r.slice(1).some(x=>pointInRing(point,x));}if(g.type==="MultiPolygon")return (g.coordinates||[]).some(p=>pointInGeometry(point,{type:"Polygon",coordinates:p}));return false;}
function makeDisplayMask(boundary){
  const outer=[[-180,-85], [180,-85], [180,85], [-180,85], [-180,-85]];
  const polygons=[];
  for(const f of boundary?.features||[]){
    const g=f.geometry;
    if(g?.type==="Polygon") polygons.push([outer,...(g.coordinates||[]).map((r)=>r.slice().reverse())]);
    if(g?.type==="MultiPolygon") for(const poly of g.coordinates||[]) polygons.push([outer,...(poly||[]).map((r)=>r.slice().reverse())]);
  }
  return {type:"FeatureCollection",features:polygons.map((coordinates)=>({type:"Feature",properties:{},geometry:{type:"Polygon",coordinates}}))};
}
function collectCoords(g,out){if(!g)return;if(g.type==="Polygon")for(const r of g.coordinates||[])for(const p of r)out.push([Number(p[0]),Number(p[1])]);if(g.type==="MultiPolygon")for(const p of g.coordinates||[])collectCoords({type:"Polygon",coordinates:p},out);}
