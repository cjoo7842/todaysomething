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
import { useEvents } from "@/hooks/useEvents";
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
import { Heart, Compass, Calendar, SlidersHorizontal, Filter, ChevronDown, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const today = useMemo(() => getTodaySeoul(), []);
  const allEvents = useEvents();

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

  // 날씨 기반 추천 공간 및 개수 계산
  const { recommendedSpace, recommendedCount, isIndoorRecommended } = useMemo(() => {
    if (!weather) return { recommendedSpace: "ALL", recommendedCount: 0, isIndoorRecommended: false };
    const isIndoor = weather.isRainy || weather.temp <= 5 || weather.temp >= 30 || weather.isCloudy;
    const space = isIndoor ? "INDOOR" : "OUTDOOR";
    const count = allEvents.filter(e => e.location_type === space || e.location_type === "BOTH").length;
    return { recommendedSpace: space, recommendedCount: count, isIndoorRecommended: isIndoor };
  }, [weather, allEvents]);

  // 1. TODAY'S PICK (추천 행사 - 날씨 기반 1개 + 일반 2개)
  const todaysPicks = useMemo(() => {
    const weatherRecs = allEvents.filter(e => e.location_type === recommendedSpace || e.location_type === "BOTH");
    const weatherPick = weatherRecs[0];
    
    const genericPicks = allEvents.filter(e => e.id !== weatherPick?.id).slice(0, 3);
    
    const picks = [];
    if (weatherPick) {
      picks.push({ 
        event: weatherPick, 
        reason: isIndoorRecommended ? "☁️ 오늘 날씨에 딱 좋아요" : "☀️ 오늘 날씨에 딱 좋아요" 
      });
    }
    genericPicks.forEach(e => picks.push({ event: e }));
    return picks;
  }, [allEvents, recommendedSpace, isIndoorRecommended]);

  // 2. THIS WEEKEND (이번 주말 진행)
  const weekendEvents = useMemo(() => {
    return allEvents.filter((e) => isWeekendEvent(e, today)).slice(0, 4);
  }, [allEvents, today]);

  // 3. FREE IN SEOUL (무료 행사)
  const freeEvents = useMemo(() => {
    return allEvents.filter((e) => e.isFree).slice(0, 4);
  }, [allEvents]);

  // 4. ENDING SOON (7일 이내 마감)
  const endingSoonEvents = useMemo(() => {
    return allEvents.filter((e) => isEndingSoon(e, today, 7)).slice(0, 4);
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
    <main className="mx-auto flex w-full max-w-7xl flex-col px-6 pb-24 pt-4 lg:px-8">
      {/* 상단 통합 네비게이션 헤더 */}
      <header className="flex items-center justify-between border-b pb-4 gap-2 md:gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="text-xl font-black text-brand tracking-tight shrink-0">
            오늘뭐보지?
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-rose-accent px-3 py-1 text-[11px] font-extrabold text-white shadow-sm">
            <Ticket className="h-3.5 w-3.5" />
            TODAY {Number(today.split("-")[1])}.{Number(today.split("-")[2])}
          </span>
        </div>
        
        <div className="flex flex-1 items-center gap-3 md:gap-6 justify-end">
          <div className="w-full max-w-[240px] sm:max-w-[320px] md:max-w-[400px]">
            {/* 검색창 (자동완성 기능 적용) */}
            <Autocomplete
              value={filters.keyword}
              onChange={(keyword) => setFilters((prev) => ({ ...prev, keyword }))}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>

          <nav className="flex items-center gap-2 md:gap-3 shrink-0">
            <Link
              href="/events"
              className="flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-brand transition-colors"
            >
              <Compass className="h-5 w-5 md:h-4 md:w-4" />
              <span className="hidden sm:inline">탐색</span>
            </Link>
            <Link
              href="/my"
              className="flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-brand transition-colors"
            >
              <Heart className="h-5 w-5 md:h-4 md:w-4 text-rose-500" />
              <span className="hidden sm:inline">MY</span>
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto mt-6 flex w-full max-w-4xl flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8">
        <div className="shrink-0">
          <TodayBadge count={todayActiveCount} />
        </div>

        {/* 스마트 날씨 배너 */}
        <div className="w-full sm:max-w-[340px] md:max-w-sm shrink-0">
          <WeatherBanner
            weather={weather}
            loading={weatherLoading}
            recommendedCount={recommendedCount}
          />
        </div>
      </div>

      {/* 🗓️ 빠른 탐색 카드 */}
      <section className="mx-auto mt-6 w-full max-w-4xl rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
        <h2 className="text-sm font-extrabold text-neutral-900 flex items-center gap-1.5 shrink-0">
          <Compass className="h-4 w-4 text-brand" />
          빠른 탐색
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full">
          {/* 날짜 필터 */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { label: "오늘", href: "/events?date=today" },
              { label: "이번 주", href: "/events?date=thisweek" },
              { label: "이번 주말", href: "/events?date=weekend" },
            ].map((d) => (
              <Link
                key={d.label}
                href={d.href}
                className="rounded-full bg-neutral-100 px-3.5 py-1.5 text-[13px] font-bold text-neutral-600 transition-colors hover:bg-brand hover:text-white focus:bg-brand focus:text-white active:bg-brand active:text-white"
              >
                {d.label}
              </Link>
            ))}
            
            <div className="relative">
              <button
                onClick={() => {
                  const input = document.getElementById("home-date-picker") as HTMLInputElement | null;
                  input?.showPicker?.();
                  input?.click();
                }}
                className="rounded-full bg-neutral-100 px-3.5 py-1.5 text-[13px] font-bold text-neutral-600 transition-colors hover:bg-brand hover:text-white focus:bg-brand focus:text-white active:bg-brand active:text-white flex items-center gap-1"
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
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

          {/* 구분선 */}
          <div className="hidden sm:block h-4 w-px bg-neutral-200 shrink-0" />

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {DISPLAY_CATEGORIES.filter((c) => c !== "전체").map((cat) => (
              <Link
                key={cat}
                href={`/events?category=${encodeURIComponent(cat)}`}
                className="rounded-full bg-neutral-100 px-3.5 py-1.5 text-[13px] font-bold text-neutral-600 transition-colors hover:bg-brand hover:text-white focus:bg-brand focus:text-white active:bg-brand active:text-white"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 큐레이션 데이터 섹션 */}
      <div className="mx-auto mt-8 w-full max-w-[1200px] space-y-6">
        {/* TODAY'S PICK */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
            <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-1.5">
              <span className="text-xl">🔥</span> 오늘의 PICK
            </h2>
            <p className="text-sm text-neutral-500 font-medium">지금 가기 좋은 행사들을 골라봤어요.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {todaysPicks.map(({ event, reason }) => (
              <EventCard key={event.id} event={event} recommendationReason={reason} />
            ))}
          </div>
        </section>

        {/* THIS WEEKEND */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-neutral-900">📅 이번 주말 진행 행사</h2>
          {weekendEvents.length === 0 ? (
            <p className="text-sm text-neutral-500">이번 주말 예정된 행사가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {weekendEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {/* FREE IN SEOUL */}
        <section className="space-y-3">
          <h2 className="text-base font-bold text-neutral-900">🎁 서울 무료 행사</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : visibleEvents.length === 0 ? (
          <div className="mt-4">
            <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 mt-4">
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
