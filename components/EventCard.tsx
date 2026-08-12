import Image from "next/image";
import Link from "next/link";
import type { CultureEvent } from "@/types/event";
import { getUrgencyLabel } from "@/lib/date";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: CultureEvent;
}

export function EventCard({ event }: EventCardProps) {
  const urgency = getUrgencyLabel(event);

  return (
    <Link
      href={`/event/${event.id}`}
      className="group block rounded-card border border-neutral-100 bg-white shadow-sm transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-card bg-neutral-100">
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

      <div className="space-y-1 p-3">
        <p className="line-clamp-1 text-base font-semibold text-neutral-900">{event.title}</p>
        <p className="line-clamp-1 text-xs text-neutral-500">
          {event.locationName} · {formatRange(event.startDate, event.endDate)}
        </p>
      </div>
    </Link>
  );
}

function formatRange(start: string, end: string) {
  const [, sm, sd] = start.split("-");
  const [, em, ed] = end.split("-");
  return `${Number(sm)}.${Number(sd)} ~ ${Number(em)}.${Number(ed)}`;
}
