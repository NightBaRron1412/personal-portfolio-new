import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small uppercase mono label with a leading accent "LED" — the instrument
 * motif that replaces the old `//` comment prefix.
 */
export function PanelLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("eyebrow inline-flex items-center gap-2", className)}>
      <span aria-hidden className="inline-block h-1.5 w-1.5 shrink-0 rounded-[1px] bg-accent" />
      {children}
    </span>
  );
}
