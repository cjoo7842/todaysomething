"use client";

import { useState, useEffect, useCallback } from "react";

const RECENTLY_VIEWED_KEY = "todaysomething_recently_viewed";
const MAX_RECENT_ITEMS = 10;

export function useRecentlyViewed() {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setRecentlyViewedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load recently viewed events from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const addRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const next = [id, ...filtered].slice(0, MAX_RECENT_ITEMS);
      try {
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save recently viewed events", e);
      }
      return next;
    });
  }, []);

  return { recentlyViewedIds, addRecentlyViewed, isLoaded };
}
