import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

// sharp is a transitive dep under pnpm's store (not hoisted), so resolve it directly.
const require = createRequire(import.meta.url);
const sharp = require(
  process.cwd() + "/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp"
);

// Brand gradient (matches --gradient: teal -> violet -> pink). Glossy app-icon
// treatment: radial highlight + top sheen + inner stroke, white centered "AS".
// Default/raster favicon uses the DEEP (light-mode) gradient — richer on a tab
// than the washed-out vivid one. The SVG favicon's @media dark override (see
// themedSvg) uses a slightly lighter MID gradient.
const TEAL = "#0b857a";
const VIOLET = "#7c3aed";
const PINK = "#c026d3";

function svg({ rounded }) {
  const rx = rounded ? 120 : 0;
  const innerRx = Math.max(2, rx - 5);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${TEAL}"/>
      <stop offset="0.52" stop-color="${VIOLET}"/>
      <stop offset="1" stop-color="${PINK}"/>
    </linearGradient>
    <radialGradient id="hl" cx="0.3" cy="0.24" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.32"/>
      <stop offset="0.46" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="ts" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="7" flood-color="#06201b" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#g)"/>
  <rect width="512" height="512" rx="${rx}" fill="url(#hl)"/>
  <rect width="512" height="512" rx="${rx}" fill="url(#sheen)"/>
  <rect x="5" y="5" width="502" height="502" rx="${innerRx}" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="3"/>
  <text x="256" y="264" font-family="'DejaVu Sans','Liberation Sans',Arial,sans-serif" font-size="272" font-weight="bold" fill="#ffffff" filter="url(#ts)" text-anchor="middle" dominant-baseline="central" letter-spacing="-12">AS</text>
</svg>`;
}

// Theme-aware variant for the SVG favicon: embedded @media swaps the gradient
// with the OS light/dark scheme (modern browsers honor CSS in SVG favicons).
// Raster fallbacks (.ico/png) can't adapt, so they keep the dark variant.
function themedSvg() {
  const rx = 120;
  const innerRx = rx - 5;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <style>
    .g0{stop-color:${TEAL}}.g1{stop-color:${VIOLET}}.g2{stop-color:${PINK}}
    @media (prefers-color-scheme: dark){.g0{stop-color:#16a394}.g1{stop-color:#8b5cf6}.g2{stop-color:#d472dd}}
  </style>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" class="g0"/>
      <stop offset="0.52" class="g1"/>
      <stop offset="1" class="g2"/>
    </linearGradient>
    <radialGradient id="hl" cx="0.3" cy="0.24" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="0.55" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.32"/>
      <stop offset="0.46" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="ts" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="7" flood-color="#06201b" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#g)"/>
  <rect width="512" height="512" rx="${rx}" fill="url(#hl)"/>
  <rect width="512" height="512" rx="${rx}" fill="url(#sheen)"/>
  <rect x="5" y="5" width="502" height="502" rx="${innerRx}" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="3"/>
  <text x="256" y="264" font-family="'DejaVu Sans','Liberation Sans',Arial,sans-serif" font-size="272" font-weight="bold" fill="#ffffff" filter="url(#ts)" text-anchor="middle" dominant-baseline="central" letter-spacing="-12">AS</text>
</svg>`;
}

const roundedSvg = svg({ rounded: true });
const squareSvg = svg({ rounded: false });

// 1. Modern SVG favicon (served at /icon.svg via app/ file convention) — theme-aware.
writeFileSync("app/icon.svg", themedSvg() + "\n");

// 2. Apple touch icon — opaque, full-bleed (iOS applies its own rounding).
await sharp(Buffer.from(squareSvg)).resize(180, 180).png().toFile("app/apple-icon.png");

// 3. Square PNG masters for the .ico (Pillow turns these into a multi-size ico).
mkdirSync("scripts/.tmp", { recursive: true });
await sharp(Buffer.from(roundedSvg)).resize(256, 256).png().toFile("scripts/.tmp/icon-256.png");

// 4. PWA raster icons (192 + 512).
await sharp(Buffer.from(roundedSvg)).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(Buffer.from(roundedSvg)).resize(512, 512).png().toFile("public/icon-512.png");

console.log("icons generated: app/icon.svg, app/apple-icon.png, public/icon-192.png, public/icon-512.png, scripts/.tmp/icon-256.png");
