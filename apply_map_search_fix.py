from pathlib import Path
import re

p = Path('app/components/adminMap/MapClient.js')
if not p.exists():
    raise SystemExit('MapClient.js not found')
s = p.read_text()

if 'const [searchMessage, setSearchMessage]' not in s:
    s = s.replace('  const [search, setSearch] = useState("");', '  const [search, setSearch] = useState("");\n  const [searchMessage, setSearchMessage] = useState("");')

start = s.find('  function runSearch() {')
end = s.find('\n\n  const clipPath', start)
if start < 0 or end < 0:
    raise SystemExit('runSearch boundaries not found')
new = '''  function runSearch() {
    const q = normalize(search);
    if (!q) { setSearchMessage(""); return; }
    const wh = workerHexes.find(f => normalize(f.properties?.worker_hex_id) === q);
    if (wh) { selectHex("worker", wh.properties.worker_hex_id); setSearchMessage(`Found ${wh.properties.worker_hex_id}`); return; }
    const chByCode = customerByCode.get(q);
    if (chByCode) { selectHex("customer", chByCode.properties.customer_hex_id); setSearchMessage(`Found ${q.toUpperCase()}`); return; }
    const ch = customer.find(f => normalize(f.properties?.customer_hex_id) === q);
    if (ch) { selectHex("customer", ch.properties.customer_hex_id); setSearchMessage(`Found Customer Hex`); return; }
    const w = workers.find(x => [x.workerId, x.fullName, x.profession, x.ipuc, x.slug].some(v => normalize(v).includes(q)));
    if (w) {
      const f = w.workerHexId
        ? workerHexes.find(h => normalize(h.properties?.worker_hex_id) === normalize(w.workerHexId))
        : workerHexes.find(h => Number.isFinite(+w.longitude) && Number.isFinite(+w.latitude) && pointInGeometry([+w.longitude, +w.latitude], h.geometry));
      if (f) { selectHex("worker", f.properties.worker_hex_id); setSearchMessage(`Found ${w.fullName || w.workerId} • ${f.properties.worker_hex_id}`); return; }
      setSearchMessage(`${w.fullName || w.workerId} found, but no Worker Hex matched this location`);
      return;
    }
    setSelected(null);
    setSearchMessage(`No results for “${search.trim()}”`);
  }'''
s = s[:start] + new + s[end:]

old = '''  const selectedWorkers = useMemo(() => {
    if (!selectedWorker) return [];
    return workers.filter(w => {
      const lon = +w.longitude, lat = +w.latitude;
      return Number.isFinite(lon) && Number.isFinite(lat) && pointInGeometry([lon, lat], selectedWorker.geometry);
    });
  }, [workers, selectedWorker]);'''
new2 = '''  const selectedWorkers = useMemo(() => {
    if (!selectedWorker) return [];
    return workers.filter(w => {
      if (w.workerHexId) return normalize(w.workerHexId) === normalize(selectedWorker.properties?.worker_hex_id);
      const lon = +w.longitude, lat = +w.latitude;
      return Number.isFinite(lon) && Number.isFinite(lat) && pointInGeometry([lon, lat], selectedWorker.geometry);
    });
  }, [workers, selectedWorker]);'''
if old in s:
    s=s.replace(old,new2)
else:
    raise SystemExit('selectedWorkers block not found')

old_toolbar = '<section style={S.toolbar}><div style={S.search}><input style={S.input} value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && runSearch()} placeholder="Worker ID, name, WH-01 or CH-36"/><button style={S.btn} onClick={runSearch}>Search</button></div><div style={S.buttons}>'
new_toolbar = '<section style={S.toolbar}><div style={S.search}><input style={S.input} value={search} onChange={e => { setSearch(e.target.value); setSearchMessage(""); }} onKeyDown={e => e.key === "Enter" && runSearch()} placeholder="Worker ID, name, WH-01 or CH-36"/><button style={S.btn} onClick={runSearch}>Search</button>{searchMessage && <div style={{fontSize:12,fontWeight:700,color:searchMessage.startsWith("No results") ? "#b42318" : "#027a48",marginTop:5}}>{searchMessage}</div>}</div><div style={S.buttons}>'
if old_toolbar in s:
    s=s.replace(old_toolbar,new_toolbar)
else:
    raise SystemExit('toolbar block not found')

p.write_text(s)
print('Map search fix applied')
