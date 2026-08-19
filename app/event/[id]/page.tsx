"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Heart, Calendar, Globe, Phone, User, Info, CalendarCheck } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { getUrgencyLabel } from "@/lib/date";
import { cn } from "@/lib/utils";
import { EventShareActions } from "@/components/EventShareActions";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { CalendarModal } from "@/components/CalendarModal";
import { EventCard } from "@/components/EventCard";
import type { CultureEvent } from "@/types/event";

interface EventDetailPageProps {
  params: { id: string };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const allEvents = useEvents(); // Keep this for nearby events
  const [event, setEvent] = useState<CultureEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  const { isFavorite, toggleFavorite } = useFavorites();
  const { addRecentlyViewed } = useRecentlyViewed();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    async function fetchEventDetail() {
      setIsLoading(true);
      try {
        // Next.js params.id는 이미 디코딩되어 있을 수 있으므로 try-catch로 안전하게 처리
        let decodedId = params.id;
        try {
          decodedId = decodeURIComponent(params.id);
        } catch (e) {
          console.warn("Decode URI failed, using raw params.id");
        }
        decodedId = decodedId.trim();
        console.log("[EventDetailPage] Decoded ID:", decodedId);

        // 1. 캐시(allEvents)에서 먼저 탐색
        const cached = allEvents.find((e) => String(e.id).trim() === decodedId);
        if (cached) {
          console.log("[EventDetailPage] Found in cache");
          setEvent(cached);
          setIsLoading(false);
          return;
        }

        console.log("[EventDetailPage] Fetching from APIs...");
        // 2. 서울시 API 및 TourAPI 조건부 Fetch
        const [eventsRes, placesRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/places')
        ]);
        
        const eventsData = await eventsRes.json();
        
        // 인덱스 변동으로 인한 ID 불일치 방지 (제목으로 fallback 매칭)
        const titlePart = decodedId.startsWith("api-") ? decodedId.split("-").slice(2).join("-").trim() : null;
        const seoulEvent = eventsData.find((e: any) => 
          String(e.id).trim() === decodedId || (titlePart && e.title?.trim() === titlePart)
        );
        
        if (seoulEvent) {
          console.log("[EventDetailPage] Found in Seoul API");
          setEvent(seoulEvent);
          setIsLoading(false);
          return;
        }

        const placesData = await placesRes.json();
        const tourItem = placesData.find((p: any) => `place_${p.contentid}` === decodedId);

        if (tourItem) {
          const mapCategory = (type: string) => {
            if (type === "12") return "놀거리"; 
            if (type === "14") return "전시"; 
            if (type === "28") return "레포츠"; 
            if (type === "38") return "쇼핑"; 
            if (type === "39") return "음식점"; 
            return "문화행사";
          };
          setEvent({
            id: `place_${tourItem.contentid}`,
            title: tourItem.title || "장소명 없음",
            category: mapCategory(tourItem.contenttypeid),
            district: tourItem.addr1 ? tourItem.addr1.split(" ")[1] : "서울전역",
            districtGroup: tourItem.addr1 ? tourItem.addr1.split(" ")[1] : "서울전역",
            isFree: true,
            startDate: "2000-01-01",
            endDate: "2099-12-31",
            openHours: "상시 운영",
            period: "상시 운영",
            priceInfo: "문의",
            description: tourItem.addr1 || "",
            imageUrl: tourItem.firstimage || tourItem.firstimage2 || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
            locationName: tourItem.title || "서울",
            mapUrl: `https://map.kakao.com/link/map/${tourItem.title},${tourItem.mapy},${tourItem.mapx}`,
            location_type: tourItem.contenttypeid === "14" || tourItem.contenttypeid === "38" ? "INDOOR" : "OUTDOOR",
            isPermanent: true,
          });
          setIsLoading(false);
          return;
        }

        // 그래도 없으면 404
        setIsNotFound(true);
      } catch (error) {
        console.error("Failed to fetch event detail:", error);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEventDetail();
  }, [params.id, allEvents]);

  // 최근 본 행사로 추가
  useEffect(() => {
    if (event) {
      addRecentlyViewed(event.id);
    }
  }, [event, addRecentlyViewed]);

  const urgency = event ? getUrgencyLabel(event) : null;

  // 주변 행사 추천 (동일 district이면서 자기 자신 제외)
  const nearbyEvents = useMemo(() => {
    if (!event) return [];
    return allEvents
      .filter((e) => e.district === event.district && e.id !== event.id)
      .slice(0, 3);
  }, [allEvents, event]);

  // 사용자 요청: 종료된 행사 판단 가드 및 예외 처리
  const isEnded = useMemo(() => {
    if (!event) return false;
    
    // 상시 공간/연중무휴는 절대 종료로 판단하지 않음 (예외 처리)
    if (event.isPermanent || event.period === "상시 운영" || event.openHours === "상시 운영" || event.category === "상시공간") {
      return false;
    }

    // 날짜가 없으면 기본적으로 활성화 상태로 렌더링
    if (!event.endDate || event.endDate === "2099-12-31") return false;

    // '8.19' 처럼 연도가 생략된 문자열은 2001년 등으로 잘못 파싱됨. 연도(4자리)가 없으면 판단 보류(진행중 처리)
    if (!/\d{4}/.test(event.endDate)) return false;

    const end = new Date(event.endDate);
    if (isNaN(end.getTime())) return false; // Date 파싱 실패 시 종료 처리 안 함

    // 과거 연도로 잘못 파싱된 경우 (예: 2001년) 방어 로직
    if (end.getFullYear() < 2023) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return end < today;
  }, [event]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
      </div>
    );
  }

  // 필수 속성(title)이라도 있으면 404로 튕기지 않고 최대한 렌더링 허용 (조건 완화)
  if (isNotFound || (!event?.title && !event)) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl pb-28">
      {/* 종료 안내 배너 (필요 시 UI 추가, 현재는 notFound로 안 튕기게만 처리) */}
      {isEnded && (
        <div className="bg-rose-50 p-3 text-center text-sm font-bold text-rose-600">
          이 행사는 이미 종료되었습니다.
        </div>
      )}

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
        event={event}
      />
    </main>
  );
}
