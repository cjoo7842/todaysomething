"use client";

import { useState, useEffect } from "react";
import type { CultureEvent } from "@/types/event";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { Calendar, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTodaySeoul } from "@/lib/date";

interface EventShareActionsProps {
  event: CultureEvent;
}

export function EventShareActions({ event }: EventShareActionsProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Toast duration timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // Initialize Kakao SDK
  const initKakao = () => {
    const appKey =
      process.env.NEXT_PUBLIC_KAKAO_APP_KEY ||
      process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

    if (typeof window !== "undefined" && window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        if (appKey) {
          window.Kakao.init(appKey);
          console.log("Kakao SDK initialized successfully.");
        } else {
          console.warn(
            "Kakao App Key is missing. Kakao Share will fall back to Web Share API or Clipboard Copy."
          );
        }
      }
    }
  };

  useEffect(() => {
    initKakao();
  }, []);

  const handleKakaoShare = async () => {
    initKakao(); // Re-initialize fallback if needed

    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    // 1. Try Kakao Talk Share SDK
    if (
      typeof window !== "undefined" &&
      window.Kakao &&
      window.Kakao.isInitialized()
    ) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: "feed",
          content: {
            title: event.title,
            description: `📍 장소: ${event.locationName}\n⏰ 시간: ${event.openHours}`,
            imageUrl: event.imageUrl,
            link: {
              mobileWebUrl: currentUrl,
              webUrl: currentUrl,
            },
          },
          buttons: [
            {
              title: "자세히 보기",
              link: {
                mobileWebUrl: currentUrl,
                webUrl: currentUrl,
              },
            },
            {
              title: "위치 확인하기",
              link: {
                mobileWebUrl: event.mapUrl,
                webUrl: event.mapUrl,
              },
            },
          ],
        });
        return;
      } catch (err) {
        console.error("Kakao share failed. Trying fallbacks...", err);
      }
    }

    // 2. Fallback: Web Share API (Mobile native sharing drawer)
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `오늘 뭐 보지? '${event.title}' 일정을 공유합니다.\n장소: ${event.locationName}`,
          url: currentUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Web Share failed:", err);
        } else {
          // User aborted/closed the native share dialog, don't copy to clipboard
          return;
        }
      }
    }

    // 3. Fallback: Clipboard API copy + Custom Toast Notification
    try {
      await navigator.clipboard.writeText(currentUrl);
      setIsCopied(true);
      setToastMessage("📋 주소가 복사되었습니다. 원하는 곳에 공유해보세요!");
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      alert(
        "공유하기 주소 복사에 실패했습니다. 브라우저 주소창의 링크를 복사해서 약속을 공유해 주세요!"
      );
    }
  };

  const googleCalendarUrl = generateGoogleCalendarUrl({
    title: `[오늘뭐보지] ${event.title}`,
    description: `행사 안내:\n${event.description}\n\n행사 링크: ${
      typeof window !== "undefined" ? window.location.href : ""
    }`,
    locationName: event.locationName,
    startDate: event.isPermanent ? getTodaySeoul() : event.startDate,
    endDate: event.isPermanent ? getTodaySeoul() : event.endDate,
  });

  return (
    <div className="relative space-y-3 rounded-card border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-800">
        <Sparkles className="h-4 w-4 text-brand animate-pulse" />
        <span>약속 잡기 & 저장</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {/* 카카오톡 공유 버튼 */}
        <button
          type="button"
          onClick={handleKakaoShare}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-4 text-sm font-bold text-[#191919] shadow-sm transition-all duration-200 hover:bg-[#FEE500]/90 hover:shadow active:scale-[0.98] select-none"
        >
          {/* Kakao Balloon SVG Icon */}
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3c-5.52 0-10 3.48-10 7.78 0 2.76 1.83 5.18 4.6 6.56l-1.16 4.29c-.1.38.35.69.69.47l5.08-3.37c.88.18 1.8.27 2.79.27 5.52 0 10-3.48 10-7.78s-4.48-7.78-10-7.78z" />
          </svg>
          카카오톡으로 약속 공유하기
        </button>

        {/* 구글 캘린더 등록 버튼 */}
        <a
          href={googleCalendarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-700 shadow-sm transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 hover:shadow active:scale-[0.98] select-none"
        >
          <Calendar className="h-5 w-5 text-brand" />
          구글 캘린더에 일정 추가
        </a>
      </div>

      {/* Floating custom toast notifications */}
      <div
        className={cn(
          "fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-neutral-900/90 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-sm transition-all duration-300 select-none",
          toastMessage ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"
        )}
      >
        {isCopied && <Check className="h-4 w-4 text-green-400" />}
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
