"use client";

import { useState, useEffect } from "react";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("favorites_events");
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  }, []);

  const toggleFavorite = (eventId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId];
      try {
        localStorage.setItem("favorites_events", JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save favorites", e);
      }
      return next;
    });
  };

  const isFavorite = (eventId: string) => favorites.includes(eventId);

  return { favorites, toggleFavorite, isFavorite };
}
