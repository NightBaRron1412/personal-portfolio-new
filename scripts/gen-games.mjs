// Fetches game cover art + metadata for the "Off the Clock" section — keyless,
// straight from Steam's public endpoints. Resolves each title to an appid via
// the community SearchApps endpoint, pulls year/genres from the storefront
// appdetails API, and downloads the official 600x900 portrait capsule into
// public/images/games/. Writes data/games.meta.json (keyed by slug).
//
// Run:  node scripts/gen-games.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const games = JSON.parse(readFileSync("data/games.json", "utf8"));
mkdirSync("public/images/games", { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { "User-Agent": "Mozilla/5.0 (portfolio-build)" };

async function searchAppId(term) {
  try {
    const r = await fetch(
      `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(term)}`,
      { headers: UA }
    );
    if (!r.ok) return null;
    const arr = await r.json();
    return arr?.[0]?.appid ?? null;
  } catch {
    return null;
  }
}

async function details(appid) {
  try {
    const r = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&l=english&filters=basic,genres,release_date`,
      { headers: UA }
    );
    const j = await r.json();
    const d = j?.[appid]?.data;
    if (!d) return {};
    const year = (d.release_date?.date || "").match(/\d{4}/)?.[0] || null;
    const genres = (d.genres || []).slice(0, 2).map((g) => g.description);
    return { year, genres, name: d.name, header: d.header_image || null };
  } catch {
    return {};
  }
}

async function save(url, slug) {
  try {
    const r = await fetch(url, { headers: UA });
    if (r.ok && (r.headers.get("content-type") || "").startsWith("image")) {
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > 2000) {
        writeFileSync(`public/images/games/${slug}.jpg`, buf);
        return true;
      }
    }
  } catch {
    /* ignore */
  }
  return false;
}

// Cover priority: explicit `poster` override (a real vertical box-art URL) →
// Steam portrait library capsule → (landscape) Steam header as a last resort.
async function downloadCover(appid, slug, headerUrl, posterUrl) {
  if (posterUrl && (await save(posterUrl, slug))) {
    return { cover: `/images/games/${slug}.jpg`, wide: false };
  }
  const portrait = [
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`,
    `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
  ];
  for (const u of portrait) {
    if (await save(u, slug)) return { cover: `/images/games/${slug}.jpg`, wide: false };
  }
  if (headerUrl && (await save(headerUrl, slug))) {
    return { cover: `/images/games/${slug}.jpg`, wide: true };
  }
  return { cover: null, wide: false };
}

const meta = {};
for (const g of games) {
  const appid = await searchAppId(g.query || g.title);
  let info = {};
  let cover = null;
  let wide = false;
  if (appid) info = await details(appid);
  ({ cover, wide } = await downloadCover(appid, g.slug, info.header, g.poster));
  meta[g.slug] = {
    appid: appid || null,
    cover,
    wide,
    year: info.year || null,
    genres: info.genres || [],
    url: appid ? `https://store.steampowered.com/app/${appid}` : null,
  };
  console.log(
    `${g.title} → appid ${appid ?? "—"} (${info.name ?? "?"}) | cover ${cover ? (wide ? "header" : "portrait") : "—"} | ${info.year ?? "?"} | ${(info.genres || []).join(", ")}`
  );
  await sleep(700);
}

writeFileSync("data/games.meta.json", JSON.stringify(meta, null, 2) + "\n");
console.log("wrote data/games.meta.json");
