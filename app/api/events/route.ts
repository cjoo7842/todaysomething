import { NextResponse } from "next/server";
import { getMockEvents } from "@/lib/mock-events";
import { EventCategory, CultureEvent } from "@/types/event";

const API_KEY = process.env.SEOUL_API_KEY;

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json(getMockEvents());
  }

  try {
    const url = `http://openapi.seoul.go.kr:8088/${API_KEY}/json/culturalEventInfo/1/200/`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      throw new Error(`API fetch failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.culturalEventInfo || !data.culturalEventInfo.row) {
      return NextResponse.json(getMockEvents());
    }

    const rows = data.culturalEventInfo.row;
    
    const events: CultureEvent[] = rows.map((row: any, index: number) => {
      // Map CODENAME to Category
      let category: EventCategory = "놀거리" as EventCategory;
      const codename = row.CODENAME || "";
      if (codename.includes("전시") || codename.includes("미술")) category = "미술·전시";
      else if (codename.includes("축제")) category = "지역축제";
      else if (codename.includes("공연") || codename.includes("연극") || codename.includes("콘서트") || codename.includes("뮤지컬") || codename.includes("클래식") || codename.includes("국악") || codename.includes("무용") || codename.includes("독주")) category = "공연";
      else if (codename.includes("교육") || codename.includes("체험")) category = "체험";
      else category = "놀거리";

      const district = row.GUNAME || "서울전역";
      let districtGroup = district;
      if (["종로구", "중구", "용산구"].includes(district)) districtGroup = "도심권";
      else if (["성동구", "광진구", "동대문구", "중랑구", "성북구", "강북구", "도봉구", "노원구"].includes(district)) districtGroup = "동북권";
      else if (["은평구", "서대문구", "마포구"].includes(district)) districtGroup = "서북권";
      else if (["양천구", "강서구", "구로구", "금천구", "영등포구", "동작구", "관악구"].includes(district)) districtGroup = "서남권";
      else if (["서초구", "강남구", "송파구", "강동구"].includes(district)) districtGroup = "동남권";
      else districtGroup = "기타";

      let startDate = row.STRTDATE ? row.STRTDATE.split(" ")[0] : "";
      let endDate = row.END_DATE ? row.END_DATE.split(" ")[0] : "";

      const isFree = row.IS_FREE === "1" || row.IS_FREE === "무료" || (row.USE_FEE && row.USE_FEE.includes("무료"));

      return {
        id: `api-${index}-${row.TITLE}`,
        title: row.TITLE || "제목 없음",
        category,
        district,
        districtGroup,
        isFree,
        startDate,
        endDate,
        openHours: "",
        priceInfo: row.USE_FEE || (isFree ? "무료" : "유료"),
        description: row.PROGRAM || row.TITLE,
        imageUrl: row.MAIN_IMG || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
        locationName: row.PLACE || "서울",
        mapUrl: row.ORG_LINK || row.HMPG_ADDR || "#",
        location_type: row.PLACE && (row.PLACE.includes("공원") || row.PLACE.includes("광장") || row.PLACE.includes("거리")) ? "OUTDOOR" : "INDOOR",
        website: row.ORG_LINK || row.HMPG_ADDR,
        contact: row.INQUIRY,
        target: row.USE_TRGT,
        latitude: row.LAT ? parseFloat(row.LAT) : undefined,
        longitude: row.LOT ? parseFloat(row.LOT) : undefined,
      };
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Seoul API Fetch Error:", error);
    return NextResponse.json(getMockEvents());
  }
}
