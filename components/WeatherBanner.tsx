"use client";

import type { WeatherInfo } from "@/hooks/useWeather";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface WeatherBannerProps {
  weather: WeatherInfo;
  loading: boolean;
  currentFilter: "ALL" | "INDOOR" | "OUTDOOR";
  onFilterChange: (filter: "ALL" | "INDOOR" | "OUTDOOR") => void;
}

export function WeatherBanner({
  weather,
  loading,
  currentFilter,
  onFilterChange,
}: WeatherBannerProps) {
  if (loading) {
    return (
      <div className="w-full h-24 animate-pulse rounded-card bg-neutral-100 border border-neutral-200" />
    );
  }

  const { temp, isRainy, isCloudy, description, icon } = weather;

  // 비/눈이 오거나 흐린 날씨인 경우 실내 행사 추천
  const showIndoorRecommendation = isRainy || isCloudy;

  const handleQuickFilterClick = () => {
    if (showIndoorRecommendation) {
      onFilterChange(currentFilter === "INDOOR" ? "ALL" : "INDOOR");
    } else {
      onFilterChange(currentFilter === "OUTDOOR" ? "ALL" : "OUTDOOR");
    }
  };

  const isQuickFilterActive = showIndoorRecommendation
    ? currentFilter === "INDOOR"
    : currentFilter === "OUTDOOR";

  const bannerText = showIndoorRecommendation
    ? `${icon} 오늘 비/눈 소식이 있거나 흐린 날씨네요! 쾌적한 실내 행사는 어떠세요?`
    : `☀️ 오늘 날씨가 화창하고 맑아요! 화창한 야외 활동은 어떠세요?`;

  const buttonText = showIndoorRecommendation ? "🏢 실내 행사만 보기" : "🌳 야외 행사만 보기";

  return (
    <div className="relative overflow-hidden rounded-card border border-brand/20 bg-gradient-to-r from-orange-50/90 to-rose-50/90 p-4 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
      {/* 뒷배경 소프트 그라디언트 글로우 효과 */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/15 blur-xl" />
      <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-rose-accent/15 blur-xl" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
        <div className="space-y-1.5">
          {/* 서울 날씨 요약 뱃지 */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-neutral-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-0.5 shadow-sm border border-neutral-100">
              <span className="text-sm leading-none">{icon}</span>
              <span>서울 {temp}°C</span>
              <span className="text-neutral-300">|</span>
              <span className="text-brand font-bold">{description}</span>
            </span>
            <span className="flex items-center gap-1 text-rose-500 bg-rose-100/50 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3 animate-pulse" />
              오늘의 스마트 추천
            </span>
          </div>

          {/* 추천 문구 */}
          <p className="text-sm font-medium text-neutral-800 leading-relaxed">
            {bannerText}
          </p>
        </div>

        {/* 퀵 필터 버튼 */}
        <button
          type="button"
          onClick={handleQuickFilterClick}
          className={cn(
            "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-xl border transition-all duration-200 active:scale-[0.98] shadow-sm select-none shrink-0",
            isQuickFilterActive
              ? "bg-brand text-white border-brand shadow-inner hover:bg-brand-dark"
              : "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200 hover:border-neutral-300"
          )}
        >
          <span>{showIndoorRecommendation ? "🏢" : "🌳"}</span>
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  );
}
