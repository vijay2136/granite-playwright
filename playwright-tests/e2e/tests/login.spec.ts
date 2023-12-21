import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("should login with the correct credentials", async ({ page }) => {
    await page.goto("http://localhost:3000/login");
    await page.getByTestId("login-email-field").fill("oliver@example.com");
    await page.getByTestId("login-password-field").fill("welcome");
    const btn = await page.getByTestId("login-submit-button");
    await btn.click();
    console.log(btn);
    await expect(page.getByTestId("navbar-username-label")).toHaveText(
      "Oliver Smith"
    );
  });
});
