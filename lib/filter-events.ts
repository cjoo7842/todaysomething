import type { CultureEvent } from "@/types/event";
import type { District } from "./types";
import { daysUntilEnd, getTodaySeoul, isTodayEvent, isWeekendEvent, isThisWeekEvent } from "./date";
import { getDistrictsByAreaName } from "./areas";
import { getApiCategoriesByDisplay, type DisplayCategory } from "./categories";
import { getLivingZoneById, getLivingZoneByName, type LivingZone } from "./districts";

export type AudienceFilter = "all" | "kids" | "allAges";

export interface EventFilters {
  districtGroup: string; // "전체" 또는 특정 권역 (하위 호환 유지)
  district: string; // "전체" 또는 서울 25개 자치구 중 하나 (예: "마포구")
  districts: District[]; // 전체 필터 모달 다중 자치구 선택
  livingZoneId: string; // "" 이면 미선택, 그 외 LIVING_ZONES id
  category: string; // "전체" 또는 대분류 ("전시" | "문화행사" | "놀거리")
  freeOnly: boolean;
  keyword: string;
  locationType: "ALL" | "INDOOR" | "OUTDOOR";
  dateFilter: "all" | "today" | "weekend" | "thisweek" | "custom";
  customDate: string; // YYYY-MM-DD
  areaName: string; // 하위 호환: 생활권역명 필터 (별도 사용 시)
  priceFilter: "all" | "free" | "paid";
  audience: AudienceFilter;
}

export type SortOption = "urgency" | "district" | "latestStart" | "freeFirst";

export const DEFAULT_FILTERS: EventFilters = {
  districtGroup: "전체",
  district: "전체",
  districts: [],
  livingZoneId: "",
  category: "전체",
  freeOnly: false,
  keyword: "",
  locationType: "ALL",
  dateFilter: "today",
  customDate: "",
  areaName: "전체",
  priceFilter: "all",
  audience: "all",
};

export const DEFAULT_SORT: SortOption = "urgency";

function eventTextBlob(event: CultureEvent): string {
  return [event.title, event.locationName, event.district, event.address ?? "", event.districtGroup]
    .join(" ")
    .toLowerCase();
}

export function eventMatchesLivingZone(event: CultureEvent, zone: LivingZone): boolean {
  if (event.livingZoneId && event.livingZoneId === zone.id) return true;
  if (zone.districts.some((d) => event.district === d || event.district.includes(d))) return true;
  const blob = eventTextBlob(event);
  return (zone.keywords ?? []).some((keyword) => blob.includes(keyword.toLowerCase()));
}

function matchesAudience(event: CultureEvent, audience: AudienceFilter): boolean {
  if (audience === "all") return true;
  const target = event.target ?? "";
  if (audience === "kids") {
    return /어린이|아동|유아|키즈|3세|초등/.test(target);
  }
  return /전연령|누구나|전체관람/.test(target);
}

/** 생활권 칩 선택 시 행정구 선택을 비워 두 트랙이 겹치지 않게 합니다. */
export function selectLivingZone(filters: EventFilters, livingZoneId: string): EventFilters {
  const nextId = filters.livingZoneId === livingZoneId ? "" : livingZoneId;
  return {
    ...filters,
    livingZoneId: nextId,
    district: "전체",
    districts: [],
    districtGroup: "전체",
    areaName: "전체",
  };
}

/** 전체 필터(행정구 등) 적용 시 생활권 선택을 해제합니다. */
export function applyDetailedFilters(current: EventFilters, detailed: EventFilters): EventFilters {
  return {
    ...current,
    ...detailed,
    livingZoneId: "",
    areaName: "전체",
    districtGroup: "전체",
    district:
      detailed.districts.length === 1
        ? detailed.districts[0]
        : detailed.districts.length === 0
          ? detailed.district
          : "전체",
  };
}

function matchesDistrictSelection(event: CultureEvent, filters: EventFilters): boolean {
  if (filters.districts.length > 0) {
    return filters.districts.some((d) => event.district === d || event.district.includes(d));
  }
  if (filters.district && filters.district !== "전체") {
    return event.district === filters.district || event.district.includes(filters.district);
  }
  return true;
}

/** 복합 필터 및 정렬을 적용합니다. */
export function filterAndSortEvents(
  events: CultureEvent[],
  filters: EventFilters,
  sort: SortOption = DEFAULT_SORT,
  today: string = getTodaySeoul()
): CultureEvent[] {
  const keyword = filters.keyword.trim().toLowerCase();
  const livingZone =
    getLivingZoneById(filters.livingZoneId) ??
    (filters.areaName !== "전체" ? getLivingZoneByName(filters.areaName) : undefined);

  const filtered = events.filter((event) => {
    // isAlwaysOpen(상시 개방) 장소는 날짜 필터를 무시하고 항상 포함
    const skipDateFilter = event.isAlwaysOpen === true;

    // 1. 날짜 필터
    if (!skipDateFilter) {
      if (filters.dateFilter === "today" && !isTodayEvent(event.startDate, event.endDate, today)) {
        return false;
      }
      if (filters.dateFilter === "weekend" && !isWeekendEvent(event.startDate, event.endDate, today)) {
        return false;
      }
      if (filters.dateFilter === "thisweek" && !isThisWeekEvent(event.startDate, event.endDate, today)) {
        return false;
      }
      if (filters.dateFilter === "customDate" && filters.customDateValue) {
        const d = filters.customDateValue;
        if (!(d >= event.startDate && d <= event.endDate)) return false;
      }
      // 기본 'all' 일 때는 오늘 진행중인 것만
      if (filters.dateFilter === "all") {
        const active = today >= event.startDate && today <= event.endDate;
        if (!active) return false;
      }
    }

    // 생활권 트랙이 켜져 있으면 행정구 다중 선택보다 우선 (상태 동기화 안전망)
    if (livingZone) {
      if (!eventMatchesLivingZone(event, livingZone)) return false;
    } else if (!matchesDistrictSelection(event, filters)) {
      return false;
    }

    if (filters.districtGroup !== "전체" && event.districtGroup !== filters.districtGroup) {
      return false;
    }

    if (!livingZone && filters.areaName !== "전체") {
      const allowedDistricts = getDistrictsByAreaName(filters.areaName);
      const matched = allowedDistricts.some((dist) => event.district.includes(dist));
      if (!matched) return false;
    }

    if (filters.category !== "전체") {
      const apiCats = getApiCategoriesByDisplay(filters.category as DisplayCategory);
      if (apiCats.length > 0 && !apiCats.includes(event.category)) {
        return false;
      }
    }

    if (filters.freeOnly && !event.isFree) {
      return false;
    }
    if (filters.priceFilter === "free" && !event.isFree) {
      return false;
    }
    if (filters.priceFilter === "paid" && event.isFree) {
      return false;
    }

    if (filters.locationType && filters.locationType !== "ALL") {
      const isIndoorMatch =
        filters.locationType === "INDOOR" &&
        (event.location_type === "INDOOR" || event.location_type === "BOTH");
      const isOutdoorMatch =
        filters.locationType === "OUTDOOR" &&
        (event.location_type === "OUTDOOR" || event.location_type === "BOTH");
      if (!isIndoorMatch && !isOutdoorMatch) {
        return false;
      }
    }

    if (!matchesAudience(event, filters.audience)) {
      return false;
    }

    if (keyword) {
      const inTitle = event.title.toLowerCase().includes(keyword);
      const inLocation = event.locationName.toLowerCase().includes(keyword);
      const inDistrict = event.district.toLowerCase().includes(keyword);
      const inApiCategory = event.category.toLowerCase().includes(keyword);
      const inAddress = (event.address ?? "").toLowerCase().includes(keyword);
      if (!inTitle && !inLocation && !inDistrict && !inApiCategory && !inAddress) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sort === "urgency") {
      if (a.isPermanent && b.isPermanent) return 0;
      if (a.isPermanent) return 1;
      if (b.isPermanent) return -1;
      return daysUntilEnd(a.endDate, today) - daysUntilEnd(b.endDate, today);
    }
    if (sort === "district") {
      return a.districtGroup.localeCompare(b.districtGroup, "ko");
    }
    if (sort === "latestStart") {
      return b.startDate.localeCompare(a.startDate);
    }
    if (sort === "freeFirst") {
      if (a.isFree === b.isFree) return 0;
      return a.isFree ? -1 : 1;
    }
    return 0;
  });
}

export function countActiveDetailedFilters(filters: EventFilters): number {
  let count = 0;
  if (filters.districts.length > 0 || (filters.district && filters.district !== "전체")) count += 1;
  if (filters.category !== "전체") count += 1;
  if (filters.dateFilter === "weekend" || filters.dateFilter === "thisweek" || filters.dateFilter === "custom") {
    count += 1;
  }
  if (filters.freeOnly || filters.priceFilter !== "all") count += 1;
  if (filters.locationType !== "ALL") count += 1;
  if (filters.audience !== "all") count += 1;
  return count;
}
