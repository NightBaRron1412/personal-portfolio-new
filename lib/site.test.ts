import { describe, expect, it } from "vitest";
import { DEFAULT_SITE_URL, getSiteUrl } from "./site";

describe("getSiteUrl", () => {
  it("uses the canonical production domain by default", () => {
    expect(getSiteUrl(undefined)).toBe(DEFAULT_SITE_URL);
  });

  it("removes hosting-dashboard whitespace and trailing slashes", () => {
    expect(getSiteUrl("  https://www.amirshetaia.com/\n")).toBe("https://www.amirshetaia.com");
  });

  it("keeps a valid local origin while removing paths and query strings", () => {
    expect(getSiteUrl("http://localhost:3000/about?preview=1#top")).toBe("http://localhost:3000");
  });

  it("falls back safely for an invalid or non-web URL", () => {
    expect(getSiteUrl("javascript:alert(1)")).toBe(DEFAULT_SITE_URL);
  });
});
