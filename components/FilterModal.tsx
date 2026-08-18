"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { SEOUL_DISTRICTS } from "@/lib/districts";
import { DISPLAY_CATEGORIES } from "@/lib/categories";
import {
  DEFAULT_FILTERS,
  type AudienceFilter,
  type EventFilters,
} from "@/lib/filter-events";
import type { District } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: EventFilters;
  onApply: (filters: EventFilters) => void;
}

const DATE_OPTIONS: { id: EventFilters["dateFilter"]; label: string }[] = [
  { id: "all", label: "전체 일정" },
  { id: "today", label: "오늘" },
  { id: "thisweek", label: "이번 주" },
  { id: "weekend", label: "이번 주말" },
  { id: "custom", label: "날짜 선택" },
];

const AUDIENCE_OPTIONS: { id: AudienceFilter; label: string }[] = [
  { id: "all", label: "전체" },
  { id: "kids", label: "어린이" },
  { id: "allAges", label: "전연령" },
];

export function FilterModal({ isOpen, onClose, filters, onApply }: FilterModalProps) {
  const [draft, setDraft] = useState<EventFilters>(filters);

  useEffect(() => {
    if (isOpen) {
      setDraft({
        ...filters,
        livingZoneId: "",
      });
    }
  }, [isOpen, filters]);

  if (!isOpen) return null;

  const toggleDistrict = (district: District) => {
    setDraft((prev) => {
      const exists = prev.districts.includes(district);
      const districts = exists
        ? prev.districts.filter((d) => d !== district)
        : [...prev.districts, district];
      return {
        ...prev,
        districts,
        district: districts.length === 1 ? districts[0] : "전체",
        livingZoneId: "",
        areaName: "전체",
      };
    });
  };

  const handleApply = () => {
    onApply({
      ...draft,
      livingZoneId: "",
      areaName: "전체",
      districtGroup: "전체",
    });
    onClose();
  };

  const handleReset = () => {
    setDraft({
      ...DEFAULT_FILTERS,
      keyword: filters.keyword,
      dateFilter: "all",
      livingZoneId: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 id="filter-modal-title" className="text-base font-bold text-neutral-900">
            전체 필터
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-5 py-4">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-500">서울시 25개 구</h3>
              {draft.districts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, districts: [], district: "전체" }))}
                  className="text-xs font-semibold text-neutral-400 hover:text-brand"
                >
                  구 선택 해제
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {SEOUL_DISTRICTS.map((district) => {
                const active = draft.districts.includes(district);
                return (
                  <label
                    key={district}
                    className={cn(
                      "flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold transition-colors",
                      active
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleDistrict(district)}
                      className="accent-brand"
                    />
                    {district}
                  </label>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-bold text-neutral-500">콘텐츠</h3>
            <div className="flex flex-wrap gap-1.5">
              {DISPLAY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, category: cat }))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    draft.category === cat
                      ? "border-brand bg-brand text-white"
                      : "border-neutral-200 text-neutral-600"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-bold text-neutral-500">일정</h3>
            <div className="flex flex-wrap gap-1.5">
              {DATE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      dateFilter: opt.id,
                      customDate:
                        opt.id === "custom"
                          ? prev.customDate || new Date().toISOString().split("T")[0]
                          : "",
                    }))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    draft.dateFilter === opt.id
                      ? "border-brand bg-brand text-white"
                      : "border-neutral-200 text-neutral-600"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {draft.dateFilter === "custom" && (
              <input
                type="date"
                value={draft.customDate}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, dateFilter: "custom", customDate: e.target.value }))
                }
                className="mt-2 w-full rounded-xl border border-brand p-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            )}
          </section>

          <section>
            <h3 className="mb-2 text-xs font-bold text-neutral-500">연령 · 특성</h3>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {AUDIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, audience: opt.id }))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    draft.audience === opt.id
                      ? "border-brand bg-brand text-white"
                      : "border-neutral-200 text-neutral-600"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "가격 전체" },
                { id: "free", label: "무료" },
                { id: "paid", label: "유료" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      priceFilter: p.id as EventFilters["priceFilter"],
                      freeOnly: p.id === "free",
                    }))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    draft.priceFilter === p.id
                      ? "border-brand bg-brand text-white"
                      : "border-neutral-200 text-neutral-600"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                { id: "ALL", label: "전체 공간" },
                { id: "INDOOR", label: "실내" },
                { id: "OUTDOOR", label: "실외" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      locationType: s.id as EventFilters["locationType"],
                    }))
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    draft.locationType === s.id
                      ? "border-brand bg-brand text-white"
                      : "border-neutral-200 text-neutral-600"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="flex gap-2 border-t px-5 py-4">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-bold text-neutral-600 hover:bg-neutral-50"
          >
            초기화
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-[2] rounded-xl bg-brand py-3 text-sm font-bold text-white hover:opacity-90"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
