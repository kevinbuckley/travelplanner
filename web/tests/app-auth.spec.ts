import { test, expect } from "@playwright/test";

test.describe("/app page (unauthenticated)", () => {
  test.beforeEach(async ({ page }) => {
    // Ensure no auth state
    await page.context().clearCookies();
    await page.goto("/app");
  });

  test("shows welcome screen instead of redirecting away", async ({ page }) => {
    // Should stay on /app, not bounce to /
    await expect(page).toHaveURL(/\/app/);
  });

  test("shows welcome headline", async ({ page }) => {
    await expect(page.getByText("Welcome to TripWit")).toBeVisible();
  });

  test("shows sign in with Google button in header", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Sign in with Google/i })).toBeVisible();
  });

  test("header shows TripWit logo", async ({ page }) => {
    await expect(page.getByText("✈ TripWit")).toBeVisible();
  });

  test("does NOT show trip sidebar or map (requires auth)", async ({ page }) => {
    await expect(page.getByText("My Trips")).not.toBeVisible();
  });
});

test.describe("Open App navigation flow", () => {
  test("clicking Open App from landing lands on /app with sign-in UI", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Open App" }).click();
    await expect(page).toHaveURL(/\/app/);
    await expect(page.getByText("Welcome to TripWit")).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign in with Google/i })).toBeVisible();
  });
});
