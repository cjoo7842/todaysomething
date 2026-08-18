"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, SlidersHorizontal } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { FilterChips } from "@/components/FilterChips";
import { FilterModal } from "@/components/FilterModal";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { getMockEvents } from "@/lib/mock-events";
import { getTodaySeoul } from "@/lib/date";
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  applyDetailedFilters,
  countActiveDetailedFilters,
  filterAndSortEvents,
  selectLivingZone,
  type EventFilters,
  type SortOption,
} from "@/lib/filter-events";
import { SEOUL_DISTRICTS, getLivingZoneById, getLivingZoneByName } from "@/lib/districts";
import type { District } from "@/lib/types";
import { DISPLAY_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

const EVENTS_DEFAULT_FILTERS: EventFilters = {
  ...DEFAULT_FILTERS,
  dateFilter: "all",
};

function parseDistrictsParam(raw: string | null, single: string): District[] {
  const fromList = (raw ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter((d): d is District => (SEOUL_DISTRICTS as readonly string[]).includes(d));
  if (fromList.length > 0) return fromList;
  if (single !== "전체" && (SEOUL_DISTRICTS as readonly string[]).includes(single)) {
    return [single as District];
  }
  return [];
}

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useMemo(() => getTodaySeoul(), []);
  const allEvents = useMemo(() => getMockEvents(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const initialFilters = useMemo((): EventFilters => {
    const keyword = searchParams.get("keyword") || "";
    const category = searchParams.get("category") || "전체";
    const district = searchParams.get("district") || "전체";
    const date = searchParams.get("date") || "all";
    const customDate = searchParams.get("customDate") || "";
    const free = searchParams.get("free") === "true";
    const space = searchParams.get("space") || "ALL";
    const livingZoneParam = searchParams.get("livingZone") || "";
    const areaParam = searchParams.get("area") || "전체";
    const livingZone =
      getLivingZoneById(livingZoneParam) ??
      (areaParam !== "전체" ? getLivingZoneByName(areaParam) : undefined);

    const districts = livingZone ? [] : parseDistrictsParam(searchParams.get("districts"), district);

    return {
      ...DEFAULT_FILTERS,
      keyword,
      category,
      district: livingZone ? "전체" : districts.length === 1 ? districts[0] : district,
      districts,
      livingZoneId: livingZone?.id ?? "",
      areaName: livingZone ? "전체" : areaParam,
      dateFilter: (date as EventFilters["dateFilter"]) || "all",
      customDate,
      freeOnly: free,
      priceFilter: free ? "free" : "all",
      locationType: (space as EventFilters["locationType"]) || "ALL",
      audience: (searchParams.get("audience") as EventFilters["audience"]) || "all",
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<EventFilters>(initialFilters);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);

  // URL 파라미터가 바뀌면 내부 필터 상태도 업데이트
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [filters, sort]);

  // 필터가 변경될 때 URL Query Parameter 갱신
  const updateUrlParams = (newFilters: EventFilters, newSort: SortOption) => {
    const params = new URLSearchParams();
    if (newFilters.keyword) params.set("keyword", newFilters.keyword);
    if (newFilters.category !== "전체") params.set("category", newFilters.category);
    if (newFilters.livingZoneId) {
      params.set("livingZone", newFilters.livingZoneId);
    } else if (newFilters.districts.length > 0) {
      params.set("districts", newFilters.districts.join(","));
    } else if (newFilters.district !== "전체") {
      params.set("district", newFilters.district);
    }
    if (newFilters.dateFilter !== "all") params.set("date", newFilters.dateFilter);
    if (newFilters.dateFilter === "custom" && newFilters.customDate) params.set("customDate", newFilters.customDate);
    if (newFilters.priceFilter !== "all") params.set("free", newFilters.priceFilter === "free" ? "true" : "false");
    if (newFilters.locationType !== "ALL") params.set("space", newFilters.locationType);
    if (newFilters.audience !== "all") params.set("audience", newFilters.audience);
    if (newSort !== DEFAULT_SORT) params.set("sort", newSort);

    router.replace(`/events?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    updateUrlParams(newFilters, sort);
  };

  const handleLivingZoneChange = (livingZoneId: string) => {
    const next = livingZoneId
      ? selectLivingZone(filters, livingZoneId)
      : { ...filters, livingZoneId: "", areaName: "전체" };
    handleFilterChange(next);
  };

  const handleApplyDetailedFilters = (next: EventFilters) => {
    handleFilterChange(applyDetailedFilters(filters, next));
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    updateUrlParams(filters, newSort);
  };

  const detailedFilterCount = countActiveDetailedFilters(filters);
  const activeLivingZone = getLivingZoneById(filters.livingZoneId);

  const visibleEvents = useMemo(
    () => filterAndSortEvents(allEvents, filters, sort, today),
    [allEvents, filters, sort, today]
  );

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-20 pt-6 lg:max-w-5xl">
      <header className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-neutral-900">행사 탐색</h1>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/my"
            className="flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-brand transition-colors"
          >
            <Heart className="h-4 w-4 text-rose-500" />
            <span>MY</span>
          </Link>
        </nav>
      </header>

      {/* 복합 필터 바 */}
      <section className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
        {/* 키워드 검색창 */}
        <div>
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => handleFilterChange({ ...filters, keyword: e.target.value })}
            placeholder="키워드로 바로 검색"
            className="w-full rounded-xl border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>

        {/* 날짜 선택 */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-2">날짜</label>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "all", label: "전체" },
              { id: "today", label: "오늘" },
              { id: "thisweek", label: "이번 주" },
              { id: "weekend", label: "이번 주말" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => handleFilterChange({ ...filters, dateFilter: d.id as any, customDate: "" })}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-center text-xs font-semibold transition-colors",
                  filters.dateFilter === d.id
                    ? "border-brand bg-brand text-white"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {d.label}
              </button>
            ))}
            {/* 날짜 선택 피커 버튼 */}
            <button
              onClick={() => {
                if (filters.dateFilter !== "custom") {
                  handleFilterChange({ ...filters, dateFilter: "custom", customDate: filters.customDate || new Date().toISOString().split("T")[0] });
                }
              }}
              className={cn(
                "flex-1 min-w-[80px] rounded-lg border py-2 px-2 text-center text-xs font-semibold transition-colors flex items-center justify-center gap-1",
                filters.dateFilter === "custom"
                  ? "border-brand bg-brand text-white"
                  : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {filters.dateFilter === "custom" && filters.customDate
                ? (() => { const [, m, d] = filters.customDate.split("-"); return `${Number(m)}. ${Number(d)}`; })()
                : "날짜 선택"}
            </button>
          </div>
          {/* 사용자가 "날짜 선택" 선택 시 날짜 입력칼린더 표시 */}
          {filters.dateFilter === "custom" && (
            <div className="mt-2">
              <input
                id="custom-date-picker"
                type="date"
                value={filters.customDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleFilterChange({ ...filters, dateFilter: "custom", customDate: e.target.value })}
                className="w-full rounded-xl border border-brand p-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand accent-brand"
              />
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-xs font-bold text-neutral-500">주요 생활권</label>
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-brand"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              전체 필터 (25개 구)
              {detailedFilterCount > 0 && (
                <span className="rounded-full bg-brand px-1.5 text-[10px] text-white">{detailedFilterCount}</span>
              )}
            </button>
          </div>
          <FilterChips livingZoneId={filters.livingZoneId} onLivingZoneChange={handleLivingZoneChange} />
          {activeLivingZone && (
            <p className="mt-1.5 text-xs text-neutral-500">
              {activeLivingZone.name} → {activeLivingZone.districts.join(", ")}
            </p>
          )}
          {!activeLivingZone && filters.districts.length > 0 && (
            <p className="mt-1.5 text-xs text-neutral-500">자치구: {filters.districts.join(", ")}</p>
          )}
        </div>

        {/* 카테고리(콘텐츠) 선택 - 대분류 3종 */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-2">콘텐츠</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {DISPLAY_CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => handleFilterChange({ ...filters, category: c })}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  filters.category === c
                    ? "border-brand bg-brand text-white"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* 가격 종류 선택 */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-2">가격</label>
          <div className="flex gap-2">
            {[
              { id: "all", label: "전체" },
              { id: "free", label: "무료" },
              { id: "paid", label: "유료" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleFilterChange({ ...filters, priceFilter: p.id as any })}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-center text-xs font-semibold transition-colors",
                  filters.priceFilter === p.id
                    ? "border-brand bg-brand text-white"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 공간 유형 선택 */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-2">공간</label>
          <div className="flex gap-2">
            {[
              { id: "ALL", label: "전체 공간" },
              { id: "INDOOR", label: "🏢 실내" },
              { id: "OUTDOOR", label: "🌳 실외" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => handleFilterChange({ ...filters, locationType: s.id as any })}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-center text-xs font-semibold transition-colors",
                  filters.locationType === s.id
                    ? "border-brand bg-brand text-white"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 정렬 & 초기화 */}
        <div className="flex items-center justify-between pt-2 border-t text-sm">
          <button
            onClick={() => handleFilterChange(EVENTS_DEFAULT_FILTERS)}
            className="text-xs font-semibold text-neutral-400 hover:text-brand transition-colors"
          >
            필터 전체 초기화
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-400">정렬 기준</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value as SortOption)}
              className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="urgency">마감임박순</option>
              <option value="district">지역순</option>
              <option value="latestStart">최근시작순</option>
              <option value="freeFirst">무료우선</option>
            </select>
          </div>
        </div>
      </section>

      {/* 리스트 뷰 영역 */}
      <div>
        <h2 className="text-sm font-bold text-neutral-800 mb-3">행사 목록 ({visibleEvents.length}개)</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visibleEvents.length === 0 ? (
          <EmptyState onReset={() => handleFilterChange(EVENTS_DEFAULT_FILTERS)} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApply={handleApplyDetailedFilters}
      />
    </main>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-neutral-500">불러오는 중...</div>}>
      <EventsContent />
    </Suspense>
  );
}
