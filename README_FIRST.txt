INFIXO MAP — FINAL PATCH

Purpose: one clean Admin entry point for INFIXO MAP without changing the public INFIXO UI/profile system.

Included:
- /admin/workers updated with + Add New Worker and INFIXO MAP buttons
- /admin/map protected by the existing /admin middleware
- existing 149 Customer Hex GIS included under public/gis/
- deterministic Worker Hex parent layer
- Customer Hex ↔ Worker Hex in-memory relationship
- worker ID/name/profession search
- live worker/category counters from the existing workers table
- worker dots and Worker Hex worker lists
- existing public profile link from the worker record
- graceful configuration message when SUPABASE_SERVICE_ROLE_KEY is missing
- no fake worker or demand data
- no changes to public home/profile/gallery/video/sharing routes

IMPORTANT:
The map API reads worker coordinates from worker_service_areas. A worker without valid latitude/longitude is not placed on a Worker Hex.
Worker Hex is NOT a service-radius boundary.
Customer demand values remain 0 until real customer-query data exists.

DATABASE:
No Supabase SQL is required for this patch. The current map computes the deterministic Customer Hex → Worker Hex relationship in the map layer and reads live worker coordinates from the existing worker_service_areas table.

ENVIRONMENT:
The map API needs the server-only SUPABASE_SERVICE_ROLE_KEY to load real workers. Do not expose this key in client code or NEXT_PUBLIC_* variables.

TEST TARGETS:
1. /admin/workers shows both buttons.
2. Clicking INFIXO MAP opens /admin/map.
3. 149 Customer Hexes render without HexGrid null errors.
4. Worker Hexes render above the Customer Hexes.
5. Search does not crash when there are zero workers.
6. Missing service-role key shows a configuration warning instead of HTTP 500.
7. Public home and worker profile UI are untouched.
