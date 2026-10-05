"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

const CATEGORIES = ["Painter", "Plumber", "Electrician"];
const DEFAULT_CENTER = [75.8577, 22.7196];

function normalize(v) { return String(v || "").trim().toLowerCase(); }
function fc(features) { return { type: "FeatureCollection", features: features || [] }; }
function collectCoords(g, out) {
  if (!g) return;
  if (g.type === "Polygon") for (const ring of g.coordinates || []) for (const p of ring) out.push([+p[0], +p[1]]);
  if (g.type === "MultiPolygon") for (const poly of g.coordinates || []) collectCoords({ type: "Polygon", coordinates: poly }, out);
}
function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = +ring[i][0], yi = +ring[i][1], xj = +ring[j][0], yj = +ring[j][1];
    if (((yi > point[1]) !== (yj > point[1])) && point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || Number.EPSILON) + xi)) inside = !inside;
  }
  return inside;
}
function pointInGeometry(point, g) {
  if (!g) return false;
  if (g.type === "Polygon") return !!g.coordinates?.length && pointInRing(point, g.coordinates[0]) && !g.coordinates.slice(1).some(r => pointInRing(point, r));
  if (g.type === "MultiPolygon") return (g.coordinates || []).some(p => pointInGeometry(point, { type: "Polygon", coordinates: p }));
  return false;
}
function geometryCenter(feature) {
  const p = feature?.properties || {};
  if (Number.isFinite(+p.label_lon) && Number.isFinite(+p.label_lat)) return [+p.label_lon, +p.label_lat];
  const coords = [];
  collectCoords(feature?.geometry, coords);
  if (!coords.length) return DEFAULT_CENTER;
  return coords.reduce((a, c) => [a[0] + c[0], a[1] + c[1]], [0, 0]).map(v => v / coords.length);
}
function ringPath(ring, project) {
  return ring.map((p, i) => `${i ? "L" : "M"}${project(p[0], p[1])[0].toFixed(2)},${project(p[0], p[1])[1].toFixed(2)}`).join(" ") + " Z";
}
function geometryPath(g, project) {
  if (!g) return "";
  if (g.type === "Polygon") return (g.coordinates || []).map(r => ringPath(r, project)).join(" ");
  if (g.type === "MultiPolygon") return (g.coordinates || []).map(p => geometryPath({ type: "Polygon", coordinates: p }, project)).join(" ");
  return "";
}
function categoryMatch(profession, category) {
  const p = normalize(profession);
  if (category === "Painter") return /painter|painting|paint/.test(p);
  if (category === "Plumber") return /plumber|plumbing/.test(p);
  return /electrician|electrical/.test(p);
}
function workerLink(w) { return w?.slug ? `/w/${w.slug}` : null; }

export default function MapClient() {
  const svgRef = useRef(null);
  const [customer, setCustomer] = useState([]);
  const [workerHexes, setWorkerHexes] = useState([]);
  const [boundary, setBoundary] = useState(null);
  const [areaNames, setAreaNames] = useState({});
  const [workers, setWorkers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [drag, setDrag] = useState(null);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [layers, setLayers] = useState({ customer: true, worker: true, boundary: true });

  useEffect(() => {
    let cancelled = false;
    const get = u => fetch(u, { cache: "no-store" }).then(r => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); });
    Promise.allSettled([
      get("/gis/customer_hex_v2.geojson"),
      get("/gis/worker_hex_final.geojson"),
      get("/gis/imc_boundary_dissolved.geojson"),
      get("/gis/customer_hex_areas.json"),
    ]).then(rs => {
      if (cancelled) return;
      const [c, w, b, a] = rs;
      if (c.status === "fulfilled") setCustomer(c.value.features || []);
      if (w.status === "fulfilled") setWorkerHexes(w.value.features || []);
      if (b.status === "fulfilled") setBoundary(b.value);
      if (a.status === "fulfilled") setAreaNames(a.value || {});
      setLoading(false);
    });
    // Worker data is optional. A worker API problem must never blank the map.
    get("/api/admin/map/workers").then(x => { if (!cancelled) setWorkers(x?.workers || []); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const bounds = useMemo(() => {
    const pts = [];
    collectCoords(boundary?.features?.[0]?.geometry, pts);
    if (!pts.length) customer.forEach(f => collectCoords(f.geometry, pts));
    if (!pts.length) return { minLon: 75.75, maxLon: 75.96, minLat: 22.60, maxLat: 22.82 };
    const minLon = Math.min(...pts.map(p => p[0])), maxLon = Math.max(...pts.map(p => p[0]));
    const minLat = Math.min(...pts.map(p => p[1])), maxLat = Math.max(...pts.map(p => p[1]));
    const padLon = (maxLon - minLon) * 0.035, padLat = (maxLat - minLat) * 0.035;
    return { minLon: minLon - padLon, maxLon: maxLon + padLon, minLat: minLat - padLat, maxLat: maxLat + padLat };
  }, [boundary, customer]);

  const selectedCustomer = selected?.type === "customer" ? customer.find(f => f.properties?.customer_hex_id === selected.id) : null;
  const selectedWorker = selected?.type === "worker" ? workerHexes.find(f => f.properties?.worker_hex_id === selected.id) : null;
  const selectedWorkers = useMemo(() => {
    if (!selectedWorker) return [];
    return workers.filter(w => {
      const lon = +w.longitude, lat = +w.latitude;
      return Number.isFinite(lon) && Number.isFinite(lat) && pointInGeometry([lon, lat], selectedWorker.geometry);
    });
  }, [workers, selectedWorker]);

  const categoryCounts = useMemo(() => Object.fromEntries(CATEGORIES.map(c => [c, workers.filter(w => categoryMatch(w.profession, c)).length])), [workers]);
  const selectedAreas = useMemo(() => {
    const ids = selectedCustomer ? [selectedCustomer.properties?.customer_hex_id] : selectedWorker ? (selectedWorker.properties?.customer_hex_ids || []) : [];
    const set = new Set();
    ids.forEach(id => (areaNames[id]?.ward_names || []).forEach(n => set.add(n)));
    return [...set];
  }, [selectedCustomer, selectedWorker, areaNames]);

  const W = 1000, H = 620;
  const baseProject = (lon, lat) => [((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * W, H - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * H];
  const project = (lon, lat) => {
    const [x, y] = baseProject(lon, lat);
    return [(x - W / 2) * view.scale + W / 2 + view.x, (y - H / 2) * view.scale + H / 2 + view.y];
  };

  function fitAll() { setView({ scale: 1, x: 0, y: 0 }); }
  function zoomAt(factor, cx = W / 2, cy = H / 2) {
    setView(v => {
      const ns = Math.min(8, Math.max(0.75, v.scale * factor));
      const k = ns / v.scale;
      return { scale: ns, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k };
    });
  }
  function onWheel(e) { e.preventDefault(); const r = svgRef.current.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.18 : 0.85, ((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H); }
  function onPointerDown(e) { e.currentTarget.setPointerCapture?.(e.pointerId); setDrag({ x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }); }
  function onPointerMove(e) { if (!drag) return; const r = svgRef.current.getBoundingClientRect(); setView(v => ({ ...v, x: drag.vx + ((e.clientX - drag.x) / r.width) * W, y: drag.vy + ((e.clientY - drag.y) / r.height) * H })); }
  function onPointerUp() { setDrag(null); }

  function selectHex(type, id) {
    setSelected({ type, id });
    const f = type === "customer" ? customer.find(x => x.properties?.customer_hex_id === id) : workerHexes.find(x => x.properties?.worker_hex_id === id);
    if (!f) return;
    const [x, y] = baseProject(...geometryCenter(f));
    const target = Math.min(5, Math.max(1.7, view.scale * 1.55));
    setView({ scale: target, x: W / 2 - (x - W / 2) * target, y: H / 2 - (y - H / 2) * target });
  }
  function runSearch() {
    const q = normalize(search); if (!q) return;
    const wh = workerHexes.find(f => normalize(f.properties?.worker_hex_id) === q);
    if (wh) return selectHex("worker", wh.properties.worker_hex_id);
    const ch = customer.find(f => normalize(f.properties?.customer_hex_id) === q);
    if (ch) return selectHex("customer", ch.properties.customer_hex_id);
    const w = workers.find(x => [x.workerId, x.fullName, x.profession, x.ipuc, x.slug].some(v => normalize(v).includes(q)));
    if (w) { const f = workerHexes.find(h => Number.isFinite(+w.longitude) && Number.isFinite(+w.latitude) && pointInGeometry([+w.longitude, +w.latitude], h.geometry)); if (f) selectHex("worker", f.properties.worker_hex_id); }
  }

  return <main style={S.page}>
    <header style={S.header}><div><h1 style={S.h1}>INFIXO MAP</h1><p style={S.sub}>Indore — fixed Customer Hex + Worker Hex network</p></div><Link href="/admin/workers" style={S.link}>Workers</Link></header>
    <section style={S.stats}><Stat label="Workers" value={workers.length}/><Stat label="Customer Hex" value={customer.length}/><Stat label="Worker Hex" value={workerHexes.length}/>{CATEGORIES.map(c => <Stat key={c} label={`${c}s`} value={categoryCounts[c]}/>)}</section>
    <section style={S.toolbar}><div style={S.search}><input style={S.input} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()} placeholder="Worker ID, name, WH-01 or Customer Hex ID"/><button style={S.btn} onClick={runSearch}>Search</button></div><div style={S.buttons}><button style={S.btn} onClick={() => zoomAt(1.35)}>＋</button><button style={S.btn} onClick={() => zoomAt(.74)}>−</button><button style={S.btn} onClick={fitAll}>Reset</button></div></section>
    <section style={S.layers}>{[["customer","Customer Hex"],["worker","Worker Hex"],["boundary","IMC Boundary"]].map(([k,l]) => <label key={k} style={S.toggle}><input type="checkbox" checked={layers[k]} onChange={() => setLayers(x => ({...x,[k]:!x[k]}))}/>{l}</label>)}</section>
    <section style={S.mapShell}>
      {loading ? <div style={S.loading}>Loading INFIXO map…</div> : <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={S.svg} onWheel={onWheel} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
        <rect width={W} height={H} fill="#f7f8fa"/>
        {layers.boundary && boundary?.features?.map((f,i) => <path key={`b${i}`} d={geometryPath(f.geometry, project)} fill="none" stroke="#d33" strokeWidth={2.5 / view.scale}/>) }
        {layers.customer && customer.map(f => { const id=f.properties?.customer_hex_id; const selectedId=selected?.type==="customer"&&selected.id===id; return <path key={id} d={geometryPath(f.geometry,project)} fill={selectedId?"#9ec9ee":"#cfe3f5"} fillOpacity={selectedId?.9:.82} stroke={selectedId?"#002d97":"#4d7ba6"} strokeWidth={(selectedId?3:0.7)/view.scale} onClick={e=>{e.stopPropagation();selectHex("customer",id)}}/>; })}
        {layers.worker && workerHexes.map(f => { const id=f.properties?.worker_hex_id; const selectedId=selected?.type==="worker"&&selected.id===id; return <path key={id} d={geometryPath(f.geometry,project)} fill="none" stroke={selectedId?"#002d97":"#0b2a4a"} strokeWidth={(selectedId?5:3)/view.scale} onClick={e=>{e.stopPropagation();selectHex("worker",id)}}/>; })}
        {selectedAreas.slice(0,8).map((name,i) => <text key={name} x={24} y={34+i*20} fontSize="14" fontWeight="700" fill="#001f6b">{name}</text>)}
      </svg>}
      <div style={S.mapHint}>Drag to move • Pinch / wheel to zoom • Tap a hex for area details</div>
    </section>
    <section style={S.detail}>{selectedCustomer ? <CustomerPanel feature={selectedCustomer} areaNames={areaNames}/> : selectedWorker ? <WorkerPanel hex={selectedWorker} workers={selectedWorkers} areaNames={areaNames}/> : <p style={S.muted}>Tap a Customer Hex or Worker Hex to see the real area/ward names.</p>}</section>
  </main>;
}

function Stat({label,value}) { return <div style={S.stat}><span>{label}</span><strong>{value}</strong></div>; }
function CustomerPanel({feature,areaNames}) { const p=feature.properties||{}, a=areaNames[p.customer_hex_id]||{}; return <><h2 style={S.detailTitle}>{p.customer_hex_id}</h2><div style={S.grid}><Info k="Worker Hex" v={p.worker_hex_id}/><Info k="Area inside IMC" v={p.area_inside_imc_km2 ? `${p.area_inside_imc_km2} km²` : "—"}/><Info k="Primary Ward" v={a.primary_ward||"—"}/><Info k="Other Areas / Wards" v={(a.ward_names||[]).join(", ")||"—"}/></div></>; }
function WorkerPanel({hex,workers,areaNames}) { const p=hex.properties||{}, set=new Set(); (p.customer_hex_ids||[]).forEach(id => (areaNames[id]?.ward_names||[]).forEach(n=>set.add(n))); return <><h2 style={S.detailTitle}>{p.worker_hex_id}</h2><div style={S.grid}><Info k="Customer Hexes" v={p.customer_hex_count}/><Info k="Workers" v={workers.length}/><Info wide k="Real Areas / Wards" v={[...set].join(", ")||"—"}/></div><div style={S.cats}>{CATEGORIES.map(c=><span key={c}>{c}: <b>{workers.filter(w=>categoryMatch(w.profession,c)).length}</b></span>)}</div>{workers.length>0&&<div style={S.workerList}>{workers.map(w=><WorkerRow key={w.id} worker={w}/>)}</div>}</>; }
function Info({k,v,wide}) { return <div style={wide?{...S.info,...S.wide}:S.info}><small>{k}</small><b>{v||"—"}</b></div>; }
function WorkerRow({worker}) { const link=workerLink(worker); return <div style={S.worker}><div><b>{worker.fullName||"Untitled Worker"}</b><small>{worker.profession||"—"} · ID: {worker.workerId||"—"}</small></div>{link&&<Link href={link} target="_blank" style={S.profile}>Full Profile</Link>}</div>; }

const S={page:{minHeight:"100vh",background:"#f7f8fa",padding:"16px",fontFamily:"Arial,sans-serif",color:"#172033"},header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12},h1:{margin:0,fontSize:24,color:"#001f6b"},sub:{margin:"4px 0 0",color:"#667085",fontSize:13},link:{textDecoration:"none",fontWeight:700,color:"#002d97"},stats:{display:"grid",gridTemplateColumns:"repeat(6,minmax(0,1fr))",gap:8,marginBottom:10},stat:{background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 10px",display:"flex",flexDirection:"column",gap:3},toolbar:{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"},search:{display:"flex",gap:6,flex:1,minWidth:240},input:{flex:1,minWidth:0,border:"1px solid #d0d5dd",borderRadius:9,padding:"10px 12px",fontSize:14},btn:{border:0,borderRadius:9,padding:"9px 13px",background:"#002d97",color:"white",fontWeight:700,cursor:"pointer"},buttons:{display:"flex",gap:6},layers:{display:"flex",gap:12,flexWrap:"wrap",marginBottom:8},toggle:{background:"white",border:"1px solid #e5e7eb",borderRadius:9,padding:"7px 10px",fontSize:13,fontWeight:600},mapShell:{position:"relative",background:"#eef3f8",border:"1px solid #d8dee8",borderRadius:14,overflow:"hidden",touchAction:"none",minHeight:360},svg:{width:"100%",height:"min(68vh,620px)",display:"block",cursor:"grab",touchAction:"none"},loading:{height:420,display:"grid",placeItems:"center",color:"#667085"},mapHint:{position:"absolute",bottom:8,left:8,background:"rgba(255,255,255,.9)",borderRadius:8,padding:"6px 9px",fontSize:11,color:"#667085",pointerEvents:"none"},detail:{marginTop:10,background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:14},detailTitle:{margin:"0 0 10px",color:"#001f6b"},grid:{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:8},info:{background:"#f7f8fa",borderRadius:9,padding:9,display:"flex",flexDirection:"column",gap:3},wide:{gridColumn:"1/-1"},cats:{display:"flex",gap:8,flexWrap:"wrap",marginTop:10},workerList:{display:"grid",gap:7,marginTop:10},worker:{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,border:"1px solid #e5e7eb",borderRadius:9,padding:9},profile:{color:"#002d97",fontWeight:700,fontSize:12},muted:{color:"#667085"}};
