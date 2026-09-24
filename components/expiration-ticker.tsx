"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ExpirationTicker() {
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkExpiration = async () => {
      try {
        const res = await fetch("/api/orders/check-expiration");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.expiredCount > 0) {
            router.refresh();
          }
        }
      } catch (e) {
        console.error("Failed to execute background expiration check:", e);
      }
    };

    // Run on initial load
    checkExpiration();

    // Run interval every 60,000 ms (1 minute)
    const interval = setInterval(checkExpiration, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
