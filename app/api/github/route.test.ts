import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); });

it("returns an upstream failure even when the events request succeeded", async () => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => new Response("{}", {
    status: url.includes("events") ? 200 : 403,
  })));
  const { GET } = await import("./route");
  expect((await GET()).status).toBe(502);
});

it("counts only active days and caches a successful response", async () => {
  vi.stubEnv("GITHUB_TOKEN", "test-token");
  const today = new Date().toISOString().slice(0, 10);
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    let body: unknown = [];
    if (url.endsWith("/NightBaRron1412")) body = { login: "NightBaRron1412", public_repos: 3 };
    if (url.endsWith("/graphql")) body = { data: { viewer: { login: "NightBaRron1412", contributionsCollection: {
      contributionCalendar: { weeks: [{ contributionDays: [
        { date: today, contributionCount: 2 }, { date: "2020-01-01", contributionCount: 0 },
      ] }] },
    } } } };
    return Response.json(body);
  }));
  const { GET } = await import("./route");
  const response = await GET();
  expect(response.headers.get("cache-control")).toContain("s-maxage=300");
  expect((await response.json()).stats).toMatchObject({ activeDays: 1, totalCommits: 2 });
});
