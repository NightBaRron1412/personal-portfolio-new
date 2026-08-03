import { test, expect } from "@playwright/test";

const SECTIONS = [
  "about",
  "skills",
  "work",
  "experience",
  "education",
  "signals",
  "testimonials",
  "contact",
];

test.describe("Portfolio", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("main", { timeout: 10000 });
  });

  test("hero renders name and value proposition", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Amir Shetaia");
    await expect(page.getByText("GPU drivers").first()).toBeVisible();
  });

  test("all sections are present in the DOM", async ({ page }) => {
    for (const id of SECTIONS) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("nav links scroll to their section", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile-chromium") {
      await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page.getByRole("button", { name: "03 Work", exact: true }).click();
    } else {
      await page.getByRole("button", { name: "Work", exact: true }).first().click();
    }
    await page.waitForTimeout(800);
    const inView = await page.evaluate(() => {
      const el = document.getElementById("work");
      if (!el) return false;
      const top = el.getBoundingClientRect().top;
      return top > -50 && top < window.innerHeight;
    });
    expect(inView).toBe(true);
  });

  test("theme toggle switches the html class", async ({ page }) => {
    const getTheme = () =>
      page.evaluate(() => document.documentElement.classList.contains("dark"));
    const before = await getTheme();
    await page.getByRole("button", { name: /switch to .* theme/i }).first().click();
    await page.waitForTimeout(300);
    const after = await getTheme();
    expect(after).not.toBe(before);
  });

  test("flagship projects are listed", async ({ page }) => {
    await expect(page.getByText("DeepParse:", { exact: false })).toBeVisible();
    await expect(page.getByText("VehiPlus:", { exact: false })).toBeVisible();
  });

  test("contact form exposes the expected fields", async ({ page }) => {
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.getByPlaceholder("Your name")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("What are you working on?")).toBeVisible();
  });

  test("page loads without critical console errors", async ({ page }) => {
    const errors: string[] = [];
    const failedResponses: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedResponses.push(`${response.status()} ${response.url()}`);
      }
    });
    await page.goto("/");
    await page.waitForSelector("main", { timeout: 10000 });
    await page.waitForTimeout(1500);
    const critical = errors.filter(
      (e) =>
        !e.includes("Failed to load resource") &&
        !e.includes("favicon") &&
        !e.includes("spotify") &&
        !e.includes("github") &&
        // Vercel Analytics/Speed-Insights scripts only exist on Vercel; they
        // 404 / fail MIME locally but are fine once deployed.
        !e.includes("_vercel") &&
        !e.includes("insights")
    );
    expect(critical).toHaveLength(0);
    const criticalResponses = failedResponses.filter(
      (entry) =>
        !entry.includes("/api/spotify") &&
        !entry.includes("/api/github") &&
        !entry.includes("/_vercel/")
    );
    expect(criticalResponses).toHaveLength(0);
  });

  test("project cards link to their GitHub repositories", async ({ page }) => {
    await page.locator("#work").scrollIntoViewIfNeeded();
    await expect(page.getByRole("link", { name: "Repository" }).first()).toBeVisible();
  });

  test("skip-to-content is the first focusable element", async ({ page }, testInfo) => {
    if (testInfo.project.name === "webkit") {
      const firstFocusable = await page.evaluate(() => {
        const selector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
        return document.querySelector(selector)?.textContent ?? "";
      });
      expect(firstFocusable).toMatch(/skip to content/i);
    } else {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => document.activeElement?.textContent ?? "");
      expect(focused).toMatch(/skip to content/i);
    }
  });

  test("unknown routes render the 404 page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByText("404").first()).toBeVisible();
    await expect(page.getByText(/signal lost/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /back to home/i })).toBeVisible();
  });
});
