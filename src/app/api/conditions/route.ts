import { NextRequest, NextResponse } from "next/server";
import { fetchLiveConditions } from "@/lib/noaa";

// Not cached by Next.js (Route Handlers are request-time by default) —
// fetchLiveConditions() does its own TTL caching in-memory, keyed by
// coordinate, so repeated requests for the same marina within the cache
// window don't re-hit NOAA/NWS.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng query params are required" }, { status: 400 });
  }

  const conditions = await fetchLiveConditions(lat, lng);
  return NextResponse.json(conditions);
}
