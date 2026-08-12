import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "오늘뭐보지? | 서울 오늘의 전시·축제",
  description: "오늘 서울에서 바로 갈 수 있는 전시·축제·팝업스토어를 지역별로 빠르게 찾아보세요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f97316",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* 디자인 가이드 지정 폰트: Pretendard (CDN) */}
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="min-h-screen bg-surface font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
