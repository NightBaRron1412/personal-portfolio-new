"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/**
 * Renders a logo image, falling back to a monogram tile if the asset is
 * missing or fails to load. Many logo files referenced in profile data are
 * not on disk, so this keeps the layout clean regardless.
 */
export function Logo({
  src,
  name,
  className,
}: {
  src?: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-border-subtle bg-bg-elevated text-text-secondary",
          className
        )}
        aria-hidden
      >
        <span className="mono text-[11px] font-semibold tracking-tight">{initials(name)}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        // Softer than a stark white chip: a translucent tile so it settles into
        // the dark glass instead of popping; logo eases to full on hover.
        "flex items-center justify-center overflow-hidden rounded-lg border border-border-subtle bg-white/70 p-1.5",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${name} logo`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
