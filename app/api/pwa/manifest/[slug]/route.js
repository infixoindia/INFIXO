import { NextResponse } from "next/server";
import { publishedWorkerBySlug } from "@/lib/workerPwaServer";
import { makeWorkerManifest } from "@/lib/workerPwa.mjs";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const worker = await publishedWorkerBySlug(slug);
    if (!worker) return NextResponse.json({ error: "Profile not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return new NextResponse(JSON.stringify(makeWorkerManifest(worker)), {
      headers: { "Content-Type": "application/manifest+json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  } catch (error) {
    console.error("Worker PWA manifest unavailable:", error?.message || error);
    return NextResponse.json({ error: "Profile manifest unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
