# Website audit and improvement pass

## Scope

Reviewed the homepage, shared visual system, navigation, interactive sections, contact form, animation behavior, assets, and the contact/GitHub/Spotify API routes. Kept the instrument-panel identity, teal/violet palette, content, desktop background effects, and background music behavior.

## Changes

- **Mobile atmosphere:** lightweight CSS gradients and diagonal texture, subtle tinted panels, short entrance transitions, and existing status animations. Phone/coarse-pointer initialization skips the WebGL shader and constellation renderer. Mobile avoids backdrop blur on cards, large blurred aurora layers, film grain, and continuous portrait effects.
- **Motion:** removed reveal blur and persistent layer-promotion hints, shortened phone reveal timing, honored reduced motion in section navigation, and fixed OS preference tracking. An explicit visitor choice still wins. Testimonials now pause offscreen, in hidden tabs, and on interaction, with a visible pause/play control. Quotes animate as a block instead of many independently blurred words.
- **Layout/navigation:** tighter phone section spacing, wrapping section headings, narrow-screen header spacing, opaque scrolled header and menu, visible keyboard focus, Escape dismissal with focus return, and compact navigation through tablet widths. Fixed controls clipped at 768–820 px.
- **Forms:** shared trimmed validation and length limits between client/server, autocomplete hints, 16 px phone inputs, bounded client request duration, persistent inline submission feedback, and drafts retained after failures. Success clears the form. No real email was sent during testing.
- **Assets:** game covers use lazy loading and low fetch priority instead of competing with the hero. Background music remains preloaded and starts after the browser permits playback, preserving the visitor's existing on/off preference. Fixed rejected audio cleanup promises during navigation.
- **GitHub:** bounded upstream request duration, parallel independent repository requests, correct non-success HTTP status on upstream failure, contribution-calendar failure fallback, successful-response CDN caching, correct active-day/window totals, and loading deferred until the section approaches the viewport.
- **Spotify:** shared in-flight requests, access-token reuse until expiry, bounded upstream calls, retry cooldown on empty/error responses, and no client polls while hidden or already pending.
- **Other:** daylight-saving-aware Toronto date/time label, no-JavaScript reveal fallback, and generated browser artifacts excluded from lint discovery.

## Verification

- Production build, TypeScript, ESLint, and `git diff --check`: passed.
- Vitest: **20 passed**, including contact validation, GitHub upstream failures/statistics/cache headers, and concurrent Spotify polling/token reuse.
- Existing Playwright suite: **40 passed** across desktop Chromium, Firefox, WebKit, and mobile Chromium.
- Additional WebKit iPhone 13 emulation: dark/light visual inspection, menu Escape/focus behavior, form validation, mocked failure with retained draft, mocked success with form reset, reduced-motion preference changes, testimonial controls, and game-cover decoding.
- Header bounds checked at **320, 390, 768, 820, 1024, 1280, and 1440 px**: no clipped controls after the fix.
- Axe WCAG A/AA scan of the mobile light-mode page: no violations reported. Automated accessibility scanning does not replace manual assistive-technology testing.
- Screenshots are in `output/playwright/audit-*.png`.

## Practical limits and retained tradeoffs

- Production deployment is authorized. The release response records the deployed URL and commit after live verification.
- Browser device emulation is not a physical-phone battery, thermal, or frame-rate benchmark. No before/after Lighthouse or field-performance percentage is claimed.
- Background music intentionally retains its approximately 4.4 MB preload, per the requested experience. Browser gesture restrictions and the existing saved mute preference still apply.
- Live third-party uptime and actual email delivery were not verified. Contact success/failure browser checks used intercepted responses. Local Vercel telemetry script 404s are expected without the Vercel hosting endpoints.
- Contact rate limiting and Spotify runtime cache remain process-local; they are best-effort across multiple serverless instances. GitHub successful responses additionally carry CDN cache headers.
- Without a usable GitHub contribution calendar, public activity is an approximation from limited event/repository history, not an authoritative full contribution ledger.
- Canvas eligibility now responds to viewport/input changes. Desktop-only code is dynamically imported; narrowing the viewport unmounts the renderers and releases WebGL resources.


## Second enhancement pass

- Larger header controls, a compact current-section indicator, outside-click menu dismissal, and highlighted active menu entries.
- Explicit View code project actions, highlighted result summaries, readable metric cards, and restored shared surface color utilities.
- GitHub retry UI, cancelled requests on unmount, visible fallback-source explanation, overlapping commits deduplicated, and contribution-calendar fetching started alongside REST requests.
- Game-cover errors fall back to a branded title card.
- Contact streaming JSON parsing is capped at 32 KiB; rate-limit errors retain inline feedback. The in-memory rate limiter reclaims expired identities and bounds capacity.
- Spotify invalidates rejected access tokens so later polls can recover.
- Card pointer effects use one animation-frame update without re-rendering React children and honor the explicit motion setting.
- Desktop canvas bundles are conditional, and resizing from desktop to phone and back was checked in the browser.
- Additional iPhone/WebKit checks confirmed GitHub failure-to-retry recovery. Mobile dark-mode axe scan reported no WCAG A/AA violations.
- Background music and its preload remain intact. No lossy audio conversion was applied.
