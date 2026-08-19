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
        fetch('/api/places')
          .then(res => res.ok ? res.json() : [])
          .catch(() => [])
      ]).then(([apiEvents, placesData]) => {
        const mapCategory = (type: string) => {
          if (type === "12") return "놀거리"; 
          if (type === "14") return "전시"; 
          if (type === "28") return "레포츠"; 
          if (type === "38") return "쇼핑"; 
          if (type === "39") return "음식점"; 
          return "문화행사";
        };

        const places: CultureEvent[] = placesData.map((p: any) => ({
          id: p.contentid,
          title: p.title || "장소명 없음",
          category: mapCategory(p.contenttypeid),
          district: p.addr1 ? p.addr1.split(" ")[1] : "서울전역",
          districtGroup: p.addr1 ? p.addr1.split(" ")[1] : "서울전역",
          isFree: true,
          startDate: "2000-01-01",
          endDate: "2099-12-31",
          openHours: "상시 운영",
          priceInfo: "문의",
          description: p.addr1 || "",
          imageUrl: p.firstimage || p.firstimage2 || "",
          locationName: p.title || "서울",
          mapUrl: `https://map.kakao.com/link/map/${p.title},${p.mapy},${p.mapx}`,
          location_type: p.contenttypeid === "14" || p.contenttypeid === "38" ? "INDOOR" : "OUTDOOR",
          isPermanent: true,
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
