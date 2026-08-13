"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { getMockEvents } from "@/lib/mock-events";
import { getTodaySeoul } from "@/lib/date";
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  filterAndSortEvents,
  type EventFilters,
  type SortOption,
} from "@/lib/filter-events";
import { SEOUL_DISTRICTS } from "@/lib/districts";
import { DISPLAY_CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";

function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useMemo(() => getTodaySeoul(), []);
  const allEvents = useMemo(() => getMockEvents(), []);

  const [isLoading, setIsLoading] = useState(true);

  // URL Query Parameters 파싱하여 초기 필터 구성
  const initialFilters = useMemo((): EventFilters => {
    const keyword = searchParams.get("keyword") || "";
    const category = searchParams.get("category") || "전체";
    const district = searchParams.get("district") || "전체";
    const date = searchParams.get("date") || "all";
    const free = searchParams.get("free") === "true";
    const space = searchParams.get("space") || "ALL";

    return {
      ...DEFAULT_FILTERS,
      keyword,
      category,
      district,
      dateFilter: date as any,
      freeOnly: free,
      priceFilter: free ? "free" : "all",
      locationType: space as any,
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
    if (newFilters.district !== "전체") params.set("district", newFilters.district);
    if (newFilters.dateFilter !== "all") params.set("date", newFilters.dateFilter);
    if (newFilters.priceFilter !== "all") params.set("free", newFilters.priceFilter === "free" ? "true" : "false");
    if (newFilters.locationType !== "ALL") params.set("space", newFilters.locationType);

    router.replace(`/events?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters(newFilters);
    updateUrlParams(newFilters, sort);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    updateUrlParams(filters, newSort);
  };

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
          <div className="flex gap-2">
            {[
              { id: "all", label: "전체" },
              { id: "today", label: "오늘" },
              { id: "thisweek", label: "이번 주" },
              { id: "weekend", label: "이번 주말" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => handleFilterChange({ ...filters, dateFilter: d.id as any })}
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
          </div>
        </div>

        {/* 지역 선택 (서울 25개 자치구) */}
        <div>
          <label className="block text-xs font-bold text-neutral-500 mb-2">지역 (자치구)</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {SEOUL_DISTRICTS.map((d) => (
              <button
                key={d}
                onClick={() => handleFilterChange({ ...filters, district: d })}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  filters.district === d
                    ? "border-brand bg-brand text-white"
                    : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                )}
              >
                {d}
              </button>
            ))}
          </div>
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
            onClick={() => handleFilterChange(DEFAULT_FILTERS)}
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
          <EmptyState onReset={() => handleFilterChange(DEFAULT_FILTERS)} />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
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
