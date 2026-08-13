"use client";

import { SEOUL_DISTRICTS } from "@/lib/districts";
import { DISPLAY_CATEGORIES } from "@/lib/categories";
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
      {/* 카테고리 대분류 필터 (전시 / 문화행사 / 놀거리) */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="카테고리 필터">
        {DISPLAY_CATEGORIES.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            active={filters.category === cat}
            onClick={() => onFiltersChange({ ...filters, category: cat })}
          />
        ))}
        <span className="mx-1 w-px shrink-0 bg-neutral-200" aria-hidden="true" />
        <Chip
          label="무료만"
          active={filters.freeOnly}
          onClick={() => onFiltersChange({ ...filters, freeOnly: !filters.freeOnly })}
        />
      </div>

      {/* 지역 필터 (서울 25개 자치구 기준) */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="지역 필터">
        {SEOUL_DISTRICTS.map((d) => (
          <Chip
            key={d}
            label={d}
            active={filters.district === d}
            onClick={() => onFiltersChange({ ...filters, district: d })}
          />
        ))}
      </div>

      {/* 공간 필터 (실내/실외) */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="공간 필터">
        <Chip
          label="전체 공간"
          active={filters.locationType === "ALL"}
          onClick={() => onFiltersChange({ ...filters, locationType: "ALL" })}
        />
        <Chip
          label="🏢 실내"
          active={filters.locationType === "INDOOR"}
          onClick={() => onFiltersChange({ ...filters, locationType: "INDOOR" })}
        />
        <Chip
          label="🌳 실외"
          active={filters.locationType === "OUTDOOR"}
          onClick={() => onFiltersChange({ ...filters, locationType: "OUTDOOR" })}
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
          <option value="latestStart">최근시작순</option>
          <option value="freeFirst">무료우선</option>
        </select>
      </div>
    </div>
  );
}
