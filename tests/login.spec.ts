import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { TestCredentials } from "../utils/test-data";


test.describe("Login Functionality", () => {
  test("TC_001: Valid Login", async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    const credentials = TestCredentials.validUser;

    await test.step("Navigate to Homepage", async () => {
      await homePage.navigateToHome();
      await homePage.waitForCloudflareChallenge();
      await homePage.takeScreenshot("01-homepage");
    });

    await test.step("Navigate to Login Page", async () => {
      await homePage.goToLogin();
      await loginPage.waitForCloudflareChallenge();
      await loginPage.takeScreenshot("02-login-page");
    });

    await test.step("Perform Login and Verify", async () => {
      const loginSuccess = await loginPage.performLogin(
        credentials.username,
        credentials.password
      );

      expect(loginSuccess).toBe(true);
      await loginPage.takeScreenshot("03-login-success");
    });
  });
});
