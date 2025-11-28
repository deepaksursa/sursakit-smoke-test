import { LoginPage } from "./../pages/LoginPage";
import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { TestCredentials } from "../utils/test-data";

test.describe("Login Functionality", () => {
  test(
    "TC_001: Valid Login",
    {
      tag: ["@smoke", "@regression"],
    },
    async ({ page }) => {
      const homePage = new HomePage(page);
      const loginPage = new LoginPage(page);
      const credentials = TestCredentials.validUser;

      await test.step("Navigate to Homepage", async () => {
        await homePage.navigateToHome();
      });

      await test.step("Navigate to Login Page", async () => {
        await homePage.goToLogin();
        await loginPage.waitForCloudflareChallenge();
      });

      await test.step("Perform Login and Verify", async () => {
        const loginSuccess = await loginPage.performLogin(
          credentials.username,
          credentials.password
        );

        expect(loginSuccess).toBe(true);
        await loginPage.takeScreenshot("03-login-success");
      });
    }
  );

  test(
    "TC_002: Invalid Login",
    {
      tag: ["@smoke", "@regression"],
      annotation: { type: "bug", description: "For negative test case" },
    },
    async ({ page }) => {
      const loginPage = new LoginPage(page);
      const credentials = TestCredentials.invalidUser;

      await test.step("Navigate to Login Page", async () => {
        await loginPage.navigateToLogin();
        await loginPage.waitForCloudflareChallenge();
      });

      await test.step("Perform Login with Invalid Credentials and Verify", async () => {
        const loginSuccess = await loginPage.performLogin(
          credentials.username,
          credentials.password
        );

        expect(loginSuccess).toBe(false);
        await loginPage.takeScreenshot("03-login-failure");
      });
    }
  );
});
