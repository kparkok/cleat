import type { SVGProps } from "react";

// Line icons matching the mockup: 24x24 grid, no fill, stroke = currentColor.
// Color is controlled by the parent via `text-*`; size via `className`.

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </Base>
  );
}

export function NewsIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </Base>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 6-6 8-6s6.5 2 8 6" />
    </Base>
  );
}

export function MarinaIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 2 L4 7 L4 15 L12 22 L20 15 L20 7 Z" />
    </Base>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v4a2 2 0 0 1-2 2C9 21 3 15 3 7a2 2 0 0 1 1-3Z" />
    </Base>
  );
}

export function HeartIcon({ filled, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Base strokeWidth={1.8} fill={filled ? "currentColor" : undefined} {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </Base>
  );
}

export function ReplyIcon(props: IconProps) {
  return (
    <Base strokeWidth={1.8} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </Base>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Base strokeWidth={2.2} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Base strokeWidth={2} {...props}>
      <path d="M15 18l-6-6 6-6" />
    </Base>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Base strokeWidth={2} {...props}>
      <path d="M9 6l6 6-6 6" />
    </Base>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Base strokeWidth={2} {...props}>
      <path d="M6 9l6 6 6-6" />
    </Base>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Base strokeWidth={2.5} {...props}>
      <path d="M20 6L9 17l-5-5" />
    </Base>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Base strokeWidth={2} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Base>
  );
}

export function FileIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M6 2h9l5 5v15H6z" />
      <path d="M15 2v5h5" />
    </Base>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4m0 4h.01" />
    </Base>
  );
}

export function IssuesIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4m0 4h.01" />
    </Base>
  );
}

export function MoreVerticalIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
    </Base>
  );
}

// ---- Amenity icons ----

export function FuelIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </Base>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </Base>
  );
}

export function ShowerIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="3" y="8" width="18" height="10" rx="2" />
      <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
    </Base>
  );
}

export function WifiIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M5 12h14M5 12a7 7 0 0 1 14 0M5 12a7 7 0 0 0 14 0" />
    </Base>
  );
}

export function EvChargingIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="7" width="16" height="10" rx="2" />
      <path d="M20 10h2v4h-2" />
    </Base>
  );
}

export function LaundryIcon(props: IconProps) {
  return (
    <Base {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 10h16" />
    </Base>
  );
}

export function IceIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M12 2v20M2 12h20" />
    </Base>
  );
}

export function DogAreaIcon(props: IconProps) {
  return (
    <Base {...props}>
      <path d="M4 21v-7a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v7" />
    </Base>
  );
}
