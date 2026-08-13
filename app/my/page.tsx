"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, History, Trash2 } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { getMockEvents } from "@/lib/mock-events";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { cn } from "@/lib/utils";

export default function MyPage() {
  const allEvents = useMemo(() => getMockEvents(), []);
  const { favorites } = useFavorites();
  const { recentlyViewed } = useRecentlyViewed();

  const [activeTab, setActiveTab] = useState<"favorites" | "recent">("favorites");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 찜한 행사 객체 필터링
  const favoriteEvents = useMemo(() => {
    return allEvents.filter((e) => favorites.includes(e.id));
  }, [allEvents, favorites]);

  // 최근 본 행사 객체 필터링 (순서 유지)
  const recentEvents = useMemo(() => {
    return recentlyViewed
      .map((id) => allEvents.find((e) => e.id === id))
      .filter(Boolean) as typeof allEvents;
  }, [allEvents, recentlyViewed]);

  const handleClearHistory = () => {
    try {
      localStorage.removeItem("recently_viewed_events");
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 px-4 pb-20 pt-6 lg:max-w-5xl">
      <header className="flex items-center gap-2 border-b pb-4">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-neutral-900">마이페이지</h1>
      </header>

      {/* 탭 구조 */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("favorites")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-bold border-b-2 transition-colors",
            activeTab === "favorites"
              ? "border-brand text-brand"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          )}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Heart className="h-4 w-4 fill-current" />
            찜한 행사 ({isClient ? favoriteEvents.length : 0})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("recent")}
          className={cn(
            "flex-1 py-3 text-center text-sm font-bold border-b-2 transition-colors",
            activeTab === "recent"
              ? "border-brand text-brand"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          )}
        >
          <span className="flex items-center justify-center gap-1.5">
            <History className="h-4 w-4" />
            최근 본 행사 ({isClient ? recentEvents.length : 0})
          </span>
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="mt-4">
        {!isClient ? (
          <div className="text-center py-10 text-neutral-500 text-sm">로딩 중...</div>
        ) : activeTab === "favorites" ? (
          favoriteEvents.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-neutral-200 bg-white">
              <p className="text-sm text-neutral-500 font-medium">찜한 행사가 없습니다.</p>
              <Link
                href="/events"
                className="mt-3 inline-block rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white"
              >
                행사 구경하러 가기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favoriteEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )
        ) : (
          <div>
            {recentEvents.length > 0 && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-1 text-xs font-semibold text-neutral-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  기록 전체 삭제
                </button>
              </div>
            )}
            {recentEvents.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-neutral-200 bg-white">
                <p className="text-sm text-neutral-500 font-medium font-sans">최근에 본 행사가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
