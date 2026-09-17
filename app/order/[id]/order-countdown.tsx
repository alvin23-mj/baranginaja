"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCountdown } from "@/lib/orders";

export function OrderCountdown({ holdExpiresAt }: { holdExpiresAt: string }) {
  const router = useRouter();
  const expiresAtMs = new Date(holdExpiresAt).getTime();
  const [remainingMs, setRemainingMs] = useState(() => expiresAtMs - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const next = expiresAtMs - Date.now();
      setRemainingMs(next);
      if (next <= 0) {
        clearInterval(interval);
        router.refresh();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAtMs, router]);

  return (
    <p className="text-sm text-zinc-600 dark:text-zinc-400">
      Sisa waktu pembayaran:{" "}
      <span className="font-semibold text-zinc-950 dark:text-zinc-50">
        {formatCountdown(remainingMs)}
      </span>
    </p>
  );
}
