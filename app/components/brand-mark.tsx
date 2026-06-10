/**
 * BrandMark — the "AS" monogram squircle, matching the favicon / OG image so the
 * brand reads consistently across tab icon, social preview, and header.
 * Inline SVG: crisp at any size, theme-independent (the gradient reads on light
 * and dark), and weightless (no image request).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Amir Shetaia">
      <defs>
        <linearGradient id="brandmark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2dd4bf" />
          <stop offset="0.52" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#f472b6" />
        </linearGradient>
        <linearGradient id="brandmark-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.24" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#brandmark-grad)" />
      <rect width="32" height="32" rx="8" fill="url(#brandmark-sheen)" />
      <text
        x="16"
        y="17"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display), system-ui, sans-serif"
        fontSize="16.5"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="#0b0f17"
      >
        AS
      </text>
    </svg>
  );
}
