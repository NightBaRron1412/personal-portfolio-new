import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require(
  process.cwd() + "/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp"
);

const W = 1200;
const H = 630;

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2dd4bf"/>
      <stop offset="0.52" stop-color="#a78bfa"/>
      <stop offset="1" stop-color="#f0abfc"/>
    </linearGradient>
    <radialGradient id="og-hl" cx="0.3" cy="0.24" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="og-sh" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="3" flood-color="#06201b" flood-opacity="0.45"/>
    </filter>
    <radialGradient id="glow" cx="82%" cy="16%" r="65%">
      <stop offset="0" stop-color="#2dd4bf" stop-opacity="0.26"/>
      <stop offset="0.45" stop-color="#a78bfa" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#0a0e14" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.20"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="2" fill="#ffffff" fill-opacity="0.045"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="#0a0e14"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- AS monogram tile -->
  <g transform="translate(80,76)">
    <rect width="104" height="104" rx="26" fill="url(#brand)"/>
    <rect width="104" height="104" rx="26" fill="url(#og-hl)"/>
    <rect width="104" height="104" rx="26" fill="url(#sheen)"/>
    <rect x="1.5" y="1.5" width="101" height="101" rx="24.5" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1.5"/>
    <text x="52" y="56" font-family="'DejaVu Sans',Arial,sans-serif" font-size="56" font-weight="bold" fill="#ffffff" filter="url(#og-sh)" text-anchor="middle" dominant-baseline="central" letter-spacing="-2">AS</text>
  </g>

  <!-- eyebrow + accent rule -->
  <text x="82" y="312" font-family="'DejaVu Sans Mono',monospace" font-size="25" letter-spacing="2" fill="#2dd4bf">SENIOR SOFTWARE ENGINEER · AMD ROCm</text>
  <rect x="82" y="330" width="132" height="4" rx="2" fill="url(#brand)"/>

  <!-- name -->
  <text x="78" y="430" font-family="'DejaVu Sans',Arial,sans-serif" font-weight="bold" font-size="100" fill="#f5f7fa">Amir Shetaia</text>

  <!-- tagline -->
  <text x="82" y="500" font-family="'DejaVu Sans',Arial,sans-serif" font-size="37" fill="#9aa4b2">GPU drivers · HPC optimization · ML systems</text>

  <!-- footer -->
  <text x="82" y="572" font-family="'DejaVu Sans Mono',monospace" font-size="25" fill="#6b7280">amirshetaia.com</text>
</svg>`;

// Flatten onto the solid bg to strip the alpha channel — WhatsApp's crawler
// refuses to render PNGs that carry alpha, even when fully opaque.
await sharp(Buffer.from(svg))
  .flatten({ background: "#0a0e14" })
  .png()
  .toFile("public/og-image.png");
console.log("og-image.png written (1200x630, opaque/no-alpha)");
