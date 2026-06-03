import { test, expect } from "@playwright/test";
import { signIn } from "./helpers";

test.describe("Dashboard date navigation", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("shows prev/next buttons; next is disabled on today", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("button", { name: "Previous day" })).toBeVisible();
    const nextBtn = page.getByRole("button", { name: "Next day" });
    await expect(nextBtn).toBeVisible();
    await expect(nextBtn).toBeDisabled();
    await expect(page.getByRole("button", { name: "Today" })).not.toBeVisible();
  });

  test("clicking prev day updates URL and shows Today button", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Previous day" }).click();
    await expect(page).toHaveURL(/date=/);
    await expect(page.getByRole("button", { name: "Today" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next day" })).toBeEnabled();
  });

  test("clicking Today jumps back and hides Today button", async ({ page }) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const iso = yesterday.toISOString().split("T")[0];
    await page.goto(`/dashboard?date=${iso}`);
    await page.getByRole("button", { name: "Today" }).click();
    await expect(page.getByRole("button", { name: "Today" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Next day" })).toBeDisabled();
  });

  test("next day button re-enables after going back and navigating forward", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Previous day" }).click();
    await page.getByRole("button", { name: "Next day" }).click();
    await expect(page.getByRole("button", { name: "Next day" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Today" })).not.toBeVisible();
  });
});
