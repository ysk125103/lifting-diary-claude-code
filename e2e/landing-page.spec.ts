import { test, expect } from "@playwright/test";
import { signIn } from "./helpers";

test.describe("Landing page — anonymous user", () => {
  test("stays on landing page and shows marketing content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: /Track Every Rep\./i })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Get Started Free" })).toBeVisible();
  });

  test("shows stats section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("10,000+")).toBeVisible();
    await expect(page.getByText("500+")).toBeVisible();
    await expect(page.getByText("100%")).toBeVisible();
  });

  test("shows feature cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Log Any Workout" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Track Your Progress" })).toBeVisible();
  });

  test("shows footer copyright", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Lifting Diary\. All rights reserved\./)).toBeVisible();
  });
});

test.describe("Landing page — signed-in user", () => {
  test("redirects to dashboard", async ({ page }) => {
    await signIn(page);
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
