INFIXO MAP — ONE-SHOT STABILITY PATCH v6

Changed:
- MapLibre loader switched to stable UMD build (4.7.1) with CDN fallbacks.
- Worker API is now non-blocking and never produces a 500 popup in the map UI.
- Map loads from the four fixed GIS files independently of worker data.
- OSM raster base map retained.
- Customer/Worker/IMC sliders remain removed; clean ON/OFF toggles only.
- Exact 149 Customer Hex / 19 Worker Hex geometry is untouched.

No Supabase SQL is required.
