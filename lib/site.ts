export const DEFAULT_SITE_URL = "https://www.amirshetaia.com";

/**
 * Return one canonical, origin-only URL for metadata and structured data.
 * Hosting dashboards can accidentally save environment variables with leading
 * or trailing whitespace, so normalize the value before exposing it to bots.
 */
export function getSiteUrl(value = process.env.SITE_URL): string {
  const candidate = value?.trim() || DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return DEFAULT_SITE_URL;
    }

    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}
