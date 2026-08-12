export interface AreaMapping {
  name: string; // 화면 표시용 지역명 (예: 성수·서울숲)
  districtGroup: string; // DISTRICT_GROUPS에 매핑
  districts: string[]; // 행정구 (예: ["성동구"])
}

export const POPULAR_AREAS: AreaMapping[] = [
  { name: "성수 · 서울숲", districtGroup: "성수/왕십리", districts: ["성동구"] },
  { name: "종로 · 서촌", districtGroup: "종로/중구", districts: ["종로구", "중구"] },
  { name: "한남 · 이태원", districtGroup: "종로/중구", districts: ["용산구"] },
  { name: "홍대 · 연남", districtGroup: "마포/서대문", districts: ["마포구", "서대문구"] },
  { name: "잠실 · 송파", districtGroup: "강남/서초", districts: ["송파구"] },
  { name: "여의도 · 영등포", districtGroup: "마포/서대문", districts: ["영등포구"] },
  { name: "강남 · 압구정", districtGroup: "강남/서초", districts: ["강남구", "서초구"] },
];

/**
 * 지역 이름으로 행정구 또는 districtGroup을 찾습니다.
 */
export function findDistrictByAreaName(areaName: string): string | null {
  const match = POPULAR_AREAS.find((a) => a.name === areaName);
  return match ? match.districtGroup : null;
}
