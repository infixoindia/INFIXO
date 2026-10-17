import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createElement } from "react";

// Use the existing, exact official INFIXO wordmark (without tagline).
// Never redraw the brand typography or crop off its X/O.
// The square white canvas supplies launcher-safe margins.
export async function createBrandShortcutIcon(pixelSize) {
  if (![180, 512].includes(pixelSize)) {
    throw new Error("Unsupported icon size");
  }

  const logo = await readFile(join(process.cwd(), "public", "images", "logo.png"));
  const source = "data:image/png;base64," + logo.toString("base64");

  // Original wordmark: 1193 × 364. Fit it fully inside an 88%-wide safe area.
  const logoWidth = Math.round(pixelSize * 0.88);
  const logoHeight = Math.round((logoWidth * 364) / 1193);

  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
        },
      },
      createElement("img", {
        src: source,
        alt: "INFIXO",
        width: logoWidth,
        height: logoHeight,
        style: { objectFit: "contain" },
      })
    ),
    { width: pixelSize, height: pixelSize }
  );
}
