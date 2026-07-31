import type { LiveConditions, LiveTideCondition, LiveWindCondition } from "./types";

// Server-only (imported from the /api/conditions route handler). Fetches
// current tide (NOAA CO-OPS) and wind (NWS) for a lat/lng, nearest-station
// first, with per-source graceful degradation — a failure on one never
// blocks the other, and both report "unavailable" rather than throwing so
// the UI can render a clear state instead of stale/fake numbers.

const FETCH_TIMEOUT_MS = 8_000;
const USER_AGENT = "Cleat/1.0 (marina member app)"; // NWS asks for an identifying User-Agent

// Successes are cached longer than failures — if NOAA/NWS is briefly down,
// we don't want to lock in "unavailable" for the full window once it
// recovers, but we also don't want to hammer a down upstream every load.
const SUCCESS_TTL_MS = 20 * 60 * 1000; // 20 min — within the requested 15-30 min window
const FAILURE_TTL_MS = 2 * 60 * 1000;

const conditionsCache = new Map<string, { data: LiveConditions; expiresAt: number }>();

// The full CO-OPS station list is a few thousand entries but rarely
// changes — cached separately, much longer, from the actual tide readings.
const STATION_LIST_TTL_MS = 24 * 60 * 60 * 1000;
let stationListCache: { stations: TideStation[]; expiresAt: number } | null = null;

interface TideStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(FETCH_TIMEOUT_MS);
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // miles
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function nearestFirst<T extends { lat: number; lng: number }>(items: T[], lat: number, lng: number): T[] {
  return [...items].sort(
    (a, b) => haversineMiles(lat, lng, a.lat, a.lng) - haversineMiles(lat, lng, b.lat, b.lng),
  );
}

// ── tide (NOAA CO-OPS) ──────────────────────────────────────────────────────

async function fetchTideStations(): Promise<TideStation[]> {
  if (stationListCache && stationListCache.expiresAt > Date.now()) {
    return stationListCache.stations;
  }
  const res = await fetch(
    "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions",
    { signal: timeoutSignal() },
  );
  if (!res.ok) throw new Error(`NOAA station list fetch failed: ${res.status}`);
  const json = (await res.json()) as { stations?: { id: string; name: string; lat: number; lng: number }[] };
  const stations: TideStation[] = (json.stations ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    lat: s.lat,
    lng: s.lng,
  }));
  if (stations.length === 0) throw new Error("NOAA station list returned no stations");
  stationListCache = { stations, expiresAt: Date.now() + STATION_LIST_TTL_MS };
  return stations;
}

function yyyymmdd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

async function fetchPredictionsForStation(stationId: string): Promise<LiveTideCondition> {
  // Yesterday through tomorrow in GMT, hourly — small payload, but wide
  // enough to safely bracket "now" regardless of GMT/local date-boundary
  // edge cases near midnight.
  const beginDate = yyyymmdd(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const endDate = yyyymmdd(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const url =
    `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter` +
    `?product=predictions&application=cleat&datum=MLLW&units=english&interval=h&time_zone=gmt` +
    `&begin_date=${beginDate}&end_date=${endDate}&station=${stationId}&format=json`;
  const res = await fetch(url, { signal: timeoutSignal() });
  if (!res.ok) throw new Error(`NOAA tide predictions fetch failed: ${res.status}`);
  const json = (await res.json()) as { predictions?: { t: string; v: string }[]; error?: { message: string } };
  if (json.error) throw new Error(`NOAA tide predictions error: ${json.error.message}`);

  const points = (json.predictions ?? [])
    .map((p) => ({ time: Date.parse(`${p.t.replace(" ", "T")}Z`), value: parseFloat(p.v) }))
    .filter((p) => Number.isFinite(p.time) && Number.isFinite(p.value))
    .sort((a, b) => a.time - b.time);
  if (points.length < 2) throw new Error("NOAA returned insufficient tide predictions to interpolate");

  const now = Date.now();
  let prev = points[0];
  let next = points[points.length - 1];
  for (let i = 0; i < points.length - 1; i++) {
    if (points[i].time <= now && points[i + 1].time >= now) {
      prev = points[i];
      next = points[i + 1];
      break;
    }
  }

  const span = next.time - prev.time;
  const frac = span > 0 ? (now - prev.time) / span : 0;
  const height = prev.value + (next.value - prev.value) * frac;
  const trend: LiveTideCondition["trend"] =
    next.value > prev.value ? "rising" : next.value < prev.value ? "falling" : "steady";

  return { status: "ok", height: `${height.toFixed(1)} ft`, trend };
}

// NOAA's own metadata (type=tidepredictions) isn't fully reliable — some
// listed stations reject every datum with "No Predictions data was found"
// (confirmed against the live API, e.g. station 9447265 "Meadow Point,
// Shilshole Bay", the single nearest station to Shilshole Bay Marina).
// Rather than trust the geometrically nearest station blindly, try the
// closest few in order and use the first one that actually returns data.
const MAX_STATION_ATTEMPTS = 5;

async function fetchTideCondition(lat: number, lng: number): Promise<LiveTideCondition> {
  let lastErr: unknown;
  try {
    const stations = await fetchTideStations();
    const candidates = nearestFirst(stations, lat, lng).slice(0, MAX_STATION_ATTEMPTS);
    for (const station of candidates) {
      try {
        return await fetchPredictionsForStation(station.id);
      } catch (err) {
        lastErr = err;
        console.error("[noaa] tide station candidate failed, trying next:", station.id, station.name, err);
      }
    }
  } catch (err) {
    lastErr = err;
  }
  console.error("[noaa] fetchTideCondition failed for all candidates:", lastErr, { lat, lng });
  return { status: "unavailable" };
}

// ── wind (NWS) ───────────────────────────────────────────────────────────────

async function fetchWindCondition(lat: number, lng: number): Promise<LiveWindCondition> {
  try {
    // NWS gridpoints are ~2.5km — 4 decimal places is their own recommended
    // precision; finer than that just fragments their cache for no benefit.
    const pointsRes = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/geo+json" },
      signal: timeoutSignal(),
    });
    if (!pointsRes.ok) throw new Error(`NWS points lookup failed: ${pointsRes.status}`);
    const pointsJson = (await pointsRes.json()) as { properties?: { forecastHourly?: string } };
    const forecastHourlyUrl = pointsJson.properties?.forecastHourly;
    if (!forecastHourlyUrl) throw new Error("NWS points response missing forecastHourly URL");

    const forecastRes = await fetch(forecastHourlyUrl, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/geo+json" },
      signal: timeoutSignal(),
    });
    if (!forecastRes.ok) throw new Error(`NWS forecastHourly fetch failed: ${forecastRes.status}`);
    const forecastJson = (await forecastRes.json()) as {
      properties?: { periods?: { windSpeed?: string; windDirection?: string }[] };
    };
    const current = forecastJson.properties?.periods?.[0];
    if (!current?.windSpeed) throw new Error("NWS forecastHourly response missing current period");

    return { status: "ok", speed: current.windSpeed, direction: current.windDirection };
  } catch (err) {
    console.error("[noaa] fetchWindCondition failed:", err, { lat, lng });
    return { status: "unavailable" };
  }
}

// ── combined + cached entry point ───────────────────────────────────────────

export async function fetchLiveConditions(lat: number, lng: number): Promise<LiveConditions> {
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = conditionsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  const [tide, wind] = await Promise.all([fetchTideCondition(lat, lng), fetchWindCondition(lat, lng)]);
  const data: LiveConditions = { tide, wind };

  const bothFailed = tide.status !== "ok" && wind.status !== "ok";
  conditionsCache.set(cacheKey, {
    data,
    expiresAt: Date.now() + (bothFailed ? FAILURE_TTL_MS : SUCCESS_TTL_MS),
  });
  return data;
}
