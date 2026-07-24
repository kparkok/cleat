import Image from "next/image";

const DARK_OVERLAY =
  "linear-gradient(180deg, rgba(8,24,38,0.1) 0%, rgba(8,24,38,0.75) 100%)";
const DEFAULT_SEA_GRADIENT =
  "linear-gradient(180deg, #4A7A8C 0%, #6B9CAA 40%, #A8C4C9 70%, #C9D8D4 100%)";

/**
 * Home screen hero. Every marina gets this illustrated gradient banner by
 * default; if staff upload a custom banner image (bannerImageUrl on the
 * marina record), that photo renders instead with the same dark-bottom
 * overlay so the name/subtitle stay legible.
 */
export function HeroBanner({
  name,
  subtitle,
  imageUrl,
}: {
  name: string;
  subtitle: string;
  imageUrl?: string;
}) {
  return (
    <div className="relative h-[190px] shrink-0 overflow-hidden">
      {imageUrl ? (
        <>
          <Image src={imageUrl} alt="" fill priority className="object-cover" />
          <div className="absolute inset-0" style={{ backgroundImage: DARK_OVERLAY }} />
        </>
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundImage: `${DARK_OVERLAY}, ${DEFAULT_SEA_GRADIENT}` }}
        >
          <DockSilhouette />
        </div>
      )}

      <div className="absolute bottom-3.5 left-5 z-10">
        <div className="font-serif text-[21px] font-semibold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.3)]">
          {name}
        </div>
        <div className="u-mono mt-0.5 text-[10px] tracking-[0.08em] text-dock">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

/**
 * Dock/pier silhouette illustration used as the default banner art. Piers
 * and boat hulls are kept in the right two-thirds of the 440-wide viewBox —
 * our mobile frame maxes out at 440px — so they never collide with the
 * marina name/subtitle, which sit bottom-left.
 */
function DockSilhouette() {
  return (
    <svg
      className="absolute bottom-0 left-0 right-0 h-[70px] w-full"
      viewBox="0 0 440 70"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect x="0" y="30" width="440" height="4" fill="#C9A876" opacity="0.85" />
      <rect x="250" y="0" width="4" height="70" fill="#0F2A3D" opacity="0.5" />
      <rect x="320" y="0" width="4" height="70" fill="#0F2A3D" opacity="0.5" />
      <rect x="390" y="0" width="4" height="70" fill="#0F2A3D" opacity="0.5" />
      <path d="M260 45 q15 -10 30 0 l0 15 l-30 0 Z" fill="#F6F3EC" opacity="0.85" />
      <path d="M350 40 q18 -12 36 0 l0 18 l-36 0 Z" fill="#F6F3EC" opacity="0.85" />
    </svg>
  );
}
