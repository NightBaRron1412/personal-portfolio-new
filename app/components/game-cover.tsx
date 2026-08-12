"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type GameCoverProps = {
  cover: string | null;
  title: string;
  wide?: boolean;
};

/**
 * A lazy game cover with an intentional arrival state. On slower mobile
 * connections the card can reveal before its artwork has decoded, so the
 * image fades and settles in instead of abruptly popping into the card.
 */
export function GameCover({ cover, title, wide }: GameCoverProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  useEffect(() => {
    const image = imageRef.current;
    if (!image?.complete) return;
    setStatus(image.naturalWidth > 0 ? "loaded" : "error");
  }, []);

  if (!cover || status === "error") {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center p-3 text-center"
        style={{ background: "var(--gradient)" }}
      >
        <span className="font-display text-base font-semibold text-text-on-accent">{title}</span>
      </div>
    );
  }

  const loaded = status === "loaded";

  return (
    <>
      <span
        aria-hidden
        className={cn(
          "game-cover-placeholder pointer-events-none absolute inset-0 transition-opacity duration-700",
          loaded && "opacity-0"
        )}
      />

      {wide ? (
        // Landscape art gets a soft fill behind the full, uncropped image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          aria-hidden
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-700",
            loaded ? "opacity-55" : "opacity-0"
          )}
        />
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imageRef}
        src={cover}
        alt={`${title} cover`}
        loading="lazy"
        fetchPriority="low"
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        data-game-cover
        data-loaded={loaded ? "true" : "false"}
        className={cn(
          "game-cover-image absolute inset-0",
          wide ? "m-auto h-auto w-full object-contain" : "h-full w-full object-cover",
          loaded
            ? wide
              ? "scale-100 opacity-100 group-hover:scale-[1.04]"
              : "scale-100 opacity-100 group-hover:scale-105"
            : "scale-[1.025] opacity-0"
        )}
      />
    </>
  );
}
