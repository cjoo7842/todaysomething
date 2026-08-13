"use client";

import { useMemo } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Info, Globe, Building } from "lucide-react";
import { getMockEvents } from "@/lib/mock-events";
import { EventCard } from "@/components/EventCard";

interface PlaceDetailPageProps {
  params: { name: string };
}

export default function PlaceDetailPage({ params }: PlaceDetailPageProps) {
  const placeName = decodeURIComponent(params.name);
  const allEvents = useMemo(() => getMockEvents(), []);

  // 이 장소명과 일치하는 행사 목록 추출
  const placeEvents = useMemo(() => {
    return allEvents.filter((e) => e.locationName === placeName);
  }, [allEvents, placeName]);

  // 해당 장소를 쓰고 있는 첫 번째 행사 정보를 바탕으로 장소 메타데이터(주소, 좌표 등) 조회
  const placeMeta = useMemo(() => {
    return placeEvents[0] || null;
  }, [placeEvents]);

  if (placeEvents.length === 0) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-6 lg:max-w-5xl">
      <header className="flex items-center gap-2 border-b pb-4 mb-5">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold text-neutral-900">공간 상세 정보</h1>
      </header>

      {/* 공간 정보 카드 */}
      <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-brand">
          <Building className="h-6 w-6" />
          <h2 className="text-xl font-bold text-neutral-900">{placeName}</h2>
        </div>

        <div className="space-y-2.5 text-sm text-neutral-600">
          {placeMeta?.address && (
            <div className="flex gap-2">
              <span className="font-semibold text-neutral-700 w-16 shrink-0">도로명주소:</span>
              <span>{placeMeta.address}</span>
            </div>
          )}
          {placeMeta?.district && (
            <div className="flex gap-2">
              <span className="font-semibold text-neutral-700 w-16 shrink-0">행정구역:</span>
              <span>서울특별시 {placeMeta.district} ({placeMeta.districtGroup})</span>
            </div>
          )}
          {placeMeta?.openHours && (
            <div className="flex gap-2">
              <span className="font-semibold text-neutral-700 w-16 shrink-0">운영시간:</span>
              <span>{placeMeta.openHours}</span>
            </div>
          )}
          {placeMeta?.website && (
            <div className="flex gap-2">
              <span className="font-semibold text-neutral-700 w-16 shrink-0">홈페이지:</span>
              <a
                href={placeMeta.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand hover:underline truncate"
              >
                {placeMeta.website}
              </a>
            </div>
          )}
        </div>

        {/* 지도 외부링크가 있는 경우 길찾기 CTA */}
        {placeMeta?.mapUrl && (
          <a
            href={placeMeta.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-neutral-100 text-sm font-bold text-neutral-700 hover:bg-neutral-200 transition-colors"
          >
            <MapPin className="h-4 w-4" />
            네이버/카카오 지도 길찾기
          </a>
        )}
      </section>

      {/* 해당 장소에서 진행 중인 행사 목록 */}
      <section className="mt-8 space-y-4">
        <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
          🏛️ 이 공간에서 진행 중인 행사 ({placeEvents.length}개)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {placeEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </main>
  );
}
