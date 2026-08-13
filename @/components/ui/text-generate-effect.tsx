import { cn } from "@/lib/utils";

/**
 * Server-rendered value proposition. Keeping the hero text immediately
 * paintable avoids making the LCP wait for JavaScript and a blur animation.
 */
export function TextGenerateEffect({
  segments,
  className,
}: {
  segments: { text: string; accent?: boolean }[];
  className?: string;
}) {
  const words = segments.flatMap((segment) =>
    segment.text
      .split(" ")
      .filter(Boolean)
      .map((word) => ({ word, accent: segment.accent }))
  );

  return (
    <div className={cn(className)}>
      {words.map(({ word, accent }, index) => (
        <span
          key={`${word}-${index}`}
          className={cn("inline-block", accent && "text-accent")}
        >
          {word}
          {index < words.length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </div>
  );
}
