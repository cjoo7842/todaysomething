"use client";

import { CATEGORIES, DISTRICT_GROUPS } from "@/lib/mock-events";
import type { EventFilters, SortOption } from "@/lib/filter-events";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  filters: EventFilters;
  sort: SortOption;
  onFiltersChange: (filters: EventFilters) => void;
  onSortChange: (sort: SortOption) => void;
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

export function FilterChips({ filters, sort, onFiltersChange, onSortChange }: FilterChipsProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* 지역 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="지역 필터">
        {DISTRICT_GROUPS.map((group) => (
          <Chip
            key={group}
            label={group}
            active={filters.districtGroup === group}
            onClick={() => onFiltersChange({ ...filters, districtGroup: group })}
          />
        ))}
      </div>

      {/* 카테고리 필터 + 무료만 보기 */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="카테고리 필터">
        {CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={category}
            active={filters.category === category}
            onClick={() => onFiltersChange({ ...filters, category })}
          />
        ))}
        <span className="mx-1 w-px shrink-0 bg-neutral-200" aria-hidden="true" />
        <Chip
          label="무료만"
          active={filters.freeOnly}
          onClick={() => onFiltersChange({ ...filters, freeOnly: !filters.freeOnly })}
        />
      </div>

      {/* 정렬 */}
      <div className="flex items-center justify-end gap-2 text-sm text-neutral-500">
        <label htmlFor="sort-select" className="sr-only">
          정렬 기준
        </label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <option value="urgency">마감임박순</option>
          <option value="district">지역순</option>
        </select>
      </div>
    </div>
  );
}
