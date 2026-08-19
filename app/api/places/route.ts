import { NextResponse } from "next/server";

export const revalidate = 3600;
export const preferredRegion = 'icn1';

export async function GET() {
  const apiKey = process.env.TOUR_API_KEY;
  if (!apiKey) {
    console.error("[TourAPI] TOUR_API_KEY is missing in environment variables");
    return NextResponse.json([]);
  }

  try {
    // API 키 인코딩 안전 처리 (이미 인코딩된 경우와 디코딩된 경우 모두 대응)
    const serviceKey = apiKey.includes("%") ? apiKey : encodeURIComponent(apiKey);
    const url = `http://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&areaCode=1`;

    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`Tour API HTTP error with status: ${res.status}`);
    }

    const text = await res.text();
    if (text.trim().startsWith("<")) {
      console.error("[TourAPI] Received XML response instead of JSON:", text.substring(0, 150));
      return NextResponse.json([]);
    }

    const data = JSON.parse(text);
    const items = data?.response?.body?.items?.item || [];
    
    // 허용된 문화/관광/체험 카테고리 필터링 (12:관광지, 14:문화시설, 28:레포츠, 38:쇼핑, 39:음식점)
    const allowedTypes = ["12", "14", "28", "38", "39"];
    const filteredItems = items.filter((item: any) => allowedTypes.includes(String(item.contenttypeid)));

    return NextResponse.json(filteredItems);
  } catch (error) {
    console.error("[TourAPI] Fetch or parsing error:", error);
    return NextResponse.json([]);
  }
}
