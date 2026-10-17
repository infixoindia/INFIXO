import { createBrandShortcutIcon } from "@/lib/shortcutIcon";

export const runtime = "nodejs";
export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export const alt = "INFIXO logo";

export default function Icon() {
  return createBrandShortcutIcon(size.width);
}
