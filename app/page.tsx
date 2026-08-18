"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TodayBadge } from "@/components/TodayBadge";
import { Autocomplete } from "@/components/Autocomplete";
import { FilterChips } from "@/components/FilterChips";
import { FilterModal } from "@/components/FilterModal";
import { EventCard } from "@/components/EventCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { getMockEvents } from "@/lib/mock-events";
import { getTodaySeoul, isEndingSoon, isWeekendEvent } from "@/lib/date";
import { DISPLAY_CATEGORIES } from "@/lib/categories";
import { getLivingZoneById } from "@/lib/districts";
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
import { useWeather } from "@/hooks/useWeather";
import { WeatherBanner } from "@/components/WeatherBanner";
import { Heart, Compass, Calendar, SlidersHorizontal, Filter, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const today = useMemo(() => getTodaySeoul(), []);
  const allEvents = useMemo(() => getMockEvents(), []);

  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 실시간 날씨 데이터 수신
  const { weather, loading: weatherLoading } = useWeather();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const visibleEvents = useMemo(
    () => filterAndSortEvents(allEvents, filters, sort, today),
    [allEvents, filters, sort, today]
  );

  const todayActiveCount = useMemo(
    () => filterAndSortEvents(allEvents, DEFAULT_FILTERS, sort, today).length,
    [allEvents, sort, today]
  );

  // 1. TODAY'S PICK (추천 행사 - 임시로 3개)
  const todaysPicks = useMemo(() => {
    return allEvents.slice(0, 3);
  }, [allEvents]);

  // 2. THIS WEEKEND (이번 주말 진행)
  const weekendEvents = useMemo(() => {
    return allEvents.filter((e) => isWeekendEvent(e, today)).slice(0, 3);
  }, [allEvents, today]);

  // 3. FREE IN SEOUL (무료 행사)
  const freeEvents = useMemo(() => {
    return allEvents.filter((e) => e.isFree).slice(0, 3);
  }, [allEvents]);

  // 4. ENDING SOON (7일 이내 마감)
  const endingSoonEvents = useMemo(() => {
    return allEvents.filter((e) => isEndingSoon(e, today, 7)).slice(0, 3);
  }, [allEvents, today]);

  // 키워드 자동완성 선택 시, /events 페이지로 복합 검색 이동
  const handleSearchSubmit = (keyword: string) => {
    router.push(`/events?keyword=${encodeURIComponent(keyword)}`);
  };

  const activeLivingZone = getLivingZoneById(filters.livingZoneId);
  const detailedFilterCount = countActiveDetailedFilters(filters);
  const activeListFilterCount = detailedFilterCount + (filters.livingZoneId ? 1 : 0);
  const hasActiveListFilters = activeListFilterCount > 0;

  const handleLivingZoneChange = (livingZoneId: string) => {
    if (!livingZoneId) {
      setFilters((prev) => ({ ...prev, livingZoneId: "", areaName: "전체" }));
      return;
    }
    setFilters((prev) => selectLivingZone(prev, livingZoneId));
  };

  const handleApplyDetailedFilters = (next: EventFilters) => {
    setFilters((prev) => applyDetailedFilters(prev, next));
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 pb-20 pt-6 lg:max-w-5xl">
      {/* 상단 통합 네비게이션 헤더 */}
      <header className="flex items-center justify-between border-b pb-4">
        <Link href="/" className="text-xl font-black text-brand tracking-tight">
          오늘뭐보지?
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/events"
            className="flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-brand transition-colors"
          >
            <Compass className="h-4 w-4" />
            <span>탐색</span>
          </Link>
          <Link
            href="/my"
            className="flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-brand transition-colors"
          >
            <Heart className="h-4 w-4 text-rose-500" />
            <span>MY</span>
          </Link>
        </nav>
      </header>

      <TodayBadge today={today} count={todayActiveCount} />

      {/* 스마트 날씨 배너 */}
      <WeatherBanner
        weather={weather}
        loading={weatherLoading}
        currentFilter={filters.locationType || "ALL"}
        onFilterChange={(locationType) =>
          setFilters((prev) => ({ ...prev, locationType }))
        }
      />

      {/* 검색창 (자동완성 기능 적용) */}
      <Autocomplete
        value={filters.keyword}
        onChange={(keyword) => setFilters((prev) => ({ ...prev, keyword }))}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* 빠른 날짜 탐색 버튼 그룹 */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-brand" />
          빠른 날짜 탐색
        </h2>
        <div className="flex gap-2">
          <Link
            href="/events?date=today"
            className="flex-1 rounded-xl bg-white border border-neutral-200 py-3 text-center text-sm font-bold text-neutral-700 hover:border-brand hover:text-brand transition-colors"
          >
            오늘
          </Link>
          <Link
            href="/events?date=thisweek"
            className="flex-1 rounded-xl bg-white border border-neutral-200 py-3 text-center text-sm font-bold text-neutral-700 hover:border-brand hover:text-brand transition-colors"
          >
            이번 주
          </Link>
          <Link
            href="/events?date=weekend"
            className="flex-1 rounded-xl bg-white border border-neutral-200 py-3 text-center text-sm font-bold text-neutral-700 hover:border-brand hover:text-brand transition-colors"
          >
            이번 주말
          </Link>
          {/* 날짜 선택 피커 트리거 버튼 */}
          <div className="relative flex-1">
            <button
              onClick={() => {
                const input = document.getElementById("home-date-picker") as HTMLInputElement | null;
                input?.showPicker?.();
                input?.click();
              }}
              className="w-full h-full rounded-xl bg-white border border-neutral-200 py-3 px-2 text-center text-sm font-bold text-neutral-700 hover:border-brand hover:text-brand transition-colors flex items-center justify-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              날짜
            </button>
            <input
              id="home-date-picker"
              type="date"
              aria-label="날짜 선택"
              className="absolute inset-0 opacity-0 pointer-events-none w-full h-full"
              onChange={(e) => {
                const val = e.target.value;
                if (val) router.push(`/events?date=custom&customDate=${val}`);
              }}
            />
          </div>
        </div>
      </section>

      {/* 콘텐츠별 탐색 - 대분류 3종 */}
      <section className="space-y-2">
        <h2 className="text-sm font-bold text-neutral-800">콘텐츠별 탐색</h2>
        <div className="grid grid-cols-3 gap-2">
          {DISPLAY_CATEGORIES.filter((c) => c !== "전체").map((cat) => (
            <Link
              key={cat}
              href={`/events?category=${encodeURIComponent(cat)}`}
              className="rounded-xl bg-neutral-50 p-3 text-center hover:bg-neutral-100 transition-colors"
            >
              <span className="block text-xs font-bold text-neutral-800">{cat}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 큐레이션 데이터 섹션 */}
      <div className="space-y-6 mt-4">
        {/* TODAY'S PICK */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-neutral-900">🔥 TODAY&apos;S PICK (추천 행사)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todaysPicks.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* THIS WEEKEND */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-neutral-900">📅 이번 주말 진행 행사</h2>
          {weekendEvents.length === 0 ? (
            <p className="text-sm text-neutral-500">이번 주말 예정된 행사가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {weekendEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* FREE IN SEOUL */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-neutral-900">🎁 서울 무료 행사</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {freeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        {/* ENDING SOON */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-neutral-900">⏰ 마감 임박 (7일 이내 종료)</h2>
          {endingSoonEvents.length === 0 ? (
            <p className="text-sm text-neutral-500">마감이 임박한 행사가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {endingSoonEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="border-t pt-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold text-neutral-900">
            {activeLivingZone ? `${activeLivingZone.name} 행사` : "전체 필터 탐색"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <button
              type="button"
              onClick={() => setIsFilterOpen((prev) => !prev)}
              aria-expanded={isFilterOpen}
              aria-controls="home-filter-panel"
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                isFilterOpen || hasActiveListFilters
                  ? "border-brand bg-brand text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-brand hover:text-brand"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              필터
              {hasActiveListFilters && (
                <span className="rounded-full bg-white/20 px-1.5 text-[10px] text-white">
                  {activeListFilterCount}
                </span>
              )}
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", isFilterOpen && "rotate-180")}
              />
            </button>
            <label htmlFor="home-sort-select" className="sr-only">
              정렬 기준
            </label>
            <select
              id="home-sort-select"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-sm text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <option value="urgency">마감임박순</option>
              <option value="district">지역순</option>
              <option value="latestStart">최근시작순</option>
              <option value="freeFirst">무료우선</option>
            </select>
          </div>
        </div>

        {isFilterOpen && (
          <section id="home-filter-panel" className="mb-4 space-y-2 rounded-2xl border border-neutral-100 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-neutral-800">주요 생활권</h3>
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:border-brand hover:text-brand"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                전체 필터
                {detailedFilterCount > 0 && (
                  <span className="rounded-full bg-brand px-1.5 text-[10px] text-white">{detailedFilterCount}</span>
                )}
              </button>
            </div>
            <FilterChips livingZoneId={filters.livingZoneId} onLivingZoneChange={handleLivingZoneChange} />
            {activeLivingZone && (
              <p className="text-xs text-neutral-500">
                {activeLivingZone.name} · {activeLivingZone.districts.join(", ")}
                {activeLivingZone.keywords?.length ? ` · ${activeLivingZone.keywords.slice(0, 3).join(", ")}` : ""}
              </p>
            )}
            {filters.districts.length > 0 && (
              <p className="text-xs text-neutral-500">자치구: {filters.districts.join(", ")}</p>
            )}
          </section>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="mt-4">
            <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
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
