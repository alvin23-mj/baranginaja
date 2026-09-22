"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
          second: "2-digit",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span>{time || "Loading..."}</span>;
}

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  backLink?: { href: string; label: string };
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  backLink,
  badge,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-200 dark:border-zinc-800 pb-5">
      <div>
        {backLink && (
          <Link
            href={backLink.href}
            className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← {backLink.label}
          </Link>
        )}
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right Controls: Custom Children + Live Clock + Compact Theme Toggle */}
      <div className="flex flex-wrap items-center gap-2.5">
        {children}

        {/* Realtime Live Clock */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <LiveClock />
        </div>

        {/* Theme Dropdown Select right beside Live Clock */}
        <ThemeToggle />
      </div>
    </div>
  );
}
