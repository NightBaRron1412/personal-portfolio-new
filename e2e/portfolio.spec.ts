import { test, expect } from "@playwright/test";

test.describe("Portfolio interactive features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const skipBtn = page.locator("button:has-text('SKIP')");
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await skipBtn.click();
    }
    await page.waitForSelector("main", { timeout: 10000 });
  });

  test("interactive terminal accepts input and runs help", async ({ page }) => {
    const input = page.locator('input[aria-label="Terminal input"]');
    await expect(input).toBeAttached({ timeout: 8000 });
    await input.click();
    await page.waitForTimeout(200);
    await input.pressSequentially("help", { delay: 50 });
    await input.press("Enter");

    await expect(page.locator("text=whoami")).toBeVisible({ timeout: 3000 });
  });

  test("terminal whoami shows profile name", async ({ page }) => {
    const input = page.locator('input[aria-label="Terminal input"]');
    await expect(input).toBeAttached({ timeout: 8000 });
    await input.click();
    await page.waitForTimeout(200);
    await input.pressSequentially("whoami", { delay: 50 });
    await input.press("Enter");

    await expect(page.locator(`text=${profile.name}`).first()).toBeVisible({ timeout: 3000 });
  });

  test("terminal has visible blinking cursor", async ({ page }) => {
    const cursor = page.locator(".terminal-cursor");
    await expect(cursor).toBeAttached({ timeout: 8000 });

    const bg = await cursor.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("terminal tab completion works", async ({ page }) => {
    const input = page.locator('input[aria-label="Terminal input"]');
    await expect(input).toBeAttached({ timeout: 8000 });
    await input.click();
    await page.waitForTimeout(200);
    await input.pressSequentially("who", { delay: 50 });
    await input.press("Tab");
    await page.waitForTimeout(200);

    expect(await input.inputValue()).toBe("whoami");
  });

  test("idle teaser hints appear", async ({ page }) => {
    await page.waitForTimeout(12000);
    const hint = page.locator('text=/try "/');
    await expect(hint.first()).toBeVisible({ timeout: 5000 });
  });

  test("section connectors render", async ({ page }) => {
    await page.evaluate(() => window.scrollBy(0, 600));
    await page.waitForTimeout(500);
    const svgPaths = page.locator("svg path");
    expect(await svgPaths.count()).toBeGreaterThan(0);
  });

  test("scroll text reveal on about heading", async ({ page }) => {
    await page.evaluate(() => document.getElementById("about")?.scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(1000);
    await expect(page.locator("#about h2")).toBeVisible({ timeout: 5000 });
  });

  test("experience cards animate individually on scroll", async ({ page }) => {
    await page.evaluate(() => document.getElementById("experience")?.scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(1500);
    const first = page.locator("#experience .group").first();
    await expect(first).toBeVisible({ timeout: 5000 });
    expect(await page.locator("#experience .group").count()).toBeGreaterThan(3);
  });

  test("experience timeline line renders", async ({ page }) => {
    await page.evaluate(() => document.getElementById("experience")?.scrollIntoView({ behavior: "instant" }));
    await page.waitForTimeout(500);
    const timeline = page.locator("#experience .w-0\\.5 .bg-gradient-to-b.from-accent-blue");
    await expect(timeline).toBeAttached();
  });

  test("page loads without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    await page.goto("/");
    const skipBtn = page.locator("button:has-text('SKIP')");
    if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) await skipBtn.click();
    await page.waitForSelector("main", { timeout: 10000 });
    await page.waitForTimeout(2000);
    const critical = errors.filter((e) => !e.includes("Failed to load resource") && !e.includes("favicon") && !e.includes("spotify"));
    expect(critical).toHaveLength(0);
  });
});

const profile = { name: "Amir Shetaia" };
