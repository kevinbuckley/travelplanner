import { test, expect } from "@playwright/test";

test.describe("Auth callback route", () => {
  test("redirects to / when no code param is provided", async ({ page }) => {
    const response = await page.goto("/auth/callback");
    // No code → redirects to /
    await expect(page).toHaveURL("/");
  });

  test("does not crash with an invalid code param", async ({ page }) => {
    const response = await page.goto("/auth/callback?code=invalid-code-12345");
    // Without real Supabase env vars the route redirects to /.
    // With real env vars an invalid code also redirects to /.
    // Either way must not be a 5xx error.
    expect(response?.status()).not.toBeGreaterThanOrEqual(500);
  });
});
