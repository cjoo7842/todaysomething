import { addDays } from "./date";

interface CalendarParams {
  title: string;
  description: string;
  locationName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

/**
  * CultureEvent의 속성을 기반으로 구글 캘린더 등록용 렌더 URL을 빌드합니다.
  * 구글 캘린더 All-day(종일) 포맷에 맞추기 위해 '-' 기호를 제거하고,
  * 종료 당일이 일정에 정상 포함되도록 종료일 기준 +1일을 가산하여 dates 파라미터를 설정합니다.
  */
export function generateGoogleCalendarUrl({
  title,
  description,
  locationName,
  startDate,
  endDate,
}: CalendarParams): string {
  const startFormatted = startDate.replace(/-/g, "");
  const nextDay = addDays(endDate, 1);
  const endFormatted = nextDay.replace(/-/g, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location: locationName,
    dates: `${startFormatted}/${endFormatted}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
