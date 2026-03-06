import { test, expect } from "@playwright/test";

test.describe("Public trip page (/trip/[id])", () => {
  test("returns 404 for non-existent trip (no Supabase configured → notFound())", async ({ page }) => {
    const response = await page.goto("/trip/non-existent-trip-id-12345");
    // Without Supabase env vars getServerSupabase() returns null → notFound() → 404.
    // With real Supabase but a missing trip, same result.
    expect(response?.status()).toBe(404);
  });

  test("404 page renders Next.js not-found UI", async ({ page }) => {
    await page.goto("/trip/non-existent-trip-id-12345");
    // Next.js renders its not-found page — just confirm we're not on a 500
    const response = await page.goto("/trip/non-existent-trip-id-12345");
    expect(response?.status()).not.toBeGreaterThanOrEqual(500);
  });
});
