import { test, expect } from "@playwright/test";

const SECTIONS = ["about", "skills", "experience", "projects", "github", "education", "testimonials", "contact"];

test("desktop: all connector texts visible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const skipBtn = page.locator("button:has-text('SKIP')");
  if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) await skipBtn.click();
  await page.waitForSelector("main", { timeout: 10000 });
  await page.waitForTimeout(3000);

  for (const section of SECTIONS) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 300, behavior: "instant" });
    }, section);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `test-results/dt-${section}.png` });
  }
});

test("mobile: all connector texts visible", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  const skipBtn = page.locator("button:has-text('SKIP')");
  if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) await skipBtn.click();
  await page.waitForSelector("main", { timeout: 10000 });
  await page.waitForTimeout(3000);

  for (const section of SECTIONS) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 200, behavior: "instant" });
    }, section);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `test-results/mb-${section}.png` });
  }
});
