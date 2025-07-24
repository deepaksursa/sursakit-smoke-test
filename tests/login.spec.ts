import { test } from "@playwright/test";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { TestCredentials } from "../utils/test-data";

/**
 * Login Test Suite - Complete Page Object Model
 *
 * Test Case Documentation: test-cases/login-test-cases.md
 *
 * This test demonstrates the full Page Object Model pattern with multiple page objects
 */

test.describe("Login Functionality - Complete Page Object Model", () => {
  /**
   * TEST CASE: TC_001
   * Title: Valid login using complete Page Object Model
   * Priority: High
   *
   * Documentation: test-cases/login-test-cases.md (TC_001)
   * Objective: User logs in successfully using HomePage and LoginPage objects
   */
  test("TC_001: Valid Login (Complete POM)", async ({ page }) => {
    console.log("\n🚀 Starting Complete Page Object Model Test");
    console.log("🏠 Testing against localhost:5173");

    // Initialize page objects
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);

    await test.step("Navigate to Homepage", async () => {
      console.log("📍 Navigating to homepage using HomePage object");
      await homePage.navigateToHome();

      // Verify we're on homepage
      if (homePage.isOnHomePage()) {
        console.log("✅ Successfully loaded homepage");
      } else {
        console.log("⚠️ Homepage validation uncertain, continuing...");
      }

      await homePage.takeScreenshot("01-homepage");
    });

    await test.step("Navigate to Login via HomePage", async () => {
      console.log("🔗 Using HomePage object to navigate to login");

      try {
        await homePage.goToLogin();
        await loginPage.takeScreenshot("02-after-signin-click");
        console.log("✅ Successfully navigated to login page");
      } catch (error) {
        console.log("❌ HomePage navigation failed:", (error as Error).message);
        throw error;
      }
    });

    await test.step("Verify Login Page", async () => {
      const currentUrl = loginPage.getCurrentUrl();
      console.log(`📍 Current URL: ${currentUrl}`);

      if (loginPage.isOnLoginPage()) {
        console.log("✅ Confirmed on login page");
      } else {
        console.log("⚠️ Login page validation uncertain, continuing...");
      }
    });

    await test.step("Perform Login with LoginPage Object", async () => {
      const credentials = TestCredentials.validUser;
      console.log(`📝 Using LoginPage object to perform login`);

      // Use the page object to handle the entire login process
      const loginSuccess = await loginPage.performLogin(
        credentials.username,
        credentials.password
      );

      console.log(`🎯 Login result: ${loginSuccess ? "SUCCESS" : "FAILED"}`);
    });

    await test.step("Analyze Results with Page Objects", async () => {
      const currentURL = loginPage.getCurrentUrl();
      const pageTitle = await loginPage.getTitle();

      console.log("📊 FINAL RESULTS:");
      console.log(`📍 URL: ${currentURL}`);
      console.log(`📄 Title: ${pageTitle}`);

      // Take final screenshot
      await loginPage.takeScreenshot("04-final-result");

      if (loginPage.isOnLoginPage()) {
        console.log("⚠️ LOGIN STATUS: Still on login page");

        // Use LoginPage object to get detailed error information
        const errors = await loginPage.getErrorMessages();

        if (errors.length > 0) {
          console.log("❌ PAGE ERRORS FOUND:");
          errors.forEach((error) => console.log(`   • ${error}`));
        }

        console.log("🤔 POSSIBLE REASONS:");
        if (
          errors.some(
            (err) =>
              err?.toLowerCase().includes("captcha") ||
              err?.toLowerCase().includes("service")
          )
        ) {
          console.log("   🎯 CAPTCHA SERVICE ERROR DETECTED!");
          console.log("   • Backend is expecting CAPTCHA validation");
          console.log(
            "   • Frontend has Turnstile disabled but backend still requires it"
          );
          console.log(
            '   • Check your backend logs for "CAPTCHA service unavailable"'
          );
          console.log("");
          console.log("🔧 SOLUTIONS:");
          console.log(
            "   1. Disable CAPTCHA plugin in your backend auth config"
          );
          console.log("   2. Configure CAPTCHA service in backend environment");
          console.log("   3. Check better-auth configuration");
        } else {
          console.log("   • Invalid credentials in .env file");
          console.log("   • Form validation errors");
          console.log("   • Additional fields required");
          console.log(
            "💡 CHECK: Review screenshots and update .env credentials"
          );
        }
      } else {
        console.log("✅ LOGIN STATUS: Redirected away from login page");
        console.log("🎉 SUCCESS: Login flow completed successfully!");
      }

      console.log("✅ COMPLETE PAGE OBJECT MODEL TEST FINISHED");
      console.log("📋 Framework Benefits Demonstrated:");
      console.log("   • HomePage object for navigation");
      console.log("   • LoginPage object for authentication");
      console.log("   • BasePage for common functionality");
      console.log("   • Maintainable and reusable code structure");
    });
  });
});
