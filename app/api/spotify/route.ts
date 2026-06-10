import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

type Track = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumArt?: string;
  songUrl?: string;
  progress?: number;
  duration?: number;
};

// Module-level cache. The widget polls every ~20s and this route is dynamic, so
// without throttling every visitor/poll hits Spotify and trips a 429 (which made
// "last played" vanish). We call Spotify at most once per CACHE_MS and serve the
// last good track on rate-limit/error so it stays visible.
let cache: { data: Track; ts: number } | null = null;
let cooldownUntil = 0; // honor Spotify's Retry-After so we don't extend a 429 ban
const CACHE_MS = 30_000;

function noteRateLimit(res: Response) {
  const ra = parseInt(res.headers.get("retry-after") || "60", 10);
  cooldownUntil = Date.now() + (Number.isFinite(ra) ? ra : 60) * 1000;
}

async function getAccessToken() {
  const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN!,
    }),
    cache: "no-store",
  });
  return response.json();
}

async function fetchFromSpotify(): Promise<Track | null> {
  const { access_token } = await getAccessToken();
  if (!access_token) return null;
  const auth = { Authorization: `Bearer ${access_token}` };

  const now = await fetch(NOW_PLAYING_ENDPOINT, { headers: auth, cache: "no-store" });
  if (now.status === 429) {
    noteRateLimit(now);
    return null;
  }
  if (now.status === 200) {
    const data = await now.json();
    if (data?.is_playing && data?.currently_playing_type === "track" && data.item) {
      return {
        isPlaying: true,
        title: data.item.name,
        artist: data.item.artists.map((a: { name: string }) => a.name).join(", "),
        album: data.item.album.name,
        albumArt: data.item.album.images?.[0]?.url,
        songUrl: data.item.external_urls.spotify,
        progress: data.progress_ms,
        duration: data.item.duration_ms,
      };
    }
  }

  const recent = await fetch(RECENTLY_PLAYED_ENDPOINT, { headers: auth, cache: "no-store" });
  if (recent.status === 429) {
    noteRateLimit(recent);
    return null;
  }
  if (recent.ok) {
    const track = (await recent.json()).items?.[0]?.track;
    if (track) {
      return {
        isPlaying: false,
        title: track.name,
        artist: track.artists.map((a: { name: string }) => a.name).join(", "),
        album: track.album.name,
        albumArt: track.album.images?.[0]?.url,
        songUrl: track.external_urls.spotify,
      };
    }
  }

  return null; // 429 / nothing — caller falls back to the cached track
}

export async function GET() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json({ isPlaying: false, notConfigured: true }, { headers: NO_CACHE_HEADERS });
  }

  // Serve a fresh cache without touching Spotify.
  if (cache && Date.now() - cache.ts < CACHE_MS) {
    return NextResponse.json(cache.data, { headers: NO_CACHE_HEADERS });
  }

  // In a rate-limit cooldown: don't call Spotify (would extend the ban); serve
  // the last known track instead.
  if (Date.now() < cooldownUntil) {
    return NextResponse.json(cache?.data ?? { isPlaying: false }, { headers: NO_CACHE_HEADERS });
  }

  try {
    const data = await fetchFromSpotify();
    if (data) {
      cache = { data, ts: Date.now() };
      return NextResponse.json(data, { headers: NO_CACHE_HEADERS });
    }
    // Rate-limited or empty: keep showing the last known track if we have one.
    if (cache) return NextResponse.json(cache.data, { headers: NO_CACHE_HEADERS });
    return NextResponse.json({ isPlaying: false }, { headers: NO_CACHE_HEADERS });
  } catch (err) {
    console.error("Spotify API error:", err);
    if (cache) return NextResponse.json(cache.data, { headers: NO_CACHE_HEADERS });
    return NextResponse.json({ isPlaying: false }, { headers: NO_CACHE_HEADERS });
  }
}
