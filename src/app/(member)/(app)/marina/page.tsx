import { ProfileHero } from "@/components/member/ProfileHero";
import { SectionTitle } from "@/components/member/ui";
import {
  ClockIcon,
  DogAreaIcon,
  EvChargingIcon,
  FuelIcon,
  IceIcon,
  LaundryIcon,
  PlusIcon,
  ShowerIcon,
  WifiIcon,
} from "@/components/icons";
import { currentMarina } from "@/lib/data";
import type { Amenity, AmenityIconId } from "@/lib/types";

const AMENITY_ICONS: Record<AmenityIconId, typeof FuelIcon> = {
  fuel: FuelIcon,
  pumpOut: ClockIcon,
  showers: ShowerIcon,
  wifi: WifiIcon,
  evCharging: EvChargingIcon,
  laundry: LaundryIcon,
  ice: IceIcon,
  dogArea: DogAreaIcon,
};

function AmenityTile({ amenity }: { amenity: Amenity }) {
  const Icon = AMENITY_ICONS[amenity.icon];
  return (
    <div
      className={`flex flex-col gap-[7px] rounded-xl border bg-white p-3 ${
        amenity.verified ? "border-line" : "border-dashed border-dock"
      }`}
    >
      <span
        className={`grid h-6 w-6 place-items-center rounded-[7px] ${
          amenity.verified ? "bg-navy" : "bg-paper-dim"
        }`}
      >
        <Icon className={`h-3 w-3 ${amenity.verified ? "text-dock" : "text-navy"}`} />
      </span>
      <div className="text-[11.5px] font-semibold text-navy">{amenity.label}</div>
      <div className="u-mono text-[8.5px] text-ink-soft">{amenity.note}</div>
    </div>
  );
}

export default function MarinaProfilePage() {
  const { name, location, status, hours, amenities } = currentMarina;
  const verified = amenities.filter((a) => a.verified);
  const submitted = amenities.filter((a) => !a.verified);

  return (
    <>
      <ProfileHero name={name} location={location} />

      <div className="flex items-center gap-2 bg-navy px-5 py-[11px]">
        <span className="h-[7px] w-[7px] rounded-full bg-seaglass" />
        <span className="u-mono text-[10px] font-bold tracking-[0.04em] text-paper/75">
          {status === "verified" ? "Verified · Staff-managed" : "Community-run"}
        </span>
      </div>

      <SectionTitle>Hours</SectionTitle>
      <div className="mx-5 mb-3 rounded-xl border border-line bg-white p-3.5">
        {hours.rows.map((row, i) => (
          <div
            key={row.label}
            className={`flex justify-between py-1.5 text-[12.5px] ${
              row.isToday ? "font-bold text-navy" : "text-ink-soft"
            } ${i > 0 ? "border-t border-line" : ""}`}
          >
            <span>{row.label}</span>
            <span>{row.time}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-line py-1.5 text-[12.5px] text-ink-soft">
          <span>Fuel dock</span>
          <span>{hours.fuelDock}</span>
        </div>
      </div>

      <SectionTitle
        badge={
          <span className="u-mono rounded-full bg-seaglass/12 px-[7px] py-[2px] text-[8px] font-bold tracking-[0.04em] text-seaglass">
            {verified.length} verified
          </span>
        }
      >
        Amenities
      </SectionTitle>
      <div className="grid grid-cols-2 gap-2.5 px-5 pb-1.5">
        {verified.map((a) => (
          <AmenityTile key={a.id} amenity={a} />
        ))}
      </div>

      {submitted.length > 0 && (
        <>
          <SectionTitle
            badge={
              <span className="u-mono rounded-full bg-dock/22 px-[7px] py-[2px] text-[8px] font-bold tracking-[0.03em] text-[#8A6A2E]">
                Member-submitted
              </span>
            }
          >
            Also here
          </SectionTitle>
          <div className="grid grid-cols-2 gap-2.5 px-5 pb-1.5">
            {submitted.map((a) => (
              <AmenityTile key={a.id} amenity={a} />
            ))}
          </div>
        </>
      )}

      <button
        type="button"
        className="mx-5 mb-4 mt-2.5 flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-line py-3 text-[11.5px] font-semibold text-ink-soft transition-colors hover:border-dock"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Suggest an amenity
      </button>
    </>
  );
}
