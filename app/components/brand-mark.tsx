/**
 * BrandMark — the "AS" monogram squircle, matching the favicon / OG image so the
 * brand reads consistently across tab icon, social preview, and header. Glossy
 * app-icon treatment: radial highlight + top sheen + inner stroke, white "AS".
 * Inline SVG: crisp at any size, theme-independent, weightless (no request).
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="brandmark-grad" x1="0" y1="0" x2="1" y2="1">
          {/* CSS vars → the mark re-tints with the in-app light/dark toggle */}
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="0.52" stopColor="var(--accent-2)" />
          <stop offset="1" stopColor="var(--accent-3)" />
        </linearGradient>
        <radialGradient id="brandmark-hl" cx="0.3" cy="0.24" r="0.9">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="brandmark-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="0.46" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="brandmark-sh" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0.2" stdDeviation="0.5" floodColor="#06201b" floodOpacity="0.5" />
        </filter>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#brandmark-grad)" />
      <rect width="32" height="32" rx="8" fill="url(#brandmark-hl)" />
      <rect width="32" height="32" rx="8" fill="url(#brandmark-sheen)" />
      <rect
        x="0.6"
        y="0.6"
        width="30.8"
        height="30.8"
        rx="7.4"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="0.8"
      />
      <text
        x="16"
        y="16.6"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-display), system-ui, sans-serif"
        fontSize="15.5"
        fontWeight="700"
        letterSpacing="-1"
        fill="#ffffff"
        filter="url(#brandmark-sh)"
      >
        AS
      </text>
    </svg>
  );
}
