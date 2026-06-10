import { createRequire } from "node:module";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require(
  process.cwd() + "/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp"
);

const kb = (n) => Math.round(n / 1024) + "KB";
let savedTotal = 0;

async function optimize(path, fn) {
  const before = statSync(path).size;
  const buf = readFileSync(path);
  const out = await fn(sharp(buf));
  writeFileSync(path, out);
  const after = out.length;
  savedTotal += before - after;
  console.log(`${path.padEnd(46)} ${kb(before).padStart(7)} -> ${kb(after).padStart(7)}`);
}

// 1. Portrait: 2811x5082 2.1MB -> ~1100px webp (+ shrink the jpg fallback).
await optimize("public/images/portrait.jpg", (s) =>
  s.rotate().resize({ width: 1100, withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
);
{
  const buf = readFileSync("public/images/portrait.jpg");
  const webp = await sharp(buf).webp({ quality: 80 }).toBuffer();
  writeFileSync("public/images/portrait.webp", webp);
  console.log(`public/images/portrait.webp (new)            ${"".padStart(7)}    ${kb(webp.length).padStart(7)}`);
}

// 2. Logos: rendered at ~20-48px -> cap longer side at 200px, recompress.
const logoDir = "public/images/logos";
for (const f of readdirSync(logoDir)) {
  const ext = extname(f).toLowerCase();
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") continue; // leave SVGs
  const path = join(logoDir, f);
  await optimize(path, (s) =>
    s
      .resize({ width: 200, height: 200, fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true, effort: 10 })
      .toBuffer()
  );
}

console.log(`\nTotal saved: ${kb(savedTotal)}`);
