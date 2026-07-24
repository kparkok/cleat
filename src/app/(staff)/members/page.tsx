import { Pill, Th, Td } from "@/components/staff/ui";
import { memberSummary, staffMembers } from "@/lib/data";
import type { MemberVerification } from "@/lib/types";

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
  return (
    <>
      <h1 className="font-serif text-[22px] font-semibold text-navy">Members</h1>
      <div className="u-mono mb-[22px] mt-1 text-[11px] text-ink-soft">
        {memberSummary.active} ACTIVE · {memberSummary.visitingThisWeek} VISITING
        THIS WEEK · {memberSummary.pendingVerification} PENDING VERIFICATION
      </div>

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
          {staffMembers.map((member) => (
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
    </>
  );
}
