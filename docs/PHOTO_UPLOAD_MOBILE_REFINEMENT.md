# Admin Work Photos: Mobile UI refinement

- Keep the existing thumbnail ✕ Remove button visible.
- Tap the thumbnail to open the full original image. Viewer has a different ✕ Close button.
- Two viewer buttons: Frame (non-destructive 3:4 gallery framing) and Replace.
- Long-press + drag (Android) / mouse drag to reorder; no thumbnail ↑ ↓ controls.
- Upload percentage only during active upload, gone after save; failed uploads show Retry.
- Add Photos supports multi-select where Android Files picker allows it, and repeated selection otherwise.
- Old image URLs, Work Profile public design, Videos and Identity unchanged.
- Isolated staging feature branch only; production and SIGMA untouched.
- Run both work photo test suites, Next.js build, and Android preview acceptance QA before main merge.
