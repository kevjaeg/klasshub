"use client";

import { useEffect } from "react";

export function ForceLightMode() {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark");
    html.classList.add("light");
    html.style.colorScheme = "light";

    return () => {
      // On unmount, let next-themes re-apply the stored preference
      html.style.colorScheme = "";
    };
  }, []);

  return null;
}
