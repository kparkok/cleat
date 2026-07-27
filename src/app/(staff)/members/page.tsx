"use client";

import { useEffect, useState } from "react";
import { Pill, Th, Td } from "@/components/staff/ui";
import { fetchMembersData, type StaffMemberSummary } from "@/lib/staff-db";
import type { MemberVerification, StaffMember } from "@/lib/types";

function VerificationPill({ verification }: { verification: MemberVerification }) {
  if (verification.kind === "verified") {
    return <Pill tone="seaglass">Verified</Pill>;
  }
  if (verification.kind === "visiting") {
    return <Pill tone="amber">{verification.detail}</Pill>;
  }
  return <Pill tone="coral">{verification.detail}</Pill>;
}

export default function StaffMembersPage() {
  const [summary, setSummary] = useState<StaffMemberSummary | null>(null);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchMembersData()
      .then((data) => {
        setSummary(data.summary);
        setMembers(data.members);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <h1 className="font-serif text-[22px] font-semibold text-navy">Members</h1>
      <div className="u-mono mb-[22px] mt-1 text-[11px] text-ink-soft">
        {loading || !summary
          ? "LOADING…"
          : `${summary.active} ACTIVE · ${summary.visitingThisWeek} VISITING THIS WEEK · ${summary.pendingVerification} PENDING VERIFICATION`}
      </div>

      {error ? (
        <div className="rounded-[10px] border border-coral/30 bg-coral/5 p-4 text-[13px] text-coral">
          Couldn&apos;t load member data. Try refreshing.
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <Th>Member</Th>
              <Th>Usage</Th>
              <Th>Slip</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {!loading && members.length === 0 && (
              <tr>
                <Td>
                  <span className="text-ink-soft">No members at this marina yet.</span>
                </Td>
                <Td>—</Td>
                <Td>—</Td>
                <Td>—</Td>
              </tr>
            )}
            {members.map((member) => (
              <tr key={member.id}>
                <Td>
                  <span className="u-mono mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-paper-dim align-middle text-[9px] font-bold normal-case tracking-normal text-navy">
                    {member.initials}
                  </span>
                  {member.name}
                </Td>
                <Td>{member.usage}</Td>
                <Td>{member.slip}</Td>
                <Td>
                  <VerificationPill verification={member.verification} />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
