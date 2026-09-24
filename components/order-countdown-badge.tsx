"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCountdown } from "@/lib/orders";

interface OrderCountdownBadgeProps {
  holdExpiresAt: string | null;
  onExpire?: () => void;
  compact?: boolean;
}

export function OrderCountdownBadge({
  holdExpiresAt,
  onExpire,
  compact = false,
}: OrderCountdownBadgeProps) {
  const router = useRouter();
  const expiresAtMs = holdExpiresAt ? new Date(holdExpiresAt).getTime() : 0;
  const [remainingMs, setRemainingMs] = useState<number>(() =>
    expiresAtMs ? expiresAtMs - Date.now() : 0
  );

  useEffect(() => {
    if (!expiresAtMs) return;

    const updateTimer = () => {
      const next = expiresAtMs - Date.now();
      setRemainingMs(next);
      if (next <= 0) {
        if (onExpire) {
          onExpire();
        } else {
          router.refresh();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAtMs, router, onExpire]);

  if (!holdExpiresAt) return null;

  const isExpired = remainingMs <= 0;
  const isUrgent = remainingMs > 0 && remainingMs <= 3 * 60 * 1000; // < 3 minutes

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
        Waktu Habis
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-mono font-semibold transition-colors ${
        isUrgent
          ? "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300 animate-pulse"
          : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
      }`}
    >
      <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{compact ? formatCountdown(remainingMs) : `Hold ${formatCountdown(remainingMs)}`}</span>
    </span>
  );
}
