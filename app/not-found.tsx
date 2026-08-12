import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-lg font-semibold text-neutral-800">
        찾으시는 행사를 찾을 수 없어요
      </p>
      <p className="text-sm text-neutral-500">
        종료되었거나 존재하지 않는 행사예요.
      </p>
      <Link
        href="/"
        className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white"
      >
        오늘의 행사 보러가기
      </Link>
    </main>
  );
}
