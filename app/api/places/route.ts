import { NextResponse } from "next/server";

export const revalidate = 3600;
export const preferredRegion = 'icn1';

export async function GET() {
  const rawKey = process.env.TOUR_API_KEY || '';
  if (!rawKey) {
    console.error("TOUR_API_KEY is missing");
    return NextResponse.json([]);
  }

  const encodedKey = encodeURIComponent(rawKey);
  let decodedKey = rawKey;
  try {
    decodedKey = decodeURIComponent(rawKey);
  } catch (e) {
    console.warn("Raw key could not be decoded:", e);
  }

  console.log('\n=== [TourAPI Key Diagnostic Log] ===');
  console.log('1. Raw Key:', `${rawKey.substring(0, 10)}... (Length: ${rawKey.length})`);
  console.log('2. Has % Sign (Already Encoded?):', rawKey.includes('%'));
  console.log('3. Has + Sign (Needs Encoding?):', rawKey.includes('+'));

  const testCall = async (keyName: string, keyValue: string) => {
    try {
      const url = `http://apis.data.go.kr/B551011/KorService2/areaBasedList2?serviceKey=${keyValue}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&_type=json&areaCode=1`;
      const res = await fetch(url, { next: { revalidate: 0 } });
      const text = await res.text();
      const preview = text.substring(0, 150).replace(/\n/g, ' ');
      console.log(`[Test ${keyName}] Status: ${res.status} | Response: ${preview}`);
      
      if (res.ok && !text.trim().startsWith("<") && text.includes("response")) {
        const data = JSON.parse(text);
        return data?.response?.body?.items?.item || [];
      }
      return null;
    } catch (e: any) {
      console.log(`[Test ${keyName}] Error:`, e.message);
      return null;
    }
  };

  const rawResult = await testCall('Raw', rawKey);
  const encResult = await testCall('Encoded', encodedKey);
  const decResult = await testCall('Decoded', decodedKey);

  console.log('====================================\n');

  // 성공한 결과가 있으면 필터링해서 리턴
  const validItems = rawResult || encResult || decResult || [];
  
  const allowedTypes = ["12", "14", "28", "38", "39"];
  const filteredItems = validItems.filter((item: any) => allowedTypes.includes(String(item.contenttypeid)));
  
  return NextResponse.json(filteredItems);
}
