export function TodayBadge({ count }: { count: number }) {
  return (
    <h1 className="flex items-baseline gap-1 md:gap-2 text-2xl font-black tracking-tight text-neutral-900 lg:text-3xl">
      <span>오늘 서울 문화행사</span>
      <span className="text-brand text-4xl lg:text-5xl font-black">
        {count}
        <span className="text-2xl lg:text-3xl ml-0.5">건</span>
      </span>
    </h1>
  );
}
