const siteUrl = (process.env.SITE_URL || "https://www.amirshetaia.com")
  .trim()
  .replace(/\/+$/, "");

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl,
  generateRobotsTxt: true,
  outDir: "./public",
};
