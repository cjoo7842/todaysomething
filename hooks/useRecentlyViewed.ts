"use client";

import { useState, useEffect } from "react";

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recently_viewed_events");
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recently viewed", e);
    }
  }, []);

  const addRecentlyViewed = (eventId: string) => {
    setRecentlyViewed((prev) => {
      // 중복 제거 후 가장 앞으로 이동
      const filtered = prev.filter((id) => id !== eventId);
      const next = [eventId, ...filtered].slice(0, 10); // 최대 10개
      try {
        localStorage.setItem("recently_viewed_events", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save recently viewed", e);
      }
      return next;
    });
  };

  return { recentlyViewed, addRecentlyViewed };
}
