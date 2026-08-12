import type { CultureEvent } from "@/types/event";
import { daysUntilEnd, getTodaySeoul, isEventActiveToday, isEndingSoon, isThisWeekEvent, isWeekendEvent } from "./date";

export type DateFilterOption = "all" | "today" | "weekend" | "thisweek" | "ending_soon";

export interface EventFilters {
  districtGroup: string; // "전체" 또는 특정 권역
  category: string; // "전체" 또는 특정 카테고리
  freeOnly: boolean;
  keyword: string;
  locationType: 'ALL' | 'INDOOR' | 'OUTDOOR';
  dateFilter?: DateFilterOption;
}

export type SortOption = "urgency" | "district" | "recentStart" | "freeFirst" | "recommend";

export const DEFAULT_FILTERS: EventFilters = {
  districtGroup: "전체",
  category: "전체",
  freeOnly: false,
  keyword: "",
  locationType: "ALL",
  dateFilter: "all",
};

export const DEFAULT_SORT: SortOption = "urgency";

/** 행사를 조건별로 필터 및 정렬합니다. */
export function filterAndSortEvents(
  events: CultureEvent[],
  filters: EventFilters,
  sort: SortOption = DEFAULT_SORT,
  today: string = getTodaySeoul()
): CultureEvent[] {
  const keyword = filters.keyword.trim().toLowerCase();

  const filtered = events.filter((event) => {
    // 날짜 조건
    if (filters.dateFilter === "today") {
      if (!isEventActiveToday(event.startDate, event.endDate, today)) return false;
    } else if (filters.dateFilter === "weekend") {
      if (!isWeekendEvent(event, today)) return false;
    } else if (filters.dateFilter === "thisweek") {
      if (!isThisWeekEvent(event, today)) return false;
    } else if (filters.dateFilter === "ending_soon") {
      if (!isEndingSoon(event, today)) return false;
    } else {
      // 기본 "all" 혹은 미지정 시에도 오늘 기준 진행중인 행사를 기본 표시 (기존 동작 호환)
      if (!isEventActiveToday(event.startDate, event.endDate, today)) return false;
    }

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
      const inDistrict = event.district.toLowerCase().includes(keyword) || event.districtGroup.toLowerCase().includes(keyword);
      const inCategory = event.category.toLowerCase().includes(keyword);
      if (!inTitle && !inLocation && !inDistrict && !inCategory) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sort === "urgency") {
      return daysUntilEnd(a.endDate, today) - daysUntilEnd(b.endDate, today);
    }
    if (sort === "recentStart") {
      return b.startDate.localeCompare(a.startDate);
    }
    if (sort === "freeFirst") {
      if (a.isFree !== b.isFree) return a.isFree ? -1 : 1;
      return daysUntilEnd(a.endDate, today) - daysUntilEnd(b.endDate, today);
    }
    if (sort === "recommend") {
      return daysUntilEnd(a.endDate, today) - daysUntilEnd(b.endDate, today);
    }
    return a.districtGroup.localeCompare(b.districtGroup, "ko");
  });
}

