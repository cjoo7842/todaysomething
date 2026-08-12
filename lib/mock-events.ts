import type { CultureEvent } from "@/types/event";
import { addDays, getTodaySeoul } from "./date";

/**
 * 실제 서울 열린데이터광장 API 연동 전까지 사용하는 더미 데이터입니다.
 * 날짜를 "오늘" 기준 상대값으로 계산해서, 언제 이 저장소를 clone 하더라도
 * "오늘 진행중 필터링"과 "마감 임박 배지"가 바로 정상 동작하는 걸 확인할 수 있습니다.
 *
 * 나중에 실제 API로 교체할 때는 이 파일의 getMockEvents()만
 * fetch 로직으로 바꿔치기하면 됩니다 (다른 코드는 CultureEvent[] 타입만 보고 동작).
 */
export function getMockEvents(): CultureEvent[] {
  const today = getTodaySeoul();

  const events: CultureEvent[] = [
    {
      id: "1",
      title: "망원 한강 여름 아트마켓",
      category: "팝업스토어",
      district: "마포구",
      districtGroup: "마포/서대문",
      isFree: true,
      startDate: addDays(today, -5),
      endDate: today, // 오늘 마감 케이스
      openHours: "11:00 - 20:00",
      priceInfo: "무료 입장",
      description: "한강공원에서 열리는 로컬 아티스트들의 여름 마켓입니다. 핸드메이드 소품과 푸드트럭을 함께 즐길 수 있어요.",
      imageUrl: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
      locationName: "망원한강공원",
      mapUrl: "https://map.naver.com/p/search/망원한강공원",
      location_type: "OUTDOOR",
    },
    {
      id: "2",
      title: "종로 전통시장 야시장 축제",
      category: "지역축제",
      district: "종로구",
      districtGroup: "종로/중구",
      isFree: true,
      startDate: today, // 오늘 시작 → NEW 배지 케이스
      endDate: addDays(today, 6),
      openHours: "17:00 - 23:00",
      priceInfo: "무료 입장 (음식 구매 별도)",
      description: "야간에만 열리는 전통시장 야시장. 다양한 길거리 음식과 공연을 즐길 수 있는 여름 축제입니다.",
      imageUrl: "https://images.unsplash.com/photo-1555529771-7888783a18d3?w=800&q=80",
      locationName: "광장시장 일대",
      mapUrl: "https://map.naver.com/p/search/광장시장",
      location_type: "OUTDOOR",
    },
    {
      id: "3",
      title: "국립현대미술관 여름 기획전",
      category: "미술·전시",
      district: "종로구",
      districtGroup: "종로/중구",
      isFree: false,
      startDate: addDays(today, -20),
      endDate: addDays(today, 2), // D-2 케이스
      openHours: "10:00 - 18:00 (월요일 휴관)",
      priceInfo: "성인 8,000원 / 청소년 5,000원",
      description: "국내외 현대 작가들의 대형 설치 작품을 한자리에서 감상할 수 있는 여름 기획전입니다.",
      imageUrl: "https://images.unsplash.com/photo-1545033131-485ea67fd7c3?w=800&q=80",
      locationName: "국립현대미술관 서울관",
      mapUrl: "https://map.naver.com/p/search/국립현대미술관 서울관",
      location_type: "INDOOR",
    },
    {
      id: "4",
      title: "성수동 디자인 팝업 위크",
      category: "팝업스토어",
      district: "성동구",
      districtGroup: "성수/왕십리",
      isFree: true,
      startDate: addDays(today, -2),
      endDate: addDays(today, 12),
      openHours: "12:00 - 21:00",
      priceInfo: "무료 입장",
      description: "국내 신진 디자이너 브랜드들이 모인 성수동 골목 팝업 위크입니다.",
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      locationName: "성수동 골목 일대",
      mapUrl: "https://map.naver.com/p/search/성수동 팝업스토어",
      location_type: "INDOOR",
    },
    {
      id: "5",
      title: "홍대 버스킹 나이트",
      category: "공연",
      district: "마포구",
      districtGroup: "마포/서대문",
      isFree: true,
      startDate: addDays(today, -1),
      endDate: addDays(today, 1), // D-1 케이스
      openHours: "19:00 - 22:00",
      priceInfo: "무료 관람",
      description: "홍대 걷고싶은거리에서 매주 열리는 인디 뮤지션들의 무료 버스킹 공연입니다.",
      imageUrl: "https://images.unsplash.com/photo-1493676304819-0d7a8d026dcf?w=800&q=80",
      locationName: "홍대 걷고싶은거리",
      mapUrl: "https://map.naver.com/p/search/홍대 걷고싶은거리",
      location_type: "OUTDOOR",
    },
    {
      id: "6",
      title: "강남 라이프스타일 전시 & 체험관",
      category: "미술·전시",
      district: "강남구",
      districtGroup: "강남/서초",
      isFree: false,
      startDate: addDays(today, -10),
      endDate: addDays(today, 25),
      openHours: "10:00 - 19:00",
      priceInfo: "16,000원 (사전예매 시 할인)",
      description: "미디어아트와 체험형 콘텐츠로 구성된 강남 인기 전시입니다.",
      imageUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=800&q=80",
      locationName: "코엑스 인근 전시관",
      mapUrl: "https://map.naver.com/p/search/코엑스",
      location_type: "INDOOR",
    },
    {
      id: "7",
      title: "다음 달 예정 - 서울 라이트 페스티벌 (테스트용 비활성)",
      category: "지역축제",
      district: "중구",
      districtGroup: "종로/중구",
      isFree: true,
      startDate: addDays(today, 15),
      endDate: addDays(today, 30),
      openHours: "18:00 - 23:00",
      priceInfo: "무료 관람",
      description: "아직 시작 전인 행사입니다. '오늘 진행중 필터링'이 정상 동작하면 메인 리스트에 노출되지 않아야 합니다.",
      imageUrl: "https://images.unsplash.com/photo-1470019693664-1d202d2c0907?w=800&q=80",
      locationName: "청계천 일대",
      mapUrl: "https://map.naver.com/p/search/청계천",
      location_type: "OUTDOOR",
    },
  ];

  return events;
}

export const DISTRICT_GROUPS = [
  "전체",
  "종로/중구",
  "마포/서대문",
  "성수/왕십리",
  "강남/서초",
] as const;

export const CATEGORIES = ["전체", "미술·전시", "지역축제", "팝업스토어", "공연"] as const;
