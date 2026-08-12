interface TodayBadgeProps {
  today: string; // "YYYY-MM-DD"
  count: number;
}

export function TodayBadge({ today, count }: TodayBadgeProps) {
  const [, month, day] = today.split("-");
  const monthNum = Number(month);
  const dayNum = Number(day);

  return (
    <div className="flex flex-col gap-2">
      <span className="inline-flex w-fit items-center rounded-full bg-gradient-to-r from-brand to-rose-accent px-3 py-1 text-xs font-bold text-white">
        TODAY {monthNum}.{dayNum}
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-neutral-900 lg:text-3xl">
        오늘 서울 문화행사{" "}
        <span className="text-brand">{count}건</span>
      </h1>
    </div>
  );
}
