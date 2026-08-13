"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { generateGoogleCalendarUrl } from "@/lib/calendar";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  eventDescription: string;
  locationName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export function CalendarModal({
  isOpen,
  onClose,
  eventTitle,
  eventDescription,
  locationName,
  startDate,
  endDate,
}: CalendarModalProps) {
  const [visitDate, setVisitDate] = useState(startDate);
  const [visitTime, setVisitTime] = useState("12:00");

  if (!isOpen) return null;

  const handleAddToCalendar = () => {
    // 사용자가 선택한 날짜에 일정을 만듦
    // Google Calendar URL 생성 시 시간 정보가 있는 포맷 적용: YYYYMMDDTHHMMSSZ
    const timeFormatted = visitTime.replace(":", "");
    // 로컬 시간(KST)으로 시작시간 설정
    const startIso = visitDate.replace(/-/g, "") + "T" + timeFormatted + "00";
    
    // 종료 시간은 일단 2시간 뒤로 잡기
    const [hours, minutes] = visitTime.split(":").map(Number);
    let endHours = hours + 2;
    let endMinutes = minutes;
    if (endHours >= 24) {
      endHours = 23;
      endMinutes = 59;
    }
    const endHoursStr = String(endHours).padStart(2, "0");
    const endMinutesStr = String(endMinutes).padStart(2, "0");
    const endIso = visitDate.replace(/-/g, "") + "T" + endHoursStr + endMinutesStr + "00";

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: eventTitle,
      details: eventDescription,
      location: locationName,
      dates: `${startIso}/${endIso}`,
    });

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(googleCalendarUrl, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-lg font-bold text-neutral-900">방문 날짜 및 시간 선택</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              방문일 선택 (행사 기간: {startDate} ~ {endDate})
            </label>
            <input
              type="date"
              min={startDate}
              max={endDate}
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-1">
              방문 시간
            </label>
            <input
              type="time"
              value={visitTime}
              onChange={(e) => setVisitTime(e.target.value)}
              className="w-full rounded-xl border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-neutral-200 py-3 text-sm font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleAddToCalendar}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand py-3 text-sm font-bold text-white hover:brightness-95 transition-all shadow-sm"
          >
            <span>구글 캘린더에 추가</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
