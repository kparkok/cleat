"use client";

import { useEffect, useState } from "react";
import { StatCard, Pill, Th, Td } from "@/components/staff/ui";
import { fetchDashboardData } from "@/lib/staff-db";
import {
  ANNOUNCEMENT_CATEGORY_LABELS,
  ANNOUNCEMENT_STATUS_LABELS,
  type Announcement,
  type AnnouncementStatus,
  type DashboardStat,
} from "@/lib/types";

const STATUS_TONE: Record<AnnouncementStatus, "seaglass" | "amber" | "coral"> = {
  sent: "seaglass",
  scheduled: "amber",
  draft: "coral",
};

export default function StaffDashboardPage() {
  const [marinaName, setMarinaName] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const today = new Date()
    .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    .toUpperCase();

  useEffect(() => {
    fetchDashboardData()
      .then((data) => {
        setMarinaName(data.marinaName);
        setStats(data.stats);
        setAnnouncements(data.announcements);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <h1 className="font-serif text-[22px] font-semibold text-navy">Dashboard</h1>
      <div className="u-mono mb-[22px] mt-1 text-[11px] text-ink-soft">
        {loading ? "LOADING…" : (marinaName?.toUpperCase() ?? "—")} · {today}
      </div>

      {error ? (
        <div className="rounded-[10px] border border-coral/30 bg-coral/5 p-4 text-[13px] text-coral">
          Couldn&apos;t load dashboard data. Try refreshing.
        </div>
      ) : (
        <>
          <div className="mb-[26px] flex gap-3.5">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[74px] flex-1 animate-pulse rounded-[10px] border border-line bg-paper-dim"
                  />
                ))
              : stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
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
              {!loading && announcements.length === 0 && (
                <tr>
                  <Td>
                    <span className="text-ink-soft">No announcements yet for this marina.</span>
                  </Td>
                  <Td>—</Td>
                  <Td>—</Td>
                  <Td>—</Td>
                </tr>
              )}
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
      )}
    </>
  );
}
