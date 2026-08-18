"use client";

import { useState, useEffect } from "react";
import type { CultureEvent } from "@/types/event";
import { generateGoogleCalendarUrl } from "@/lib/calendar";
import { X, Calendar as CalendarIcon, Clock } from "lucide-react";
import { getTodaySeoul } from "@/lib/date";

interface CalendarModalProps {
  event: CultureEvent;
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarModal({ event, isOpen, onClose }: CalendarModalProps) {
  const [visitDate, setVisitDate] = useState(() => {
    const today = getTodaySeoul();
    if (event.isPermanent) return today;
    return (today >= event.startDate && today <= event.endDate) ? today : event.startDate;
  });
  const [visitTime, setVisitTime] = useState("14:00");
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  if (!isOpen) return null;

  const googleCalendarUrl = generateGoogleCalendarUrl({
    title: `[오늘뭐보지] ${event.title}`,
    description: `행사 안내:\n${event.description}\n\n장소: ${event.locationName}`,
    locationName: event.locationName,
    startDate: event.startDate,
    endDate: event.endDate,
    visitDate,
    visitTime,
    pageUrl: pageUrl || undefined,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-neutral-800 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-brand" />
            Google Calendar 일정 추가
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 py-4 text-sm">
          <div>
            <p className="font-semibold text-neutral-700">{event.title}</p>
            <p className="text-xs text-neutral-500">{event.locationName}</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              행사 기간: {event.isPermanent ? "상시 운영" : `${event.startDate} ~ ${event.endDate}`}
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="visit-date" className="block text-xs font-semibold text-neutral-700">
              방문 예정 날짜
            </label>
            <input
              id="visit-date"
              type="date"
              min={event.isPermanent ? undefined : event.startDate}
              max={event.isPermanent ? undefined : event.endDate}
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="visit-time" className="block text-xs font-semibold text-neutral-700 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              방문 시작 시간
            </label>
            <input
              id="visit-time"
              type="time"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 rounded-xl border border-neutral-200 py-2.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50"
          >
            취소
          </button>
          <a
            href={googleCalendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex w-2/3 items-center justify-center gap-1.5 rounded-xl bg-brand py-2.5 text-xs font-bold text-white shadow transition-all hover:brightness-95"
          >
            캘린더로 연결하기
          </a>
        </div>
      </div>
    </div>
  );
}
