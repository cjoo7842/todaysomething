import { NextResponse } from "next/server";

const KMA_API_KEY = process.env.KMA_API_KEY;

export async function GET() {
  if (!KMA_API_KEY) {
    return NextResponse.json({ error: "No API Key" }, { status: 400 });
  }

  try {
    // KMA 초단기실황 기준시간 계산 (매시간 40분 업데이트, 40분 이전이면 이전 시간 정각)
    const now = new Date();
    // KST 변환
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const kst = new Date(utc + 9 * 3600000);
    
    let year = kst.getFullYear();
    let month = kst.getMonth() + 1;
    let date = kst.getDate();
    let hours = kst.getHours();
    let minutes = kst.getMinutes();

    if (minutes < 40) {
      kst.setHours(hours - 1);
      year = kst.getFullYear();
      month = kst.getMonth() + 1;
      date = kst.getDate();
      hours = kst.getHours();
    }

    const base_date = `${year}${String(month).padStart(2, "0")}${String(date).padStart(2, "0")}`;
    const base_time = `${String(hours).padStart(2, "0")}00`;
    
    // 서울시 좌표 (nx: 60, ny: 127)
    const nx = 60;
    const ny = 127;

    const url = `http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?ServiceKey=${KMA_API_KEY}&pageNo=1&numOfRows=100&dataType=JSON&base_date=${base_date}&base_time=${base_time}&nx=${nx}&ny=${ny}`;

    const res = await fetch(url, { next: { revalidate: 300 } }); // 5분 캐시
    if (!res.ok) {
      throw new Error("KMA API response not ok");
    }

    const data = await res.json();
    if (data.response?.header?.resultCode !== "00") {
      throw new Error(`KMA API Error: ${data.response?.header?.resultMsg}`);
    }

    const items = data.response.body.items.item;
    
    let t1h = 22; // 기온
    let pty = 0;  // 강수형태 (0: 없음, 1: 비, 2: 비/눈, 3: 눈, 5: 빗방울, 6: 빗방울눈날림, 7: 눈날림)
    
    for (const item of items) {
      if (item.category === "T1H") t1h = parseFloat(item.obsrValue);
      if (item.category === "PTY") pty = parseInt(item.obsrValue, 10);
    }

    const isRainy = pty === 1 || pty === 2 || pty === 5 || pty === 6;
    const isSnowy = pty === 3 || pty === 7;
    const isCloudy = false; // 초단기실황에는 구름 정보가 없으므로 비/눈이 아니면 맑음으로 처리하거나 별도 처리 안 함

    let condition = "Clear";
    let description = "맑음";
    let icon = "☀️";

    if (isRainy) {
      condition = "Rain";
      description = "비";
      icon = "☔";
    } else if (isSnowy) {
      condition = "Snow";
      description = "눈";
      icon = "❄️";
    }

    return NextResponse.json({
      temp: t1h,
      condition,
      isRainy: isRainy || isSnowy,
      isCloudy,
      description,
      icon
    });
  } catch (error: any) {
    console.error("Weather API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
