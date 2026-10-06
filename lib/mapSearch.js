import { findWorkerHexId } from "@/lib/mapWorkers";

export const normalizeText = v => String(v ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export function customerCode(index) { return `CH-${String(index + 1).padStart(2, "0")}`; }

// Returns { kind: "worker-hex" | "customer-hex" | "worker" | "worker-no-location" | "none" | "empty",
//           hexId?, message }
export function searchMap({ query, workers, workerHexes, customer }) {
  const raw = String(query ?? "").trim();
  const q = normalizeText(raw);
  if (!q) return { kind: "empty", message: "" };

  const wh = (workerHexes || []).find(f => normalizeText(f.properties?.worker_hex_id) === q);
  if (wh) { const id = wh.properties.worker_hex_id; return { kind: "worker-hex", hexId: id, message: `Found ${id}` }; }

  const idx = (customer || []).findIndex((f, i) => customerCode(i).toLowerCase() === q);
  if (idx >= 0) return { kind: "customer-hex", hexId: customer[idx].properties.customer_hex_id, message: `Found ${customerCode(idx)}` };

  const orig = (customer || []).find(f => normalizeText(f.properties?.customer_hex_id) === q);
  if (orig) return { kind: "customer-hex", hexId: orig.properties.customer_hex_id, message: `Found Customer Hex ${orig.properties.customer_hex_id}` };

  const matches = (workers || []).filter(w => [w.workerId, w.fullName, w.profession, w.ipuc, w.slug, w.workerHexId].some(v => normalizeText(v).includes(q)));
  const placed = matches.find(w => (w.workerHexId || findWorkerHexId(+w.longitude, +w.latitude, workerHexes)) && Number.isFinite(+w.latitude) && w.latitude !== null);
  if (placed) {
    const hexId = placed.workerHexId || findWorkerHexId(+placed.longitude, +placed.latitude, workerHexes);
    const extra = matches.length > 1 ? ` (+${matches.length - 1} more)` : "";
    return { kind: "worker", hexId, message: `Found ${placed.fullName || placed.workerId} • ${hexId}${extra}` };
  }
  if (matches.length) {
    const w = matches[0];
    return { kind: "worker-no-location", message: `${w.fullName || w.workerId} found, but has no map location (Internal Location Lat/Lon missing)` };
  }
  return { kind: "none", message: `No results for “${raw}”` };
}
