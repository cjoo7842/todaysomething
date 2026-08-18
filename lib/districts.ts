import type { District, LivingZone } from "./types";

export type { District, LivingZone };

/** 서울시 25개 행정구 */
export const SEOUL_DISTRICTS: District[] = [
  "강남구",
  "강동구",
  "강북구",
  "강서구",
  "관악구",
  "광진구",
  "구로구",
  "금천구",
  "노원구",
  "도봉구",
  "동대문구",
  "동작구",
  "마포구",
  "서대문구",
  "서초구",
  "성동구",
  "성북구",
  "송파구",
  "양천구",
  "영등포구",
  "용산구",
  "은평구",
  "종로구",
  "중구",
  "중랑구",
];

export const DISTRICT_FILTER_OPTIONS = ["전체", ...SEOUL_DISTRICTS] as const;
export type DistrictFilterValue = (typeof DISTRICT_FILTER_OPTIONS)[number];

/** 주요 생활권 ↔ 행정구·동 단위 키워드 매핑 */
export const LIVING_ZONES: LivingZone[] = [
  {
    id: "jongno-seochon",
    name: "종로·서촌",
    districts: ["종로구"],
    keywords: ["서촌", "북촌", "삼청", "광화문", "인사동", "익선"],
  },
  {
    id: "seongsu-seoulforest",
    name: "성수·서울숲",
    districts: ["성동구"],
    keywords: ["성수", "성수동", "서울숲", "왕십리"],
  },
  {
    id: "hongdae-yeonnam",
    name: "홍대·연남",
    districts: ["마포구"],
    keywords: ["홍대", "연남", "연남동", "상수", "합정", "망원"],
  },
  {
    id: "hannam-itaewon",
    name: "한남·이태원",
    districts: ["용산구"],
    keywords: ["한남", "이태원", "해방촌", "경리단"],
  },
  {
    id: "jamsil",
    name: "잠실",
    districts: ["송파구"],
    keywords: ["잠실", "롯데월드", "석촌호수"],
  },
  {
    id: "yeouido",
    name: "여의도",
    districts: ["영등포구"],
    keywords: ["여의도", "여의나루"],
  },
  {
    id: "gangnam",
    name: "강남",
    districts: ["강남구", "서초구"],
    keywords: ["강남", "신사", "압구정", "청담", "삼성", "서초"],
  },
];

export function getLivingZoneById(id: string): LivingZone | undefined {
  if (!id) return undefined;
  return LIVING_ZONES.find((zone) => zone.id === id);
}

export function getLivingZoneByName(name: string): LivingZone | undefined {
  const normalized = name.replace(/\s/g, "");
  return LIVING_ZONES.find((zone) => zone.name.replace(/\s/g, "") === normalized);
}

/** 자치구가 속하는 생활권 (없으면 undefined) */
export function getLivingZoneByDistrict(district: string): LivingZone | undefined {
  return LIVING_ZONES.find((zone) =>
    zone.districts.some((d) => district.includes(d))
  );
}
