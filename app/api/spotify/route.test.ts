import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.resetModules();
});

it("reports unavailable authorization and cools down instead of returning a silent empty player", async () => {
  vi.stubEnv("SPOTIFY_CLIENT_ID", "test");
  vi.stubEnv("SPOTIFY_CLIENT_SECRET", "test");
  vi.stubEnv("SPOTIFY_REFRESH_TOKEN", "invalid");
  vi.spyOn(console, "error").mockImplementation(() => {});
  const fetch = vi.fn(async () => Response.json({ error: "invalid_grant" }, { status: 400 }));
  vi.stubGlobal("fetch", fetch);
  const { GET } = await import("./route");
  expect(await (await GET()).json()).toEqual({ isPlaying: false, unavailable: true });
  expect(await (await GET()).json()).toEqual({ isPlaying: false, unavailable: true });
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("coalesces simultaneous polls and reuses the access token on later refreshes", async () => {
  vi.stubEnv("SPOTIFY_CLIENT_ID", "test");
  vi.stubEnv("SPOTIFY_CLIENT_SECRET", "test");
  vi.stubEnv("SPOTIFY_REFRESH_TOKEN", "test");
  let now = 100000;
  vi.spyOn(Date, "now").mockImplementation(() => now);
  const fetch = vi.fn(async (url: string) => {
    if (url.includes("/api/token")) return Response.json({ access_token: "token", expires_in: 3600 });
    return Response.json({ is_playing: true, progress_ms: 2000, item: {
      type: "track", name: "Track", artists: [{ name: "Artist" }],
      album: { name: "Album", images: [] }, external_urls: { spotify: "https://open.spotify.com/track/test" }, duration_ms: 100000,
    } });
  });
  vi.stubGlobal("fetch", fetch);
  const { GET } = await import("./route");
  const responses = await Promise.all([GET(), GET(), GET()]);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect((await responses[0].json()).title).toBe("Track");
  now += 31000;
  await GET();
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch.mock.calls.filter(([url]) => url.includes("/api/token"))).toHaveLength(1);
});
