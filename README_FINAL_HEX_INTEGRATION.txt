INFIXO MAP — FINAL CLAUDE HEX GEOMETRY INTEGRATION

This patch replaces the runtime-generated Worker Hex geometry with the approved finalized GeoJSON geometry.

Source of truth:
- public/gis/customer_hex_v2.geojson = 149 fixed Customer Hexes
- public/gis/worker_hex_final.geojson = 19 fixed Worker Hexes
- public/gis/imc_boundary_dissolved.geojson = existing IMC boundary

No geometry is recomputed, regenerated, merged, split, simplified, or edited at runtime.
Worker location is assigned to the provided Worker Hex polygons by point-in-polygon only.

Counts verified:
- Customer Hexes: 149
- Worker Hexes: 19
- Worker Hex customer counts: 12x7, 3x9, 2x11, 1x10, 1x6 = 149
- Every Worker Hex geometry is exactly the union of its listed Customer Hex geometries.
- All supplied Customer/Worker geometries are valid.

Supabase SQL is not required for this design integration.
