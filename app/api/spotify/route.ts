import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
} as const;

async function getAccessToken() {
  const basic = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

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
  });

  return response.json();
}

export async function GET() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return NextResponse.json(
      { isPlaying: false, notConfigured: true },
      { headers: NO_CACHE_HEADERS }
    );
  }

  try {
    const { access_token } = await getAccessToken();

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
      cache: "no-store",
    });

    // Not playing anything
    if (response.status === 204 || response.status > 400) {
      const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, {
        headers: { Authorization: `Bearer ${access_token}` },
        cache: "no-store",
      });

      if (recentRes.ok) {
        const recentData = await recentRes.json();
        const track = recentData.items?.[0]?.track;
        if (track) {
          return NextResponse.json(
            {
              isPlaying: false,
              title: track.name,
              artist: track.artists.map((a: any) => a.name).join(", "),
              album: track.album.name,
              albumArt: track.album.images?.[0]?.url,
              songUrl: track.external_urls.spotify,
            },
            { headers: NO_CACHE_HEADERS }
          );
        }
      }

      return NextResponse.json(
        { isPlaying: false },
        { headers: NO_CACHE_HEADERS }
      );
    }

    const data = await response.json();

    if (data.currently_playing_type !== "track") {
      return NextResponse.json(
        { isPlaying: false },
        { headers: NO_CACHE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        isPlaying: data.is_playing,
        title: data.item.name,
        artist: data.item.artists.map((a: any) => a.name).join(", "),
        album: data.item.album.name,
        albumArt: data.item.album.images?.[0]?.url,
        songUrl: data.item.external_urls.spotify,
        progress: data.progress_ms,
        duration: data.item.duration_ms,
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (err) {
    console.error("Spotify API error:", err);
    return NextResponse.json(
      { isPlaying: false },
      { headers: NO_CACHE_HEADERS }
    );
  }
}
