import type { CultureEvent } from "@/types/event";

/**
 * 서버가 어느 지역에 배포되든(Vercel 등은 기본적으로 UTC) 항상
 * 한국 기준 "오늘"을 정확히 계산하기 위한 유틸입니다.
 * (Antigravity 협업 절차 문서의 "타임존 문제" 체크리스트 항목을 코드로 반영)
 */

const SEOUL_TIME_ZONE = "Asia/Seoul";

/** 오늘 날짜를 "YYYY-MM-DD" 형식으로, Asia/Seoul 기준으로 반환합니다. */
export function getTodaySeoul(referenceDate: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // en-CA 로케일은 YYYY-MM-DD 형식으로 포맷됩니다.
  return formatter.format(referenceDate);
}

/** "YYYY-MM-DD" 문자열에 일수를 더해 새로운 "YYYY-MM-DD" 문자열을 반환합니다. */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00+09:00`);
  date.setDate(date.getDate() + days);
  return getTodaySeoul(date);
}

/** 오늘이 시작일~종료일 사이에 포함되는지 (오늘 진행중인 행사인지) 판별합니다. */
export function isEventActiveToday(
  startDate: string,
  endDate: string,
  today: string = getTodaySeoul()
): boolean {
  return today >= startDate && today <= endDate;
}

/** 종료일까지 남은 일수 (오늘=0, 내일 마감=1, 이미 지남=음수) */
export function daysUntilEnd(endDate: string, today: string = getTodaySeoul()): number {
  const end = new Date(`${endDate}T00:00:00+09:00`);
  const now = new Date(`${today}T00:00:00+09:00`);
  return Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export type UrgencyTone = "new" | "urgent";

export interface UrgencyLabel {
  label: string;
  tone: UrgencyTone;
}

/**
 * 사용자 편의 요소 문서의 "A그룹-1. 마감 임박 배지" 로직입니다.
 * - 오늘 막 시작한 행사 → "NEW"
 * - 종료까지 3일 이하로 남은 행사 → "오늘 마감" 또는 "D-N"
 * - 그 외에는 배지 없음(null)
 */
export function getUrgencyLabel(
  event: Pick<CultureEvent, "startDate" | "endDate">,
  today: string = getTodaySeoul()
): UrgencyLabel | null {
  if (event.startDate === today) {
    return { label: "NEW", tone: "new" };
  }
  const remaining = daysUntilEnd(event.endDate, today);
  if (remaining === 0) return { label: "오늘 마감", tone: "urgent" };
  if (remaining > 0 && remaining <= 3) return { label: `D-${remaining}`, tone: "urgent" };
  return null;
}

/** 행사가 지정한 오늘 날짜에 진행 중인지 여부 */
export function isTodayEvent(event: Pick<CultureEvent, "startDate" | "endDate">, today: string = getTodaySeoul()): boolean {
  return isEventActiveToday(event.startDate, event.endDate, today);
}

/** 행사가 이번 주말(토/일)에 진행 중인지 여부 */
export function isWeekendEvent(event: Pick<CultureEvent, "startDate" | "endDate">, today: string = getTodaySeoul()): boolean {
  const now = new Date(`${today}T00:00:00+09:00`);
  const dayOfWeek = now.getDay(); // 0: 일요일, 6: 토요일
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
  const saturdayStr = addDays(today, daysUntilSaturday);
  const sundayStr = addDays(saturdayStr, 1);

  // 행사 기간이 이번주 토요일 또는 일요일과 겹치는지 체크
  const activeSat = saturdayStr >= event.startDate && saturdayStr <= event.endDate;
  const activeSun = sundayStr >= event.startDate && sundayStr <= event.endDate;
  return activeSat || activeSun;
}

/** 행사가 이번 주(오늘~일요일) 진행 중인지 여부 */
export function isThisWeekEvent(event: Pick<CultureEvent, "startDate" | "endDate">, today: string = getTodaySeoul()): boolean {
  const now = new Date(`${today}T00:00:00+09:00`);
  const dayOfWeek = now.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  const sundayStr = addDays(today, daysUntilSunday);

  // 오늘부터 일요일 사이에 행사 기간이 존재하는지
  return event.startDate <= sundayStr && event.endDate >= today;
}

/** 행사가 마감 임박(7일 이내 종료)인지 여부 */
export function isEndingSoon(event: Pick<CultureEvent, "startDate" | "endDate">, today: string = getTodaySeoul(), withinDays = 7): boolean {
  const remaining = daysUntilEnd(event.endDate, today);
  return remaining >= 0 && remaining <= withinDays && isTodayEvent(event, today);
}

