/**
 * 생활권(생활권역)과 실제 행정구역(district/자치구)을 매핑하는 파일입니다.
 */

export interface AreaMapping {
  name: string; // 성수 · 서울숲
  districts: string[]; // ['성동구']
}

export const AREA_MAPPINGS: AreaMapping[] = [
  { name: "종로 · 서촌", districts: ["종로구"] },
  { name: "한남 · 이태원", districts: ["용산구"] },
  { name: "홍대 · 연남", districts: ["마포구", "서대문구"] },
  { name: "성수 · 서울숲", districts: ["성동구"] },
  { name: "잠실", districts: ["송파구"] },
  { name: "여의도", districts: ["영등포구"] },
  { name: "강남", districts: ["강남구", "서초구"] },
];

/** 특정 행정구역(district)이 속하는 생활권역의 이름을 반환합니다. */
export function getAreaNameByDistrict(district: string): string {
  const matched = AREA_MAPPINGS.find((mapping) =>
    mapping.districts.some((d) => district.includes(d))
  );
  return matched ? matched.name : "기타 지역";
}

/** 생활권역명으로 해당하는 행정구역(district) 목록을 반환합니다. */
export function getDistrictsByAreaName(areaName: string): string[] {
  const matched = AREA_MAPPINGS.find((mapping) => mapping.name === areaName);
  return matched ? matched.districts : [];
}
