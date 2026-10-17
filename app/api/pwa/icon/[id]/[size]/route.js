import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { publishedWorkerById } from "@/lib/workerPwaServer";
import { isSafeProfilePhotoUrl, pickWorkerIconSlide } from "@/lib/workerPwa.mjs";
import { layoutCrop, validCrop } from "@/lib/photoCrop";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

let logoFilePromise;
function officialLogo() {
  // Same official logo used on the live worker header; no duplicated artwork.
  if (!logoFilePromise) logoFilePromise = readFile(path.join(process.cwd(), "public", "images", "logo.png"));
  return logoFilePromise;
}

async function verifiedPhoto(slide) {
  const photoUrl = slide?.image;
  if (!isSafeProfilePhotoUrl(photoUrl, process.env.NEXT_PUBLIC_SUPABASE_URL)) return null;
  try {
    const res = await fetch(photoUrl, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").split(";")[0].toLowerCase();
    if (!["image/jpeg", "image/png", "image/webp"].includes(type)) return null;
    if (Number(res.headers.get("content-length") || "0") > 8 * 1024 * 1024) return null;
    const data = Buffer.from(await res.arrayBuffer());
    if (!data.length || data.length > 8 * 1024 * 1024) return null;
    return `data:${type};base64,${data.toString("base64")}`;
  } catch { return null; }
}

export async function GET(_request, { params }) {
  const { id, size: rawSize } = await params;
  const size = Number(rawSize);
  if (size !== 192 && size !== 512) return new Response("Unsupported icon size", { status: 404 });
  try {
    const worker = await publishedWorkerById(id);
    if (!worker) return new Response("Profile not found", { status: 404, headers: { "Cache-Control": "no-store" } });
    const slide = pickWorkerIconSlide(worker.hero_slides);
    const photo = await verifiedPhoto(slide);
    const logo = `data:image/png;base64,${(await officialLogo()).toString("base64")}`;
    const crop = slide?.pwaCrop;
    const frame = photo && validCrop(crop) ? layoutCrop(size, size, crop) : null;
    return new ImageResponse(
      <div style={{ display: "flex", position: "relative", width: size, height: size, overflow: "hidden", backgroundColor: "#002D97" }}>
        {photo && <img src={photo} alt="" style={{
          position: "absolute", left: frame ? frame.left : 0, top: frame ? frame.top : 0,
          width: frame ? frame.width : size, height: frame ? frame.height : size,
          objectFit: frame ? "fill" : "cover", objectPosition: "center 35%"
        }} />}
        <div style={{ display: "flex", position: "absolute", bottom: 0, left: 0, right: 0, height: size * 0.37,
          background: "linear-gradient(180deg, rgba(3,19,43,0), rgba(3,19,43,0.78))" }} />
        <img src={logo} alt="" style={{ position: "absolute", bottom: size * 0.045, left: size * 0.14,
          width: size * 0.72, height: size * 0.22, objectFit: "contain" }} />
      </div>,
      { width: size, height: size, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } }
    );
  } catch (err) {
    console.error("Worker PWA icon unavailable:", err?.message || err);
    return new Response("Profile icon unavailable", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
