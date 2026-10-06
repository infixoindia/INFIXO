INFIXO MAP WORKER API FIX

Replace only:
app/api/admin/map/workers/route.js

Fixes:
- Reads workers independently from worker_service_areas.
- Uses the latest valid internal location row per worker.
- Does not hide all workers if an optional location/availability query has an error.
- Calculates Worker Hex from the fixed public/gis/worker_hex_final.geojson.
- Keeps only active workers with valid internal latitude/longitude for map display.
- Does not change any hex geometry or Supabase hex tables.
