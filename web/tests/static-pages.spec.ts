import { test, expect } from "@playwright/test";

test.describe("Privacy policy page", () => {
  test("loads and has correct title", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveTitle(/Privacy/i);
    await expect(page.getByRole("heading", { name: /Privacy Policy/i })).toBeVisible();
  });

  test("has navigation back to home", async ({ page }) => {
    await page.goto("/privacy");
    const homeLink = page.getByRole("link", { name: /TripWit/i }).first();
    await expect(homeLink).toBeVisible();
  });
});

test.describe("Terms of service page", () => {
  test("loads and has correct title", async ({ page }) => {
    await page.goto("/terms");
    await expect(page).toHaveTitle(/Terms/i);
    await expect(page.getByRole("heading", { name: /Terms of Service/i })).toBeVisible();
  });
});

test.describe("404 page", () => {
  test("returns 404 for unknown routes", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
