import { test, expect } from "@playwright/test";

test("capture sections mid-scroll to see blur state", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const skipBtn = page.locator("button:has-text('SKIP')");
  if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) await skipBtn.click();
  await page.waitForSelector("main", { timeout: 10000 });
  await page.waitForTimeout(2000);

  // Scroll gradually and screenshot at each step to catch sections mid-blur
  const steps = [
    { scroll: 300, name: "scroll-300" },
    { scroll: 600, name: "scroll-600" },
    { scroll: 1000, name: "scroll-1000" },
    { scroll: 1500, name: "scroll-1500" },
    { scroll: 2000, name: "scroll-2000" },
    { scroll: 2500, name: "scroll-2500" },
  ];

  for (const step of steps) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), step.scroll);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `test-results/blur-${step.name}.png` });
  }

  // Check that a section not yet in view has opacity < 1 (blurred/hidden state)
  // Scroll to just before Contact section
  const contactY = await page.evaluate(() => {
    const el = document.getElementById("contact");
    return el ? el.getBoundingClientRect().top + window.scrollY - 800 : 5000;
  });
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), contactY);
  await page.waitForTimeout(100);
  await page.screenshot({ path: "test-results/blur-before-contact.png" });

  // Now scroll Contact into view
  await page.evaluate(() => document.getElementById("contact")?.scrollIntoView({ behavior: "instant" }));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "test-results/blur-contact-visible.png" });
});
