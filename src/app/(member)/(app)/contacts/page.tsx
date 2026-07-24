"use client";

import Link from "next/link";
import { AppHeader, SectionTitle } from "@/components/member/ui";
import { useMarina } from "@/components/member/MarinaProvider";
import { AlertIcon, ChevronRightIcon, MarinaIcon, PhoneIcon, UserIcon } from "@/components/icons";
import { contacts } from "@/lib/data";

export default function ContactsPage() {
  const { activeMarina } = useMarina();
  const staff = contacts.filter((c) => !c.emergency);
  const emergency = contacts.filter((c) => c.emergency);

  return (
    <>
      <AppHeader title="Contacts" subtitle={activeMarina.name} />

      <SectionTitle>Marina staff</SectionTitle>
      {staff.map((contact) => (
        <div
          key={contact.id}
          className="mx-5 mb-2.5 flex items-center gap-[11px] rounded-xl border border-line bg-white p-[11px_13px]"
        >
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-paper-dim">
            <UserIcon className="h-4 w-4 text-navy" />
          </span>
          <div>
            <div className="text-[12.5px] font-semibold text-navy">
              {contact.name}
            </div>
            <div className="u-mono mt-0.5 text-[9px] text-ink-soft">
              {contact.role}
            </div>
          </div>
          <a
            href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
            aria-label={`Call ${contact.name}`}
            className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-paper-dim transition-opacity hover:opacity-70"
          >
            <PhoneIcon className="h-[13px] w-[13px] text-navy" strokeWidth={1.8} />
          </a>
        </div>
      ))}

      <SectionTitle>Emergency</SectionTitle>
      {emergency.map((contact) => (
        <div
          key={contact.id}
          className="mx-5 mb-2.5 flex items-center gap-[11px] rounded-xl border border-coral/30 bg-white p-[11px_13px]"
        >
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-coral/12">
            <AlertIcon className="h-4 w-4 text-coral" />
          </span>
          <div>
            <div className="text-[12.5px] font-semibold text-navy">
              {contact.name}
            </div>
            <div className="u-mono mt-0.5 text-[9px] text-ink-soft">
              {contact.role}
            </div>
          </div>
          <a
            href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
            aria-label={`Call ${contact.name}`}
            className="ml-auto grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-coral/12 transition-opacity hover:opacity-70"
          >
            <PhoneIcon className="h-[13px] w-[13px] text-coral" strokeWidth={1.8} />
          </a>
        </div>
      ))}

      <SectionTitle>Marina</SectionTitle>
      <Link
        href="/marinas"
        className="mx-5 mb-4 flex items-center justify-between rounded-[10px] bg-paper-dim p-[12px_14px] transition-opacity hover:opacity-80"
      >
        <span className="flex items-center gap-[11px]">
          <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] bg-white">
            <MarinaIcon className="h-4 w-4 text-navy" />
          </span>
          <span>
            <span className="block text-xs font-semibold text-navy">
              Switch or add a marina
            </span>
            <span className="u-mono mt-0.5 block text-[9.5px] text-ink-soft">
              Currently: {activeMarina.name}
            </span>
          </span>
        </span>
        <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-ink-soft" />
      </Link>
    </>
  );
}
