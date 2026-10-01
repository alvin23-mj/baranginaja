"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time || "Loading..."}</span>;
}

interface UserPageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: { href: string; label: string };
  children?: React.ReactNode;
}

export function UserPageHeader({
  title,
  subtitle,
  backLink,
  children,
}: UserPageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 md:px-8 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3 min-w-0">
        {backLink && (
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 shrink-0"
          >
            ← {backLink.label}
          </Link>
        )}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-normal text-zinc-900 dark:text-zinc-100 truncate">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {children}

        {/* Live Clock (Plain text, bukan badge) */}
        <div className="hidden sm:flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          <Calendar className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
          <LiveClock />
        </div>

        <div className="hidden sm:block h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* Theme Toggle (Plain button, bukan badge) */}
        <ThemeToggle
          buttonClassName="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        />
      </div>
    </header>
  );
}
