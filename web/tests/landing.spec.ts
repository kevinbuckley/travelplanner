import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders logo and headline", async ({ page }) => {
    await expect(page.getByText("✈ TripWit").first()).toBeVisible();
    await expect(page.getByText("Plan trips that")).toBeVisible();
    await expect(page.getByText("actually happen")).toBeVisible();
  });

  test("Open App nav link is present and goes to /app", async ({ page }) => {
    const openApp = page.getByRole("link", { name: "Open App" });
    await expect(openApp).toBeVisible();
    await expect(openApp).toHaveAttribute("href", "/app");
  });

  test("Start Planning CTA button links to /app", async ({ page }) => {
    const cta = page.getByRole("link", { name: /Start Planning/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/app");
  });

  test("Open TripWit footer CTA links to /app", async ({ page }) => {
    const cta = page.getByRole("link", { name: "Open TripWit" });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/app");
  });

  test("shows all 6 feature card headings", async ({ page }) => {
    // Use heading role to avoid strict-mode collision with paragraph text
    await expect(page.getByRole("heading", { name: "Interactive Map" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Day-by-Day Itinerary" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Shareable Trips" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Import from iOS" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sign in with Google" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Free to Use" })).toBeVisible();
  });

  test("footer has Privacy Policy and Terms links", async ({ page }) => {
    // Use exact match to avoid collision with cookie banner "Privacy policy" link
    const privacy = page.getByRole("link", { name: "Privacy Policy", exact: true });
    const terms = page.getByRole("link", { name: "Terms of Service", exact: true });
    await expect(privacy).toBeVisible();
    await expect(terms).toBeVisible();
    await expect(privacy).toHaveAttribute("href", "/privacy");
    await expect(terms).toHaveAttribute("href", "/terms");
  });
});
