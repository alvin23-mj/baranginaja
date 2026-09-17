"use client";

import { useEffect } from "react";

export function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white shadow-lg dark:bg-zinc-50 dark:text-zinc-950">
      {message}
    </div>
  );
}
