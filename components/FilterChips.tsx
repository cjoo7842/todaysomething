"use client";

import { LIVING_ZONES } from "@/lib/districts";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  livingZoneId: string;
  onLivingZoneChange: (livingZoneId: string) => void;
  isPermanentOnly?: boolean;
  onPermanentToggle?: (value: boolean) => void;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-[36px] shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        active
          ? "border-brand bg-brand text-white shadow-sm"
          : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
      )}
    >
      {label}
    </button>
  );
}

/** 메인 화면 상단 주요 생활권 빠른 탐색 칩 */
export function FilterChips({ livingZoneId, onLivingZoneChange, isPermanentOnly, onPermanentToggle }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="group" aria-label="주요 생활권">
      <Chip
        label="상시 공간"
        active={isPermanentOnly === true}
        onClick={() => onPermanentToggle?.(!isPermanentOnly)}
      />
      <div className="h-9 w-px bg-neutral-300 mx-1"></div>
      <Chip
        label="전체"
        active={!livingZoneId && !isPermanentOnly}
        onClick={() => {
          onLivingZoneChange("");
          onPermanentToggle?.(false);
        }}
      />
      {LIVING_ZONES.map((zone) => (
        <Chip
          key={zone.id}
          label={zone.name}
          active={livingZoneId === zone.id}
          onClick={() => {
            onLivingZoneChange(zone.id);
            onPermanentToggle?.(false);
          }}
        />
      ))}
    </div>
  );
}
