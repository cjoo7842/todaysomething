"use client";

import { useState, useEffect } from "react";
import type { CultureEvent } from "@/types/event";
import { getMockEvents } from "@/lib/mock-events";

let globalEventsCache: CultureEvent[] | null = null;
let globalFetchPromise: Promise<CultureEvent[]> | null = null;

export function useEvents(): CultureEvent[] {
  const [events, setEvents] = useState<CultureEvent[]>(globalEventsCache || []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (globalEventsCache) {
      setEvents(globalEventsCache);
      return;
    }
    if (!globalFetchPromise) {
      globalFetchPromise = Promise.all([
        fetch('/api/events')
          .then(res => res.ok ? res.json() : getMockEvents())
          .catch(() => getMockEvents()),
        fetch('/seoul-places.json')
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      ]).then(([apiEvents, placesData]) => {
        const places: CultureEvent[] = placesData.map((p: any, i: number) => ({
          id: p.id || `place-${i}`,
          title: p.title || p.name || "장소명 없음",
          category: p.category || "복합문화공간",
          district: p.district || "서울전역",
          districtGroup: p.districtGroup || p.district || "서울전역",
          isFree: p.isFree ?? true,
          startDate: p.startDate || "2000-01-01",
          endDate: p.endDate || "2099-12-31",
          openHours: p.openHours || "",
          priceInfo: p.priceInfo || (p.isFree ? "무료" : "유료"),
          description: p.description || "",
          imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
          locationName: p.locationName || p.name || p.title || "서울",
          mapUrl: p.mapUrl || "#",
          location_type: p.location_type || "BOTH",
          isPermanent: p.type === "place" ? true : (p.isPermanent ?? true),
        }));
        return [...apiEvents, ...places];
      });
    }
    globalFetchPromise.then(data => {
      globalEventsCache = data;
      setEvents(data);
    });
  }, []);

  if (!isClient && !globalEventsCache) return getMockEvents();
  if (isClient && events.length === 0) return getMockEvents();

  return events;
}
