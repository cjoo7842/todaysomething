import { addDays } from "./date";

interface CalendarParams {
  title: string;
  description: string;
  locationName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  visitDate?: string; // YYYY-MM-DD
  visitTime?: string; // HH:mm
  pageUrl?: string; // 상세페이지 URL (description 하단 및 sprop에 포함)
}

/**
  * CultureEvent의 속성을 기반으로 구글 캘린더 등록용 렌더 URL을 빌드합니다.
  * visitDate 및 visitTime이 제공되면 해당 방문 일시로 일정을 생성합니다.
  */
export function generateGoogleCalendarUrl({
  title,
  description,
  locationName,
  startDate,
  endDate,
  visitDate,
  visitTime,
  pageUrl,
}: CalendarParams): string {
  let datesParam: string;

  if (visitDate) {
    const vDateClean = visitDate.replace(/-/g, "");
    if (visitTime) {
      const [hours, mins] = visitTime.split(":");
      const startIso = `${vDateClean}T${hours.padStart(2, "0")}${mins.padStart(2, "0")}00`;
      // 기본 2시간 방문 일정 설정
      const endHour = String(Math.min(23, Number(hours) + 2)).padStart(2, "0");
      const endIso = `${vDateClean}T${endHour}${mins.padStart(2, "0")}00`;
      datesParam = `${startIso}/${endIso}`;
    } else {
      const nextDay = addDays(visitDate, 1);
      const endFormatted = nextDay.replace(/-/g, "");
      datesParam = `${vDateClean}/${endFormatted}`;
    }
  } else {
    const startFormatted = startDate.replace(/-/g, "");
    const nextDay = addDays(endDate, 1);
    const endFormatted = nextDay.replace(/-/g, "");
    datesParam = `${startFormatted}/${endFormatted}`;
  }

  // 페이지 URL이 있으면 description 하단에 출처 링크 포함
  const fullDescription = pageUrl
    ? `${description}\n\n📎 상세 페이지: ${pageUrl}`
    : description;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: fullDescription,
    location: locationName,
    dates: datesParam,
    // Google Calendar가 한국 시간으로 시간을 정확히 해석하도록 timezone 지정
    ctz: "Asia/Seoul",
  });

  // sprop=website:<url> 형식으로 출처 URL을 캘린더 일정 메타에 추가
  if (pageUrl) {
    params.append("sprop", `website:${pageUrl}`);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

