import { addDays } from "./date";

interface CalendarParams {
  title: string;
  description: string;
  locationName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  visitDate?: string; // YYYY-MM-DD
  visitTime?: string; // HH:mm
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

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location: locationName,
    dates: datesParam,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

