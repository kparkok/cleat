import { supabase } from "./supabase";
import type { Amenity, AmenityIconId, Contact, Marina, MarinaHoursRow } from "./types";

// ── DB row shapes ──────────────────────────────────────────────────────────

interface DbHoursRow {
  id: string;
  label: string;
  time: string;
  sort_order: number;
}

interface DbAmenityRow {
  id: string;
  label: string;
  icon: string;
  note: string | null;
  verified: boolean;
}

interface DbMarinaRow {
  id: string;
  name: string;
  location: string;
  status: "verified" | "community";
  banner_image_url: string | null;
  conditions_tide: string | null;
  conditions_tide_trend: string | null;
  conditions_water_temp: string | null;
  conditions_wind: string | null;
  office_hours: string | null;
  office_phone: string | null;
  office_location: string | null;
  fuel_dock_hours: string | null;
  marina_hours: DbHoursRow[];
  amenities: DbAmenityRow[];
}

// ── today helper ────────────────────────────────────────────────────────────

const DAY_ABBREVS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function isToday(label: string): boolean {
  const abbrev = DAY_ABBREVS[new Date().getDay()];
  return label.includes(abbrev);
}

// ── transform ────────────────────────────────────────────────────────────────

function toMarina(row: DbMarinaRow): Marina {
  const hoursRows: MarinaHoursRow[] = [...row.marina_hours]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((h) => ({
      label: isToday(h.label) ? `Today (${h.label})` : h.label,
      time: h.time,
      isToday: isToday(h.label),
    }));

  const amenities: Amenity[] = row.amenities.map((a) => ({
    id: a.id,
    label: a.label,
    icon: a.icon as AmenityIconId,
    note: a.note ?? "",
    verified: a.verified,
  }));

  return {
    id: row.id,
    name: row.name,
    location: row.location,
    slip: "",
    bannerImageUrl: row.banner_image_url ?? undefined,
    status: row.status,
    conditions: {
      tide: row.conditions_tide ?? "",
      tideTrend: row.conditions_tide_trend ?? "",
      waterTemp: row.conditions_water_temp ?? "",
      wind: row.conditions_wind ?? "",
    },
    hours: {
      rows: hoursRows,
      fuelDock: row.fuel_dock_hours ?? "",
    },
    amenities,
    office: {
      hours: row.office_hours ?? "",
      phone: row.office_phone ?? "",
      location: row.office_location ?? "",
    },
  };
}

// ── public API ───────────────────────────────────────────────────────────────

export async function fetchMarinas(): Promise<Marina[]> {
  const { data, error } = await supabase
    .from("marinas")
    .select("*, marina_hours(*), amenities(*)");

  if (error) throw error;
  return (data as DbMarinaRow[]).map(toMarina);
}

// ── contacts ─────────────────────────────────────────────────────────────────

interface DbContactRow {
  id: string;
  name: string;
  role: string;
  phone: string;
  is_emergency: boolean;
}

export async function fetchContacts(marinaId: string): Promise<Contact[]> {
  const { data, error } = await supabase
    .from("contacts")
    .select("id, name, role, phone, is_emergency")
    .eq("marina_id", marinaId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data as DbContactRow[]).map((c) => ({
    id: c.id,
    name: c.name,
    role: c.role,
    phone: c.phone,
    emergency: c.is_emergency || undefined,
  }));
}
