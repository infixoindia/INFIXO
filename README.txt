INFIXO INTERNAL LOCATION + MAP WORKER FIX

Root cause found:
- worker_service_areas contains the exact coordinates correctly.
- infixo_worker_hexes table is currently empty (0 rows), so the foreign key prevented a worker_hex_membership row from being created.
- The current map's fixed Worker Hex source is public/gis/worker_hex_final.geojson, so map assignment should use that fixed geometry instead of requiring the DB hex table to be seeded.

This patch:
- keeps Full address / Pincode / Lat / Lon private.
- saves the exact location without failing when the DB Worker Hex table is empty.
- makes the map API use worker_service_areas as the source of map workers.
- calculates workerHexId from the fixed Worker Hex GeoJSON.
- makes selected Worker Hex worker counts use workerHexId.
- makes search show a clear Found / No results message.

After copying this patch into the repo, run apply_map_search_fix.py once from repo root.
