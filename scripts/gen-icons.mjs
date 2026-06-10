import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

// sharp is a transitive dep under pnpm's store (not hoisted), so resolve it directly.
const require = createRequire(import.meta.url);
const sharp = require(
  process.cwd() + "/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp"
);

// Brand gradient (matches --gradient: teal -> violet -> pink) with a dark ink
// monogram for maximum contrast at favicon sizes.
const TEAL = "#2dd4bf";
const VIOLET = "#a78bfa";
const PINK = "#f472b6";
const INK = "#0b0f17";

function svg({ rounded }) {
  const rx = rounded ? 112 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${TEAL}"/>
      <stop offset="0.52" stop-color="${VIOLET}"/>
      <stop offset="1" stop-color="${PINK}"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="0.5" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rx}" fill="url(#g)"/>
  <rect width="512" height="512" rx="${rx}" fill="url(#sheen)"/>
  <text x="256" y="258" font-family="'DejaVu Sans','Liberation Sans',Arial,sans-serif" font-size="300" font-weight="bold" fill="${INK}" text-anchor="middle" dominant-baseline="central">AS</text>
</svg>`;
}

const roundedSvg = svg({ rounded: true });
const squareSvg = svg({ rounded: false });

// 1. Modern SVG favicon (served at /icon.svg via app/ file convention).
writeFileSync("app/icon.svg", roundedSvg + "\n");

// 2. Apple touch icon — opaque, full-bleed (iOS applies its own rounding).
await sharp(Buffer.from(squareSvg)).resize(180, 180).png().toFile("app/apple-icon.png");

// 3. Square PNG masters for the .ico (Pillow turns these into a multi-size ico).
mkdirSync("scripts/.tmp", { recursive: true });
await sharp(Buffer.from(roundedSvg)).resize(256, 256).png().toFile("scripts/.tmp/icon-256.png");

// 4. PWA raster icons (192 + 512).
await sharp(Buffer.from(roundedSvg)).resize(192, 192).png().toFile("public/icon-192.png");
await sharp(Buffer.from(roundedSvg)).resize(512, 512).png().toFile("public/icon-512.png");

console.log("icons generated: app/icon.svg, app/apple-icon.png, public/icon-192.png, public/icon-512.png, scripts/.tmp/icon-256.png");
