import { test, expect } from "@playwright/test";

test.describe("Cookie consent banner", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage so banner appears fresh
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("tripwit_cookie_consent"));
    await page.reload();
  });

  test("banner appears on first visit", async ({ page }) => {
    await expect(page.getByText(/We use cookies/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Accept" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Decline" })).toBeVisible();
  });

  test("accepting hides the banner", async ({ page }) => {
    await page.getByRole("button", { name: "Accept" }).click();
    await expect(page.getByText(/We use cookies/i)).not.toBeVisible();
  });

  test("declining hides the banner", async ({ page }) => {
    await page.getByRole("button", { name: "Decline" }).click();
    await expect(page.getByText(/We use cookies/i)).not.toBeVisible();
  });

  test("banner does not reappear after accepting", async ({ page }) => {
    await page.getByRole("button", { name: "Accept" }).click();
    await page.reload();
    await expect(page.getByText(/We use cookies/i)).not.toBeVisible();
  });

  test("banner does not reappear after declining", async ({ page }) => {
    await page.getByRole("button", { name: "Decline" }).click();
    await page.reload();
    await expect(page.getByText(/We use cookies/i)).not.toBeVisible();
  });

  test("banner links to privacy policy", async ({ page }) => {
    const privacyLink = page.getByText(/Privacy policy/i).first();
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveAttribute("href", "/privacy");
  });

  test("X button dismisses the banner", async ({ page }) => {
    await page.getByRole("button", { name: "Dismiss" }).click();
    await expect(page.getByText(/We use cookies/i)).not.toBeVisible();
  });
});
