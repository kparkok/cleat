import { StatCard, Pill, Th, Td } from "@/components/staff/ui";
import { announcements, currentMarina, dashboardStats } from "@/lib/data";
import {
  ANNOUNCEMENT_CATEGORY_LABELS,
  ANNOUNCEMENT_STATUS_LABELS,
  type AnnouncementStatus,
} from "@/lib/types";

const STATUS_TONE: Record<AnnouncementStatus, "seaglass" | "amber" | "coral"> = {
  sent: "seaglass",
  scheduled: "amber",
  draft: "coral",
};

export default function StaffDashboardPage() {
  const today = new Date()
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();

  return (
    <>
      <h1 className="font-serif text-[22px] font-semibold text-navy">Dashboard</h1>
      <div className="u-mono mb-[22px] mt-1 text-[11px] text-ink-soft">
        {currentMarina.name.toUpperCase()} · {today}
      </div>

      <div className="mb-[26px] flex gap-3.5">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <Th>Recent announcements</Th>
            <Th>Category</Th>
            <Th>Status</Th>
            <Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((a) => (
            <tr key={a.id}>
              <Td>{a.title}</Td>
              <Td>{ANNOUNCEMENT_CATEGORY_LABELS[a.category]}</Td>
              <Td>
                <Pill tone={STATUS_TONE[a.status]}>
                  {ANNOUNCEMENT_STATUS_LABELS[a.status]}
                </Pill>
              </Td>
              <Td>{a.date || "—"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
