"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "홈", href: "/", icon: Home },
    { label: "탐색/목록", href: "/events", icon: Compass },
    { label: "마이페이지", href: "/my", icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 lg:max-w-5xl">
        <Link href="/" className="flex items-center gap-1.5 text-lg font-extrabold text-brand">
          <span>오늘뭐보지</span>
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold text-brand">서울</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-brand/10 text-brand font-bold"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
