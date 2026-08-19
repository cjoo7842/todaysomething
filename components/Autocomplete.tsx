"use client";

import { useEffect, useState, useRef } from "react";
import { Search } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { getAreaNameByDistrict } from "@/lib/areas";
import { getDisplayCategory } from "@/lib/categories";

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSearchSubmit?: (keyword: string) => void;
}

export function Autocomplete({ value, onChange, onSearchSubmit }: AutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Array<{ type: string; text: string }>>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const events = useEvents();

  useEffect(() => {
    // 바깥 클릭 시 닫기
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const matches: Array<{ type: string; text: string }> = [];
    const seen = new Set<string>();

    events.forEach((event) => {
      // 1. 제목 매칭
      if (event.title.toLowerCase().includes(trimmed.toLowerCase())) {
        const key = `title:${event.title}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({ type: "행사", text: event.title });
        }
      }
      // 2. 장소 매칭
      if (event.locationName.toLowerCase().includes(trimmed.toLowerCase())) {
        const key = `place:${event.locationName}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({ type: "장소", text: event.locationName });
        }
      }
      // 3. 자치구/지역명 매칭
      const areaName = getAreaNameByDistrict(event.district);
      if (
        event.district.toLowerCase().includes(trimmed.toLowerCase()) ||
        areaName.toLowerCase().includes(trimmed.toLowerCase())
      ) {
        const key = `area:${areaName}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({ type: "지역", text: areaName });
        }
      }
      // 4. API 카테고리 및 대분류 매핑 제안
      const displayCat = getDisplayCategory(event.category);
      // API 원본 카테고리로도 검색 가능
      if (event.category.toLowerCase().includes(trimmed.toLowerCase())) {
        const key = `apicat:${event.category}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({ type: "카테고리", text: event.category });
        }
      }
      // 대분류명으로도 검색 가능
      if (displayCat.toLowerCase().includes(trimmed.toLowerCase())) {
        const key = `displaycat:${displayCat}`;
        if (!seen.has(key)) {
          seen.add(key);
          matches.push({ type: "카테고리", text: displayCat });
        }
      }
    });

    setSuggestions(matches.slice(0, 5));
    setIsOpen(matches.length > 0);
  }, [value, events]);

  const handleSelect = (text: string) => {
    onChange(text);
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(text);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsOpen(false);
      if (onSearchSubmit) {
        onSearchSubmit(value);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="행사명, 장소, 지역, 카테고리로 검색해보세요"
          aria-label="행사 검색"
          className="w-full rounded-full border border-neutral-200 bg-white py-2 sm:py-2.5 pl-8 sm:pl-9 pr-4 text-[12px] sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-white text-ellipsis overflow-hidden whitespace-nowrap"
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-neutral-100 bg-white p-2 shadow-lg">
          {suggestions.map((suggestion, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => handleSelect(suggestion.text)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <span className="inline-block rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500">
                  {suggestion.type}
                </span>
                <span className="font-medium text-neutral-800 truncate">{suggestion.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
