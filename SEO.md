# Search visibility checklist

The site now emits one canonical identity URL, a descriptive title and snippet,
ProfilePage/Person structured data, a crawlable portrait caption, image sitemap
entries, and optional Google and Bing verification tags.

## 1. Keep the production URL consistent

Set this exact value in Vercel, with no quotes or extra whitespace:

```text
SITE_URL=https://www.amirshetaia.com
```

The application normalizes this value as a safeguard, but the deployment setting
should still match the domain that serves the final `200` response.

## 2. Verify the site with search engines

1. Add `amirshetaia.com` as a Domain property in [Google Search Console](https://search.google.com/search-console/about).
2. Complete DNS verification. If Google instead provides an HTML meta token, put only the token value in `GOOGLE_SITE_VERIFICATION` in Vercel and redeploy.
3. Add the site to [Bing Webmaster Tools](https://www.bing.com/webmasters/about). Put its meta-token value in `BING_SITE_VERIFICATION` if needed, then redeploy.

## 3. Submit and request indexing

1. In Google Search Console, submit `https://www.amirshetaia.com/sitemap.xml` under **Sitemaps**.
2. Inspect `https://www.amirshetaia.com/` with **URL Inspection**, run the live test, and choose **Request indexing**.
3. Repeat the sitemap submission in Bing Webmaster Tools.
4. Validate the page in Google's [Rich Results Test](https://search.google.com/test/rich-results) and [Schema Markup Validator](https://validator.schema.org/).

Google says crawling can take from several days to several weeks, and a request
does not guarantee indexing or a particular ranking.

## 4. Strengthen the name entity off-site

- Keep the exact public name **Amir Shetaia** and the same portrait, employer, role, and website URL on LinkedIn, GitHub, ResearchGate, Queen's/CritLab, conference, and author profiles.
- Make the canonical site link clickable from those profiles wherever editing is possible.
- Ask authoritative pages that already mention Amir—university, publication, conference, and open-source contribution pages—to link to the canonical portfolio when appropriate.
- Publish substantive, first-hand pages for major public projects or publications. Each deserves its own stable URL, title, description, and links from the home page.

## 5. Monitor monthly

- Check Search Console's **Pages**, **Performance**, **Links**, and **Enhancements** reports.
- Track impressions and average position for `Amir Shetaia` and close variants.
- Fix crawl or structured-data errors before making cosmetic SEO changes.
- Update visible experience and structured data together so every identity signal remains truthful and consistent.

Do not buy links, repeat the name unnaturally, or add unrelated keywords. Those
tactics do not create durable authority and can make the page look spammy.
