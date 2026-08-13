type GameCoverProps = {
  cover: string | null;
  title: string;
  wide?: boolean;
};

/**
 * The covers are small local assets and intentionally load before the games
 * section enters view. The card owns the viewport entrance; the artwork does
 * not run a second load-state animation inside it.
 */
export function GameCover({ cover, title, wide }: GameCoverProps) {
  if (!cover) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center p-3 text-center"
        style={{ background: "var(--gradient)" }}
      >
        <span className="font-display text-base font-semibold text-text-on-accent">{title}</span>
      </div>
    );
  }

  return (
    <>
      {wide ? (
        // Landscape art gets a soft fill behind the full, uncropped image.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover}
          alt=""
          aria-hidden
          loading="eager"
          fetchPriority="low"
          decoding="async"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-55 blur-xl"
        />
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover}
        alt={`${title} cover`}
        loading="eager"
        fetchPriority="low"
        decoding="async"
        data-game-cover
        className={
          wide
            ? "absolute inset-0 m-auto h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]"
            : "absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        }
      />
    </>
  );
}
