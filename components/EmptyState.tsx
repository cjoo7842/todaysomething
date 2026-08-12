import { SearchX } from "lucide-react";

interface EmptyStateProps {
  onReset: () => void;
}

export function EmptyState({ onReset }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-neutral-300 bg-white/60 px-6 py-16 text-center">
      <SearchX className="h-8 w-8 text-neutral-400" aria-hidden="true" />
      <p className="text-sm text-neutral-500">
        조건에 맞는 행사가 없어요. 필터를 조정해보세요!
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-1 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        필터 초기화
      </button>
    </div>
  );
}
