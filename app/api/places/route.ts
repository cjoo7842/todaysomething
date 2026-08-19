import { NextResponse } from "next/server";

export const revalidate = 3600;
export const preferredRegion = 'icn1';

export async function GET() {
  const apiKey = process.env.TOUR_API_KEY;
  if (!apiKey) {
    console.error("TOUR_API_KEY is missing");
    return NextResponse.json([]);
  }

  try {
    const url = `http://apis.data.go.kr/B551011/KorService1/areaBasedList1?serviceKey=${apiKey}&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&areaCode=1`;
    
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      throw new Error(`Tour API responded with status: ${res.status}`);
    }

    const data = await res.json();
    const items = data?.response?.body?.items?.item || [];

    const allowedTypes = ["12", "14", "28", "38", "39"];
    const filteredItems = items.filter((item: any) => allowedTypes.includes(item.contenttypeid));

    return NextResponse.json(filteredItems);
  } catch (error) {
    console.error("TourAPI fetch error:", error);
    return NextResponse.json([]);
  }
}
