"use client";

import { useEffect, useState } from "react";

/** Slim reading-progress bar pinned to the very top of the viewport. */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? Math.min(1, scrollTop / height) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[70] h-0.5 bg-transparent">
      <div
        className="h-full w-full origin-left"
        style={{
          transform: `scaleX(${progress})`,
          background: "var(--gradient)",
          boxShadow: "0 0 8px var(--accent-glow)",
        }}
      />
    </div>
  );
}
