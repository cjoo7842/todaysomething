export type EventCategory = "미술·전시" | "지역축제" | "팝업스토어" | "공연";

export interface CultureEvent {
  id: string;
  title: string;
  category: EventCategory;
  district: string; // 원본 자치구명 (예: 종로구)
  districtGroup: string; // 화면에 노출되는 권역 그룹명 (예: 종로/중구)
  isFree: boolean;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  openHours: string;
  priceInfo: string;
  description: string;
  imageUrl: string;
  locationName: string;
  mapUrl: string; // 네이버지도 / 카카오맵 길찾기 외부 링크
  location_type: 'INDOOR' | 'OUTDOOR' | 'BOTH';
  website?: string;
  contact?: string;
  target?: string;
  fee?: string;
  latitude?: number;
  longitude?: number;
}

