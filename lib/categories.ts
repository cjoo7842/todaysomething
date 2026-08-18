/**
 * lib/categories.ts
 *
 * API 원본 카테고리 → 사용자용 대분류(전시/문화행사/놀거리) 매핑
 */

import type { EventCategory } from "@/types/event";

/** 사용자에게 노출할 대분류 */
export const DISPLAY_CATEGORIES = ["전체", "전시", "문화행사", "놀거리"] as const;
export type DisplayCategory = (typeof DISPLAY_CATEGORIES)[number];

/**
 * API 원본 카테고리 → 대분류 매핑 테이블
 * - 전시:    미술·전시
 * - 문화행사: 지역축제, 공연
 * - 놀거리:  팝업스토어, 놀거리, 공원, 체험, 복합문화공간 (상시 방문 가능 장소 포함)
 */
export const CATEGORY_TO_DISPLAY: Record<EventCategory | string, DisplayCategory> = {
  "미술·전시": "전시",
  "지역축제": "문화행사",
  "공연": "문화행사",
  "팝업스토어": "놀거리",
  "놀거리": "놀거리",
  "공원": "놀거리",
  "체험": "놀거리",
  "복합문화공간": "놀거리",
};

/** API 원본 카테고리 값을 받아 대분류를 반환합니다. */
export function getDisplayCategory(apiCategory: string): DisplayCategory {
  return CATEGORY_TO_DISPLAY[apiCategory] ?? "문화행사";
}

/**
 * 선택한 대분류에 해당하는 API 원본 카테고리 목록을 반환합니다.
 * 필터링 시 사용합니다.
 */
export function getApiCategoriesByDisplay(display: DisplayCategory): string[] {
  if (display === "전체") return [];
  return Object.entries(CATEGORY_TO_DISPLAY)
    .filter(([, d]) => d === display)
    .map(([apiCat]) => apiCat);
}
