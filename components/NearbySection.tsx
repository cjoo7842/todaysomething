"use client";

import type { CultureEvent } from "@/types/event";
import { EventCard } from "./EventCard";
import { MapPin } from "lucide-react";

interface NearbySectionProps {
  currentEvent: CultureEvent;
  allEvents: CultureEvent[];
}

export function NearbySection({ currentEvent, allEvents }: NearbySectionProps) {
  // 동일 권역/행정구 행사 추출 (현재 행사 제외)
  const nearbyEvents = allEvents.filter(
    (e) => e.id !== currentEvent.id && (e.district === currentEvent.district || e.districtGroup === currentEvent.districtGroup)
  );

  if (nearbyEvents.length === 0) return null;

  return (
    <section className="space-y-3 pt-6 border-t border-neutral-200">
      <div className="flex items-center gap-1.5 text-base font-bold text-neutral-900">
        <MapPin className="h-5 w-5 text-brand" />
        <span>인근 ({currentEvent.districtGroup}) 추천 행사</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {nearbyEvents.slice(0, 4).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
