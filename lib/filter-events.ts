import type { CultureEvent } from "@/types/event";
import { daysUntilEnd, getTodaySeoul, isTodayEvent, isWeekendEvent, isThisWeekEvent } from "./date";
import { getDistrictsByAreaName } from "./areas";
import { getApiCategoriesByDisplay, type DisplayCategory } from "./categories";

export interface EventFilters {
  districtGroup: string; // "전체" 또는 특정 권역 (하위 호환 유지)
  district: string; // "전체" 또는 서울 25개 자치구 중 하나 (예: "마포구")
  category: string; // "전체" 또는 대분류 ("전시" | "문화행사" | "놀거리")
  freeOnly: boolean;
  keyword: string;
  locationType: 'ALL' | 'INDOOR' | 'OUTDOOR';
  dateFilter: 'all' | 'today' | 'weekend' | 'thisweek';
  areaName: string; // 하위 호환: 생활권역명 필터 (별도 사용 시)
  priceFilter: 'all' | 'free' | 'paid';
}

export type SortOption = "urgency" | "district" | "latestStart" | "freeFirst";

export const DEFAULT_FILTERS: EventFilters = {
  districtGroup: "전체",
  district: "전체",
  category: "전체",
  freeOnly: false,
  keyword: "",
  locationType: "ALL",
  dateFilter: "all",
  areaName: "전체",
  priceFilter: "all",
};

export const DEFAULT_SORT: SortOption = "urgency";

/** 복합 필터 및 정렬을 적용합니다. */
export function filterAndSortEvents(
  events: CultureEvent[],
  filters: EventFilters,
  sort: SortOption = DEFAULT_SORT,
  today: string = getTodaySeoul()
): CultureEvent[] {
  const keyword = filters.keyword.trim().toLowerCase();

  const filtered = events.filter((event) => {
    // 1. 날짜 필터 (오늘 진행중 여부 뿐만 아니라 오늘, 이번주말, 이번주 퀵 필터 적용)
    if (filters.dateFilter === "today" && !isTodayEvent(event.startDate, event.endDate, today)) {
      return false;
    }
    if (filters.dateFilter === "weekend" && !isWeekendEvent(event.startDate, event.endDate, today)) {
      return false;
    }
    if (filters.dateFilter === "thisweek" && !isThisWeekEvent(event.startDate, event.endDate, today)) {
      return false;
    }
    // 기본 'all' 일 때는 "오늘 진행중인" 것만 보여주는 것이 원래 기본값이므로 기존 active 상태 체크
    if (filters.dateFilter === "all") {
      const active = today >= event.startDate && today <= event.endDate;
      if (!active) return false;
    }

    // 2. 자치구 필터 (서울 25개 구 직접 매칭 - 우선)
    if (filters.district && filters.district !== "전체") {
      if (event.district !== filters.district) return false;
    }

    // 2-b. 권역 필터 (districtGroup, 하위 호환 유지)
    if (filters.districtGroup !== "전체" && event.districtGroup !== filters.districtGroup) {
      return false;
    }

    // 2-c. 생활권역 필터 (하위 호환 유지)
    if (filters.areaName !== "전체") {
      const allowedDistricts = getDistrictsByAreaName(filters.areaName);
      const matched = allowedDistricts.some((dist) => event.district.includes(dist));
      if (!matched) return false;
    }

    // 3. 카테고리 필터 (대분류 → API 원본 카테고리 역매핑)
    if (filters.category !== "전체") {
      const apiCats = getApiCategoriesByDisplay(filters.category as DisplayCategory);
      if (apiCats.length > 0 && !apiCats.includes(event.category)) {
        return false;
      }
    }

    // 5. 무료만 필터 및 가격 필터
    if (filters.freeOnly && !event.isFree) {
      return false;
    }
    if (filters.priceFilter === "free" && !event.isFree) {
      return false;
    }
    if (filters.priceFilter === "paid" && event.isFree) {
      return false;
    }

    // 6. 공간 필터 (실내/실외)
    if (filters.locationType && filters.locationType !== "ALL") {
      const isIndoorMatch = filters.locationType === "INDOOR" && (event.location_type === "INDOOR" || event.location_type === "BOTH");
      const isOutdoorMatch = filters.locationType === "OUTDOOR" && (event.location_type === "OUTDOOR" || event.location_type === "BOTH");
      if (!isIndoorMatch && !isOutdoorMatch) {
        return false;
      }
    }

    // 7. 검색 키워드 필터 (콘텐츠명, 장소명, 지역명, 카테고리 통합 검색)
    if (keyword) {
      const inTitle = event.title.toLowerCase().includes(keyword);
      const inLocation = event.locationName.toLowerCase().includes(keyword);
      const inDistrict = event.district.toLowerCase().includes(keyword);
      const inApiCategory = event.category.toLowerCase().includes(keyword);
      // 주소가 있으면 주소도 검색 범위에 포함
      const inAddress = (event.address ?? "").toLowerCase().includes(keyword);
      if (!inTitle && !inLocation && !inDistrict && !inApiCategory && !inAddress) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sort === "urgency") {
      return daysUntilEnd(a.endDate, today) - daysUntilEnd(b.endDate, today);
    }
    if (sort === "district") {
      return a.districtGroup.localeCompare(b.districtGroup, "ko");
    }
    if (sort === "latestStart") {
      // 최근 시작순 (시작일 내림차순)
      return b.startDate.localeCompare(a.startDate);
    }
    if (sort === "freeFirst") {
      // 무료 우선
      if (a.isFree === b.isFree) return 0;
      return a.isFree ? -1 : 1;
    }
    return 0;
  });
}

