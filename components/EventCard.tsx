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
      className="group block rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-t-2xl bg-neutral-100">
        <Image
          src={event.imageUrl}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />

        {/* 무료/유료 배지 */}
        <span
          className={cn(
            "absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow",
            event.isFree ? "bg-green-500" : "bg-neutral-800/80"
          )}
        >
          {event.isFree ? "무료" : "유료"}
        </span>

        {/* 마감임박 / NEW 배지 */}
        {urgency && (
          <span
            className={cn(
              "absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold text-white shadow",
              urgency.tone === "urgent" ? "bg-rose-accent" : "bg-teal-accent"
            )}
          >
            {urgency.label}
          </span>
        )}

      </div>

      <div className="flex flex-col p-4 gap-1.5">
        <h3 className="line-clamp-1 text-lg font-bold text-neutral-900 leading-tight group-hover:text-brand transition-colors mb-0.5">
          {event.title}
        </h3>
        
        <div className="flex items-center gap-2.5 text-xs font-medium text-neutral-500">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.locationName}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{event.isPermanent ? "상시 운영" : formatRange(event.startDate, event.endDate)}</span>
          </div>
        </div>

        <div className="mt-1 pt-2 border-t border-neutral-100 flex items-center justify-between">
          {recommendationReason ? (
            <p className="text-[11px] font-bold text-brand leading-none">
              {recommendationReason}
            </p>
          ) : (
            <p className="text-[11px] font-bold text-neutral-400 group-hover:text-brand transition-colors">
              자세히 보기
            </p>
          )}
          <span className="text-neutral-300 text-xs group-hover:text-brand transition-colors aria-hidden={true}">&rarr;</span>
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
