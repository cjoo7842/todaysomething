"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Heart, Calendar, Globe, Phone, User, Info, CalendarCheck } from "lucide-react";
import { getMockEvents } from "@/lib/mock-events";
import { getUrgencyLabel } from "@/lib/date";
import { cn } from "@/lib/utils";
import { EventShareActions } from "@/components/EventShareActions";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { CalendarModal } from "@/components/CalendarModal";
import { EventCard } from "@/components/EventCard";

interface EventDetailPageProps {
  params: { id: string };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const allEvents = useMemo(() => getMockEvents(), []);
  const event = allEvents.find((e) => e.id === params.id);

  if (!event) {
    notFound();
  }

  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 최근 본 행사로 추가
  useEffect(() => {
    addRecentlyViewed(event.id);
  }, [event.id]);

  const urgency = getUrgencyLabel(event);

  // 주변 행사 추천 (동일 district이면서 자기 자신 제외)
  const nearbyEvents = useMemo(() => {
    return allEvents
      .filter((e) => e.district === event.district && e.id !== event.id)
      .slice(0, 3);
  }, [allEvents, event.district, event.id]);

  return (
    <main className="mx-auto max-w-2xl pb-28">
      {/* 대표 이미지 및 상단 플로팅 버튼 */}
      <div className="relative aspect-[4/3] w-full bg-neutral-100">
        <Image src={event.imageUrl} alt="" fill priority className="object-cover" />

        <Link
          href="/"
          aria-label="뒤로가기"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {/* 찜하기 플로팅 버튼 */}
        <button
          onClick={() => toggleFavorite(event.id)}
          aria-label="찜하기"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isFavorite(event.id) ? "fill-rose-500 text-rose-500" : "text-neutral-500"
            )}
          />
        </button>

        {/* 마감 임박 / 신규 뱃지 */}
        {urgency && (
          <span
            className={cn(
              "absolute left-3 bottom-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow",
              urgency.tone === "urgent" ? "bg-rose-accent" : "bg-teal-accent"
            )}
          >
            {urgency.label}
          </span>
        )}
      </div>

      <div className="space-y-5 px-4 py-5">
        {/* 태그 리스트 */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-bold text-white",
                event.isFree ? "bg-green-500" : "bg-neutral-700"
              )}
            >
              {event.isFree ? "무료" : "유료"}
            </span>
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
              {event.category}
            </span>
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
              {event.districtGroup}
            </span>
            <span className="rounded-full border border-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
              {event.location_type === "INDOOR" && "🏢 실내"}
              {event.location_type === "OUTDOOR" && "🌳 실외"}
              {event.location_type === "BOTH" && "🏢🌳 실내·외"}
            </span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">{event.title}</h1>
        </div>

        {/* 캘린더 커스텀 모달 호출 버튼 */}
        <button
          onClick={() => setIsCalendarOpen(true)}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-brand bg-orange-50/50 text-sm font-bold text-brand hover:bg-orange-50 transition-colors"
        >
          <CalendarCheck className="h-5 w-5" />
          일자 지정하여 구글 캘린더에 추가
        </button>

        {/* 상세 안내 정보 리스트 */}
        <div className="space-y-3">
          <section className="space-y-2 rounded-card border border-neutral-100 bg-white p-4 text-sm shadow-sm">
            <h2 className="font-bold text-neutral-800 flex items-center gap-1.5 border-b pb-1.5 mb-2">
              <Info className="h-4 w-4 text-neutral-400" />
              기본 정보
            </h2>
            <div className="space-y-2 text-neutral-600">
              <div className="flex gap-2">
                <span className="font-semibold text-neutral-700 w-16 shrink-0">운영 시간:</span>
                <span>{event.openHours}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-neutral-700 w-16 shrink-0">요금 안내:</span>
                <span>{event.priceInfo}</span>
              </div>
              {event.target && (
                <div className="flex gap-2">
                  <span className="font-semibold text-neutral-700 w-16 shrink-0">이용 대상:</span>
                  <span>{event.target}</span>
                </div>
              )}
              {event.contact && (
                <div className="flex gap-2">
                  <span className="font-semibold text-neutral-700 w-16 shrink-0">문의처:</span>
                  <span>{event.contact}</span>
                </div>
              )}
            </div>
          </section>

          {/* 장소 정보 & 장소상세 이동 링크 */}
          <section className="space-y-2 rounded-card border border-neutral-100 bg-white p-4 text-sm shadow-sm">
            <h2 className="font-bold text-neutral-800 flex items-center justify-between border-b pb-1.5 mb-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-neutral-400" />
                장소 정보
              </span>
              <Link
                href={`/place/${encodeURIComponent(event.locationName)}`}
                className="text-xs font-semibold text-brand hover:underline"
              >
                장소 상세 보기 &rarr;
              </Link>
            </h2>
            <div className="space-y-1.5 text-neutral-600">
              <p className="font-semibold text-neutral-800">{event.locationName}</p>
              {event.address && <p className="text-xs text-neutral-500">{event.address}</p>}
            </div>
          </section>

          {/* 공식 홈페이지 */}
          {event.website && (
            <section className="space-y-2 rounded-card border border-neutral-100 bg-white p-4 text-sm shadow-sm">
              <h2 className="font-bold text-neutral-800 flex items-center gap-1.5 border-b pb-1.5 mb-2">
                <Globe className="h-4 w-4 text-neutral-400" />
                공식 홈페이지
              </h2>
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-brand hover:underline break-all"
              >
                {event.website}
              </a>
            </section>
          )}

          <section className="space-y-1 rounded-card border border-neutral-100 bg-white p-4 text-sm shadow-sm">
            <h2 className="font-bold text-neutral-800 border-b pb-1.5 mb-2">상세 설명</h2>
            <p className="leading-relaxed text-neutral-600 whitespace-pre-wrap">{event.description}</p>
          </section>
        </div>

        {/* 카카오톡 공유 등 */}
        <EventShareActions event={event} />

        {/* 주변 행사 추천 (NEARBY) */}
        <section className="space-y-3 pt-4 border-t">
          <h2 className="text-base font-bold text-neutral-900 flex items-center gap-1.5">
            📍 같은 지역({event.district})의 다른 행사
          </h2>
          {nearbyEvents.length === 0 ? (
            <p className="text-sm text-neutral-400">해당 지역에 등록된 다른 행사가 없습니다.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearbyEvents.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* 하단 고정 지도 이동 CTA */}
      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-2xl px-4 pb-4">
        <a
          href={event.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal-accent text-base font-bold text-white shadow-lg transition-colors hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-accent focus-visible:ring-offset-2"
        >
          <MapPin className="h-5 w-5" aria-hidden="true" />
          지도로 위치 보기
          <span className="sr-only">(새 창에서 열림)</span>
        </a>
      </div>

      {/* 방문 예약용 구글 캘린더 모달 */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        eventTitle={`[오늘뭐보지] ${event.title}`}
        eventDescription={`장소: ${event.locationName}\n설명: ${event.description}`}
        locationName={event.locationName}
        startDate={event.startDate}
        endDate={event.endDate}
      />
    </main>
  );
}
