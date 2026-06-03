import { setupClerkTestingToken } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";

const TEST_EMAIL = process.env.TEST_USER_EMAIL!;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD!;

export async function signIn(page: Page) {
  await setupClerkTestingToken({ page });
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill(TEST_EMAIL);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.locator('input[name="password"]').fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.includes("sign-in"));
}
