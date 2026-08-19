import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import type { CultureEvent } from "@/types/event";
import { getUrgencyLabel } from "@/lib/date";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: CultureEvent;
  recommendationReason?: string;
}

export function EventCard({ event, recommendationReason }: EventCardProps) {
  const urgency = getUrgencyLabel(event);

  return (
    <Link
      href={`/event/${event.id}`}
      className="group block rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl bg-neutral-100">
        <Image
          src={event.imageUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* 무료/유료 배지 - 글래스모피즘 */}
        <span
          className={cn(
            "absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-md border border-white/20",
            event.isFree ? "bg-green-500/80" : "bg-black/40"
          )}
        >
          {event.isFree ? "무료" : "유료"}
        </span>

        {/* 마감임박 / NEW 배지 - 글래스모피즘 */}
        {urgency && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm backdrop-blur-md border border-white/20",
              urgency.tone === "urgent" ? "bg-rose-500/80" : "bg-teal-500/80"
            )}
          >
            {urgency.label}
          </span>
        )}

      </div>

      <div className="flex flex-col p-3 gap-1.5">
        <h3 className="line-clamp-2 text-[15px] font-bold text-neutral-800 leading-snug group-hover:text-brand transition-colors mb-0.5">
          {event.title}
        </h3>
        
        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{event.locationName}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{event.isPermanent ? "상시 운영" : formatRange(event.startDate, event.endDate)}</span>
          </div>
        </div>

        <div className="mt-1 pt-2 border-t border-slate-100 flex items-center justify-between">
          {recommendationReason ? (
            <p className="text-[11px] font-bold text-brand leading-none">
              {recommendationReason}
            </p>
          ) : (
            <p className="text-[11px] font-bold text-slate-400 group-hover:text-brand transition-colors">
              자세히 보기
            </p>
          )}
          <span className="text-slate-300 text-xs group-hover:text-brand transition-colors aria-hidden={true}">&rarr;</span>
        </div>
      </div>
    </Link>
  );
}

function formatRange(start: string, end: string) {
  const [, sm, sd] = start.split("-");
  const [, em, ed] = end.split("-");
  return `${Number(sm)}.${Number(sd)} ~ ${Number(em)}.${Number(ed)}`;
}
