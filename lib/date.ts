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

/** 행사 일정이 "오늘"을 포함하는지 확인 */
export function isTodayEvent(startDate: string, endDate: string, today: string = getTodaySeoul()): boolean {
  return today >= startDate && today <= endDate;
}

/** 행사 일정이 이번 주말(토, 일) 중 어느 하루라도 걸치는지 확인 */
export function isWeekendEvent(startDate: string, endDate: string, today: string = getTodaySeoul()): boolean {
  // 오늘 날짜 기준 이번 주 토요일, 일요일 날짜 계산
  const todayDate = new Date(`${today}T00:00:00+09:00`);
  const day = todayDate.getDay(); // 0: 일, 1: 월, ..., 6: 토
  
  const distanceToSat = 6 - day;
  const satDate = new Date(todayDate);
  satDate.setDate(todayDate.getDate() + distanceToSat);
  
  const sunDate = new Date(satDate);
  sunDate.setDate(satDate.getDate() + 1);

  const satStr = getTodaySeoul(satDate);
  const sunStr = getTodaySeoul(sunDate);

  // 토요일 또는 일요일이 행사 기간(startDate ~ endDate)에 포함되는지 확인
  const isSatActive = satStr >= startDate && satStr <= endDate;
  const isSunActive = sunStr >= startDate && sunStr <= endDate;
  return isSatActive || isSunActive;
}

/** 행사 일정이 이번 주(오늘부터 일요일까지) 중 걸치는지 확인 */
export function isThisWeekEvent(startDate: string, endDate: string, today: string = getTodaySeoul()): boolean {
  const todayDate = new Date(`${today}T00:00:00+09:00`);
  const day = todayDate.getDay(); // 0: 일, ..., 6: 토
  const daysToSunday = day === 0 ? 0 : 7 - day;
  
  const sundayDate = new Date(todayDate);
  sundayDate.setDate(todayDate.getDate() + daysToSunday);
  const sundayStr = getTodaySeoul(sundayDate);

  // 오늘 ~ 이번 주 일요일 사이에 행사가 걸치는지 확인
  // 즉, 행사 시작일이 이번주 일요일 이하이고, 행사 종료일이 오늘 이상이어야 함
  return startDate <= sundayStr && endDate >= today;
}

/** 행사의 종료일이 7일 이내로 다가왔는지 확인 */
export function isEndingSoon(endDate: string, today: string = getTodaySeoul(), limitDays: number = 7): boolean {
  const remaining = daysUntilEnd(endDate, today);
  return remaining >= 0 && remaining <= limitDays;
}

