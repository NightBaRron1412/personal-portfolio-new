import { WORLD_VIEWBOX, WORLD_PINS } from "@/data/world-map";

/**
 * Dotted world map for the Contact section — replaces the heavy WebGL globe.
 * The dots are a static SVG used as a CSS mask, so they take the theme color
 * with a single element (no thousands of nodes, no WebGL, no theme rebuild).
 * City markers are a tiny overlay SVG with a pinging accent ring.
 */
export function WorldMap({ className }: { className?: string }) {
  return (
    <div className={"relative aspect-[87/44] w-full " + (className ?? "")} aria-hidden>
      {/* dots (themeable via mask + background-color) */}
      <div
        className="absolute inset-0 opacity-[0.42]"
        style={{
          backgroundColor: "var(--text-faint)",
          WebkitMaskImage: "url(/world-dots.svg)",
          maskImage: "url(/world-dots.svg)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
      {/* city markers */}
      <svg
        viewBox={WORLD_VIEWBOX}
        className="absolute inset-0 h-full w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        {WORLD_PINS.map((p, i) => (
          <g key={p.label} transform={`translate(${p.x} ${p.y})`}>
            <circle
              className="map-ping"
              r={p.big ? 1.5 : 1.1}
              fill="var(--accent)"
              style={{ animationDelay: `${(i % 4) * 0.6}s` }}
            />
            <circle r={p.big ? 0.85 : 0.6} fill="var(--accent)" />
            {p.big ? (
              <circle r="1.5" fill="none" stroke="var(--accent-2)" strokeWidth="0.22" opacity="0.9" />
            ) : null}
          </g>
        ))}
      </svg>
    </div>
  );
}
