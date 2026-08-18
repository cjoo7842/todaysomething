"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { WeatherInfo } from "@/hooks/useWeather";
import { cn } from "@/lib/utils";

interface WeatherBannerProps {
  weather: WeatherInfo;
  loading: boolean;
  recommendedCount: number;
}

export function WeatherBanner({ weather, loading, recommendedCount }: WeatherBannerProps) {
  const { temp, isRainy, isCloudy, description, icon } = weather;

  // 추천 로직 계산 (early return 전에 호출)
  const recommendation = useMemo(() => {
    // 비나 눈이 오거나 아주 추울 때/더울 때 -> 실내 추천
    if (isRainy) {
      return {
        type: "INDOOR",
        shortDesc: "비가 오네요! 쾌적한",
        btnPrefix: "실내 행사",
        bgClass: "from-blue-50 to-indigo-50 border-blue-100",
      };
    }
    
    if (temp <= 5) {
      return {
        type: "INDOOR",
        shortDesc: "추워요! 따뜻한",
        btnPrefix: "실내 행사",
        bgClass: "from-slate-50 to-blue-50 border-slate-100",
      };
    }
    
    if (temp >= 30) {
      return {
        type: "INDOOR",
        shortDesc: "더워요! 시원한",
        btnPrefix: "실내 행사",
        bgClass: "from-sky-50 to-cyan-50 border-sky-100",
      };
    }

    if (isCloudy) {
      return {
        type: "INDOOR",
        shortDesc: "흐린 날에도 즐거운",
        btnPrefix: "실내 행사",
        bgClass: "from-neutral-50 to-slate-50 border-neutral-200",
      };
    }

    // 기본 (맑고 좋은 날씨) -> 야외 추천
    return {
      type: "OUTDOOR",
      shortDesc: "날씨가 너무 좋아요!",
      btnPrefix: "야외 행사",
      bgClass: "from-[#FFF5F0] to-[#FFE8E0] border-[#FFECE5]",
    };
  }, [isRainy, temp, isCloudy]);

  if (loading) {
    return (
      <div className="w-full h-11 animate-pulse rounded-xl bg-neutral-100 border border-neutral-200" />
    );
  }

  return (
    <Link
      href={`/events?space=${recommendation.type}`}
      className={cn(
        "group flex w-full items-center justify-between gap-2 overflow-hidden rounded-xl border px-4 py-3 shadow-sm transition-all hover:shadow-md active:scale-[0.98] bg-gradient-to-r",
        recommendation.bgClass
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <span className="text-[13px] font-extrabold text-neutral-800 shrink-0">
          [{icon} 서울 {temp}°C]
        </span>
        <span className="text-[13px] font-bold text-neutral-800 group-hover:text-brand transition-colors truncate">
          <span className="text-neutral-600 font-medium mr-1">{recommendation.shortDesc}</span>
          {recommendation.btnPrefix} {recommendedCount}개 보러가기
        </span>
      </div>
      <span aria-hidden="true" className="text-brand opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
        &rarr;
      </span>
    </Link>
  );
}
