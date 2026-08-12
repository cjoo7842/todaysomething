import type { CultureEvent } from "@/types/event";
import { daysUntilEnd, getTodaySeoul, isEventActiveToday } from "./date";

export interface EventFilters {
  districtGroup: string; // "전체" 또는 특정 권역
  category: string; // "전체" 또는 특정 카테고리
  freeOnly: boolean;
  keyword: string;
  locationType: 'ALL' | 'INDOOR' | 'OUTDOOR';
}

export type SortOption = "urgency" | "district";

export const DEFAULT_FILTERS: EventFilters = {
  districtGroup: "전체",
  category: "전체",
  freeOnly: false,
  keyword: "",
  locationType: "ALL",
};

// 기본 정렬값은 "마감임박순"입니다.
// (사용자 편의 요소 문서 A그룹-2: "오늘 뭐 보지"라는 서비스 목적과
//  가장 직결되는 정렬 기준이라 기본값으로 채택)
export const DEFAULT_SORT: SortOption = "urgency";

/** 오늘 진행중인 행사만 남기고, 필터/검색/정렬까지 한 번에 적용합니다. */
export function filterAndSortEvents(
  events: CultureEvent[],
  filters: EventFilters,
  sort: SortOption = DEFAULT_SORT,
  today: string = getTodaySeoul()
): CultureEvent[] {
  const activeToday = events.filter((event) =>
    isEventActiveToday(event.startDate, event.endDate, today)
  );

  const keyword = filters.keyword.trim().toLowerCase();

  const filtered = activeToday.filter((event) => {
    if (filters.districtGroup !== "전체" && event.districtGroup !== filters.districtGroup) {
      return false;
    }
    if (filters.category !== "전체" && event.category !== filters.category) {
      return false;
    }
    if (filters.freeOnly && !event.isFree) {
      return false;
    }
    if (filters.locationType && filters.locationType !== "ALL") {
      const isIndoorMatch = filters.locationType === "INDOOR" && (event.location_type === "INDOOR" || event.location_type === "BOTH");
      const isOutdoorMatch = filters.locationType === "OUTDOOR" && (event.location_type === "OUTDOOR" || event.location_type === "BOTH");
      if (!isIndoorMatch && !isOutdoorMatch) {
        return false;
      }
    }
    if (keyword) {
      const inTitle = event.title.toLowerCase().includes(keyword);
      const inLocation = event.locationName.toLowerCase().includes(keyword);
      if (!inTitle && !inLocation) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sort === "urgency") {
      return daysUntilEnd(a.endDate, today) - daysUntilEnd(b.endDate, today);
    }
    return a.districtGroup.localeCompare(b.districtGroup, "ko");
  });
}
