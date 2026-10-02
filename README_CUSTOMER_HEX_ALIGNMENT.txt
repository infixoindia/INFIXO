INFIXO MAP — Customer Hex Alignment Patch

Purpose:
- Worker Hexes are now built from the existing 149 Customer Hexes instead of an independent overlapping parent grid.
- Customer Hexes are grouped deterministically into contiguous Worker Hex groups.
- Target is 7 Customer Hexes per Worker Hex; boundary groups may contain more when required so 1–2-cell fragments are not left alone.
- Worker Hex boundaries are complete regular hexagons sized to fully contain every assigned Customer Hex.
- Existing Customer Hex IDs and GIS geometry are unchanged.
- Worker location lookup now resolves against the generated Worker Hex boundaries.

No Supabase SQL is required.
No public UI changes are included.
