"use client";

import { useState } from "react";
import { Toast } from "./toast";

export function AccessDeniedToast() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <Toast message="Akses ditolak." onDismiss={() => setVisible(false)} />
  );
}
