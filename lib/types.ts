/** 서울시 25개 자치구 */
export type District =
  | "강남구"
  | "강동구"
  | "강북구"
  | "강서구"
  | "관악구"
  | "광진구"
  | "구로구"
  | "금천구"
  | "노원구"
  | "도봉구"
  | "동대문구"
  | "동작구"
  | "마포구"
  | "서대문구"
  | "서초구"
  | "성동구"
  | "성북구"
  | "송파구"
  | "양천구"
  | "영등포구"
  | "용산구"
  | "은평구"
  | "종로구"
  | "중구"
  | "중랑구";

/** 메인 화면 빠른 탐색용 생활권 */
export interface LivingZone {
  id: string;
  name: string;
  districts: District[];
  keywords?: string[];
}
