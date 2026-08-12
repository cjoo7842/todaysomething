import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getMockEvents } from "@/lib/mock-events";
import { getUrgencyLabel } from "@/lib/date";
import { cn } from "@/lib/utils";

interface EventDetailPageProps {
  params: { id: string };
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const event = getMockEvents().find((e) => e.id === params.id);

  if (!event) {
    notFound();
  }

  const urgency = getUrgencyLabel(event);

  return (
    <main className="mx-auto max-w-2xl pb-28">
      <div className="relative aspect-[4/3] w-full bg-neutral-100">
        <Image src={event.imageUrl} alt="" fill priority className="object-cover" />

        <Link
          href="/"
          aria-label="뒤로가기"
          className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-700 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        {urgency && (
          <span
            className={cn(
              "absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow",
              urgency.tone === "urgent" ? "bg-rose-accent" : "bg-teal-accent"
            )}
          >
            {urgency.label}
          </span>
        )}
      </div>

      <div className="space-y-5 px-4 py-5">
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
          </div>
          <h1 className="text-xl font-bold text-neutral-900 lg:text-2xl">{event.title}</h1>
        </div>

        <section className="space-y-1 rounded-card border border-neutral-100 bg-white p-4 text-sm">
          <p className="font-semibold text-neutral-800">운영 시간</p>
          <p className="text-neutral-600">{event.openHours}</p>
        </section>

        <section className="space-y-1 rounded-card border border-neutral-100 bg-white p-4 text-sm">
          <p className="font-semibold text-neutral-800">요금 안내</p>
          <p className="text-neutral-600">{event.priceInfo}</p>
        </section>

        <section className="space-y-1 rounded-card border border-neutral-100 bg-white p-4 text-sm">
          <p className="font-semibold text-neutral-800">상세 설명</p>
          <p className="leading-relaxed text-neutral-600">{event.description}</p>
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
    </main>
  );
}
