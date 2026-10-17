import { NextResponse } from "next/server";
import { publishedWorkerById } from "@/lib/workerPwaServer";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const worker = await publishedWorkerById(id);
    if (!worker) return NextResponse.redirect(new URL("/", request.url), { status: 302, headers: { "Cache-Control": "no-store" } });
    // Legacy installed icons now open the isolated worker-owned PWA route.
    const path = `/pwa/worker/${encodeURIComponent(worker.id)}`;
    return NextResponse.redirect(new URL(path, request.url), { status: 302, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Worker PWA launch unavailable:", error?.message || error);
    return NextResponse.json({ error: "Profile unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
