/**
 * 하위 호환: 생활권 데이터는 lib/districts.ts 의 LIVING_ZONES 가 기준입니다.
 */

import {
  LIVING_ZONES,
  getLivingZoneByDistrict,
  getLivingZoneByName,
} from "./districts";

export interface AreaMapping {
  name: string;
  districts: string[];
}

export const AREA_MAPPINGS: AreaMapping[] = LIVING_ZONES.map((zone) => ({
  name: zone.name,
  districts: zone.districts,
}));

export function getAreaNameByDistrict(district: string): string {
  return getLivingZoneByDistrict(district)?.name ?? "기타 지역";
}

export function getDistrictsByAreaName(areaName: string): string[] {
  return getLivingZoneByName(areaName)?.districts ?? [];
}
