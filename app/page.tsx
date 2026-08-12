"use client";

import { useEffect, useMemo, useState } from "react";
import { TodayBadge } from "@/components/TodayBadge";
import { SearchBar } from "@/components/SearchBar";
import { FilterChips } from "@/components/FilterChips";
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
import { useWeather } from "@/hooks/useWeather";
import { WeatherBanner } from "@/components/WeatherBanner";

export default function HomePage() {
  const today = useMemo(() => getTodaySeoul(), []);
  const allEvents = useMemo(() => getMockEvents(), []);

  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>(DEFAULT_SORT);
  const [isLoading, setIsLoading] = useState(true);

  // 실시간 날씨 데이터 수신
  const { weather, loading: weatherLoading } = useWeather();

  // 실제 API 연동 시 이 useEffect를 fetch 로직으로 교체하면 됩니다.
  // 지금은 스켈레톤 UI 동작을 보여주기 위해 짧은 지연을 흉내냅니다.
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

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-16 pt-6 lg:max-w-5xl">
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

      <SearchBar
        value={filters.keyword}
        onChange={(keyword) => setFilters((prev) => ({ ...prev, keyword }))}
      />

      <FilterChips
        filters={filters}
        sort={sort}
        onFiltersChange={setFilters}
        onSortChange={setSort}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : visibleEvents.length === 0 ? (
        <EmptyState onReset={() => setFilters(DEFAULT_FILTERS)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </main>
  );
}
