"use client";

import { useEffect, useState } from "react";

/** Re-evaluate on resize/input changes; mobile never downloads desktop renderers. */
export function useDetailedEffects() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px) and (pointer: fine)");
    const update = () => setEnabled(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return enabled;
}
