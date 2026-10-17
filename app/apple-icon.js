import { createBrandShortcutIcon } from "@/lib/shortcutIcon";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const alt = "INFIXO logo";

export default function AppleIcon() {
  return createBrandShortcutIcon(size.width);
}
